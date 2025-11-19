import { NFTMarketplaceAccount, getIncrementInstruction } from '@project/anchor'
import { UiWalletAccount, useWalletUiSigner } from '@wallet-ui/react'
import { useWalletUiSignAndSend } from '@wallet-ui/react-gill'
import { useMutation } from '@tanstack/react-query'
import { toastTx } from '@/components/toast-tx'
import { useNFTMarketplaceAccountsInvalidate } from './use-nftmarketplace-accounts-invalidate'

export function useNFTMarketplaceIncrementMutation({
  account,
  nftmarketplace,
}: {
  account: UiWalletAccount
  nftmarketplace: NFTMarketplaceAccount
}) {
  const invalidateAccounts = useNFTMarketplaceAccountsInvalidate()
  const signAndSend = useWalletUiSignAndSend()
  const signer = useWalletUiSigner({ account })

  return useMutation({
    mutationFn: async () => await signAndSend(getIncrementInstruction({ nftmarketplace: nftmarketplace.address }), signer),
    onSuccess: async (tx) => {
      toastTx(tx)
      await invalidateAccounts()
    },
  })
}
