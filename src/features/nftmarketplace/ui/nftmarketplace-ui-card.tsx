import { NFTMarketplaceAccount } from '@project/anchor'
import { ellipsify, UiWalletAccount } from '@wallet-ui/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AppExplorerLink } from '@/components/app-explorer-link'
import { NFTMarketplaceUiButtonClose } from './nftmarketplace-ui-button-close'
import { NFTMarketplaceUiButtonDecrement } from './nftmarketplace-ui-button-decrement'
import { NFTMarketplaceUiButtonIncrement } from './nftmarketplace-ui-button-increment'
import { NFTMarketplaceUiButtonSet } from './nftmarketplace-ui-button-set'

export function NFTMarketplaceUiCard({ account, nftmarketplace }: { account: UiWalletAccount; nftmarketplace: NFTMarketplaceAccount }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>NFTMarketplace: {nftmarketplace.data.count}</CardTitle>
        <CardDescription>
          Account: <AppExplorerLink address={nftmarketplace.address} label={ellipsify(nftmarketplace.address)} />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 justify-evenly">
          <NFTMarketplaceUiButtonIncrement account={account} nftmarketplace={nftmarketplace} />
          <NFTMarketplaceUiButtonSet account={account} nftmarketplace={nftmarketplace} />
          <NFTMarketplaceUiButtonDecrement account={account} nftmarketplace={nftmarketplace} />
          <NFTMarketplaceUiButtonClose account={account} nftmarketplace={nftmarketplace} />
        </div>
      </CardContent>
    </Card>
  )
}
