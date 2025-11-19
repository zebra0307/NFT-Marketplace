import { N_FTMARKETPLACE_PROGRAM_ADDRESS } from '@project/anchor'
import { AppExplorerLink } from '@/components/app-explorer-link'
import { ellipsify } from '@wallet-ui/react'

export function NFTMarketplaceUiProgramExplorerLink() {
  return <AppExplorerLink address={N_FTMARKETPLACE_PROGRAM_ADDRESS} label={ellipsify(N_FTMARKETPLACE_PROGRAM_ADDRESS)} />
}
