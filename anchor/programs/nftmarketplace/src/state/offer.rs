use anchor_lang::prelude::*;

/// Stores the details of an offer to swap token A (held in a vault) for either
/// a different SPL token or for SOL.
#[account]
#[derive(InitSpace)]
pub struct Offer {
    /// Identifier chosen by the maker so clients can reference the offer.
    pub id: u64,
    /// Wallet that created the offer.
    pub maker: Pubkey,
    /// Mint of the asset that is being sold.
    pub token_mint_a: Pubkey,
    /// Amount of token A locked in the vault.
    pub token_a_amount: u64,
    /// How the maker wishes to be paid.
    pub payment: PaymentKind,
    /// PDA bump used for the offer account/vault seeds.
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub enum PaymentKind {
    Token { mint: Pubkey, amount: u64 },
    Sol { lamports: u64 },
}

