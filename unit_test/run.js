
import {create_polaris_exp_token} from './utils/create_polaris_exp_token.js'
import {create_or_get_accounts_for_pda} from './utils/create_or_get_accounts_for_pda.js'
import {createMarketConfig} from "./utils/createMarketConfig.js"
import { stockingMarket,displayMarket } from './utils/stockingMarket.js';
import { sell_to_marketplace } from './utils/sell_to_marketplace.js';
import { buy_from_marketplace } from './utils/buy_from_marketplace.js';


import fs from 'fs';
import * as solanaWeb3 from '@solana/web3.js';


import * as BufferLayout from 'buffer-layout';

// const umi = require('@metaplex-foundation/umi');






// //const metaPlex = require("@metaplex-foundation/js");

// // /console.log(metaPlex)
// //console.log(metaPlexMetaData.getCreateMetadataAccountV3InstructionDataSerializer())




// //programId
// const filePath = 'market_config.json';









  






// //generate pda
// let str = 'POLARIS-VAULT';
// let seeds = Buffer.from(str, 'utf-8');  // or 'ascii', 'base64', etc. depending on your needs




async function process_config(existingData)
{



  //console.log(existingData.decodedData.admin_pubkey)

  const MAX_RETRIES = 5;  // You can adjust this value
  const RETRY_DELAY = 5000;  // 5 seconds. Adjust as needed.
  let accountInfo = await fetchAccountData(connection,existingData.market_config_account_publicKey.toBase58(),MAX_RETRIES,RETRY_DELAY);
  
  // Decode the account data
  let decodedData = MarketPlaceDataLayout.decode(accountInfo.data);

  console.log(decodedData)

  //this is stocking the PDA
  console.log("Stocking Market")
  stockingMarket(connection,feePayerKp,existingData.user_star_atlas_account,existingData.pda_star_atlas_tokenAccount,feePayerKp.publicKey,200000000)
  stockingMarket(connection,feePayerKp,existingData.user_tools_account,existingData.pda_tools_tokenAccount,feePayerKp.publicKey,10)
  stockingMarket(connection,feePayerKp,existingData.user_ammo_account,existingData.pda_ammo_tokenAccount,feePayerKp.publicKey,10)
  stockingMarket(connection,feePayerKp,existingData.user_fuel_account,existingData.pda_fuel_tokenAccount,feePayerKp.publicKey,10)
  stockingMarket(connection,feePayerKp,existingData.user_food_account,existingData.pda_food_tokenAccount,feePayerKp.publicKey,10)


  let destination_accounts={
    destination_star_atlas_tokenAccount:existingData.destination_star_atlas_account,
    destination_tools_tokenAccount:existingData.destination_tools_account,
    destination_ammo_tokenAccount:existingData.destination_ammo_account,
    destination_fuel_tokenAccount:existingData.destination_fuel_account,
    destination_food_tokenAccount:existingData.destination_food_account,
  }

  let pda_accounts={
    pda_star_atlas_tokenAccount:existingData.pda_star_atlas_tokenAccount,
    pda_tools_tokenAccount:existingData.pda_tools_tokenAccount,
    pda_ammo_tokenAccount:existingData.pda_ammo_tokenAccount,
    pda_fuel_tokenAccount:existingData.pda_fuel_tokenAccount,
    pda_food_tokenAccount:existingData.pda_food_tokenAccount,
  }

  let user_accounts={
    user_atlas_account : existingData.user_star_atlas_account,
    user_tools_account : existingData.user_tools_account,
    user_ammo_account : existingData.user_ammo_account,
    user_fuel_account : existingData.user_fuel_account,
    user_food_account : existingData.user_food_account,
    user_pxp_account : existingData.user_pxp_account
  }


 decodedData.admin_pubkey = new solanaWeb3.PublicKey(decodedData.admin_pubkey)

  
  await displayMarket(connection,decodedData,pda_accounts)

  let pda_polaris_exp_mint= existingData.pda_polaris_exp_mint
  let market_config_account_publicKey= existingData.market_config_account_publicKey

  await sell_to_marketplace(0,seeds,onNet,_nonce,
    pda_accounts,
    destination_accounts,
    user_accounts,
    feePayerKp,
    pdaPublicKey,
    pda_polaris_exp_mint,
    market_config_account_publicKey,
    programId,
    connection
    )

    await buy_from_marketplace(0,seeds,programId,
      onNet,user_accounts,
      pda_accounts,feePayerKp,
      destination_accounts.destination_star_atlas_tokenAccount,
      market_config_account_publicKey,connection,
      allowedFeeSAAccount)






    // decodedData.destination_atlas_account = new solanaWeb3.PublicKey(decodedData.destination_atlas_account)
    // decodedData.destination_tools_account = new solanaWeb3.PublicKey(decodedData.destination_tools_account)
    // decodedData.destination_ammo_account = new solanaWeb3.PublicKey(decodedData.destination_ammo_account)
    // decodedData.destination_fuel_account = new solanaWeb3.PublicKey(decodedData.destination_fuel_account)
    // decodedData.destination_food_account = new solanaWeb3.PublicKey(decodedData.destination_food_account)

    // console.log(decodedData.admin_pubkey.toBase58())

    // console.log("\nAccountData")
    // console.log(decodedData.destination_atlas_account.toBase58())
    // console.log("Tool_Account: "+decodedData.destination_tools_account.toBase58())
    // console.log(decodedData.destination_ammo_account.toBase58())
    // console.log(decodedData.destination_fuel_account.toBase58())
    // console.log(decodedData.destination_food_account.toBase58())

    // console.log("\nInstructionData")

    // console.log(existingData.destination_star_atlas_account.toBase58())
    // console.log("Tool_Account: "+existingData.destination_tools_account.toBase58())
    // console.log(existingData.destination_ammo_account.toBase58())
    // console.log(existingData.destination_fuel_account.toBase58())
    // console.log(existingData.destination_food_account.toBase58())


    // BufferLayout.seq(BufferLayout.u8(), 32, 'destination_atlas_account'),
    // BufferLayout.seq(BufferLayout.u8(), 32, 'destination_tools_account'),
    // BufferLayout.seq(BufferLayout.u8(), 32, 'destination_ammo_account'),
    // BufferLayout.seq(BufferLayout.u8(), 32, 'destination_fuel_account'),
    // BufferLayout.seq(BufferLayout.u8(), 32, 'destination_food_account'),

}



