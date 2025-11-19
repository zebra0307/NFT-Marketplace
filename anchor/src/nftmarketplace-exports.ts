// Here we export some useful types and functions for interacting with the Anchor program.
import { Account, getBase58Decoder, SolanaClient } from 'gill'
import { getProgramAccountsDecoded } from './helpers/get-program-accounts-decoded'
import { NFTMarketplace, N_FTMARKETPLACE_DISCRIMINATOR, N_FTMARKETPLACE_PROGRAM_ADDRESS, getNFTMarketplaceDecoder } from './client/js'
import NFTMarketplaceIDL from '../target/idl/nftmarketplace.json'

export type NFTMarketplaceAccount = Account<NFTMarketplace, string>

// Re-export the generated IDL and type
export { NFTMarketplaceIDL }

export * from './client/js'

export function getNFTMarketplaceProgramAccounts(rpc: SolanaClient['rpc']) {
  return getProgramAccountsDecoded(rpc, {
    decoder: getNFTMarketplaceDecoder(),
    filter: getBase58Decoder().decode(N_FTMARKETPLACE_DISCRIMINATOR),
    programAddress: N_FTMARKETPLACE_PROGRAM_ADDRESS,
  })
}
