const solanaWeb3 = require('@solana/web3.js');
const splToken = require('@solana/spl-token');
const metaPlex = require("@metaplex-foundation/mpl-token-metadata");
const { exec } = require('child_process');
const fs = require('fs');
const BufferLayout = require('buffer-layout');



//programId
let programId = new solanaWeb3.PublicKey('ESL7g6h1tZrehkAVXPYmowa43JxurCmJ81A9eFCwZxy9');
const filePath = 'market_config.json';

//star atlast mintkey
let star_atlas_mint = new solanaWeb3.PublicKey('GpVqpNdUG8hJvyiNaDFnTnuiQV6EGFueduTBXAiPabWj');
let tools_mint = new solanaWeb3.PublicKey('3y3D6wHa1dfz8VNVcnejLaLL8Ld41shTaAsjKMBgdzBr');
let ammo_mint = new solanaWeb3.PublicKey('9TrKEhszrsMKYHRBuiXxefcQ4Z1WcAjhdGDBqjw7yrY9');
let fuel_mint = new solanaWeb3.PublicKey('9htVnjLQByoQnucf5Bf2C7eDkhDax7rdU3FTo1KX3ewo');
let food_mint = new solanaWeb3.PublicKey('C769DzsozfZ3SmA8PcScM4hEvkyXiFdhKfKfMiyRVjWG');

let user_star_atlas_account = new solanaWeb3.PublicKey('5RWZnLxovGyWsn3KuWbcBnBNpbJ8FH8eLvxztZaZmWzh')
let user_tools_account = new solanaWeb3.PublicKey('F1EC8s5B4G8tQb32EXHFCNVj4tsdJBdTsqYCHUWE8VU4')
let user_ammo_account = new solanaWeb3.PublicKey('Acm5gA1Av9JqJqDjaihqVrjccCex9fcpUeuT8ycDkvER')
let user_fuel_account = new solanaWeb3.PublicKey('G8phS4WPczLMzGJYhsC9TLtb9dx1SmjFJ25Dsi1NzcEM')
let user_food_account = new solanaWeb3.PublicKey('ghQ6qvEHzqQcFRnSxSELYEsJmjYW5kqXGLau9psNAsZ')

let polaris_atlas_account = new solanaWeb3.PublicKey('AiWxzDe6uaFXFUTGmYKRqAtJVmJYQWns3wM3E2xrFGdk')
let polaris_tools_account = new solanaWeb3.PublicKey('51CQRTPagzt8MX6KBAoAyTfDqM9n4NvepjC4fuZ5fgqu')
let polaris_ammo_account = new solanaWeb3.PublicKey('HhZpu7GvaAcU752HeYCApTvjLd9yY66hyRqvbfFxCXd4')
let polaris_fuel_account = new solanaWeb3.PublicKey('Gdghebj3V9deG9FuNfS43kDmzTsL5keHYXeCeReaH1bX')
let polaris_food_account = new solanaWeb3.PublicKey('9RQnXdVethx19HF9eaT688Sux5t6WcQcycLCJgKJGDru')


//mainnet
// ATLAS Account: jxLwkEdnehBrXGFcM6UaRPPrvDzafBnhBeekHJe2whU
// Tools Account: AaQgVD2uJ4Z6yqeZYcFwfsXCfz3zbnuCwcBp8kmyykGv
// Ammo Account: 4oVXqp5BGbFWBmU3dej2jWbvFmFP1d9TWL995FaBkQUX
// Fuel Account: J3wXM9S6skCnhgNgBHRnVDjtFcACZEsshnxoAPYrJBWx
// Food Account: 4PvVDKh83YAAFHGVGBPMJZHfLUFqSuSyfdiwvo4YMyUn



// Provide the path of the JSON file
const jsonFilePath = '/home/jc/.config/solana/id.json';
let rawData = fs.readFileSync(jsonFilePath);
let jsonData = JSON.parse(rawData);
let feePayerAccount = solanaWeb3.Keypair.fromSecretKey(
  Uint8Array.from(jsonData)
);


// Connect to cluster
let connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'));

//generate pda
let str = 'POLARIS-VAULT';
let seeds = Buffer.from(str, 'utf-8');  // or 'ascii', 'base64', etc. depending on your needs


// Define the account data structure
const MarketPlaceDataLayout = BufferLayout.struct([
  BufferLayout.u8('is_initialized'),
  BufferLayout.u8('reward'),
  BufferLayout.f64('ammo_price'),
  BufferLayout.f64('food'),
  BufferLayout.f64('fuel'),
  BufferLayout.f64('tool'),
  BufferLayout.seq(BufferLayout.u8(), 32, 'admin_pubkey'),
]);