// async function liquidate_market()
// { 

//   let [pdaPublicKey, _nonce] = await solanaWeb3.PublicKey.findProgramAddress([seeds], programId);
//   console.log("pda: "+pdaPublicKey.toBase58())


//   var iX = 4;
//   var iXBuffer = Buffer.alloc(1);
//   iXBuffer.writeUint8(iX);

//   var nonceBuffer = Buffer.alloc(1);
//   nonceBuffer.writeUint8(_nonce);
//   var dataBuffer = Buffer.concat([iXBuffer, seeds, nonceBuffer]);

//   var liquidate_ammount = 1  
//   var liquidate_ammountBuffer = Buffer.alloc(8);
//   liquidate_ammountBuffer.writeUint8(liquidate_ammount);

//   var dataBuffer = Buffer.concat([iXBuffer, seeds, nonceBuffer,liquidate_ammountBuffer]);


//   // Create the instruction to send data
//   let instructionData2 = {
//     keys: [
//       { pubkey: feePayerKp.publicKey, isSigner: true, isWritable: false }, //user + feePayer
//       { pubkey: pdaPublicKey, isSigner: false, isWritable: false }, //pda

//       { pubkey: pda_star_atlas_account, isSigner: false, isWritable: true }, //pda star atlas account 
//       { pubkey: pda_tools_mint_tokenAccount, isSigner: false, isWritable: true }, //pda star atlas account 
//       { pubkey: pda_ammo_mint_tokenAccount, isSigner: false, isWritable: true }, //pda star atlas account 
//       { pubkey: pda_fuel_mint_tokenAccount, isSigner: false, isWritable: true }, //pda star atlas account 
//       { pubkey: pda_food_mint_tokenAccount, isSigner: false, isWritable: true }, //pda star atlas account 

