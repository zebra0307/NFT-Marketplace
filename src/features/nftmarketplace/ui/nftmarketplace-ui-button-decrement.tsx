import { NFTMarketplaceAccount } from '@project/anchor'
import { UiWalletAccount } from '@wallet-ui/react'
import { Button } from '@/components/ui/button'

import { useNFTMarketplaceDecrementMutation } from '../data-access/use-nftmarketplace-decrement-mutation'

export function NFTMarketplaceUiButtonDecrement({ account, nftmarketplace }: { account: UiWalletAccount; nftmarketplace: NFTMarketplaceAccount }) {
  const decrementMutation = useNFTMarketplaceDecrementMutation({ account, nftmarketplace })

  return (
    <Button variant="outline" onClick={() => decrementMutation.mutateAsync()} disabled={decrementMutation.isPending}>
      Decrement
    </Button>
  )
}
