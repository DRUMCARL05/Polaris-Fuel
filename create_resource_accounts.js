const solanaWeb3 = require('@solana/web3.js');
const splToken = require('@solana/spl-token');
const metaPlex = require("@metaplex-foundation/mpl-token-metadata");
const fs = require('fs');



// Provide the path of the JSON file
const jsonFilePath = '/home/jc/.config/solana/id.json';
let rawData = fs.readFileSync(jsonFilePath);
let jsonData = JSON.parse(rawData);
let feePayerAccount = solanaWeb3.Keypair.fromSecretKey(
  Uint8Array.from(jsonData)
);


let connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('mainnet-beta'));


//star atlast mintkey
let star_atlas_mint = new solanaWeb3.PublicKey('ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx');
let tools_mint = new solanaWeb3.PublicKey('tooLsNYLiVqzg8o4m3L2Uetbn62mvMWRqkog6PQeYKL');
let ammo_mint = new solanaWeb3.PublicKey('ammoK8AkX2wnebQb35cDAZtTkvsXQbi82cGeTnUvvfK');
let fuel_mint = new solanaWeb3.PublicKey('fueL3hBZjLLLJHiFH9cqZoozTG3XQZ53diwFPwbzNim');
let food_mint = new solanaWeb3.PublicKey('foodQJAztMzX1DKpLaiounNe2BDMds5RNuPC6jsNrDG');


let pubkey_to_create_accounts_to = new solanaWeb3.PublicKey("PLRSGTRwq2rz8S62JFWbtFEixvetZ4v58KQWi21kLxg")


// ATLAS Account: jxLwkEdnehBrXGFcM6UaRPPrvDzafBnhBeekHJe2whU
// Tools Account: AaQgVD2uJ4Z6yqeZYcFwfsXCfz3zbnuCwcBp8kmyykGv
// Ammo Account: 4oVXqp5BGbFWBmU3dej2jWbvFmFP1d9TWL995FaBkQUX
// Fuel Account: J3wXM9S6skCnhgNgBHRnVDjtFcACZEsshnxoAPYrJBWx
// Food Account: 4PvVDKh83YAAFHGVGBPMJZHfLUFqSuSyfdiwvo4YMyUn


async function create_or_get_accounts_for_pda()
{



          //star atlas
    pda_star_atlas_mint_tokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
      connection,
      feePayerAccount,
      star_atlas_mint,
      pubkey_to_create_accounts_to,
      true
    )


    console.log("ATLAS Account: "+(pda_star_atlas_mint_tokenAccount.address.toBase58()))

    //tools mint
    pda_tools_mint_tokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
      connection,
      feePayerAccount,
      tools_mint,
      pubkey_to_create_accounts_to,
      true
    )

    console.log("Tools Account: "+(pda_tools_mint_tokenAccount.address.toBase58()))


  
    //ammo
    pda_ammo_mint_tokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
      connection,
      feePayerAccount,
      ammo_mint,
      pubkey_to_create_accounts_to,
      true
    )

    console.log("Ammo Account: "+(pda_ammo_mint_tokenAccount.address.toBase58()))



  
    //fuel_mint
    pda_fuel_mint_tokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
      connection,
      feePayerAccount,
      fuel_mint,
      pubkey_to_create_accounts_to,
      true
    )

    console.log("Fuel Account: "+(pda_fuel_mint_tokenAccount.address.toBase58()))



  
    //food_mint
    pda_food_mint_tokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
      connection,
      feePayerAccount,
      food_mint,
      pubkey_to_create_accounts_to,
      true
    )

    console.log("Food Account: "+(pda_food_mint_tokenAccount.address.toBase58()))




    


}


create_or_get_accounts_for_pda();