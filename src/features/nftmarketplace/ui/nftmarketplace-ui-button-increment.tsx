import { NFTMarketplaceAccount } from '@project/anchor'
import { UiWalletAccount } from '@wallet-ui/react'
import { Button } from '@/components/ui/button'
import { useNFTMarketplaceIncrementMutation } from '../data-access/use-nftmarketplace-increment-mutation'

export function NFTMarketplaceUiButtonIncrement({ account, nftmarketplace }: { account: UiWalletAccount; nftmarketplace: NFTMarketplaceAccount }) {
  const incrementMutation = useNFTMarketplaceIncrementMutation({ account, nftmarketplace })

  return (
    <Button variant="outline" onClick={() => incrementMutation.mutateAsync()} disabled={incrementMutation.isPending}>
      Increment
    </Button>
  )
}