async function getAndDecodeMarketplaceAccountData(connection, pubKey) {
  // Fetch the raw account data
  let accountInfo = await connection.getAccountInfo(pubKey);
  if (accountInfo === null) {
      throw 'Invalid public key or the account does not exist.';
  }
  
  // Decode the account data
  let decodedData = MarketPlaceDataLayout.decode(accountInfo.data);

  // Convert 'admin_pubkey' from Buffer to a Solana public key object
  decodedData.admin_pubkey = new solanaWeb3.PublicKey(decodedData.admin_pubkey);
  
  return decodedData;
}


async function createMarketConfig() {
  let [pdaPublicKey, _nonce] = await solanaWeb3.PublicKey.findProgramAddress([seeds], programId);

  // Calculate the minimum balance for the data account
  let dataSize = 66;
  let minDataBalance = await connection.getMinimumBalanceForRentExemption(dataSize);

  let marketConfigAccount = solanaWeb3.Keypair.generate()

  // Create the data account with the PDA as the owner
  let createDataAccountIx = solanaWeb3.SystemProgram.createAccount({
    fromPubkey: feePayerAccount.publicKey,
    newAccountPubkey: marketConfigAccount.publicKey,
    lamports: minDataBalance,
    space: dataSize,
    programId: programId, // The account should be owned by the program so it can write data
  });

  //pub 32 bytes

  var ammoPrice = 0.0021504;
  var ammoPriceBuffer = Buffer.alloc(8);  // create a new buffer of 8 bytes
  ammoPriceBuffer.writeDoubleLE(ammoPrice);  // write the float to the buffer in little endian format

  var food = 0.0006144;
  var foodBuffer = Buffer.alloc(8);
  foodBuffer.writeDoubleLE(food);
  //console.log(foodBuffer);

  var fuel = 0.0014336;
  var fuelBuffer = Buffer.alloc(8);
  fuelBuffer.writeDoubleLE(fuel);
  //console.log(fuelBuffer);

  var tool = 0.0017408;
  var toolBuffer = Buffer.alloc(8);
  toolBuffer.writeDoubleLE(tool);
  //console.log(toolBuffer);

  var reward = 1;
  var rewardBuffer = Buffer.alloc(1);
  rewardBuffer.writeUint8(reward);
  //console.log(rewardBuffer);

  var iX = 1;
  var iXBuffer = Buffer.alloc(1);
  iXBuffer.writeUint8(iX);

  var isInitialized = 1;
  var isInitializedBuffer = Buffer.alloc(1);
  isInitializedBuffer.writeUint8(isInitialized);

  var dataBuffer = Buffer.concat([iXBuffer,isInitializedBuffer, rewardBuffer, ammoPriceBuffer, foodBuffer, fuelBuffer, toolBuffer,feePayerAccount.publicKey.toBuffer()]);

  var { blockhash } = await connection.getRecentBlockhash();

  // Create a transaction
  transaction = new solanaWeb3.Transaction({
    feePayer: new solanaWeb3.PublicKey(feePayerAccount.publicKey),
    recentBlockhash: blockhash,
  });

  // Create the instruction to send data
  let instructionData = {
    keys: [
      { pubkey: feePayerAccount.publicKey, isSigner: true, isWritable: false },
      { pubkey: marketConfigAccount.publicKey, isSigner: false, isWritable: true }],
    programId,
    data: dataBuffer,
  };
  let sendDataIx = new solanaWeb3.TransactionInstruction(instructionData);

  // Send the transaction
  transaction
    .add(createDataAccountIx)
    .add(sendDataIx)


  transaction.sign(feePayerAccount, marketConfigAccount)


  var transactionId = await connection.sendTransaction(transaction, [feePayerAccount, marketConfigAccount], { skipPreflight: false });


  console.log(`https://explorer.solana.com/tx/${transactionId}?cluster=devnet`)

  return [pdaPublicKey, _nonce, marketConfigAccount]

}

