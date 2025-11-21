// Here we export some useful types and functions for interacting with the Anchor program.
import { Account, SolanaClient } from 'gill'
import { getProgramAccountsDecoded } from './helpers/get-program-accounts-decoded'
import { NFTMARKETPLACE_PROGRAM_ADDRESS, getOfferDecoder } from './client/js'
import NFTMarketplaceIDL from '../target/idl/nftmarketplace.json'

export type NFTMarketplaceAccount = Account<any, string> // Placeholder as NFTMarketplace type might not be generated as expected

// Re-export the generated IDL and type
export { NFTMarketplaceIDL }

export * from './client/js'

// Alias for frontend compatibility
export { NFTMARKETPLACE_PROGRAM_ADDRESS as N_FTMARKETPLACE_PROGRAM_ADDRESS }

// Stub exports for counter example compatibility (to be removed/replaced with NFT marketplace UI)
// These are placeholder functions that throw errors to indicate they're not implemented
export const getInitializeInstruction = async (...args: any[]) => {
  throw new Error('getInitializeInstruction is not implemented for NFT Marketplace')
}
export const getIncrementInstruction = async (...args: any[]) => {
  throw new Error('getIncrementInstruction is not implemented for NFT Marketplace')
}
export const getDecrementInstruction = async (...args: any[]) => {
  throw new Error('getDecrementInstruction is not implemented for NFT Marketplace')
}
export const getSetInstruction = async (...args: any[]) => {
  throw new Error('getSetInstruction is not implemented for NFT Marketplace')
}
export const getCloseInstruction = async (...args: any[]) => {
  throw new Error('getCloseInstruction is not implemented for NFT Marketplace')
}

export function getNFTMarketplaceProgramAccounts(rpc: SolanaClient['rpc']) {
  return getProgramAccountsDecoded(rpc, {
    decoder: getOfferDecoder(),
    programAddress: NFTMARKETPLACE_PROGRAM_ADDRESS,
  })
}