//       { pubkey: user_star_atlas_account, isSigner: false, isWritable: true }, //user atlas account 
//       { pubkey: user_tools_account, isSigner: false, isWritable: true }, //user atlas account 
//       { pubkey: user_ammo_account, isSigner: false, isWritable: true }, //user atlas account 
//       { pubkey: user_fuel_account, isSigner: false, isWritable: true }, //user atlas account 
//       { pubkey: user_food_account, isSigner: false, isWritable: true }, //user atlas account 


//       { pubkey: splToken.TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }, //token program
//       { pubkey: solanaWeb3.SystemProgram.programId, isSigner: false, isWritable: false }, //systemProgram
//     ],
//     programId,
//     data: dataBuffer,
//   };

//   let sendDataIx2 = new solanaWeb3.TransactionInstruction(instructionData2);

//   var { blockhash } = await connection.getRecentBlockhash();

//   // Create a transaction
//   var transaction2 = new solanaWeb3.Transaction({
//     feePayer: new solanaWeb3.PublicKey(feePayerKp.publicKey),
//     recentBlockhash: blockhash,
//   });

//   transaction2.add(sendDataIx2)


//   transaction2.sign(feePayerKp)


//   const transactionId2 = await connection.sendTransaction(transaction2, [feePayerKp], { skipPreflight: true });

//   console.log(`https://explorer.solana.com/tx/${transactionId2}?cluster=devnet`)


// }

// //updated by main
// let marketConfigAccountPubKey
// let pda_star_atlas_account ,pda_ammo_mint_tokenAccount,pda_tools_mint_tokenAccount,pda_food_mint_tokenAccount,pda_fuel_mint_tokenAccount
// let pda_polaris_exp_mint, user_polaris_exp_reward_account
// let destination_star_atlas_account,destination_tools_mint_tokenAccount,destination_ammo_mint_tokenAccount,destination_fuel_mint_tokenAccount,destination_food_mint_tokenAccount
// let admin = new solanaWeb3.PublicKey("PLRSGTRwq2rz8S62JFWbtFEixvetZ4v58KQWi21kLxg")