async function create_polaris_exp_token(){

  // let from_account = next_account_info(accounts_iter)?;
  // let to_account = next_account_info(accounts_iter)?;
  // let owner_account = next_account_info(accounts_iter)?;
  // let token_mint = next_account_info(accounts_iter)?;

  //console.log("HERE IS YOUR PDA:"+pdaPublicKey)

  var iX = 0;
  var iXBuffer = Buffer.alloc(1);
  iXBuffer.writeUint8(iX);
  //console.log(iXBuffer);

  var nonceBuffer = Buffer.alloc(1);
  nonceBuffer.writeUint8(_nonce);
  var dataBuffer = Buffer.concat([iXBuffer, seeds, nonceBuffer]);

  // generate a new keypair to be used for our mint
  const polaris_exp_mintKeypair = solanaWeb3.Keypair.generate();

  //console.log("Mint address:", polaris_exp_mintKeypair.publicKey.toBase58());

  // define the assorted token config settings
  const tokenConfig = {
    // define how many decimals we want our tokens to have
    decimals: 8,
    //
    name: "POLARIS exp",
    //
    symbol: "POLEXP",
    //
    uri: "https://raw.githubusercontent.com/redazul/POLARIS/main/POLexp.json",

  };

    // create instruction for the token mint account
    const createMintAccountInstruction = solanaWeb3.SystemProgram.createAccount({
      fromPubkey: feePayerAccount.publicKey,
      newAccountPubkey: polaris_exp_mintKeypair.publicKey,
      // the `space` required for a token mint is accessible in the `@solana/spl-token` sdk
      space: splToken.MINT_SIZE,
      // store enough lamports needed for our `space` to be rent exempt
      lamports: await connection.getMinimumBalanceForRentExemption(splToken.MINT_SIZE),
      // tokens are owned by the "token program"
      programId: splToken.TOKEN_PROGRAM_ID,
    });

    // Initialize that account as a Mint
    const initializeMintInstruction = splToken.createInitializeMint2Instruction(
      polaris_exp_mintKeypair.publicKey,
      tokenConfig.decimals,
      // feePayerAccount.publicKey,
      // feePayerAccount.publicKey,
      pdaPublicKey,
      pdaPublicKey,
    );

    //console.log("MetaData Account")
    let METADATA_PROGRAM_ID = new solanaWeb3.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
    //console.log(METADATA_PROGRAM_ID)

      // derive the pda address for the Metadata account
  const metadataAccount = solanaWeb3.PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), METADATA_PROGRAM_ID.toBuffer(), polaris_exp_mintKeypair.publicKey.toBuffer()],
    METADATA_PROGRAM_ID,
  )[0];

  //console.log("Metadata address:", metadataAccount.toBase58());

  // Create the Metadata account for the Mint
  const createMetadataInstruction = metaPlex.createCreateMetadataAccountV3Instruction(
    {
      metadata: metadataAccount,
      mint: polaris_exp_mintKeypair.publicKey,
      mintAuthority: pdaPublicKey,
      payer: feePayerAccount.publicKey,
      updateAuthority: pdaPublicKey,
    },
    {
      createMetadataAccountArgsV3: {
        data: {
          creators: null,
          name: tokenConfig.name,
          symbol: tokenConfig.symbol,
          uri: tokenConfig.uri,
          sellerFeeBasisPoints: 0,
          collection: null,
          uses: null,
        },
        // `collectionDetails` - for non-nft type tokens, normally set to `null` to not have a value set
        collectionDetails: null,
        // should the metadata be updatable?
        isMutable: true,
      },
    },
  );



  var { blockhash } = await connection.getRecentBlockhash();

  // Create a transaction
  var transaction3 = new solanaWeb3.Transaction({
    feePayer: feePayerAccount.publicKey,
    recentBlockhash: blockhash,
  });

  transaction3
  .add(createMintAccountInstruction)
  .add(initializeMintInstruction)

  //metadata update
  var iX = 2;
  var iXBuffer = Buffer.alloc(1);
  iXBuffer.writeUint8(iX);

  var dataBuffer = Buffer.concat([iXBuffer, seeds, nonceBuffer,createMetadataInstruction.data]);

  let metaDataInstruction = {
    keys: [
      { pubkey: feePayerAccount.publicKey, isSigner: true, isWritable: true }, 
      { pubkey: new solanaWeb3.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"), isSigner: false, isWritable: false }, 
      { pubkey: new solanaWeb3.PublicKey(metadataAccount.toBase58()), isSigner: false, isWritable: true }, 
      { pubkey: polaris_exp_mintKeypair.publicKey, isSigner: false, isWritable: true }, 
      { pubkey: pdaPublicKey, isSigner: false, isWritable: false }, 
      { pubkey: solanaWeb3.SystemProgram.programId, isSigner: false, isWritable: false }, //systemProgram
    ],
    programId,
    data: dataBuffer,
  };


  transaction3.add(metaDataInstruction)


  transaction3.sign(feePayerAccount,polaris_exp_mintKeypair)  



  const transactionId3 = await connection.sendTransaction(transaction3, [feePayerAccount,polaris_exp_mintKeypair], { skipPreflight: false });
  console.log(`https://explorer.solana.com/tx/${transactionId3}?cluster=devnet`)


  let stdstring=""
  exec(`spl-token create-account ${polaris_exp_mintKeypair.publicKey}`, (error, stdout, stderr) => {
    if (error) {
      //console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      //console.log(`stderr: ${stderr}`);
      return;
    }
    //console.log(`stdout: ${stdout}`);
    stdstring = stdout;

  });

  console.log("Please wait")
  await new Promise(r => setTimeout(r, 6000));

  let user_polaris_exp_reward_account = stdstring.split(" ")[2].split(" ")[0].split("\n")[0]

  return [polaris_exp_mintKeypair, user_polaris_exp_reward_account]

}

