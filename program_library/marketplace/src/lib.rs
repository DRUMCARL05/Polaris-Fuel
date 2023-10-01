use solana_program::{
    account_info::{ next_account_info, AccountInfo },
    entrypoint,
    entrypoint::ProgramResult,
    program::{ invoke, invoke_signed },
    program_error::ProgramError,
    pubkey::Pubkey,
    //rent::Rent,
    //system_instruction,
    //sysvar::Sysvar,
    msg,
};

use solana_program::instruction::Instruction;
use solana_program::instruction::AccountMeta;
use borsh::{ BorshDeserialize, BorshSerialize };
//use spl_token::state::Account as TokenAccount;
//use solana_program::program_pack::Pack;
use std::convert::TryInto;

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct MarketPlaceData {
    pub is_initialized: u8,
    pub reward: u8,
    pub ammo_price: f64,
    pub food: f64,
    pub fuel: f64,
    pub tool: f64,
    pub admin_pubkey: [u8; 32],
}

entrypoint!(process_instruction);

pub fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {
    if instruction_data.is_empty() {
        return Err(ProgramError::InvalidInstructionData);
    }


    // Define public key strings for devnet and mainnet.
    let (polaris_admin_pubkey_string, 
        pda_star_atlas_account_string, 
        pda_tools_account_string, 
        pda_ammo_account_string, 
        pda_fuel_account_string, 
        pda_food_account_string,
        polaris_tools_account_string, 
        polaris_ammo_account_string, 
        polaris_fuel_account_string, 
        polaris_food_account_string, 
        allowed_fee_star_atlas_account_string) = if instruction_data[0] == 1 {
        // devnet keys
        (
            "9z8eyT5meZsQK79Pm2rmqBQcQKfj6tWJfRVbjQczyKcK".to_string(),
            "GJNKMrcsH5m7vem9WSxs7SEpMrHeihNqtQg6CzCFuhPY".to_string(),
            "B9xSJqsBuy9Xj3kCpsh8ZpJpphyU62aaNCqmbL5qsxjC".to_string(),
            "EtgTTdct3r8kJgUmjiWWBrPHG9g5rBhUFouc9npvG6t9".to_string(),
            "8LG7PKi9GyxM7Nm3EVaYDG18fBfwjo5boNtAF5ZiW7KL".to_string(),
            "BeLzpdSP3bsuieattadMFseup9gkuNfNV1Grde134CFH".to_string(),
            "51CQRTPagzt8MX6KBAoAyTfDqM9n4NvepjC4fuZ5fgqu".to_string(),
            "HhZpu7GvaAcU752HeYCApTvjLd9yY66hyRqvbfFxCXd4".to_string(),
            "Gdghebj3V9deG9FuNfS43kDmzTsL5keHYXeCeReaH1bX".to_string(),
            "9RQnXdVethx19HF9eaT688Sux5t6WcQcycLCJgKJGDru".to_string(),
            "5RWZnLxovGyWsn3KuWbcBnBNpbJ8FH8eLvxztZaZmWzh".to_string(),
        )
    } else {
    // mainnet keys
        (
            "9z8eyT5meZsQK79Pm2rmqBQcQKfj6tWJfRVbjQczyKcK".to_string(),
            "GJNKMrcsH5m7vem9WSxs7SEpMrHeihNqtQg6CzCFuhPY".to_string(),
            "B9xSJqsBuy9Xj3kCpsh8ZpJpphyU62aaNCqmbL5qsxjC".to_string(),
            "EtgTTdct3r8kJgUmjiWWBrPHG9g5rBhUFouc9npvG6t9".to_string(),
            "8LG7PKi9GyxM7Nm3EVaYDG18fBfwjo5boNtAF5ZiW7KL".to_string(),
            "BeLzpdSP3bsuieattadMFseup9gkuNfNV1Grde134CFH".to_string(),
            "51CQRTPagzt8MX6KBAoAyTfDqM9n4NvepjC4fuZ5fgqu".to_string(),
            "HhZpu7GvaAcU752HeYCApTvjLd9yY66hyRqvbfFxCXd4".to_string(),
            "Gdghebj3V9deG9FuNfS43kDmzTsL5keHYXeCeReaH1bX".to_string(),
            "9RQnXdVethx19HF9eaT688Sux5t6WcQcycLCJgKJGDru".to_string(),
            "5RWZnLxovGyWsn3KuWbcBnBNpbJ8FH8eLvxztZaZmWzh".to_string(),
        )
    };






    match instruction_data[1] {
        0 => {
            msg!("Instruction: 0");
            user_is_buying_resource(
                _program_id,
                accounts,
                instruction_data,
                pda_tools_account_string,
                pda_ammo_account_string,
                pda_fuel_account_string,
                pda_food_account_string,
                pda_star_atlas_account_string,
                allowed_fee_star_atlas_account_string
            )
        }
        1 => {
            msg!("Instruction: 1");
            configure_vault(_program_id, accounts, instruction_data)
        }
        2 => {
            msg!("Instruction: 2");
            update_meta_data(_program_id, accounts, instruction_data)
        }
        3 => {
            msg!("Instruction: 3");
            user_is_selling_resource(
                _program_id,
                accounts,
                instruction_data,
                polaris_tools_account_string,
                polaris_ammo_account_string,
                polaris_fuel_account_string,
                polaris_food_account_string
            )
        }
        4 => {
            msg!("Instruction: 4");
            admin_liquidate_market(
                _program_id,
                accounts,
                instruction_data,
                polaris_admin_pubkey_string
            )
        }
        // Add more instructions as needed...
        _ => {
            return Err(ProgramError::InvalidInstructionData);
        }
    }
}

