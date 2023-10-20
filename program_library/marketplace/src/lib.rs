use solana_program::{
    account_info::{ next_account_info, AccountInfo },
    entrypoint,
    entrypoint::ProgramResult,
    program::{ invoke, invoke_signed },
    program_error::ProgramError,
    pubkey::Pubkey,
    msg,
};

use solana_program::instruction::Instruction;
use solana_program::instruction::AccountMeta;
use borsh::{ BorshDeserialize, BorshSerialize };
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
    pub destination_atlas_account: [u8; 32],
    pub destination_tools_account: [u8; 32],
    pub destination_ammo_account: [u8; 32],
    pub destination_fuel_account: [u8; 32],
    pub destination_food_account: [u8; 32],
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
    let (
        allowed_market_config_account,
        allowed_fee_star_atlas_account_string,
        ) = if instruction_data[0] == 1 {
        // devnet keys
        (
            "4UHduKEwYEG9pGEXZiakoHS561Fm9RkSHa1jQrnqGVoh".to_string(),
            "5RWZnLxovGyWsn3KuWbcBnBNpbJ8FH8eLvxztZaZmWzh".to_string()
        )
    } else {
        // mainnet keys
        (
            "4UHduKEwYEG9pGEXZiakoHS561Fm9RkSHa1jQrnqGVoh".to_string(),
            "2yins5xXP58bGpYQPXAEXkfT9t27ukfoMPzvbeevL1jH".to_string()
        )
    };

    match instruction_data[1] {
        0 => {
            msg!("Instruction: 0");
            user_is_buying_resource(
                _program_id, accounts, instruction_data,
                allowed_market_config_account,
                allowed_fee_star_atlas_account_string)
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
                _program_id, accounts, instruction_data ,allowed_market_config_account)
        }
        4 => {
            msg!("Instruction: 4");
            admin_liquidate_market(_program_id, accounts, instruction_data)
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
    allowed_market_config_account: String,
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

    let marketplace_account = next_account_info(accounts_iter)?;
    let data = &marketplace_account.data.borrow_mut();

    //Deserialize the account data into a MarketPlaceData
    let marketplace_data = MarketPlaceData::try_from_slice(data).map_err(
        |_| ProgramError::InvalidAccountData
    )?;

    //SECURITY CHECK
    if marketplace_account.key.to_string() != allowed_market_config_account {
        msg!("Marketplace data key does not match the market config account.");
        return Err(ProgramError::InvalidInstructionData);
    }

    if pda_star_atlas_account.key.to_bytes() != marketplace_data.destination_atlas_account {
        msg!("PDA star atlas account does not match the destination atlas account.");
        return Err(ProgramError::InvalidInstructionData);
    }

    if fee_star_atlas_account.key.to_string() != allowed_fee_star_atlas_account_string {
        msg!("The fee destination wallet is not correct");
        return Err(ProgramError::InvalidInstructionData);
    }

    let seed = &instruction_data[2..15];
    let bump = instruction_data[15];
    let amount = u64::from_be_bytes((&instruction_data[16..24]).try_into().unwrap()).to_be();
    let res_type = instruction_data[24];

    let cost = match res_type {
        0 => ((amount as f64) * marketplace_data.ammo_price * (10_f64).powi(8)) as u64,
        1 => ((amount as f64) * marketplace_data.food * (10_f64).powi(8)) as u64,
        2 => ((amount as f64) * marketplace_data.fuel * (10_f64).powi(8)) as u64,
        3 => ((amount as f64) * marketplace_data.tool * (10_f64).powi(8)) as u64,
        _ => return Err(ProgramError::InvalidInstructionData),
    };

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
        msg!("Updating Account");

        if instruction_data.len() == data.len() + 2 {
            data[0..instruction_data.len() - 2].copy_from_slice(&instruction_data[2..]);
        } else {
            return Err(ProgramError::InvalidAccountData);
        }
    }

    if marketplace_data.is_initialized == 0 {
        msg!("Creating New Account");
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
    msg!("Passed in meta_data_data: {:?}", meta_data_data);

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
    allowed_market_config_account:String
) -> ProgramResult {
    msg!("User is Selling Resources");
    let accounts_iter = &mut accounts.iter();

    //accounts
    let payer_account = next_account_info(accounts_iter)?;
    let pda_account = next_account_info(accounts_iter)?;
    let user_star_atlas_account = next_account_info(accounts_iter)?;
    let pda_star_atlas_account = next_account_info(accounts_iter)?;
    let user_resource_account = next_account_info(accounts_iter)?;
    let destination_resource_account = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;
    let token_program = next_account_info(accounts_iter)?;
    let reward_mint = next_account_info(accounts_iter)?;
    let reward_recepient_account = next_account_info(accounts_iter)?;
    let marketplace_account = next_account_info(accounts_iter)?;

    let seed = &instruction_data[2..15];
    let bump = instruction_data[15];
    let amount = u64::from_be_bytes((&instruction_data[16..24]).try_into().unwrap()).to_be();

    let data = &marketplace_account.data.borrow_mut();

    let marketplace_data = MarketPlaceData::try_from_slice(data).map_err(
        |_| ProgramError::InvalidAccountData
    )?;

    //SECURITY CHECK
    if marketplace_account.key.to_string() != allowed_market_config_account {
        msg!("Marketplace data key does not match the market config account.");
        return Err(ProgramError::InvalidInstructionData);
    }

    let res_type = instruction_data[24];

    msg!("{:?}",res_type);
    msg!("Passed in destination key: {:?} ",destination_resource_account.key);
    msg!("Passed in destination bytes: {:?} ",destination_resource_account.key.to_bytes());
    msg!("Allowed Destination {:?}: ",marketplace_data.destination_tools_account);

    let cost = match res_type {
        0 => {
            if destination_resource_account.key.to_bytes() != marketplace_data.destination_tools_account {
                msg!("Destination Tool Account is wrong.");
                return Err(ProgramError::InvalidInstructionData);
            }
            ((amount as f64) * marketplace_data.tool * (10_f64).powi(8)) as u64
        },
        1 => {
            if destination_resource_account.key.to_bytes() != marketplace_data.destination_ammo_account {
                msg!("Destination Ammo Account is wrong.");
                return Err(ProgramError::InvalidInstructionData);
            }
            ((amount as f64) * marketplace_data.ammo_price * (10_f64).powi(8)) as u64
        },
        2 => {
            if destination_resource_account.key.to_bytes() != marketplace_data.destination_fuel_account {
                msg!("Destination Fuel Account is wrong.");
                return Err(ProgramError::InvalidInstructionData);
            }
            ((amount as f64) * marketplace_data.fuel * (10_f64).powi(8)) as u64
        },
    
        3 => {
            if destination_resource_account.key.to_bytes() != marketplace_data.destination_food_account {
                msg!("Destination Food Account is wrong.");
                return Err(ProgramError::InvalidInstructionData);
            }
            ((amount as f64) * marketplace_data.food * (10_f64).powi(8)) as u64
        },
    

    

    
        _ => return Err(ProgramError::InvalidInstructionData),
    };


    msg!("ATLAS cost to buy resource {:?}",cost);
    

    let signers_seeds: &[&[u8]; 2] = &[seed, &[bump]];

    msg!("Transfer Functions v2");
    
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
    let transfer_instruction = spl_token::instruction::transfer(
        token_program.key,
        user_resource_account.key, //from
        destination_resource_account.key, //to
        payer_account.key,
        &[],
        amount
    )?;

    invoke(
        &transfer_instruction,
        &[
            token_program.clone(),
            user_resource_account.clone(),
            destination_resource_account.clone(),
            payer_account.clone(),
            system_program.clone(),
        ]
    )?;

    msg!("Sending PXP");
    //----------------------------//
    //                            //
    //         Polarix EXP        //
    //                            //
    //----------------------------//
    let mint_ix = spl_token::instruction::mint_to(
        token_program.key,
        reward_mint.key,
        reward_recepient_account.key,
        pda_account.key,
        &[],
        1
    )?;

    invoke_signed(
        &mint_ix,
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
    instruction_data: &[u8]
) -> ProgramResult {
    msg!("Configuring Marketplace Prices");

    let accounts_iter = &mut accounts.iter();

    //market place
    let marketplace_account = next_account_info(accounts_iter)?;

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

    //SECURITY CHECK
    if marketplace_account.key.to_string() != feepayer_account.key.to_string() {
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