async function create_or_get_accounts_for_pda(base58_pubkey)
{



  try {

    
    //star atlas
    pda_star_atlas_mint_tokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
      connection,
      feePayerAccount,
      star_atlas_mint,
      pdaPublicKey,
      true
    )
  
    //tools mint
    pda_tools_mint_tokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
      connection,
      feePayerAccount,
      tools_mint,
      pdaPublicKey,
      true
    )
  
    //ammo
    pda_ammo_mint_tokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
      connection,
      feePayerAccount,
      ammo_mint,
      pdaPublicKey,
      true
    )
  
    //fuel_mint
    pda_fuel_mint_tokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
      connection,
      feePayerAccount,
      fuel_mint,
      pdaPublicKey,
      true
    )
  
    //food_mint
    pda_food_mint_tokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
      connection,
      feePayerAccount,
      food_mint,
      pdaPublicKey,
      true
    )
    
  } catch (error) {

    console.log("This is a normal error please run the script again")
    console.log("Basically the PDA account has not been found yet")
  }




    return [pda_star_atlas_mint_tokenAccount,pda_tools_mint_tokenAccount,pda_ammo_mint_tokenAccount,pda_fuel_mint_tokenAccount,pda_food_mint_tokenAccount]

}



async function getBalance(connection, pubKey) {
  let accountInfo = await connection.getParsedAccountInfo(pubKey);
  if (accountInfo.value === null) {
      throw 'Invalid public key or the account does not exist.';
  }
  let tokenAccountInfo = accountInfo.value.data.parsed.info;
  let balance = tokenAccountInfo.tokenAmount.uiAmount;
  return balance;
}


let pdaPublicKey, _nonce, marketConfigAccount
let pda_star_atlas_mint_tokenAccount,pda_tools_mint_tokenAccount,pda_ammo_mint_tokenAccount,pda_fuel_mint_tokenAccount,pda_food_mint_tokenAccount
let polaris_exp_mintKeypair

