"use client"

import React, { Component } from 'react';
import {
  Connection,
  PublicKey,
  clusterApiUrl,
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { relative } from 'path';

import  { TOKEN_PROGRAM_ID } from '@solana/spl-token';


const BufferLayout = require('buffer-layout');


let provider: {
  disconnect(): unknown;
  signAndSendTransaction(transaction: Transaction): { signature: any; } | PromiseLike<{ signature: any; }>; connect: (arg0: { onlyIfTrusted: boolean; } | undefined) => void; on: (arg0: string, arg1: () => void) => void; 
};

  // Define the account data structure
  const MarketPlaceDataLayout = BufferLayout.struct([
    BufferLayout.u8('is_initialized'),
    BufferLayout.u8('reward'),
    BufferLayout.f64('ammo'),
    BufferLayout.f64('food'),
    BufferLayout.f64('fuel'),
    BufferLayout.f64('tools'),
    BufferLayout.seq(BufferLayout.u8(), 32, 'admin_pubkey'),
  ]);

//generate pda
let str = 'POLARIS-VAULT';
let seeds = Buffer.from(str, 'utf-8');  // or 'ascii', 'base64', etc. depending on your needs


//update to mainnet
let connection = new Connection(clusterApiUrl('devnet'));
let programId = new PublicKey('ESL7g6h1tZrehkAVXPYmowa43JxurCmJ81A9eFCwZxy9');
let marketConfigAccount = new PublicKey("DpTW34MTR79ckQHkygyvgDvEMrbdSm5oo83Hdgn9nzGK");

let pda_star_atlas_account = new PublicKey('GJNKMrcsH5m7vem9WSxs7SEpMrHeihNqtQg6CzCFuhPY')
let pda_tools_mint_tokenAccount = new PublicKey('B9xSJqsBuy9Xj3kCpsh8ZpJpphyU62aaNCqmbL5qsxjC')
let pda_ammo_mint_tokenAccount = new PublicKey('EtgTTdct3r8kJgUmjiWWBrPHG9g5rBhUFouc9npvG6t9')
let pda_fuel_mint_tokenAccount = new PublicKey('8LG7PKi9GyxM7Nm3EVaYDG18fBfwjo5boNtAF5ZiW7KL')
let pda_food_mint_tokenAccount = new PublicKey('BeLzpdSP3bsuieattadMFseup9gkuNfNV1Grde134CFH')

let star_atlas_mint = new PublicKey('GpVqpNdUG8hJvyiNaDFnTnuiQV6EGFueduTBXAiPabWj')
let tools_mint = new PublicKey('3y3D6wHa1dfz8VNVcnejLaLL8Ld41shTaAsjKMBgdzBr')
let ammo_mint = new PublicKey('9TrKEhszrsMKYHRBuiXxefcQ4Z1WcAjhdGDBqjw7yrY9')
let fuel_mint = new PublicKey('9htVnjLQByoQnucf5Bf2C7eDkhDax7rdU3FTo1KX3ewo')
let food_mint = new PublicKey('C769DzsozfZ3SmA8PcScM4hEvkyXiFdhKfKfMiyRVjWG')
let polaris_exp_mint = new PublicKey('BT8FRmq3K58YTMDVGiu8gevdLQmnVrXNAprJYxwheXtw')


class page extends Component {

  state={
    userPubKey:null,
    foodMSRdisplay:"...",
    fuelMSRdisplay:"...",
    ammoMSRdisplay:"...",
    toolsMSRdisplay:"...",
    foodMSRP:"...",
    fuelMSRP:"...",
    ammoMSRP:"...",
    toolsMSRP:"...",
    foodSupplyAmountDisplay:"...",
    fuelSupplyAmountDisplay:"...",
    ammoSupplyAmountDisplay:"...",
    toolsSupplyAmountDisplay:"...",
    marketFoodSupplyAmount:"...",
    marketFuelSupplyAmount:"...",
    marketAmmoSupplyAmount:"...",
    marketToolsSupplyAmount:"...",
    user_star_atlas_account :null,
    user_tools_account :null,
    user_ammo_account :null,
    user_fuel_account :null,
    user_food_account :null,
    user_polaris_exp_account:null,
    userStarAtlasSupplyAmount:"...",
    userFoodSupplyAmount:"...",
    userFuelSupplyAmount:"...",
    userAmmoSupplyAmount:"...",
    userToolsSupplyAmount:"...",
    userPolarisExpSupplyAmount:null,
    foodAmount:0,
    fuelAmount:0,
    ammoAmount:0,
    toolsAmount:0,
    display:"customer",
    actionButton:"Buy",
    customerButtonColor:"#e36414",
    providerButtonColor:"#000815CF",
    activeColor:"#e36414",
    inActiveColor:"#000814BF",
    marketFee:0.10,
    amountBoxText:"Buying Amount",
    marketQtyBoxText:"Mrkt QTY",

  }

  async getProvider(){
    if ('phantom' in window) {
      const provider = window.phantom?.solana;
  
      if (provider?.isPhantom) {
        return provider;
      }
    }
  
    window.open('https://phantom.app/', '_blank');
  };



  async getAndDecodeMarketplaceAccountData(connection, pubKey) {
    // Fetch the raw account data
    let accountInfo = await connection.getAccountInfo(pubKey);
    if (accountInfo === null) {
        throw 'Invalid public key or the account does not exist.';
    }
    
    // Decode the account data
    let decodedData = MarketPlaceDataLayout.decode(accountInfo.data);
  
    // Convert 'admin_pubkey' from Buffer to a Solana public key object
    decodedData.admin_pubkey = new PublicKey(decodedData.admin_pubkey);
    
    return decodedData;
  }

  async getBalance(connection, pubKey) {
    let accountInfo = await connection.getParsedAccountInfo(pubKey);
    if (accountInfo.value === null) {
        throw 'Invalid public key or the account does not exist.';
    }
    let tokenAccountInfo = accountInfo.value.data.parsed.info;
    let balance = tokenAccountInfo.tokenAmount.uiAmount;
    return balance;
  }

  async checkAccountForMint(ownerPubkeyStringbase58,mintsObj) {
    console.log("fetching accounts")
    const MY_WALLET_ADDRESS = ownerPubkeyStringbase58;
  
    const accounts = await connection.getParsedProgramAccounts(
      TOKEN_PROGRAM_ID, // new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
      {
        filters: [
          {
            dataSize: 165, // number of bytes
          },
          {
            memcmp: {
              offset: 32, // number of bytes
              bytes: MY_WALLET_ADDRESS, // base58 encoded string
            },
          },
        ],
      }
    );
  
    console.log(
      `Found ${accounts.length} token account(s) for wallet ${MY_WALLET_ADDRESS}: `
    );


    // Prepare an object to store the results
    let results = Object.keys(mintsObj).reduce((acc, key) => ({ ...acc, [key]: 'null' }), {});

    // Array of mints values for checking
    const mintsValues = Object.values(mintsObj);

    // Check each account
    accounts.forEach(account => {
        let accountMint = account.account.data.parsed.info.mint;
        
        // If the account's mint is in the mints array, mark it as 'found'
        if (mintsValues.includes(accountMint)) {
            // Find the key corresponding to this mint value
            const correspondingKey = Object.keys(mintsObj).find(key => mintsObj[key] === accountMint);
            results[correspondingKey] = account;
        }
    });
    
    return results;
}




formatNumber(num) {
  if (num < 1000) {
      // return the same number to 1 decimal place
      return num;
  } else if (num < 1000000) {
      // convert to K and fix to 1 decimal
      return (num / 1000).toFixed(1) + 'K';
  } else if (num < 1000000000) {
      // convert to M and fix to 1 decimal
      return (num / 1000000).toFixed(1) + 'M';
  } else {
      // convert to B and fix to 1 decimal
      return (num / 1000000000).toFixed(1) + 'B';
  }
}

async componentDidMount(){

  provider = await this.getProvider()
    
  console.log(provider)
  try {
    const resp = await provider.connect();
    console.log(resp.publicKey.toString());
    this.setState({userPubKey:resp.publicKey.toString()})
    let walletButton = document.getElementById("WalletButton");
    walletButton.innerHTML = resp.publicKey.toString().slice(0,3) + "..." + resp.publicKey.toString().slice(-3) 




    let retrievedObject = localStorage.getItem(resp.publicKey.toString());

    if (retrievedObject === null) {
        console.log("No object with this key exists in Local Storage.");
        let mintFilter =  {
          "user_star_atlas_account": star_atlas_mint.toBase58(),
          "user_tools_account": tools_mint.toBase58(),
          "user_ammo_account": ammo_mint.toBase58(),
          "user_fuel_account": fuel_mint.toBase58(),
          "user_food_account": food_mint.toBase58(),
          "user_polaris_exp_account": polaris_exp_mint.toBase58()
        }
    
        let parsedTokenAccounts = await this.checkAccountForMint(resp.publicKey.toString(),mintFilter )

      
        console.log(parsedTokenAccounts)

        localStorage.setItem(resp.publicKey.toString(), JSON.stringify(parsedTokenAccounts));

    
        console.log(this.formatNumber(parsedTokenAccounts.user_star_atlas_account.account.data.parsed.info.tokenAmount.amount))
        console.log(this.formatNumber(parsedTokenAccounts.user_tools_account.account.data.parsed.info.tokenAmount.amount))
        console.log(this.formatNumber(parsedTokenAccounts.user_ammo_account.account.data.parsed.info.tokenAmount.amount))
        console.log(this.formatNumber(parsedTokenAccounts.user_fuel_account.account.data.parsed.info.tokenAmount.amount))
        console.log(this.formatNumber(parsedTokenAccounts.user_food_account.account.data.parsed.info.tokenAmount.amount))
        console.log(this.formatNumber(parsedTokenAccounts.user_polaris_exp_account.account.data.parsed.info.tokenAmount.amount))
    
    
        this.setState({
          user_star_atlas_account :parsedTokenAccounts.user_star_atlas_account.pubkey,
          user_tools_account :parsedTokenAccounts.user_tools_account.pubkey,
          user_ammo_account :parsedTokenAccounts.user_ammo_account.pubkey,
          user_fuel_account :parsedTokenAccounts.user_fuel_account.pubkey,
          user_food_account :parsedTokenAccounts.user_food_account.pubkey,
          user_polaris_exp_account :parsedTokenAccounts.user_polaris_exp_account.pubkey,
          userStarAtlasSupplyAmount: parsedTokenAccounts.user_star_atlas_account.account.data.parsed.info.tokenAmount.amount,
          userToolsSupplyAmount:parsedTokenAccounts.user_tools_account.account.data.parsed.info.tokenAmount.amount,
          userAmmoSupplyAmount:parsedTokenAccounts.user_ammo_account.account.data.parsed.info.tokenAmount.amount,
          userFuelSupplyAmount: parsedTokenAccounts.user_fuel_account.account.data.parsed.info.tokenAmount.amount,
          userFoodSupplyAmount: parsedTokenAccounts.user_food_account.account.data.parsed.info.tokenAmount.amount,
          userPolarisExpSupplyAmount: parsedTokenAccounts.user_polaris_exp_account.account.data.parsed.info.tokenAmount.amount,
    
        })
    } else {
        console.log("returning user")
        let parsedTokenAccounts = JSON.parse(retrievedObject);
        console.log(parsedTokenAccounts);
        this.setState({
          user_star_atlas_account :parsedTokenAccounts.user_star_atlas_account.pubkey,
          user_tools_account :parsedTokenAccounts.user_tools_account.pubkey,
          user_ammo_account :parsedTokenAccounts.user_ammo_account.pubkey,
          user_fuel_account :parsedTokenAccounts.user_fuel_account.pubkey,
          user_food_account :parsedTokenAccounts.user_food_account.pubkey,
          user_polaris_exp_account :parsedTokenAccounts.user_polaris_exp_account.pubkey,
          userStarAtlasSupplyAmount: parsedTokenAccounts.user_star_atlas_account.account.data.parsed.info.tokenAmount.amount,
          userToolsSupplyAmount:parsedTokenAccounts.user_tools_account.account.data.parsed.info.tokenAmount.amount,
          userAmmoSupplyAmount:parsedTokenAccounts.user_ammo_account.account.data.parsed.info.tokenAmount.amount,
          userFuelSupplyAmount: parsedTokenAccounts.user_fuel_account.account.data.parsed.info.tokenAmount.amount,
          userFoodSupplyAmount: parsedTokenAccounts.user_food_account.account.data.parsed.info.tokenAmount.amount,
          userPolarisExpSupplyAmount: parsedTokenAccounts.user_polaris_exp_account.account.data.parsed.info.tokenAmount.amount,
        })
    }


  } catch (err) {
      // { code: 4001, message: 'User rejected the request.' }
  }


  let market_config_data = await this.getAndDecodeMarketplaceAccountData(connection,marketConfigAccount)

  let market_atlas =  await this.getBalance(connection,pda_star_atlas_account)
  let market_food = await this.getBalance(connection,pda_food_mint_tokenAccount)
  let market_fuel = await this.getBalance(connection,pda_fuel_mint_tokenAccount)
  let market_ammo = await this.getBalance(connection,pda_ammo_mint_tokenAccount)
  let market_tools = await this.getBalance(connection,pda_tools_mint_tokenAccount)


  this.setState({
    foodSupplyAmountDisplay:this.formatNumber(market_food),
    fuelSupplyAmountDisplay:this.formatNumber(market_fuel),
    ammoSupplyAmountDisplay:this.formatNumber(market_ammo),
    toolsSupplyAmountDisplay:this.formatNumber(market_tools),
    marketFoodSupplyAmount:market_food,
    marketFuelSupplyAmount:market_fuel,
    marketAmmoSupplyAmount:market_ammo,
    marketToolsSupplyAmount:market_tools,
  })



  console.log("Market Admin: " +market_config_data.admin_pubkey.toBase58())



    this.setState({
      foodMSRP:market_config_data.food,
      fuelMSRP:market_config_data.fuel,
      ammoMSRP:market_config_data.ammo,
      toolsMSRP:market_config_data.tools,
      foodMSRdisplay:market_config_data.food,
      fuelMSRdisplay:market_config_data.fuel,
      ammoMSRdisplay:market_config_data.ammo,
      toolsMSRdisplay:market_config_data.tools

    })

    console.log(window.location.pathname)


    provider.on("connect", () => console.log("connected"));

    provider.on('accountChanged', (publicKey: { toBase58: () => any; }) => {
      if (publicKey) {
        // Set new public key and continue as usual
        console.log(`Switched to account ${publicKey.toBase58()}`);
      } else {
        // Attempt to reconnect to Phantom
        provider.connect().catch((error: any) => {
          // Handle connection failure
        });
      }
  });
  }

  async walletClick()
  {
    var walletButton = document.getElementById("WalletButton");
    try {

        if(walletButton.innerHTML.length==9)
        {
          console.log("Connected Here")
          provider.disconnect();
          walletButton.innerHTML ="Connect Wallet"


        }else
        {
          const resp = await provider.connect();
          console.log(resp.publicKey.toString()); 
          walletButton.innerHTML = resp.publicKey.toString().slice(0,3) + "..." + resp.publicKey.toString().slice(-3) 

        }

    } catch (err) {
        // { code: 4001, message: 'User rejected the request.' }
    }


  
  }


  async create_polaris_buy_instruction(resource_type,buy_ammount)
  { 
  
    
    let [pdaPublicKey, _nonce] = await PublicKey.findProgramAddress([seeds], programId);
    console.log("pda: "+pdaPublicKey.toBase58())
  
    var iX = 0;
    var iXBuffer = Buffer.alloc(1);
    iXBuffer.writeUint8(iX);
  
    var nonceBuffer = Buffer.alloc(1);
    nonceBuffer.writeUint8(_nonce);

  
    var buy_ammountBuffer = Buffer.alloc(8);
    buy_ammountBuffer.write(buy_ammount);

  
    var dataBuffer = Buffer.concat([iXBuffer, seeds, nonceBuffer,buy_ammountBuffer]);

  
    let resourceMints = [food_mint,fuel_mint,ammo_mint,tools_mint]
    let userResourceAccounts=[this.state.user_food_account,this.state.user_fuel_account,this.state.user_ammo_account,this.state.user_tools_account]
    let pdaResourceAccounts=[pda_food_mint_tokenAccount,pda_fuel_mint_tokenAccount,pda_ammo_mint_tokenAccount,pda_tools_mint_tokenAccount]

  
    if(resource_type>-1 && resource_type<4)
    {
  
    }else{
      console.log("Invalid Buy Operation")
      return 0
    }
  
    // Create the instruction to send data
    let instructionData2 = {
      keys: [
        { pubkey: new PublicKey(this.state.userPubKey), isSigner: true, isWritable: false }, //user + feePayer
        { pubkey: pdaPublicKey, isSigner: false, isWritable: false }, //pda
  
        { pubkey: star_atlas_mint, isSigner: false, isWritable: false }, // star atlas mint
        { pubkey: new PublicKey(this.state.user_star_atlas_account), isSigner: false, isWritable: true }, //user star atlas account
        { pubkey: pda_star_atlas_account, isSigner: false, isWritable: true }, //pda star atlas account 
  
        { pubkey: resourceMints[resource_type], isSigner: false, isWritable: false }, // resource mint
        { pubkey: new PublicKey(userResourceAccounts[resource_type]), isSigner: false, isWritable: true }, //user resource account
        { pubkey: pdaResourceAccounts[resource_type], isSigner: false, isWritable: true }, //pda resource account
  
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, //systemProgram
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }, //token program
  
  
        { pubkey: polaris_exp_mint, isSigner: false, isWritable: true }, //reward mint
        { pubkey: new PublicKey(this.state.user_polaris_exp_account), isSigner: false, isWritable: true }, //reward account of the user
        { pubkey: marketConfigAccount, isSigner: false, isWritable: true }, //marketplace account
      ],
      programId,
      data: dataBuffer,
    };
  
    let polaris_buy_instruction = new TransactionInstruction(instructionData2);
  
    return polaris_buy_instruction
  
  
  }
  



  async callProgram()
  {


    var walletButton = document.getElementById("WalletButton");
    try {

        if(walletButton.innerHTML.length==9)
        {
   
        }else
        {
          alert("Please Connect Wallet")
          return 0

        }

    } catch (err) {
        // { code: 4001, message: 'User rejected the request.' }
    }


    // Create a transaction
    const transaction = new Transaction();
    transaction.feePayer =new PublicKey(this.state.userPubKey);





    if(this.state.actionButton=="Buy")
    {

      console.log("buying resources")

      let buyOrder = [
        this.state.foodAmount,
        this.state.fuelAmount,
        this.state.ammoAmount,
        this.state.toolsAmount
      ]

      console.log(buyOrder)

      for (let index = 0; index < buyOrder.length; index++) {
        var element = buyOrder[index];
     
          if(element>0)
          {
            console.log(index)
            console.log("creating buy order")
            let ix = await this.create_polaris_buy_instruction(index,element)
            transaction.add(ix)
          }
       
      }


    }else{
      //max user
      alert("selling resources")


    }

    console.log(transaction.instructions.length)

    return 0


    console.log("Calling Program")
    const resp = await provider.connect();
    console.log(resp.publicKey.toString()); 
    var { blockhash } = await connection.getRecentBlockhash();

    console.log(blockhash)


    transaction.recentBlockhash =blockhash;
    const { signature } = await provider.signAndSendTransaction(transaction);
    console.log(signature)
  }

  customerClick()
  {
    this.setState({providerButtonColor:this.state.inActiveColor,
      customerButtonColor:this.state.activeColor,
      actionButton:"Buy",
      amountBoxText:"Buying Amount",
      marketQtyBoxText:"Mrkt QTY",
      foodMSRdisplay:this.state.foodMSRP,
      fuelMSRdisplay:this.state.fuelMSRP,
      ammoMSRdisplay:this.state.ammoMSRP,
      toolsMSRdisplay:this.state.toolsMSRP,
      foodSupplyAmountDisplay:this.formatNumber(this.state.marketFoodSupplyAmount),
      fuelSupplyAmountDisplay:this.formatNumber(this.state.marketFuelSupplyAmount),
      ammoSupplyAmountDisplay:this.formatNumber(this.state.marketAmmoSupplyAmount),
      toolsSupplyAmountDisplay:this.formatNumber(this.state.marketToolsSupplyAmount),
    })
    document.getElementById("food").value = null
    document.getElementById("fuel").value = null
    document.getElementById("ammo").value = null
    document.getElementById("tools").value = null
    this.setState({foodAmount:0})
    this.setState({fuelAmount:0})
    this.setState({ammoAmount:0})
    this.setState({toolsAmount:0})

  }

  providerClick()
  {
    this.setState({providerButtonColor:this.state.activeColor,
      customerButtonColor:this.state.inActiveColor,
      actionButton:"Sell",
      amountBoxText:"Selling Amount",
      marketQtyBoxText:"User QTY",
      foodMSRdisplay:(this.state.foodMSRP + this.state.foodMSRP *this.state.marketFee).toFixed(6),
      fuelMSRdisplay:(this.state.fuelMSRP + this.state.fuelMSRP *this.state.marketFee).toFixed(6),
      ammoMSRdisplay:(this.state.ammoMSRP + this.state.ammoMSRP*this.state.marketFee).toFixed(6),
      toolsMSRdisplay:(this.state.toolsMSRP + this.state.toolsMSRP*this.state.marketFee).toFixed(6),
      foodSupplyAmountDisplay:this.formatNumber(this.state.userFoodSupplyAmount),
      fuelSupplyAmountDisplay:this.formatNumber(this.state.userFuelSupplyAmount),
      ammoSupplyAmountDisplay:this.formatNumber(this.state.userAmmoSupplyAmount),
      toolsSupplyAmountDisplay:this.formatNumber(this.state.userToolsSupplyAmount)
    })
    document.getElementById("food").value = null
    document.getElementById("fuel").value = null
    document.getElementById("ammo").value = null
    document.getElementById("tools").value = null

    this.setState({foodAmount:0})
    this.setState({fuelAmount:0})
    this.setState({ammoAmount:0})
    this.setState({toolsAmount:0})


  }

  changeAmount(event)
  {
    console.log(event.target.id)
    console.log(event.target.value)

    switch (event.target.id) {
      case "food":
        this.setState({foodAmount:event.target.value})
      break;
      case "fuel":
        this.setState({fuelAmount:event.target.value})
      break;
      case "ammo":
        this.setState({ammoAmount:event.target.value})
      break;
      case "tools":
        this.setState({toolsAmount:event.target.value})
      break;
    
      default:
        break;
    }
  }

  foodMaxClicked()
  {
    let foodInput = document.getElementById("food");


    if(this.state.actionButton=="Buy")
    {
     //max market
     foodInput.value = this.state.marketFoodSupplyAmount
     this.setState({foodAmount:this.state.marketFoodSupplyAmount})


    }else{
      //max user
      foodInput.value = this.state.userFoodSupplyAmount
      this.setState({foodAmount:this.state.userFoodSupplyAmount})


    }


  }

  fuelMaxClicked()
  {
    let fuelInput = document.getElementById("fuel");


    if(this.state.actionButton=="Buy")
    {
     //max market
     fuelInput.value = this.state.marketFuelSupplyAmount
     this.setState({fuelAmount:this.state.marketFuelSupplyAmount})


    }else{
      //max user
      fuelInput.value = this.state.userFuelSupplyAmount
      this.setState({fuelAmount:this.state.userFuelSupplyAmount})


    }
    
  }

  ammoMaxClicked()
  {
    let ammoInput = document.getElementById("ammo");


    if(this.state.actionButton=="Buy")
    {
     //max market
     ammoInput.value = this.state.marketAmmoSupplyAmount
     this.setState({ammoAmount: this.state.marketAmmoSupplyAmount})


    }else{
      //max user
      ammoInput.value = this.state.userAmmoSupplyAmount
      this.setState({ammoAmount:this.state.userAmmoSupplyAmount})


    }
    
  }

  toolsMaxClicked()
  {
    let toolsInput = document.getElementById("tools");


    if(this.state.actionButton=="Buy")
    {
     //max market
     toolsInput.value = this.state.marketToolsSupplyAmount
     this.setState({toolsAmount:this.state.marketToolsSupplyAmount})


    }else{
      //max user
      toolsInput.value = this.state.userToolsSupplyAmount
      this.setState({toolsAmount: this.state.userToolsSupplyAmount})


    }
    
  }


  render() {
    return (
      <div>
        {/* NAVBAR START HERE */}
        <div className='navBar' style={{display:"flex", justifyContent: "space-between", width:"100%", marginTop: -20}}>
          <div className="logo" style={{ display: "flex"}}>
            <img style={{marginLeft: 50, marginTop: 50}} width={75} height={75} src="https://cdn.discordapp.com/attachments/1119286494453055528/1126142304319717417/PXPbig-RedCirclePLess.png"></img>
            <h2 style={{color:"white", marginTop:75}}>Polaris Fuel</h2>
          </div>

          <div className="toggle" style={{ display: "flex", borderRadius: 20, overflow: 'hidden', marginTop: 65, border: '2px solid #E36414', background: '#E3641480'}}>
            <button onClick={this.customerClick.bind(this)} style={{width:"170px",height:"60px",backgroundColor:this.state.customerButtonColor,color:"#f0f0f0", border: 'none', outline: 'none', fontSize: '17px', cursor: 'pointer'}}>Customer</button>
            <button onClick={this.providerClick.bind(this)} style={{width:"200px",height:"60px",backgroundColor:this.state.providerButtonColor,color:"#f0f0f0", border: 'none', outline: 'none', fontSize: '17px', cursor: 'pointer'}}>Polaris Provider</button>
          </div>

          <button style={{position:"relative",top:65,width:225,height:60,backgroundColor:"#e36414",color:"white", marginRight: 60, border: 'none', outline: 'none', borderRadius: '20px', fontSize: 18, cursor: 'pointer'}} id="WalletButton" onClick={this.walletClick}>Connect Wallet</button>
        </div>
        {/* NAVBAR ENDS HERE */}


       {/* MARKET UI STARTS HERE */}
       <div style={{display:"flex", justifyContent: "center", marginTop:"75px"}}>
          <div style={{display:"flex", border: '1px solid #6C757D', borderRadius: 15, overflow: 'hidden'}}>
            <div style={{ display: 'flex', flexDirection: 'column', padding: 25, paddingLeft: 50, paddingRight: 50, borderRight: '1px solid #6C757D' }}>
              <h2 style={{ color: '#000814' }}>.</h2>
              <div className="content">
                <h3 style={{ color: '#f0f0f0', fontWeight: 600, marginBottom: 35 }}>FOOD</h3>
                <h3 style={{ color: '#f0f0f0', fontWeight: 600, marginBottom: 35 }}>FUEL</h3>
                <h3 style={{ color: '#f0f0f0', fontWeight: 600, marginBottom: 35 }}>AMMO</h3>
                <h3 style={{ color: '#f0f0f0', fontWeight: 600, marginBottom: 35 }}>TOOLS</h3>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', padding: 25, paddingLeft: 50, paddingRight: 50, borderRight: '1px solid #6C757D' }}>
              <h2 style={{ color: '#f0f0f0', fontWeight: 600 }}>{this.state.marketQtyBoxText}</h2>
              <div className="content">
                <h3 style={{ color: '#f0f0f0', fontWeight: 300, marginBottom: 35}}>{this.state.foodSupplyAmountDisplay}</h3>
                <h3 style={{ color: '#f0f0f0', fontWeight: 300, marginBottom: 35}}>{this.state.fuelSupplyAmountDisplay}</h3>
                <h3 style={{ color: '#f0f0f0', fontWeight: 300, marginBottom: 35}}>{this.state.ammoSupplyAmountDisplay}</h3>
                <h3 style={{ color: '#f0f0f0', fontWeight: 300, marginBottom: 35}}>{this.state.toolsSupplyAmountDisplay}</h3>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', padding: 25, paddingLeft: 50, paddingRight: 50, borderRight: '1px solid #6C757D' }}>
              <h2 style={{ color: '#f0f0f0', fontWeight: 600 }}>Current Price</h2>
              <div className="content">
                <h3 style={{ color: '#E36414', fontWeight: 300, textAlign: 'left', marginBottom: 35}}>{this.state.foodMSRdisplay} <span style={{ color: '#f0f0f0', paddingLeft: 15 }}> Atlas</span></h3>
                <h3 style={{ color: '#E36414', fontWeight: 300, textAlign: 'left', marginBottom: 35}}>{this.state.fuelMSRdisplay} <span style={{ color: '#f0f0f0', paddingLeft: 15 }}> Atlas</span></h3>
                <h3 style={{ color: '#E36414', fontWeight: 300, textAlign: 'left', marginBottom: 35}}>{this.state.ammoMSRdisplay} <span style={{ color: '#f0f0f0', paddingLeft: 15 }}> Atlas</span></h3>
                <h3 style={{ color: '#E36414', fontWeight: 300, textAlign: 'left', marginBottom: 35}}>{this.state.toolsMSRdisplay} <span style={{ color: '#f0f0f0', paddingLeft: 15 }}> Atlas</span></h3>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', padding: 25, paddingLeft: 50, paddingRight: 50, borderRight: '1px solid #6C757D' }}>
              <h2 style={{ color: '#f0f0f0', fontWeight: 600 }}>{this.state.amountBoxText}</h2>
              <div className="content" style={{ marginTop: '13px' }}>
                <div className="buyingAmount">
                  <input type="text" style={{ border: 'none', fontSize: 16, background: '#1C1E20', padding: '0.8rem', outline: '#E36414', color: '#f0f0f0', borderRadius: '5px' }}  placeholder='Enter Amount' id='food' onChange={this.changeAmount.bind(this)} onKeyPress={event => {if(event.key === '.') event.preventDefault();}}/>
                  <button onClick={this.foodMaxClicked.bind(this)} style={{ position: 'relative', left: '-2.5rem',cursor: 'pointer', background: 'none', outline: 'none', border: 'none', backgroundColor: 'none', color: '#E36414', fontSize: 12, fontWeight: 200}}>Max</button>
                  <span style={{color: '#E36414', fontSize: 18}}>{this.formatNumber((this.state.foodMSRdisplay*this.state.foodAmount).toFixed(6))} <span style={{color: '#f0f0f0', paddingLeft: 15}}>  Atlas</span></span>
                </div>
                
                <div style={{marginTop: 12}} className="buyingAmount">
                  <input type="text" style={{ border: 'none', fontSize: 16, background: '#1C1E20', padding: '0.8rem', outline: '#E36414', color: '#f0f0f0', borderRadius: '5px' }}  placeholder='Enter Amount' id='fuel' onChange={this.changeAmount.bind(this)} onKeyPress={event => {if(event.key === '.') event.preventDefault();}}/>
                  <button onClick={this.fuelMaxClicked.bind(this)} style={{ position: 'relative', left: '-2.5rem',cursor: 'pointer', background: 'none', outline: 'none', border: 'none', backgroundColor: 'none', color: '#E36414', fontSize: 12, fontWeight: 200}}>Max</button>
                  <span style={{color: '#E36414', fontSize: 18}}>{this.formatNumber((this.state.fuelMSRdisplay*this.state.fuelAmount).toFixed(6))} <span style={{color: '#f0f0f0', paddingLeft: 15}}>  Atlas</span></span>
                </div>
                
                <div style={{marginTop: 12}} className="buyingAmount">
                  <input type="text" style={{ border: 'none', fontSize: 16, background: '#1C1E20', padding: '0.8rem', outline: '#E36414', color: '#f0f0f0', borderRadius: '5px' }}  placeholder='Enter Amount' id='ammo' onChange={this.changeAmount.bind(this)} onKeyPress={event => {if(event.key === '.') event.preventDefault();}}/>
                  <button onClick={this.ammoMaxClicked.bind(this)} style={{ position: 'relative', left: '-2.5rem',cursor: 'pointer', background: 'none', outline: 'none', border: 'none', backgroundColor: 'none', color: '#E36414', fontSize: 12, fontWeight: 200}}>Max</button>
                  <span style={{color: '#E36414', fontSize: 18}}>{this.formatNumber((this.state.ammoMSRdisplay*this.state.ammoAmount).toFixed(6))} <span style={{color: '#f0f0f0', paddingLeft: 15}}>  Atlas</span></span>
                </div>
                
                <div style={{marginTop: 12}} className="buyingAmount">
                  <input type="text" style={{ border: 'none', fontSize: 16, background: '#1C1E20', padding: '0.8rem', outline: '#E36414', color: '#f0f0f0', borderRadius: '5px' }}  placeholder='Enter Amount' id='tools' onChange={this.changeAmount.bind(this)} onKeyPress={event => {if(event.key === '.') event.preventDefault();}}/>
                  <button onClick={this.toolsMaxClicked.bind(this)} style={{ fontSize: 12, position: 'relative', left: '-2.5rem',cursor: 'pointer', background: 'none', outline: 'none', border: 'none', backgroundColor: 'none', color: '#E36414', fontWeight: 200}}>Max</button>
                  <span style={{color: '#E36414', fontSize: 18}}>{this.formatNumber((this.state.toolsMSRdisplay*this.state.toolsAmount).toFixed(6))} <span style={{color: '#f0f0f0', paddingLeft: 15}}>  Atlas</span></span>
                </div>
              </div>
            </div>
          </div>
      </div>

      {/* MARKET UI ENDS HERE */}

      
      {/* Action Button Starts HERE */}
        <button style={{marginTop:"50px", width:"200px", marginLeft: "auto", marginRight: "auto", display: "block", height:50, fontSize: 18, color: '#E36414', background: 'none', border: '1px solid #E36414', borderRadius: 10, outline: 'none', cursor: 'pointer'}} id="Send" onClick={this.callProgram.bind(this)}>{this.state.actionButton}</button>
      {/* Action Button ends HERE */}


      {/* FOOTER STARTS HERE */}
        <div className="footer" style={{position: 'absolute', padding: '15px 0', left: 0, width: '100vw', bottom: 0, display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #EDF2F4'}}>
          <div className="memberShipLevel" style={{display: 'flex', left: 75, position: 'relative'}}>
            <h3 style={{color: '#f0f0f0'}}>Membership Level: </h3>
            <div className="icon" style={{ width: '1rem', height: '1rem', borderRadius: 50, border: '5px solid #E36414', position: 'relative', top: '1rem', marginLeft: '1rem' }}></div>
            <h3 className="rank" style={{ color: '#E36414', marginLeft: '0.5rem' }}>Gold</h3>
          </div>
          
          <div className="currentPxp" style={{display: 'flex', marginRight: 75}}>
            <h3 style={{color: '#f0f0f0'}}>Current PXP: </h3>
            <h3 className="pxp" style={{ color: '#E36414', marginLeft: '0.5rem' }}>{this.formatNumber(this.state.userPolarisExpSupplyAmount)}</h3>
          </div>
        </div>
      {/* FOOTER ENDS HERE */}


      </div>
    );
  }
}

export default page;