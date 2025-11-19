import { useSolana } from '@/components/solana/use-solana'
import { WalletDropdown } from '@/components/wallet-dropdown'
import { AppHero } from '@/components/app-hero'
import { NFTMarketplaceUiButtonInitialize } from './ui/nftmarketplace-ui-button-initialize'
import { NFTMarketplaceUiList } from './ui/nftmarketplace-ui-list'
import { NFTMarketplaceUiProgramExplorerLink } from './ui/nftmarketplace-ui-program-explorer-link'
import { NFTMarketplaceUiProgramGuard } from './ui/nftmarketplace-ui-program-guard'

export default function NFTMarketplaceFeature() {
  const { account } = useSolana()

  return (
    <NFTMarketplaceUiProgramGuard>
      <AppHero
        title="NFTMarketplace"
        subtitle={
          account
            ? "Initialize a new nftmarketplace onchain by clicking the button. Use the program's methods (increment, decrement, set, and close) to change the state of the account."
            : 'Select a wallet to run the program.'
        }
      >
        <p className="mb-6">
          <NFTMarketplaceUiProgramExplorerLink />
        </p>
        {account ? (
          <NFTMarketplaceUiButtonInitialize account={account} />
        ) : (
          <div style={{ display: 'inline-block' }}>
            <WalletDropdown />
          </div>
        )}
      </AppHero>
      {account ? <NFTMarketplaceUiList account={account} /> : null}
    </NFTMarketplaceUiProgramGuard>
  )
}