pub fn user_is_buying_resource(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
    pda_tools_account_string: String,
    pda_ammo_account_string: String,
    pda_fuel_account_string: String,
    pda_food_account_string: String,
    pda_star_atlas_account_string: String,
    allowed_fee_star_atlas_account_string: String
) -> ProgramResult {
    msg!("Sending ATLAS");
    let accounts_iter = &mut accounts.iter();

    //accounts
    let payer_account = next_account_info(accounts_iter)?;
    let pda_account = next_account_info(accounts_iter)?;

    //let star_atlas_mint = next_account_info(accounts_iter)?;
    let user_star_atlas_account = next_account_info(accounts_iter)?;
    let pda_star_atlas_account = next_account_info(accounts_iter)?;

    //let resource_mint = next_account_info(accounts_iter)?;
    let user_resource_account = next_account_info(accounts_iter)?;
    let pda_resource_account = next_account_info(accounts_iter)?;
    let fee_star_atlas_account = next_account_info(accounts_iter)?;

    let system_program = next_account_info(accounts_iter)?;
    let token_program = next_account_info(accounts_iter)?;

    //let reward_mint = next_account_info(accounts_iter)?;
    //let reward_recepient_account = next_account_info(accounts_iter)?;
    let marketplace_account = next_account_info(accounts_iter)?;

    let seed = &instruction_data[2..15];
    let bump = instruction_data[15];
    let amount = u64::from_be_bytes((&instruction_data[16..24]).try_into().unwrap()).to_be();

    //security check
    let allowed_resource_accounts = vec![
        pda_tools_account_string,
        pda_ammo_account_string,
        pda_fuel_account_string,
        pda_food_account_string
    ];

    if allowed_resource_accounts.contains(&pda_resource_account.key.to_string()) {
        msg!("The resource destination wallet is correct");
    } else {
        msg!("The resource destination wallet is not correct");
        return Err(ProgramError::InvalidInstructionData);
    }

    //security check

    if pda_star_atlas_account_string == pda_star_atlas_account.key.to_string() {
        msg!("The market atlas destination wallet is correct");
    } else {
        msg!("The market atlas destination wallet is not correct");
        return Err(ProgramError::InvalidInstructionData);
    }

    //security check
    if allowed_fee_star_atlas_account_string == fee_star_atlas_account.key.to_string() {
        msg!("The fee destination wallet is correct");
    } else {
        msg!("The fee destination wallet is not correct");
        return Err(ProgramError::InvalidInstructionData);
    }

    // msg!("Accounts passed in from_account: {:?}", from_account);
    // msg!("Accounts passed i to_accountn: {:?}", to_account);
    // msg!("Accounts passed in owner_account: {:?}", pda_account);
    // msg!("Accounts passed in token_mint: {:?}", token_mint);
    // msg!("Accounts passed in system_program: {:?}", system_program);
    // msg!("Accounts passed in reward_mint: {:?}", reward_mint);
    // msg!("Accounts passed in reward_recepient_account: {:?}", reward_recepient_account);
    msg!("Accounts passed in marketplace_account: {:?}", marketplace_account);

    let data = &marketplace_account.data.borrow_mut();

    msg!("Accounts passed in data: {:?}", data);
    msg!("Accounts passed in data: {:?}", data.len());

    //Deserialize the account data into a MarketPlaceData
    let marketplace_data = MarketPlaceData::try_from_slice(data).map_err(
        |_| ProgramError::InvalidAccountData
    )?;

    msg!("ammo_price: {}", marketplace_data.ammo_price);
    msg!("food: {}", marketplace_data.food);
    msg!("fuel: {}", marketplace_data.fuel);
    msg!("tool: {}", marketplace_data.tool);
    msg!("reward: {}", marketplace_data.reward);

    msg!("Trade unit amount: {:?}", amount);
    msg!("Trade cost: {:?}", (amount as f64) * marketplace_data.tool);

    let cost = ((amount as f64) * marketplace_data.tool * (10_f64).powi(8)) as u64;

    msg!("Trade cost: {:?}", cost);

    // //msg!("Passed in seed: {:?}", seed);

    // Checking if passed PDA and expected PDA are equal
    let signers_seeds: &[&[u8]; 2] = &[seed, &[bump]];

    //--------------------------------------------------//
    //                                                  //
    //      transfer atlas user is buying resource      //
    //                                                  //
    //--------------------------------------------------//

    let (quot, rem) = (cost / 100, cost % 100);
    let cost_1 = quot + (if rem > 0 { 1 } else { 0 });

    let cost_99 = cost - cost_1;

    let transfer_instruction = spl_token::instruction::transfer(
        token_program.key,
        user_star_atlas_account.key, //from
        pda_star_atlas_account.key, //to
        payer_account.key,
        &[],
        cost_99
    )?;

    invoke_signed(
        &transfer_instruction,
        &[
            token_program.clone(),
            user_star_atlas_account.clone(),
            pda_star_atlas_account.clone(),
            payer_account.clone(),
            system_program.clone(),
        ],
        &[signers_seeds]
    )?;

    //transfer to fee acount

    let transfer_instruction = spl_token::instruction::transfer(
        token_program.key,
        user_star_atlas_account.key, //from
        fee_star_atlas_account.key, //to
        payer_account.key,
        &[],
        cost_1
    )?;

    invoke_signed(
        &transfer_instruction,
        &[
            token_program.clone(),
            user_star_atlas_account.clone(),
            pda_star_atlas_account.clone(),
            payer_account.clone(),
            system_program.clone(),
        ],
        &[signers_seeds]
    )?;

    //----------------------------//
    //                            //
    //      transfer resource     //
    //                            //
    //----------------------------//
    let transfer_instruction = spl_token::instruction::transfer(
        token_program.key,
        pda_resource_account.key, //from
        user_resource_account.key, //to
        pda_account.key,
        &[],
        amount
    )?;

    invoke_signed(
        &transfer_instruction,
        &[
            token_program.clone(),
            pda_resource_account.clone(),
            user_resource_account.clone(),
            pda_account.clone(),
            system_program.clone(),
        ],
        &[signers_seeds]
    )?;

    //----------------------------//
    //                            //
    //         Polarix EXP        //
    //                            //
    //----------------------------//
    // let transfer_instruction = spl_token::instruction::mint_to(
    //     token_program.key,
    //     reward_mint.key,
    //     reward_recepient_account.key,
    //     pda_account.key,
    //     &[],
    //     cost * (marketplace_data.reward as u64)
    // )?;

    // invoke_signed(
    //     &transfer_instruction,
    //     &[
    //         reward_mint.clone(),
    //         reward_recepient_account.clone(),
    //         pda_account.clone(),
    //         system_program.clone(),
    //     ],
    //     &[signers_seeds]
    // )?;

    Ok(())
}