async function stockingMarket()
{
  console.log("Wait")
  console.log("Stocking Market")

  console.log("Transferring StarAtlas")
  signature = await splToken.transfer(
    connection,
    feePayerAccount,
    user_star_atlas_account,
    pda_star_atlas_account,
    feePayerAccount.publicKey,
    100
  );
  console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`)

  console.log("Transferring AMMO")
  signature = await splToken.transfer(
    connection,
    feePayerAccount,
    user_ammo_account,
    pda_ammo_mint_tokenAccount,
    feePayerAccount.publicKey,
    100
  );
  console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`)

  console.log("Transferring TOOLS")
  signature = await splToken.transfer(
    connection,
    feePayerAccount,
    user_tools_account,
    pda_tools_mint_tokenAccount,
    feePayerAccount.publicKey,
    100
  );
  console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`)

  console.log("Transferring FOOD")
  signature = await splToken.transfer(
    connection,
    feePayerAccount,
    user_food_account,
    pda_food_mint_tokenAccount,
    feePayerAccount.publicKey,
    100
  );
  console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`)


  console.log("Transferring FUEL")
  signature = await splToken.transfer(
    connection,
    feePayerAccount,
    user_fuel_account,
    pda_fuel_mint_tokenAccount,
    feePayerAccount.publicKey,
    100
  );
  console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`)

  let market_config_data = await getAndDecodeMarketplaceAccountData(connection,marketConfigAccount)


  console.log(" ")
  console.log("Polaris Marketplace Admin: "+market_config_data.admin_pubkey.toBase58())
  console.log("Polaris Exp Multiplier: "+market_config_data.reward)
  console.log("_____________________________________________________")
  console.log("             |    POLARIS MARKET  |                  ")
  console.log("_____________|____________________|__________________")
  console.log("       NAME  |         QTY        |      MSRP        ")
  console.log("_____________|____________________|__________________")
  console.log("       ATLAS |       "+await getBalance(connection,pda_star_atlas_account)+"    |"+"                ")
  console.log("       AMMO  |       "+await getBalance(connection,pda_ammo_mint_tokenAccount)+"         |   "+ market_config_data.ammo_price+" ATLAS                ")
  console.log("       TOOLS |       "+await getBalance(connection,pda_tools_mint_tokenAccount)+"         |   "+ market_config_data.food+" ATLAS                ")
  console.log("       FOOD  |       "+await getBalance(connection,pda_food_mint_tokenAccount)+"         |   "+ market_config_data.fuel+" ATLAS                ")
  console.log("       FUEL  |       "+await getBalance(connection,pda_fuel_mint_tokenAccount)+"         |   "+ market_config_data.tool+" ATLAS                ")
  console.log("_____________|____________________|__________________")

}


async function process_config(existingData)
{
  // Use the existing data object
  console.log('Existing data:', existingData);


  //test sell
  pda_star_atlas_account = new solanaWeb3.PublicKey(existingData.pda_star_atlas_account)
  pda_polaris_exp_mint = new solanaWeb3.PublicKey(existingData.pda_polaris_exp_mint)
  user_polaris_exp_reward_account = new solanaWeb3.PublicKey(existingData.user_polaris_exp_account)
  marketConfigAccount = new solanaWeb3.PublicKey(existingData.market_config_account)
  user_star_atlas_account = new solanaWeb3.PublicKey(existingData.user_star_atlas_account)
  pdaPublicKey = new solanaWeb3.PublicKey(existingData.pda)
  pda_ammo_mint_tokenAccount = new solanaWeb3.PublicKey(existingData.pda_ammo_mint_tokenAccount)
  pda_tools_mint_tokenAccount = new solanaWeb3.PublicKey(existingData.pda_tools_mint_tokenAccount)
  pda_food_mint_tokenAccount = new solanaWeb3.PublicKey(existingData.pda_food_mint_tokenAccount)
  pda_fuel_mint_tokenAccount = new solanaWeb3.PublicKey(existingData.pda_fuel_mint_tokenAccount)

  
  await stockingMarket()


  console.log("Testing Buy")
  await buy_from_marketplace(0);

  
  console.log("Testing Sell")
  await sell_to_marketplace(0);

  console.log("Testing Liquidation")
  await liquidate_market();


}

async function buy_from_marketplace(resource_type)
{ 

  let [pdaPublicKey, _nonce] = await solanaWeb3.PublicKey.findProgramAddress([seeds], programId);
  console.log("pda: "+pdaPublicKey.toBase58())


  var iX = 0;
  var iXBuffer = Buffer.alloc(1);
  iXBuffer.writeUint8(iX);

  var nonceBuffer = Buffer.alloc(1);
  nonceBuffer.writeUint8(_nonce);
  var dataBuffer = Buffer.concat([iXBuffer, seeds, nonceBuffer]);

  var buy_ammount = 30
  var buy_ammountBuffer = Buffer.alloc(8);
  buy_ammountBuffer.writeUint8(buy_ammount);

  var dataBuffer = Buffer.concat([iXBuffer, seeds, nonceBuffer,buy_ammountBuffer]);


  let resourceMints = [tools_mint,ammo_mint,fuel_mint,food_mint]
  let userResourceAccounts=[user_tools_account,user_ammo_account,user_fuel_account,user_food_account]
  let pdaResourceAccounts=[pda_tools_mint_tokenAccount,pda_ammo_mint_tokenAccount,pda_fuel_mint_tokenAccount,pda_food_mint_tokenAccount]

  if(resource_type>-1 && resource_type<4)
  {

  }else{
    console.log("Invalid Sell Operation")
    return 0
  }

  // Create the instruction to send data
  let instructionData2 = {
    keys: [
      { pubkey: feePayerAccount.publicKey, isSigner: true, isWritable: false }, //user + feePayer
      { pubkey: pdaPublicKey, isSigner: false, isWritable: false }, //pda

      { pubkey: star_atlas_mint, isSigner: false, isWritable: false }, // star atlas mint
      { pubkey: user_star_atlas_account, isSigner: false, isWritable: true }, //user star atlas account
      { pubkey: pda_star_atlas_account, isSigner: false, isWritable: true }, //pda star atlas account 

      { pubkey: resourceMints[resource_type], isSigner: false, isWritable: false }, // resource mint
      { pubkey: userResourceAccounts[resource_type], isSigner: false, isWritable: true }, //user resource account
      { pubkey: pdaResourceAccounts[resource_type], isSigner: false, isWritable: true }, //pda resource account
      { pubkey: new solanaWeb3.PublicKey("5RWZnLxovGyWsn3KuWbcBnBNpbJ8FH8eLvxztZaZmWzh"), isSigner: false, isWritable: true }, //fee account


      { pubkey: solanaWeb3.SystemProgram.programId, isSigner: false, isWritable: false }, //systemProgram
      { pubkey: splToken.TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }, //token program


      { pubkey: pda_polaris_exp_mint, isSigner: false, isWritable: true }, //reward mint
      { pubkey: user_polaris_exp_reward_account, isSigner: false, isWritable: true }, //reward account of the user
      { pubkey: marketConfigAccount, isSigner: false, isWritable: true }, //marketplace account
    ],
    programId,
    data: dataBuffer,
  };

  let sendDataIx2 = new solanaWeb3.TransactionInstruction(instructionData2);

  var { blockhash } = await connection.getRecentBlockhash();

  // Create a transaction
  var transaction2 = new solanaWeb3.Transaction({
    feePayer: new solanaWeb3.PublicKey(feePayerAccount.publicKey),
    recentBlockhash: blockhash,
  });

  transaction2.add(sendDataIx2)


  transaction2.sign(feePayerAccount)


  const transactionId2 = await connection.sendTransaction(transaction2, [feePayerAccount], { skipPreflight: true });

  console.log(`https://explorer.solana.com/tx/${transactionId2}?cluster=devnet`)


}

