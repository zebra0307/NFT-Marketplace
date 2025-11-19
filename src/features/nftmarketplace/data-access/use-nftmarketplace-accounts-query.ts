import { useSolana } from '@/components/solana/use-solana'
import { useQuery } from '@tanstack/react-query'
import { getNFTMarketplaceProgramAccounts } from '@project/anchor'
import { useNFTMarketplaceAccountsQueryKey } from './use-nftmarketplace-accounts-query-key'

export function useNFTMarketplaceAccountsQuery() {
  const { client } = useSolana()

  return useQuery({
    queryKey: useNFTMarketplaceAccountsQueryKey(),
    queryFn: async () => await getNFTMarketplaceProgramAccounts(client.rpc),
  })
}
