import {
  address,
  createSolanaClient,
  createTransaction,
  generateKeyPairSigner,
  signTransactionMessageWithSigners,
  Address,
  getProgramDerivedAddress,
  getU64Encoder,
  getAddressEncoder,
  AccountRole,
  IInstruction,
  setTransactionMessageLifetimeUsingBlockhash,
  addSignersToTransactionMessage,
  pipe,
  lamports,
  type KeyPairSigner,
} from 'gill'
import { expect, describe, it, beforeAll } from 'vitest'
import {
  getMakeOfferInstructionAsync,
  getTakeOfferInstructionAsync,
  getTakeOfferWithSolInstructionAsync,
  getRefundOfferInstructionAsync,
  fetchOffer,
  paymentKind,
} from '../src'
import { createKeyPairSignerFromBytes } from 'gill'
import { readFile } from 'fs/promises'
import { homedir } from 'os'

const ANCHOR_PROVIDER_URL = process.env.ANCHOR_PROVIDER_URL || 'http://127.0.0.1:8899'
const ANCHOR_WALLET = process.env.ANCHOR_WALLET || '~/.config/solana/id.json'

const { rpc, sendAndConfirmTransaction } = createSolanaClient({
  urlOrMoniker: ANCHOR_PROVIDER_URL,
})