async function sell_to_marketplace(resource_type)
{ 

  let [pdaPublicKey, _nonce] = await solanaWeb3.PublicKey.findProgramAddress([seeds], programId);
  console.log("pda: "+pdaPublicKey.toBase58())


  var iX = 3;
  var iXBuffer = Buffer.alloc(1);
  iXBuffer.writeUint8(iX);

  var nonceBuffer = Buffer.alloc(1);
  nonceBuffer.writeUint8(_nonce);
  var dataBuffer = Buffer.concat([iXBuffer, seeds, nonceBuffer]);

  var sell_ammount = 30
  var sell_ammountBuffer = Buffer.alloc(8);
  sell_ammountBuffer.writeUint8(sell_ammount);

  var dataBuffer = Buffer.concat([iXBuffer, seeds, nonceBuffer,sell_ammountBuffer]);


  let resourceMints = [tools_mint,ammo_mint,fuel_mint,food_mint]
  let userResourceAccounts=[user_tools_account,user_ammo_account,user_fuel_account,user_food_account]
  let pdaResourceAccounts=[polaris_tools_account,polaris_ammo_account,polaris_fuel_account,polaris_food_account]

  if(resource_type>-1 && resource_type<4)
  {

  }else{
    console.log("Invalid Sell Operation")
    return 0
  }

  // Create the instruction to send data
  let instructionData2 = {
    keys: [
      { pubkey: feePayerAccount.publicKey, isSigner: true, isWritable: false }, //user + feePayer
      { pubkey: pdaPublicKey, isSigner: false, isWritable: false }, //pda

      { pubkey: star_atlas_mint, isSigner: false, isWritable: false }, // star atlas mint
      { pubkey: user_star_atlas_account, isSigner: false, isWritable: true }, //user star atlas account
      { pubkey: pda_star_atlas_account, isSigner: false, isWritable: true }, //pda star atlas account 

      { pubkey: resourceMints[resource_type], isSigner: false, isWritable: false }, // resource mint
      { pubkey: userResourceAccounts[resource_type], isSigner: false, isWritable: true }, //user resource account
      { pubkey: pdaResourceAccounts[resource_type], isSigner: false, isWritable: true }, //pda resource account -> 6/27 asked to move to polaris account instead

      { pubkey: solanaWeb3.SystemProgram.programId, isSigner: false, isWritable: false }, //systemProgram
      { pubkey: splToken.TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }, //token program


      { pubkey: pda_polaris_exp_mint, isSigner: false, isWritable: true }, //reward mint
      { pubkey: user_polaris_exp_reward_account, isSigner: false, isWritable: true }, //reward account of the user
      { pubkey: marketConfigAccount, isSigner: false, isWritable: true }, //marketplace account
    ],
    programId,
    data: dataBuffer,
  };

  let sendDataIx2 = new solanaWeb3.TransactionInstruction(instructionData2);

  var { blockhash } = await connection.getRecentBlockhash();

  // Create a transaction
  var transaction2 = new solanaWeb3.Transaction({
    feePayer: new solanaWeb3.PublicKey(feePayerAccount.publicKey),
    recentBlockhash: blockhash,
  });

  transaction2.add(sendDataIx2)


  transaction2.sign(feePayerAccount)


  const transactionId2 = await connection.sendTransaction(transaction2, [feePayerAccount], { skipPreflight: true });

  console.log(`https://explorer.solana.com/tx/${transactionId2}?cluster=devnet`)


}

