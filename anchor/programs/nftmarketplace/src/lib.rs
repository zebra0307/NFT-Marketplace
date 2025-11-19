#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
use handlers::*;

declare_id!("CGTG4etJpxd39CQp9nMRsVAwPT6P58zQF9XfT8zw6GhW");

pub mod constants;
pub mod error;
pub mod handlers;
pub mod state;

#[program]
pub mod nftmarketplace {
    use super::*;

    pub fn make_offer(
        context: Context<MakeOffer>,
        id: u64,
        token_a_offered_amount: u64,
        payment_kind: state::PaymentKind,
    ) -> Result<()> {
        handlers::make_offer::make_offer(context, id, token_a_offered_amount, payment_kind)
    }

    pub fn take_offer(context: Context<TakeOffer>) -> Result<()> {
        handlers::take_offer::take_offer(context)
    }

    pub fn take_offer_with_sol(context: Context<TakeOfferWithSol>) -> Result<()> {
        handlers::take_offer_with_sol::take_offer_with_sol(context)
    }

    pub fn refund_offer(context: Context<RefundOffer>) -> Result<()> {
        handlers::refund_offer::refund_offer(context)
    }
}

#[cfg(all(test, feature = "integration-tests"))]
mod escrow_test_helpers;
#[cfg(all(test, feature = "integration-tests"))]
mod tests;
