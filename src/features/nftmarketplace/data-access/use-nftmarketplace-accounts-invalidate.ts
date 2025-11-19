import { useQueryClient } from '@tanstack/react-query'
import { useNFTMarketplaceAccountsQueryKey } from './use-nftmarketplace-accounts-query-key'

export function useNFTMarketplaceAccountsInvalidate() {
  const queryClient = useQueryClient()
  const queryKey = useNFTMarketplaceAccountsQueryKey()

  return () => queryClient.invalidateQueries({ queryKey })
}