async function buy_from_marketplace(resource_type)
{ 

  let [pdaPublicKey, _nonce] = await solanaWeb3.PublicKey.findProgramAddress([seeds], programId);
  console.log("pda: "+pdaPublicKey.toBase58())


  var iX = 0;
  var iXBuffer = Buffer.alloc(1);
  iXBuffer.writeUint8(iX);

  var nonceBuffer = Buffer.alloc(1);
  nonceBuffer.writeUint8(_nonce);
  var dataBuffer = Buffer.concat([iXBuffer, seeds, nonceBuffer]);

  var buy_ammount = 30
  var buy_ammountBuffer = Buffer.alloc(8);
  buy_ammountBuffer.writeUint8(buy_ammount);

  var dataBuffer = Buffer.concat([iXBuffer, seeds, nonceBuffer,buy_ammountBuffer]);


  let resourceMints = [tools_mint,ammo_mint,fuel_mint,food_mint]
  let userResourceAccounts=[user_tools_account,user_ammo_account,user_fuel_account,user_food_account]
  let pdaResourceAccounts=[pda_tools_mint_tokenAccount,pda_ammo_mint_tokenAccount,pda_fuel_mint_tokenAccount,pda_food_mint_tokenAccount]

  if(resource_type>-1 && resource_type<4)
  {

  }else{
    console.log("Invalid Sell Operation")
    return 0
  }

  // Create the instruction to send data
  let instructionData2 = {
    keys: [
      { pubkey: feePayerAccount.publicKey, isSigner: true, isWritable: false }, //user + feePayer
      { pubkey: pdaPublicKey, isSigner: false, isWritable: false }, //pda

      { pubkey: star_atlas_mint, isSigner: false, isWritable: false }, // star atlas mint
      { pubkey: user_star_atlas_account, isSigner: false, isWritable: true }, //user star atlas account
      { pubkey: pda_star_atlas_account, isSigner: false, isWritable: true }, //pda star atlas account 

      { pubkey: resourceMints[resource_type], isSigner: false, isWritable: false }, // resource mint
      { pubkey: userResourceAccounts[resource_type], isSigner: false, isWritable: true }, //user resource account
      { pubkey: pdaResourceAccounts[resource_type], isSigner: false, isWritable: true }, //pda resource account
      { pubkey: new solanaWeb3.PublicKey("5RWZnLxovGyWsn3KuWbcBnBNpbJ8FH8eLvxztZaZmWzh"), isSigner: false, isWritable: true }, //fee account


      { pubkey: solanaWeb3.SystemProgram.programId, isSigner: false, isWritable: false }, //systemProgram
      { pubkey: splToken.TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }, //token program


      { pubkey: pda_polaris_exp_mint, isSigner: false, isWritable: true }, //reward mint
      { pubkey: user_polaris_exp_reward_account, isSigner: false, isWritable: true }, //reward account of the user
      { pubkey: marketConfigAccount, isSigner: false, isWritable: true }, //marketplace account
    ],
    programId,
    data: dataBuffer,
  };

  let sendDataIx2 = new solanaWeb3.TransactionInstruction(instructionData2);

  var { blockhash } = await connection.getRecentBlockhash();

  // Create a transaction
  var transaction2 = new solanaWeb3.Transaction({
    feePayer: new solanaWeb3.PublicKey(feePayerAccount.publicKey),
    recentBlockhash: blockhash,
  });

  transaction2.add(sendDataIx2)


  transaction2.sign(feePayerAccount)


  const transactionId2 = await connection.sendTransaction(transaction2, [feePayerAccount], { skipPreflight: true });

  console.log(`https://explorer.solana.com/tx/${transactionId2}?cluster=devnet`)


}