async function fetchAccountData(connection,accountPubkeyStr,MAX_RETRIES,RETRY_DELAY) {
  // Convert the provided public key string to a PublicKey object
  const accountPubkey = new solanaWeb3.PublicKey(accountPubkeyStr);
  
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



async function InitMarket()
{

  let onNET=1;
  let adminString = "PLRSGTRwq2rz8S62JFWbtFEixvetZ4v58KQWi21kLxg";
  let admin_pubkey = new solanaWeb3.PublicKey(adminString)
  let adminBuffer = new solanaWeb3.PublicKey(adminString).toBuffer();
    //init
  let star_atlas_mint = ""    
  let tools_mint = ""    
  let ammo_mint = ""    
  let fuel_mint = ""    
  let food_mint = ""    
  
  let connection
  //1 devent 
  //0 mainnet
  if(onNET==1)
  {
    //devnet keys
    console.log("ON DEVNET")
    connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'));
  
    //used to create pda token
    star_atlas_mint = new solanaWeb3.PublicKey('GpVqpNdUG8hJvyiNaDFnTnuiQV6EGFueduTBXAiPabWj');
    tools_mint = new solanaWeb3.PublicKey('3y3D6wHa1dfz8VNVcnejLaLL8Ld41shTaAsjKMBgdzBr');
    ammo_mint = new solanaWeb3.PublicKey('9TrKEhszrsMKYHRBuiXxefcQ4Z1WcAjhdGDBqjw7yrY9');
    fuel_mint = new solanaWeb3.PublicKey('9htVnjLQByoQnucf5Bf2C7eDkhDax7rdU3FTo1KX3ewo');
    food_mint = new solanaWeb3.PublicKey('C769DzsozfZ3SmA8PcScM4hEvkyXiFdhKfKfMiyRVjWG');
  
  
  }else
  {
    console.log("ON MAINNET")

    // Connect to cluster
    connection = new solanaWeb3.Connection('https://winter-divine-crater.solana-mainnet.quiknode.pro/e245f53447c82dcd216b89244c8ea868c8962284/');
  
    //mainnet
    //used to create pda token
    star_atlas_mint = new solanaWeb3.PublicKey('ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx');
    tools_mint = new solanaWeb3.PublicKey('tooLsNYLiVqzg8o4m3L2Uetbn62mvMWRqkog6PQeYKL');
    ammo_mint = new solanaWeb3.PublicKey('ammoK8AkX2wnebQb35cDAZtTkvsXQbi82cGeTnUvvfK');
    fuel_mint = new solanaWeb3.PublicKey('fueL3hBZjLLLJHiFH9cqZoozTG3XQZ53diwFPwbzNim');
    food_mint = new solanaWeb3.PublicKey('foodQJAztMzX1DKpLaiounNe2BDMds5RNuPC6jsNrDG');
  
  }


  console.log("Fresh Start")

  //create pxp
  let [pda_polaris_exp_mint,user_polaris_exp_account] = await create_polaris_exp_token(onNET,_nonce,seeds,feePayerKp,connection,pdaPublicKey,programId);
  let user_pxp_account = new solanaWeb3.PublicKey(user_polaris_exp_account)
  
  //get pda accounts 
  let [pda_star_atlas_tokenAccount,pda_tools_tokenAccount,pda_ammo_tokenAccount,pda_fuel_tokenAccount,pda_food_tokenAccount] =await create_or_get_accounts_for_pda(pdaPublicKey,connection,feePayerKp,star_atlas_mint,ammo_mint,tools_mint,fuel_mint,food_mint)

  //get user accounts 
  let [user_star_atlas_account,user_tools_account,user_ammo_account,user_fuel_account,user_food_account] =await create_or_get_accounts_for_pda(feePayerKp.publicKey,connection,feePayerKp,star_atlas_mint,ammo_mint,tools_mint,fuel_mint,food_mint)


  //get destination accounts 
  let [destination_star_atlas_account,destination_tools_account,destination_ammo_account,destination_fuel_account,destination_food_account] =await create_or_get_accounts_for_pda(admin_pubkey,connection,feePayerKp,star_atlas_mint,ammo_mint,tools_mint,fuel_mint,food_mint)


  //this controls prices
  let market_config_account_publicKey = await createMarketConfig(connection,feePayerKp,programId,onNET,adminBuffer,
    destination_star_atlas_account,
    destination_tools_account,       
    destination_ammo_account,
    destination_fuel_account,   
    destination_food_account
    );

  let market_config = 
  {
    programId:programId.toBase58(),
    pdaPublicKey:pdaPublicKey.toBase58(),
    market_config_account_publicKey: market_config_account_publicKey.toBase58(),
    pda_polaris_exp_mint: pda_polaris_exp_mint.toBase58(),
    destination_star_atlas_account: destination_star_atlas_account.toBase58(),
    destination_tools_account:destination_tools_account.toBase58(),
    destination_ammo_account:destination_ammo_account.toBase58(),
    destination_fuel_account:destination_fuel_account.toBase58(),
    destination_food_account:destination_food_account.toBase58(),
    pda_star_atlas_tokenAccount: pda_star_atlas_tokenAccount.toBase58(),
    pda_tools_tokenAccount: pda_tools_tokenAccount.toBase58(),
    pda_ammo_tokenAccount: pda_ammo_tokenAccount.toBase58(),
    pda_fuel_tokenAccount: pda_fuel_tokenAccount.toBase58(),
    pda_food_tokenAccount: pda_food_tokenAccount.toBase58(),
    user_pxp_account: user_pxp_account.toBase58(),
    user_star_atlas_account: user_star_atlas_account.toBase58(),
    user_tools_account: user_tools_account.toBase58(),
    user_ammo_account: user_ammo_account.toBase58(),
    user_fuel_account: user_fuel_account.toBase58(),
    user_food_account: user_food_account.toBase58(),

};

  console.log(market_config)
  
  let myData = JSON.stringify(market_config, null, 2);

  if(onNET==1)
  {
    fs.writeFile('./devnet_market_config.json', myData, 'utf8', (err) => {
      if (err) {
        console.error('Error writing config file:', err);
      } else {
        console.log('Market config file has been written successfully.');
      }
    })
  
  }

  if(onNET==0)
  {
    fs.writeFile('./mainnet_market_config.json', myData, 'utf8', (err) => {
      if (err) {
        console.error('Error writing config file:', err);
      } else {
        console.log('Market config file has been written successfully.');
      }
    })
  
  }

}

//devnet
let onNet = 1

// Provide the path of the JSON file
const jsonFilePath = '/home/jc/.config/solana/id.json';
let rawData = fs.readFileSync(jsonFilePath);
let jsonData = JSON.parse(rawData);
let feePayerKp = solanaWeb3.Keypair.fromSecretKey(
  Uint8Array.from(jsonData)
);

//programId
let programId = new solanaWeb3.PublicKey('AwAEpzS3PxwCCKkJQuj7KiqbQ3fA9jkzjTvs52GvRkgN');

//generate pda
let str = 'POLARIS-VAULT';
let seeds = Buffer.from(str, 'utf-8');  // or 'ascii', 'base64', etc. depending on your needs
let [pdaPublicKey, _nonce] = await solanaWeb3.PublicKey.findProgramAddress([seeds], programId);

let connection;
let allowedFeeSAAccount;

if(onNet==1)
{
  console.log("ON DEVNET")
  connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'));
  allowedFeeSAAccount = new solanaWeb3.PublicKey("5RWZnLxovGyWsn3KuWbcBnBNpbJ8FH8eLvxztZaZmWzh");
}else
{
  console.log("ON MAINNET")
  connection = new solanaWeb3.Connection('https://winter-divine-crater.solana-mainnet.quiknode.pro/e245f53447c82dcd216b89244c8ea868c8962284/');
  allowedFeeSAAccount = new solanaWeb3.PublicKey("2yins5xXP58bGpYQPXAEXkfT9t27ukfoMPzvbeevL1jH");

}


// Define the account data structure
const MarketPlaceDataLayout = BufferLayout.struct([
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


function main()
{
    let filePath = 'mainnet_market_config.json';
    if(onNet==1)
    {
      filePath = 'devnet_market_config.json';
    }else
    {
      filePath = 'mainet_market_config.json';
    }
    
      // Check if the file exists
      let existingData
      if (fs.existsSync(filePath)) {
        // Read the contents of the file
        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            console.error('Error reading JSON file:', err);
          } else {
            try {
              // Parse the JSON data
              existingData = JSON.parse(data);
              console.log(existingData)

              Object.keys(existingData).forEach(key=>{
                existingData[key] = new solanaWeb3.PublicKey(existingData[key]);
              })

              //console.log(existingData)
              process_config(existingData)


              // Perform further operations with the existingData object
            } catch (err) {
              console.error('Error parsing JSON:', err);
            }
          }
        });
      }else{
        InitMarket()
      }
}

main()
