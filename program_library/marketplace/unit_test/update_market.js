const solanaWeb3 = require('@solana/web3.js');
const splToken = require('@solana/spl-token');
const metaPlex = require("@metaplex-foundation/mpl-token-metadata");
const { exec } = require('child_process');
const fs = require('fs');
const BufferLayout = require('buffer-layout');



//programId
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

let pda_star_atlas_mint_tokenAccount,pda_tools_mint_tokenAccount,pda_ammo_mint_tokenAccount,pda_fuel_mint_tokenAccount,pda_food_mint_tokenAccount

async function updateMarketConfig(marketConfigAccount,programId) {

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
  let transaction = new solanaWeb3.Transaction({
    feePayer: new solanaWeb3.PublicKey(feePayerAccount.publicKey),
    recentBlockhash: blockhash,
  });

  // Create the instruction to send data
  let instructionData = {
    keys: [
      { pubkey: feePayerAccount.publicKey, isSigner: true, isWritable: false },
      { pubkey: marketConfigAccount, isSigner: false, isWritable: true }],
    programId,
    data: dataBuffer,
  };
  let sendDataIx = new solanaWeb3.TransactionInstruction(instructionData);


  console.log(instructionData.keys)


  // Send the transaction
  transaction
    .add(sendDataIx)


  transaction.sign(feePayerAccount)


  var transactionId = await connection.sendTransaction(transaction, [feePayerAccount], { skipPreflight: false });


  console.log(`https://explorer.solana.com/tx/${transactionId}?cluster=devnet`)


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



async function getBalance(connection, pubKey) {
  let accountInfo = await connection.getParsedAccountInfo(pubKey);
  if (accountInfo.value === null) {
      throw 'Invalid public key or the account does not exist.';
  }
  let tokenAccountInfo = accountInfo.value.data.parsed.info;
  let balance = tokenAccountInfo.tokenAmount.uiAmount;
  return balance;
}



async function process_config(existingData)
{
  // Use the existing data object
  console.log('Existing data:', existingData);


  //test sell
  programId = new solanaWeb3.PublicKey(existingData.programId)
  marketConfigAccount = new solanaWeb3.PublicKey(existingData.market_config_account)
  console.log(marketConfigAccount)

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
  
  updateMarketConfig(marketConfigAccount,programId);


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

    console.log("Config File Not Found")

  
  }

}


console.log("Checking for Config File")
main()
