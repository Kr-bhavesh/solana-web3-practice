use {
    anchor_lang::prelude::*,
    anchor_lang::system_program,
    anchor_spl::{
        associated_token::{create, AssociatedToken, Create},
        metadata::{
            create_master_edition_v3, create_metadata_accounts_v3,
            mpl_token_metadata::types::DataV2, CreateMasterEditionV3, CreateMetadataAccountsV3,
            Metadata,
        },
        token::{mint_to, transfer, Mint, MintTo, Token, TokenAccount, Transfer},
    },
};

declare_id!("BSHQ8JZdnzd4ZiPL9JYGQcvrx4JjDDd6Y7HXi4V66FVD");

#[program]
pub mod nft_marketplace {
    use super::*;

    pub fn mint(
        ctx: Context<MintNft>,
        nft_name: String,
        nft_symbol: String,
        nft_uri: String,
    ) -> Result<()> {
        msg!("Minting Token");
        // Cross Program Invocation (CPI)
        // Invoking the mint_to instruction on the token program
        mint_to(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.mint_account.to_account_info(),
                    to: ctx.accounts.associated_token_account.to_account_info(),
                    authority: ctx.accounts.payer.to_account_info(),
                },
            ),
            1,
        )?;

        msg!("Creating metadata account");
        // Cross Program Invocation (CPI)
        // Invoking the create_metadata_account_v3 instruction on the token metadata program
        create_metadata_accounts_v3(
            CpiContext::new(
                ctx.accounts.token_metadata_program.to_account_info(),
                CreateMetadataAccountsV3 {
                    metadata: ctx.accounts.metadata_account.to_account_info(),
                    mint: ctx.accounts.mint_account.to_account_info(),
                    mint_authority: ctx.accounts.payer.to_account_info(),
                    update_authority: ctx.accounts.payer.to_account_info(),
                    payer: ctx.accounts.payer.to_account_info(),
                    system_program: ctx.accounts.system_program.to_account_info(),
                    rent: ctx.accounts.rent.to_account_info(),
                },
            ),
            DataV2 {
                name: nft_name,
                symbol: nft_symbol,
                uri: nft_uri,
                seller_fee_basis_points: 0,
                creators: None,
                collection: None,
                uses: None,
            },
            false, // Is mutable
            true,  // Update authority is signer
            None,  // Collection details
        )?;

        msg!("Creating master edition account");
        // Cross Program Invocation (CPI)mint
        // Invoking the create_master_edition_v3 instruction on the token metadata program
        create_master_edition_v3(
            CpiContext::new(
                ctx.accounts.token_metadata_program.to_account_info(),
                CreateMasterEditionV3 {
                    edition: ctx.accounts.edition_account.to_account_info(),
                    mint: ctx.accounts.mint_account.to_account_info(),
                    update_authority: ctx.accounts.payer.to_account_info(),
                    mint_authority: ctx.accounts.payer.to_account_info(),
                    payer: ctx.accounts.payer.to_account_info(),
                    metadata: ctx.accounts.metadata_account.to_account_info(),
                    token_program: ctx.accounts.token_program.to_account_info(),
                    system_program: ctx.accounts.system_program.to_account_info(),
                    rent: ctx.accounts.rent.to_account_info(),
                },
            ),
            None, // Max Supply
        )?;

        msg!("NFT minted successfully.");

        Ok(())
    }

    pub fn bid(ctx: Context<BidNft>, bid_lamports: u64) -> Result<()> {
        msg!("Program ID: {}", &ctx.program_id);

        let bid_account = &mut ctx.accounts.bid_account;
        bid_account.bid += bid_lamports;
        bid_account.public_key = ctx.accounts.authority.key();

        msg!("Bid submitted!");

        Ok(())
    }

    pub fn sell(ctx: Context<SellNft>, sale_lamports: u64) -> Result<()> {
        msg!("Initiating transfer of {} lamports...", sale_lamports);
        msg!(
            "Purchaser (sending lamports): {}",
            &ctx.accounts.buyer_authority.key()
        );
        msg!(
            "Seller (receiving lamports): {}",
            &ctx.accounts.owner_authority.key()
        );
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.buyer_authority.to_account_info(),
                    to: ctx.accounts.owner_authority.to_account_info(),
                },
            ),
            sale_lamports,
        )?;

        msg!("Lamports transferred successfully.");

        msg!("Creating buyer token account...");
        msg!(
            "Buyer Token Address: {}",
            &ctx.accounts.buyer_token_account.key()
        );
        create(CpiContext::new(
            ctx.accounts.associated_token_program.to_account_info(),
            Create {
                payer: ctx.accounts.buyer_authority.to_account_info(),
                associated_token: ctx.accounts.buyer_token_account.to_account_info(),
                authority: ctx.accounts.buyer_authority.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                // rent: ctx.accounts.rent.to_account_info(),
            },
        ))?;

        msg!("Transferring NFT...");
        msg!(
            "Owner Token Address: {}",
            &ctx.accounts.owner_token_account.key()
        );
        msg!(
            "Buyer Token Address: {}",
            &ctx.accounts.buyer_token_account.key()
        );
        transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.owner_token_account.to_account_info(),
                    to: ctx.accounts.buyer_token_account.to_account_info(),
                    authority: ctx.accounts.owner_authority.to_account_info(),
                },
            ),
            1,
        )?;
        msg!("NFT transferred successfully.");

        msg!("Sale completed successfully!");

        Ok(())
    }

}

#[derive(Accounts)]
pub struct SellNft<'info> {
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub owner_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub owner_authority: Signer<'info>,
    /// CHECK: We're about to create this with Anchor
    #[account(mut)]
    pub buyer_token_account: UncheckedAccount<'info>,
    #[account(mut)]
    pub buyer_authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct MintNft<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: Validate address by deriving pda
    #[account(
        mut,
        seeds = [b"metadata", token_metadata_program.key().as_ref(), mint_account.key().as_ref()],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    pub metadata_account: UncheckedAccount<'info>,

    /// CHECK: Validate address by deriving pda
    #[account(
        mut,
        seeds = [b"metadata", token_metadata_program.key().as_ref(), mint_account.key().as_ref(), b"edition"],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    pub edition_account: UncheckedAccount<'info>,
    #[account(
       mut,
        mint::decimals = 0,
        mint::authority = payer.key(),
        mint::freeze_authority = payer.key(),
    )]
    pub mint_account: Account<'info, Mint>,
    #[account(
    mut,
    associated_token::mint = mint_account,  // Ensure it's the correct mint
    associated_token::authority = payer,    // Ensure it's owned by the payer
)]
    pub associated_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct BidNft<'info> {
    #[account(zero)]
    pub mint: Account<'info, Mint>,
    #[account(
        init,
        payer = authority,
        space = 256,
        seeds = [
            b"bid_",
            mint.key().as_ref(),
        ],
        bump
    )]
    pub bid_account: Account<'info, Bid>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Bid {
    pub bid: u64,
    pub public_key: Pubkey,
}
