use super::shared::{close_token_account, transfer_tokens};
use crate::{error::ErrorCode, state::{Offer, PaymentKind}};
use anchor_lang::{prelude::*, system_program};
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface},
};

#[derive(Accounts)]
pub struct TakeOfferWithSol<'info> {
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,

    #[account(mut)]
    pub taker: Signer<'info>,

    #[account(mut)]
    pub maker: SystemAccount<'info>,

    #[account(mint::token_program = token_program)]
    pub token_mint_a: InterfaceAccount<'info, Mint>,

    #[account(
        init_if_needed,
        payer = taker,
        associated_token::mint = token_mint_a,
        associated_token::authority = taker,
        associated_token::token_program = token_program,
    )]
    pub taker_token_account_a: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        close = maker,
        has_one = maker,
        seeds = [b"offer", offer.id.to_le_bytes().as_ref()],
        bump = offer.bump
    )]
    pub offer: Account<'info, Offer>,

    #[account(
        mut,
        associated_token::mint = token_mint_a,
        associated_token::authority = offer,
        associated_token::token_program = token_program,
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,
}

pub fn take_offer_with_sol(context: Context<TakeOfferWithSol>) -> Result<()> {
    let lamports_due = match context.accounts.offer.payment {
        PaymentKind::Sol { lamports } => lamports,
        PaymentKind::Token { .. } => return err!(ErrorCode::UnsupportedPaymentMethod),
    };

    // Transfer SOL from the taker to the maker.
    let transfer_ctx = CpiContext::new(
        context.accounts.system_program.to_account_info(),
        system_program::Transfer {
            from: context.accounts.taker.to_account_info(),
            to: context.accounts.maker.to_account_info(),
        },
    );
    system_program::transfer(transfer_ctx, lamports_due)
        .map_err(|_| ErrorCode::InvalidPaymentConfiguration)?;

    // Signer seeds for PDA owned vault.
    let offer_account_seeds = &[
        b"offer",
        &context.accounts.offer.id.to_le_bytes()[..],
        &[context.accounts.offer.bump],
    ];
    let signers_seeds = Some(&offer_account_seeds[..]);

    // Send the escrowed tokens to the taker.
    transfer_tokens(
        &context.accounts.vault,
        &context.accounts.taker_token_account_a,
        &context.accounts.vault.amount,
        &context.accounts.token_mint_a,
        &context.accounts.offer.to_account_info(),
        &context.accounts.token_program,
        signers_seeds,
    )
    .map_err(|_| ErrorCode::FailedVaultWithdrawal)?;

    // Close the vault after withdrawal.
    close_token_account(
        &context.accounts.vault,
        &context.accounts.taker.to_account_info(),
        &context.accounts.offer.to_account_info(),
        &context.accounts.token_program,
        signers_seeds,
    )
    .map_err(|_| ErrorCode::FailedVaultClosure)?;

    Ok(())
}
