import { useSolana } from '@/components/solana/use-solana'

export function useNFTMarketplaceAccountsQueryKey() {
  const { cluster } = useSolana()

  return ['nftmarketplace', 'accounts', { cluster }]
}
