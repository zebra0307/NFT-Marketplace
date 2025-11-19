import {
  Blockhash,
  createSolanaClient,
  createTransaction,
  generateKeyPairSigner,
  Instruction,
  isSolanaError,
  KeyPairSigner,
  signTransactionMessageWithSigners,
} from 'gill'
import {
  fetchNFTMarketplace,
  getCloseInstruction,
  getDecrementInstruction,
  getIncrementInstruction,
  getInitializeInstruction,
  getSetInstruction,
} from '../src'
// @ts-ignore error TS2307 suggest setting `moduleResolution` but this is already configured
import { loadKeypairSignerFromFile } from 'gill/node'

const { rpc, sendAndConfirmTransaction } = createSolanaClient({ urlOrMoniker: process.env.ANCHOR_PROVIDER_URL! })

describe('nftmarketplace', () => {
  let payer: KeyPairSigner
  let nftmarketplace: KeyPairSigner

  beforeAll(async () => {
    nftmarketplace = await generateKeyPairSigner()
    payer = await loadKeypairSignerFromFile(process.env.ANCHOR_WALLET!)
  })

  it('Initialize NFTMarketplace', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getInitializeInstruction({ payer: payer, nftmarketplace: nftmarketplace })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSER
    const currentNFTMarketplace = await fetchNFTMarketplace(rpc, nftmarketplace.address)
    expect(currentNFTMarketplace.data.count).toEqual(0)
  })

  it('Increment NFTMarketplace', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getIncrementInstruction({
      nftmarketplace: nftmarketplace.address,
    })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSERT
    const currentCount = await fetchNFTMarketplace(rpc, nftmarketplace.address)
    expect(currentCount.data.count).toEqual(1)
  })

  it('Increment NFTMarketplace Again', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getIncrementInstruction({ nftmarketplace: nftmarketplace.address })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSERT
    const currentCount = await fetchNFTMarketplace(rpc, nftmarketplace.address)
    expect(currentCount.data.count).toEqual(2)
  })

  it('Decrement NFTMarketplace', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getDecrementInstruction({
      nftmarketplace: nftmarketplace.address,
    })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSERT
    const currentCount = await fetchNFTMarketplace(rpc, nftmarketplace.address)
    expect(currentCount.data.count).toEqual(1)
  })

  it('Set nftmarketplace value', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getSetInstruction({ nftmarketplace: nftmarketplace.address, value: 42 })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSERT
    const currentCount = await fetchNFTMarketplace(rpc, nftmarketplace.address)
    expect(currentCount.data.count).toEqual(42)
  })

  it('Set close the nftmarketplace account', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getCloseInstruction({
      payer: payer,
      nftmarketplace: nftmarketplace.address,
    })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSERT
    try {
      await fetchNFTMarketplace(rpc, nftmarketplace.address)
    } catch (e) {
      if (!isSolanaError(e)) {
        throw new Error(`Unexpected error: ${e}`)
      }
      expect(e.message).toEqual(`Account not found at address: ${nftmarketplace.address}`)
    }
  })
})

// Helper function to keep the tests DRY
let latestBlockhash: Awaited<ReturnType<typeof getLatestBlockhash>> | undefined
async function getLatestBlockhash(): Promise<Readonly<{ blockhash: Blockhash; lastValidBlockHeight: bigint }>> {
  if (latestBlockhash) {
    return latestBlockhash
  }
  return await rpc
    .getLatestBlockhash()
    .send()
    .then(({ value }) => value)
}
async function sendAndConfirm({ ix, payer }: { ix: Instruction; payer: KeyPairSigner }) {
  const tx = createTransaction({
    feePayer: payer,
    instructions: [ix],
    version: 'legacy',
    latestBlockhash: await getLatestBlockhash(),
  })
  const signedTransaction = await signTransactionMessageWithSigners(tx)
  return await sendAndConfirmTransaction(signedTransaction)
}