async function liquidate_market()
{ 

  let [pdaPublicKey, _nonce] = await solanaWeb3.PublicKey.findProgramAddress([seeds], programId);
  console.log("pda: "+pdaPublicKey.toBase58())


  var iX = 4;
  var iXBuffer = Buffer.alloc(1);
  iXBuffer.writeUint8(iX);

  var nonceBuffer = Buffer.alloc(1);
  nonceBuffer.writeUint8(_nonce);
  var dataBuffer = Buffer.concat([iXBuffer, seeds, nonceBuffer]);

  var liquidate_ammount = 1  
  var liquidate_ammountBuffer = Buffer.alloc(8);
  liquidate_ammountBuffer.writeUint8(liquidate_ammount);

  var dataBuffer = Buffer.concat([iXBuffer, seeds, nonceBuffer,liquidate_ammountBuffer]);


  // Create the instruction to send data
  let instructionData2 = {
    keys: [
      { pubkey: feePayerAccount.publicKey, isSigner: true, isWritable: false }, //user + feePayer
      { pubkey: pdaPublicKey, isSigner: false, isWritable: false }, //pda

      { pubkey: pda_star_atlas_account, isSigner: false, isWritable: true }, //pda star atlas account 
      { pubkey: pda_tools_mint_tokenAccount, isSigner: false, isWritable: true }, //pda star atlas account 
      { pubkey: pda_ammo_mint_tokenAccount, isSigner: false, isWritable: true }, //pda star atlas account 
      { pubkey: pda_fuel_mint_tokenAccount, isSigner: false, isWritable: true }, //pda star atlas account 
      { pubkey: pda_food_mint_tokenAccount, isSigner: false, isWritable: true }, //pda star atlas account 

      { pubkey: user_star_atlas_account, isSigner: false, isWritable: true }, //user atlas account 
      { pubkey: user_tools_account, isSigner: false, isWritable: true }, //user atlas account 
      { pubkey: user_ammo_account, isSigner: false, isWritable: true }, //user atlas account 
      { pubkey: user_fuel_account, isSigner: false, isWritable: true }, //user atlas account 
      { pubkey: user_food_account, isSigner: false, isWritable: true }, //user atlas account 


      { pubkey: splToken.TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }, //token program
      { pubkey: solanaWeb3.SystemProgram.programId, isSigner: false, isWritable: false }, //systemProgram
    ],
    programId,
    data: dataBuffer,
  };

  let sendDataIx2 = new solanaWeb3.TransactionInstruction(instructionData2);

  var { blockhash } = await connection.getRecentBlockhash();

  // Create a transaction
  var transaction2 = new solanaWeb3.Transaction({
    feePayer: new solanaWeb3.PublicKey(feePayerAccount.publicKey),
    recentBlockhash: blockhash,
  });

  transaction2.add(sendDataIx2)


  transaction2.sign(feePayerAccount)


  const transactionId2 = await connection.sendTransaction(transaction2, [feePayerAccount], { skipPreflight: true });

  console.log(`https://explorer.solana.com/tx/${transactionId2}?cluster=devnet`)


}



async function main()
{


  // Check if the file exists
  if (fs.existsSync(filePath)) {
    // Read the contents of the file
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading JSON file:', err);
      } else {
        try {
          // Parse the JSON data
          const existingData = JSON.parse(data);
          process_config(existingData)

          // Perform further operations with the existingData object
          
        } catch (err) {
          console.error('Error parsing JSON:', err);
        }
      }
    });
  }else{
    console.log("Creating Market Config")

    [pdaPublicKey, _nonce, marketConfigAccount, pda_star_atlas_mint_tokenAccount,pda_tools_mint_tokenAccount,pda_ammo_mint_tokenAccount,pda_fuel_mint_tokenAccount,pda_food_mint_tokenAccount] = await createMarketConfig();
    [pda_star_atlas_mint_tokenAccount,pda_tools_mint_tokenAccount,pda_ammo_mint_tokenAccount,pda_fuel_mint_tokenAccount,pda_food_mint_tokenAccount] = await create_or_get_accounts_for_pda();
    [polaris_exp_mintKeypair,user_polaris_exp_reward_account] = await create_polaris_exp_token();
  
    let market_config = {
      "market_admin":feePayerAccount.publicKey.toBase58(),
      "market_config_account":marketConfigAccount.publicKey.toBase58(),
      "programId":programId.toBase58(),
      "star_atlas_mint":star_atlas_mint.toBase58(),
      "tools_mint":tools_mint.toBase58(),
      "ammo_mint":ammo_mint.toBase58(),
      "fuel_mint":fuel_mint.toBase58(),
      "food_mint":food_mint.toBase58(),
      "pda": pdaPublicKey.toBase58(),
      "pda_star_atlas_account":pda_star_atlas_mint_tokenAccount.address.toBase58(),
      "pda_tools_mint_tokenAccount":pda_tools_mint_tokenAccount.address.toBase58(),
      "pda_ammo_mint_tokenAccount":pda_ammo_mint_tokenAccount.address.toBase58(),
      "pda_fuel_mint_tokenAccount":pda_fuel_mint_tokenAccount.address.toBase58(),
      "pda_food_mint_tokenAccount":pda_food_mint_tokenAccount.address.toBase58(),
      "pda_polaris_exp_mint": polaris_exp_mintKeypair.publicKey.toBase58(),
      "user_star_atlas_account":user_star_atlas_account.toBase58(),
      "user_polaris_exp_account":user_polaris_exp_reward_account   
    }
  
    console.log(market_config)
  
    const jsonData = JSON.stringify(market_config, null, 2);
  
    fs.writeFile('market_config.json', jsonData, 'utf8', (err) => {
      if (err) {
        console.error('Error writing config file:', err);
      } else {
        console.log('Market config file has been written successfully.');
      }
  
    })
  }

}


console.log("Checking for Config File")
main()