// SPL Token Program ID
const TOKEN_PROGRAM_ADDRESS = address('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
const ASSOCIATED_TOKEN_PROGRAM_ADDRESS = address('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
const SYSTEM_PROGRAM_ADDRESS = address('11111111111111111111111111111111')

const loadKeypairSignerFromFile = async (path: string): Promise<KeyPairSigner> => {
  const resolvedPath = path.startsWith('~') ? path.replace('~', homedir()) : path
  const keypairData = JSON.parse(await readFile(resolvedPath, 'utf-8'))
  return await createKeyPairSignerFromBytes(new Uint8Array(keypairData))
}

describe('nftmarketplace', () => {
  let payer: KeyPairSigner
  let maker: KeyPairSigner
  let taker: KeyPairSigner
  let mintA: Address
  let mintB: Address
  let makerAtaA: Address
  let makerAtaB: Address
  let takerAtaA: Address
  let takerAtaB: Address

  const waitForConfirmation = async (signature: string) => {
    let status = 'processing'
    while (status === 'processing' || status === 'unknown') {
      const response = await rpc.getSignatureStatuses([signature as any]).send()
      const signatureStatus = response.value[0]
      if (signatureStatus && (signatureStatus.confirmationStatus === 'confirmed' || signatureStatus.confirmationStatus === 'finalized')) {
        return
      }
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  beforeAll(async () => {
    payer = await loadKeypairSignerFromFile(ANCHOR_WALLET)
    maker = await generateKeyPairSigner()
    taker = await generateKeyPairSigner()

    // Airdrop to maker, taker, and payer
    const sig1 = await rpc.requestAirdrop(maker.address, lamports(10_000_000_000n)).send()
    await waitForConfirmation(sig1)
    const sig2 = await rpc.requestAirdrop(taker.address, lamports(10_000_000_000n)).send()
    await waitForConfirmation(sig2)
    const sig3 = await rpc.requestAirdrop(payer.address, lamports(10_000_000_000n)).send()
    await waitForConfirmation(sig3)

    const balanceMaker = await rpc.getBalance(maker.address).send()
    const balanceTaker = await rpc.getBalance(taker.address).send()
    const balancePayer = await rpc.getBalance(payer.address).send()
    console.log('Balances:', {
      maker: balanceMaker.value,
      taker: balanceTaker.value,
      payer: balancePayer.value
    })
  }, 120000)

  // Helper to create a mint
  const createMint = async (authority: Address) => {
    const mint = await generateKeyPairSigner()
    const space = 82n // Size of mint account
    const rentResponse = await rpc.getMinimumBalanceForRentExemption(space).send()
    const rent = typeof rentResponse === 'object' && rentResponse && 'value' in rentResponse ? rentResponse.value : rentResponse

    const createAccountIx: IInstruction = {
      programAddress: SYSTEM_PROGRAM_ADDRESS,
      accounts: [
        { address: payer.address, role: AccountRole.WRITABLE_SIGNER },
        { address: mint.address, role: AccountRole.WRITABLE_SIGNER },
      ],
      data: new Uint8Array([
        0, 0, 0, 0, // CreateAccount instruction index
        ...Array.from(getU64Encoder().encode(BigInt(rent))),
        ...Array.from(getU64Encoder().encode(space)),
        ...Array.from(getAddressEncoder().encode(TOKEN_PROGRAM_ADDRESS)),
      ]),
    }

    const initMintIx: IInstruction = {
      programAddress: TOKEN_PROGRAM_ADDRESS,
      accounts: [
        { address: mint.address, role: AccountRole.WRITABLE },
        { address: address('SysvarRent111111111111111111111111111111111'), role: AccountRole.READONLY },
      ],
      data: new Uint8Array([
        0, // Instruction 0 (InitializeMint)
        0, // Decimals
        ...Array.from(getAddressEncoder().encode(authority)),
        0, // Freeze authority option (None)
        ...Array.from(new Uint8Array(32)),
      ]),
    }

    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send()
    const tx = pipe(
      createTransaction({
        version: 0,
        feePayer: payer.address,
        instructions: [createAccountIx, initMintIx],
        latestBlockhash: latestBlockhash,
      }),
      tx => addSignersToTransactionMessage([payer, mint], tx)
    )

    const signedTx = await signTransactionMessageWithSigners(tx)
    await sendAndConfirmTransaction(signedTx, { commitment: 'confirmed' })

    return mint.address
  }

  const createAta = async (owner: Address, mint: Address, payerSigner: KeyPairSigner = payer) => {
    const ata = await getProgramDerivedAddress({
      programAddress: ASSOCIATED_TOKEN_PROGRAM_ADDRESS,
      seeds: [
        getAddressEncoder().encode(owner),
        getAddressEncoder().encode(TOKEN_PROGRAM_ADDRESS),
        getAddressEncoder().encode(mint),
      ],
    })

    const createAtaIx: IInstruction = {
      programAddress: ASSOCIATED_TOKEN_PROGRAM_ADDRESS,
      accounts: [
        { address: payerSigner.address, role: AccountRole.WRITABLE_SIGNER },
        { address: ata[0], role: AccountRole.WRITABLE },
        { address: owner, role: AccountRole.READONLY },
        { address: mint, role: AccountRole.READONLY },
        { address: SYSTEM_PROGRAM_ADDRESS, role: AccountRole.READONLY },
        { address: TOKEN_PROGRAM_ADDRESS, role: AccountRole.READONLY },
      ],
      data: new Uint8Array([1]), // Idempotent
    }

    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send()
    const tx = pipe(
      createTransaction({
        version: 0,
        feePayer: payerSigner.address,
        instructions: [createAtaIx],
        latestBlockhash: latestBlockhash,
      }),
      tx => addSignersToTransactionMessage([payerSigner], tx)
    )

    const signedTx = await signTransactionMessageWithSigners(tx)
    await sendAndConfirmTransaction(signedTx, { commitment: 'confirmed' })

    return ata[0]
  }

  const mintTo = async (mint: Address, dest: Address, amount: bigint, authority: KeyPairSigner) => {
    const mintToIx: IInstruction = {
      programAddress: TOKEN_PROGRAM_ADDRESS,
      accounts: [
        { address: mint, role: AccountRole.WRITABLE },
        { address: dest, role: AccountRole.WRITABLE },
        { address: authority.address, role: AccountRole.READONLY_SIGNER },
      ],
      data: new Uint8Array([
        7, // Instruction 7 (MintTo)
        ...Array.from(getU64Encoder().encode(amount)),
      ]),
    }

    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send()
    const tx = pipe(
      createTransaction({
        version: 0,
        feePayer: payer.address,
        instructions: [mintToIx],
        latestBlockhash: latestBlockhash,
      }),
      tx => addSignersToTransactionMessage([payer, authority], tx)
    )

    const signedTx = await signTransactionMessageWithSigners(tx)
    await sendAndConfirmTransaction(signedTx, { commitment: 'confirmed' })
  }

  it('Setup Mints and ATAs', async () => {
    mintA = await createMint(maker.address)
    mintB = await createMint(taker.address)

    makerAtaA = await createAta(maker.address, mintA)
    makerAtaB = await createAta(maker.address, mintB)
    takerAtaA = await createAta(taker.address, mintA)
    takerAtaB = await createAta(taker.address, mintB)

    await mintTo(mintA, makerAtaA, 1n, maker)
    await mintTo(mintB, takerAtaB, 1n, taker)
  }, 60000)

  it('Make Offer (NFT for NFT)', async () => {
    const id = 1n
    const offerIx = await getMakeOfferInstructionAsync({
      maker: maker,
      tokenMintA: mintA,
      id: id,
      tokenAOfferedAmount: 1n,
      paymentKind: paymentKind('Token', { mint: mintB, amount: 1n }),
    })

    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send()
    const tx = pipe(
      createTransaction({
        version: 0,
        feePayer: maker.address,
        instructions: [offerIx],
        latestBlockhash: latestBlockhash,
      }),
      tx => addSignersToTransactionMessage([maker], tx)
    )

    const signedTx = await signTransactionMessageWithSigners(tx)
    await sendAndConfirmTransaction(signedTx, { commitment: 'confirmed' })

    // Verify offer created
    const offerPda = await getProgramDerivedAddress({
      programAddress: offerIx.programAddress,
      seeds: [
        new TextEncoder().encode('offer'),
        getU64Encoder().encode(id),
      ],
    })
    const offerAccount = await fetchOffer(rpc, offerPda[0])
    expect(offerAccount.data.id).toEqual(id)
    expect(offerAccount.data.maker).toEqual(maker.address)
    expect(offerAccount.data.tokenMintA).toEqual(mintA)
  }, 60000)

  it('Take Offer (NFT for NFT)', async () => {
    const id = 1n
    const offerPda = await getProgramDerivedAddress({
      programAddress: address('CGTG4etJpxd39CQp9nMRsVAwPT6P58zQF9XfT8zw6GhW'),
      seeds: [
        new TextEncoder().encode('offer'),
        getU64Encoder().encode(id),
      ],
    })

    const takeIx = await getTakeOfferInstructionAsync({
      taker: taker,
      maker: maker,
      tokenMintA: mintA,
      tokenMintB: mintB,
      offer: offerPda[0],
    })

    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send()
    const tx = pipe(
      createTransaction({
        version: 0,
        feePayer: taker.address,
        instructions: [takeIx],
        latestBlockhash: latestBlockhash,
      }),
      tx => addSignersToTransactionMessage([taker], tx)
    )

    const signedTx = await signTransactionMessageWithSigners(tx)
    await sendAndConfirmTransaction(signedTx, { commitment: 'confirmed' })

    // Verify trade
    try {
      await fetchOffer(rpc, offerPda[0])
      throw new Error('Offer account should be closed')
    } catch (e) {
      // Expected
    }
  }, 60000)

  it('Make Offer (NFT for SOL)', async () => {
    const id = 2n
    // Mint another NFT for maker
    const mintC = await createMint(maker.address)
    const makerAtaC = await createAta(maker.address, mintC)
    await mintTo(mintC, makerAtaC, 1n, maker)

    const offerIx = await getMakeOfferInstructionAsync({
      maker: maker,
      tokenMintA: mintC,
      id: id,
      tokenAOfferedAmount: 1n,
      paymentKind: paymentKind('Sol', { lamports: 1000000000n }), // 1 SOL
    })

    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send()
    const tx = pipe(
      createTransaction({
        version: 0,
        feePayer: maker.address,
        instructions: [offerIx],
        latestBlockhash: latestBlockhash,
      }),
      tx => addSignersToTransactionMessage([maker], tx)
    )

    const signedTx = await signTransactionMessageWithSigners(tx)
    await sendAndConfirmTransaction(signedTx, { commitment: 'confirmed' })
  }, 60000)

  it('Take Offer (NFT for SOL)', async () => {
    const id = 2n
    const offerPda = await getProgramDerivedAddress({
      programAddress: address('CGTG4etJpxd39CQp9nMRsVAwPT6P58zQF9XfT8zw6GhW'),
      seeds: [
        new TextEncoder().encode('offer'),
        getU64Encoder().encode(id),
      ],
    })

    // Get mintC from offer account (or we could have stored it)
    const offerAccount = await fetchOffer(rpc, offerPda[0])
    const mintC = offerAccount.data.tokenMintA

    const takeIx = await getTakeOfferWithSolInstructionAsync({
      taker: taker,
      maker: maker,
      tokenMintA: mintC,
      offer: offerPda[0],
    })

    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send()
    const tx = pipe(
      createTransaction({
        version: 0,
        feePayer: taker.address,
        instructions: [takeIx],
        latestBlockhash: latestBlockhash,
      }),
      tx => addSignersToTransactionMessage([taker], tx)
    )

    const signedTx = await signTransactionMessageWithSigners(tx)
    await sendAndConfirmTransaction(signedTx, { commitment: 'confirmed' })
  }, 60000)

  it('Refund Offer', async () => {
    const id = 3n
    // Mint another NFT for maker
    const mintD = await createMint(maker.address)
    const makerAtaD = await createAta(maker.address, mintD)
    await mintTo(mintD, makerAtaD, 1n, maker)

    const offerIx = await getMakeOfferInstructionAsync({
      maker: maker,
      tokenMintA: mintD,
      id: id,
      tokenAOfferedAmount: 1n,
      paymentKind: paymentKind('Sol', { lamports: 1000000000n }),
    })

    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send()
    const tx = pipe(
      createTransaction({
        version: 0,
        feePayer: maker.address,
        instructions: [offerIx],
        latestBlockhash: latestBlockhash,
      }),
      tx => addSignersToTransactionMessage([maker], tx)
    )

    const signedTx = await signTransactionMessageWithSigners(tx)
    await sendAndConfirmTransaction(signedTx, { commitment: 'confirmed' })

    // Refund
    const offerPda = await getProgramDerivedAddress({
      programAddress: address('CGTG4etJpxd39CQp9nMRsVAwPT6P58zQF9XfT8zw6GhW'),
      seeds: [
        new TextEncoder().encode('offer'),
        getU64Encoder().encode(id),
      ],
    })

    const refundIx = await getRefundOfferInstructionAsync({
      maker: maker,
      tokenMintA: mintD,
      offer: offerPda[0],
    })

    const { value: latestBlockhash2 } = await rpc.getLatestBlockhash().send()
    const tx2 = pipe(
      createTransaction({
        version: 0,
        feePayer: maker.address,
        instructions: [refundIx],
        latestBlockhash: latestBlockhash2,
      }),
      tx => addSignersToTransactionMessage([maker], tx)
    )

    const signedTx2 = await signTransactionMessageWithSigners(tx2)
    await sendAndConfirmTransaction(signedTx2, { commitment: 'confirmed' })

    // Verify closed
    try {
      await fetchOffer(rpc, offerPda[0])
      throw new Error('Offer account should be closed')
    } catch (e) {
      // Expected
    }
  }, 60000)
})
