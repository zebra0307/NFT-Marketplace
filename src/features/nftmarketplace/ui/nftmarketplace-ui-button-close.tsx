import { NFTMarketplaceAccount } from '@project/anchor'
import { UiWalletAccount } from '@wallet-ui/react'
import { Button } from '@/components/ui/button'

import { useNFTMarketplaceCloseMutation } from '@/features/nftmarketplace/data-access/use-nftmarketplace-close-mutation'

export function NFTMarketplaceUiButtonClose({ account, nftmarketplace }: { account: UiWalletAccount; nftmarketplace: NFTMarketplaceAccount }) {
  const closeMutation = useNFTMarketplaceCloseMutation({ account, nftmarketplace })

  return (
    <Button
      variant="destructive"
      onClick={() => {
        if (!window.confirm('Are you sure you want to close this account?')) {
          return
        }
        return closeMutation.mutateAsync()
      }}
      disabled={closeMutation.isPending}
    >
      Close
    </Button>
  )
}
