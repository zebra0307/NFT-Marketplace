import { Button } from '@/components/ui/button'
import { UiWalletAccount } from '@wallet-ui/react'

import { useNFTMarketplaceInitializeMutation } from '@/features/nftmarketplace/data-access/use-nftmarketplace-initialize-mutation'

export function NFTMarketplaceUiButtonInitialize({ account }: { account: UiWalletAccount }) {
  const mutationInitialize = useNFTMarketplaceInitializeMutation({ account })

  return (
    <Button onClick={() => mutationInitialize.mutateAsync()} disabled={mutationInitialize.isPending}>
      Initialize NFTMarketplace {mutationInitialize.isPending && '...'}
    </Button>
  )
}
