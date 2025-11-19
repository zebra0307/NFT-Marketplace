use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient token balance in maker's account")]
    InsufficientMakerBalance,

    #[msg("Insufficient token balance in taker's account")]
    InsufficientTakerBalance,

    #[msg("Invalid token mint - must be different from the offered token")]
    InvalidTokenMint,

    #[msg("Amount must be greater than zero")]
    InvalidAmount,

    #[msg("Failed to close vault after sale")]
    FailedVaultClosure,

    #[msg("Failed to withdraw tokens from vault")]
    FailedVaultWithdrawal,

    #[msg("Failed to refund tokens from vault")]
    FailedRefundTransfer,

    #[msg("Failed to close vault during refund")]
    FailedRefundClosure,

    #[msg("Offer does not support this payment method")]
    UnsupportedPaymentMethod,

    #[msg("Payment configuration is invalid")]
    InvalidPaymentConfiguration,
}