pub fn configure_vault(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {
    msg!("Configuring Marketplace Prices");

    let accounts_iter = &mut accounts.iter();
    // Payer account
    let feepayer_account = next_account_info(accounts_iter)?;
    // vault pda
    let marketplace_config_account = next_account_info(accounts_iter)?;

    msg!("Configuring Data Length {:?}", instruction_data.len());

    let data = &mut *marketplace_config_account.data.borrow_mut();
    msg!("Configuring Marketplace Config Data Length {:?}", data.len());
    msg!("Configuring Marketplace Config Data {:?}", data);

    //Deserialize the account data into a MarketPlaceData
    let marketplace_data = MarketPlaceData::try_from_slice(data).map_err(
        |_| ProgramError::InvalidAccountData
    )?;

    msg!("Configuring Marketplace is {:?}", marketplace_data.is_initialized);

    if
        marketplace_data.is_initialized != 0 &&
        marketplace_data.admin_pubkey == *feepayer_account.key.as_ref()
    {
        if instruction_data.len() == data.len() + 2 {
            data[0..instruction_data.len() - 2].copy_from_slice(&instruction_data[2..]);
        } else {
            return Err(ProgramError::InvalidAccountData);
        }
    }

    if marketplace_data.is_initialized == 0 {
        if instruction_data.len() == data.len() + 2 {
            data[0..instruction_data.len() - 2].copy_from_slice(&instruction_data[2..]);
        } else {
            return Err(ProgramError::InvalidAccountData);
        }
    }

    Ok(())
}

pub fn update_meta_data(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {
    msg!("Updating Meta Data");

    let accounts_iter = &mut accounts.iter();
    // Payer account
    let feepayer_account = next_account_info(accounts_iter)?;
    // msg!("Accounts passed in feepayer_account: {:?}", feepayer_account);

    let metadata_program = next_account_info(accounts_iter)?;
    // msg!("Accounts passed in metadata_program: {:?}", metadata_program);

    let metadata_account = next_account_info(accounts_iter)?;
    // msg!("Accounts passed in metadata_account: {:?}", metadata_account);

    let reward_mint_account = next_account_info(accounts_iter)?;
    // msg!("Accounts passed in reward_mint_account: {:?}", reward_mint_account);

    let pda_account = next_account_info(accounts_iter)?;
    // msg!("Accounts passed in pda_account: {:?}", pda_account);

    let system_program_account = next_account_info(accounts_iter)?;
    // msg!("Accounts passed in system_program_account: {:?}", system_program_account);

    let seed = &instruction_data[2..15];
    let bump = instruction_data[15];
    let meta_data_data = &instruction_data[16..instruction_data.len()];

    // msg!("Passed in seed: {:?}", seed);
    // msg!("Passed in bump: {:?}", bump);
    // msg!("Passed in meta_data_data: {:?}", meta_data_data);

    // Checking if passed PDA and expected PDA are equal
    let signers_seeds: &[&[u8]] = &[seed, &[bump]];

    let instruction = Instruction {
        program_id: *metadata_program.key,
        accounts: vec![
            AccountMeta::new(*metadata_account.key, false),
            AccountMeta::new_readonly(*reward_mint_account.key, false),
            AccountMeta::new_readonly(*pda_account.key, true),
            AccountMeta::new(*feepayer_account.key, true),
            AccountMeta::new_readonly(*pda_account.key, false),
            AccountMeta::new_readonly(*system_program_account.key, false)
        ],
        data: meta_data_data.to_vec(),
    };

    invoke_signed(
        &instruction,
        &[
            metadata_account.clone(),
            reward_mint_account.clone(),
            pda_account.clone(),
            feepayer_account.clone(),
            system_program_account.clone(),
        ],
        &[signers_seeds]
    )?;

    Ok(())
}

pub fn user_is_selling_resource(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
    polaris_tools_account_string: String,
    polaris_ammo_account_string: String,
    polaris_fuel_account_string: String,
    polaris_food_account_string: String
) -> ProgramResult {
    msg!("Sending ATLAS");
    let accounts_iter = &mut accounts.iter();

    //accounts
    let payer_account = next_account_info(accounts_iter)?;
    let pda_account = next_account_info(accounts_iter)?;

    //let star_atlas_mint = next_account_info(accounts_iter)?;
    let user_star_atlas_account = next_account_info(accounts_iter)?;
    let pda_star_atlas_account = next_account_info(accounts_iter)?;

    //tranfers only need the account 
    //let resource_mint = next_account_info(accounts_iter)?;
    let user_resource_account = next_account_info(accounts_iter)?;
    let pda_resource_account = next_account_info(accounts_iter)?;

    let system_program = next_account_info(accounts_iter)?;
    let token_program = next_account_info(accounts_iter)?;

    let reward_mint = next_account_info(accounts_iter)?;
    let reward_recepient_account = next_account_info(accounts_iter)?;
    let marketplace_account = next_account_info(accounts_iter)?;

    let seed = &instruction_data[2..15];
    let bump = instruction_data[15];
    let amount = u64::from_be_bytes((&instruction_data[16..24]).try_into().unwrap()).to_be();

    // msg!("Accounts passed in from_account: {:?}", from_account);
    // msg!("Accounts passed i to_accountn: {:?}", to_account);
    // msg!("Accounts passed in owner_account: {:?}", pda_account);
    // msg!("Accounts passed in token_mint: {:?}", token_mint);
    // msg!("Accounts passed in system_program: {:?}", system_program);
    // msg!("Accounts passed in reward_mint: {:?}", reward_mint);
    // msg!("Accounts passed in reward_recepient_account: {:?}", reward_recepient_account);
    msg!("Accounts passed in marketplace_account: {:?}", marketplace_account);

    let data = &marketplace_account.data.borrow_mut();

    msg!("Accounts passed in data: {:?}", data);
    msg!("Accounts passed in data: {:?}", data.len());

    //Deserialize the account data into a MarketPlaceData
    let marketplace_data = MarketPlaceData::try_from_slice(data).map_err(
        |_| ProgramError::InvalidAccountData
    )?;

    msg!("ammo_price: {}", marketplace_data.ammo_price);
    msg!("food: {}", marketplace_data.food);
    msg!("fuel: {}", marketplace_data.fuel);
    msg!("tool: {}", marketplace_data.tool);
    msg!("reward: {}", marketplace_data.reward);

    msg!("Trade unit amount: {:?}", amount);
    msg!("Trade cost: {:?}", (amount as f64) * marketplace_data.tool);

    let cost = ((amount as f64) *
        (marketplace_data.tool - marketplace_data.tool * 0.1) *
        (10_f64).powi(8)) as u64;

    msg!("Trade cost: {:?}", cost);

    // //msg!("Passed in seed: {:?}", seed);

    // Checking if passed PDA and expected PDA are equal
    let signers_seeds: &[&[u8]; 2] = &[seed, &[bump]];

    //----------------------------//
    //                            //
    //      transfer atlas        //
    //                            //
    //----------------------------//
    let transfer_instruction = spl_token::instruction::transfer(
        token_program.key,
        pda_star_atlas_account.key, //from
        user_star_atlas_account.key, //to
        pda_account.key,
        &[],
        cost
    )?;

    invoke_signed(
        &transfer_instruction,
        &[
            token_program.clone(),
            pda_star_atlas_account.clone(),
            user_star_atlas_account.clone(),
            pda_account.clone(),
            system_program.clone(),
        ],
        &[signers_seeds]
    )?;

    //----------------------------//
    //                            //
    //      transfer resource     //
    //                            //
    //----------------------------//

    //destination polaris resource accounts
    let allowed_keys = vec![
        polaris_tools_account_string,
        polaris_ammo_account_string,
        polaris_fuel_account_string,
        polaris_food_account_string
    ];

    if allowed_keys.contains(&pda_resource_account.key.to_string()) {
        msg!("The resource destination wallet is correct");
    } else {
        msg!("The resource destination wallet is not correct");
        return Err(ProgramError::InvalidInstructionData);
    }

    let transfer_instruction = spl_token::instruction::transfer(
        token_program.key,
        user_resource_account.key, //from
        pda_resource_account.key, //to
        payer_account.key,
        &[],
        amount
    )?;

    invoke(
        &transfer_instruction,
        &[
            token_program.clone(),
            user_resource_account.clone(),
            pda_resource_account.clone(),
            payer_account.clone(),
            system_program.clone(),
        ]
    )?;

    //----------------------------//
    //                            //
    //         Polarix EXP        //
    //                            //
    //----------------------------//
    let transfer_instruction = spl_token::instruction::mint_to(
        token_program.key,
        reward_mint.key,
        reward_recepient_account.key,
        pda_account.key,
        &[],
        cost * (marketplace_data.reward as u64)
    )?;

    invoke_signed(
        &transfer_instruction,
        &[
            reward_mint.clone(),
            reward_recepient_account.clone(),
            pda_account.clone(),
            system_program.clone(),
        ],
        &[signers_seeds]
    )?;

    Ok(())
}

pub fn admin_liquidate_market(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
    polaris_admin_pubkey_string: String
) -> ProgramResult {
    msg!("Configuring Marketplace Prices");

    let accounts_iter = &mut accounts.iter();
    // Payer account
    let feepayer_account = next_account_info(accounts_iter)?;
    let pda_account = next_account_info(accounts_iter)?;

    // pda accounts
    let pda_atlas_account = next_account_info(accounts_iter)?;
    let pda_tools_account = next_account_info(accounts_iter)?;
    let pda_ammo_account = next_account_info(accounts_iter)?;
    let pda_fuel_account = next_account_info(accounts_iter)?;
    let pda_food_account = next_account_info(accounts_iter)?;

    // destination accounts
    let destination_atlas_account = next_account_info(accounts_iter)?;
    let destination_tools_account = next_account_info(accounts_iter)?;
    let destination_ammo_account = next_account_info(accounts_iter)?;
    let destination_fuel_account = next_account_info(accounts_iter)?;
    let destination_food_account = next_account_info(accounts_iter)?;

    let token_program = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    //instruction data
    let seed = &instruction_data[2..15];
    let bump = instruction_data[15];
    let amount = u64::from_be_bytes((&instruction_data[16..24]).try_into().unwrap()).to_be();

    // Checking if passed PDA and expected PDA are equal
    let signers_seeds: &[&[u8]; 2] = &[seed, &[bump]];

    //security check
    if polaris_admin_pubkey_string == feepayer_account.key.to_string() {
        msg!("Admin called liquidation");
    } else {
        msg!("Not an admin");
        return Err(ProgramError::InvalidInstructionData);
    }
    //liquidate atlas
    let transfer_instruction = spl_token::instruction::transfer(
        token_program.key,
        pda_atlas_account.key, //from
        destination_atlas_account.key, //to
        pda_account.key,
        &[],
        amount
    )?;

    invoke_signed(
        &transfer_instruction,
        &[
            token_program.clone(),
            pda_atlas_account.clone(),
            destination_atlas_account.clone(),
            pda_account.clone(),
            system_program.clone(),
        ],
        &[signers_seeds]
    )?;
    //liquidate tools
    let transfer_instruction = spl_token::instruction::transfer(
        token_program.key,
        pda_tools_account.key, //from
        destination_tools_account.key, //to
        pda_account.key,
        &[],
        amount
    )?;

    invoke_signed(
        &transfer_instruction,
        &[
            token_program.clone(),
            pda_tools_account.clone(),
            destination_tools_account.clone(),
            pda_account.clone(),
            system_program.clone(),
        ],
        &[signers_seeds]
    )?;
    //liquidate ammo
    let transfer_instruction = spl_token::instruction::transfer(
        token_program.key,
        pda_ammo_account.key, //from
        destination_ammo_account.key, //to
        pda_account.key,
        &[],
        amount
    )?;

    invoke_signed(
        &transfer_instruction,
        &[
            token_program.clone(),
            pda_ammo_account.clone(),
            destination_ammo_account.clone(),
            pda_account.clone(),
            system_program.clone(),
        ],
        &[signers_seeds]
    )?;
    //liquidate fuel
    let transfer_instruction = spl_token::instruction::transfer(
        token_program.key,
        pda_fuel_account.key, //from
        destination_fuel_account.key, //to
        pda_account.key,
        &[],
        amount
    )?;

    invoke_signed(
        &transfer_instruction,
        &[
            token_program.clone(),
            pda_fuel_account.clone(),
            destination_fuel_account.clone(),
            pda_account.clone(),
            system_program.clone(),
        ],
        &[signers_seeds]
    )?;
    //liquidate food
    let transfer_instruction = spl_token::instruction::transfer(
        token_program.key,
        pda_food_account.key, //from
        destination_food_account.key, //to
        pda_account.key,
        &[],
        amount
    )?;

    invoke_signed(
        &transfer_instruction,
        &[
            token_program.clone(),
            pda_food_account.clone(),
            destination_food_account.clone(),
            pda_account.clone(),
            system_program.clone(),
        ],
        &[signers_seeds]
    )?;

    Ok(())
}