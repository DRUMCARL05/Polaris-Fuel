//this file has functions and data types I find my self using globally


import { PublicKey } from "@solana/web3.js"; 
import * as BufferLayout from 'buffer-layout';

 
 export async function fetchAccountData(connection,accountPubkeyStr,MAX_RETRIES,RETRY_DELAY) {
    // Convert the provided public key string to a PublicKey object
    const accountPubkey = new PublicKey(accountPubkeyStr);
    
    let retries = 0;
    while (retries < MAX_RETRIES) {
        // Fetch the account info
        const accountInfo = await connection.getAccountInfo(accountPubkey);
        console.log(accountInfo)
  
        if (accountInfo !== null) {
            // If you need the raw data as a buffer
            const dataBuffer = Buffer.from(accountInfo.data);
  
            console.log('Account data:', dataBuffer.toString('base64'));
            return accountInfo;  // Exit the function successfully
        } else {
            console.log(`Attempt ${retries + 1} failed. Retrying...`);
            retries++;
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
    }
  
    console.log('Failed to fetch account data after multiple attempts.');
  }


  // Define the account data structure
export const MarketPlaceDataLayout = BufferLayout.struct([
    BufferLayout.u8('is_initialized'),
    BufferLayout.u8('reward'),
    BufferLayout.f64('ammo_price'),
    BufferLayout.f64('food'),
    BufferLayout.f64('fuel'),
    BufferLayout.f64('tool'),
    BufferLayout.seq(BufferLayout.u8(), 32, 'admin_pubkey'),
    BufferLayout.seq(BufferLayout.u8(), 32, 'destination_atlas_account'),
    BufferLayout.seq(BufferLayout.u8(), 32, 'destination_tools_account'),
    BufferLayout.seq(BufferLayout.u8(), 32, 'destination_ammo_account'),
    BufferLayout.seq(BufferLayout.u8(), 32, 'destination_fuel_account'),
    BufferLayout.seq(BufferLayout.u8(), 32, 'destination_food_account'),
  ]);

  // Define the data layout for a Solana token account
export const TokenAccountDataLayout = BufferLayout.struct([
    BufferLayout.u8('state'), // The state of the token account (0 = Uninitialized, 1 = Initialized)
    BufferLayout.seq(BufferLayout.u8(), 32, 'mint'), // The public key of the token's mint
    BufferLayout.seq(BufferLayout.u8(), 32, 'owner'), // The public key of the account's owner
    BufferLayout.seq(BufferLayout.u8(), 8, 'amount'), // The balance of tokens in the account (8 bytes, typically uint64)
    BufferLayout.seq(BufferLayout.u8(), 93), // Reserved space for future use
]);