"use client";
import React, { Component } from "react";
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
import { relative } from "path";
import {
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import AppNavbar from "@/components/AppNavbar";

import {fetchAccountData,MarketPlaceDataLayout,TokenAccountDataLayout} from "./utils/helper.js"
import AppFooter from "@/components/AppFooter.tsx";

let provider: any;
const BufferLayout = require("buffer-layout");

//generate pda
let str = "POLARIS-VAULT";
let seeds = Buffer.from(str, "utf-8");

let createAccountInstructionArray: any = [];

let connection = new Connection("https://winter-divine-crater.solana-mainnet.quiknode.pro/e245f53447c82dcd216b89244c8ea868c8962284/");
let programId = new PublicKey("PLRSkbYoHcazB4qAx47S3Kgm4BRRjFFLfLQ5Trc8yif");
let marketConfigAccount = new PublicKey("EvzdWfb5pmAoyVvXEWHQwju447RfVkcz4owePHFvbTQZ");


// This is the PDA using string POLARIS-VAULT "EVckUhHX1YaNRmJ5adjagw7x2Fri6N7vDM2JUkMDCyrY"
let pda_star_atlas_account = new PublicKey("qopSi14qw3vpttsrQc2Y5gXyq34eLpm4JBasMVE64sA");
let pda_tools_mint_tokenAccount = new PublicKey("6rjWUucyc4sAhJF1mNmgQ5qe47Bie5RhZtWCABRmyDKk");
let pda_ammo_mint_tokenAccount = new PublicKey("3hjNi2Rf2fkTURVZ6rFyrWCsXcFaNFZpykw3sV8U5j9R");
let pda_fuel_mint_tokenAccount = new PublicKey("61W15XpK1ogWu3VBH7zyAEEY4JSASTg7mYkLw8ZHUJye");
let pda_food_tokenAccount = new PublicKey("CuY49B9959RSsNq2SRBpWzFvetqLjsPqgiyQGiB9SWXq");

let star_atlas_mint = new PublicKey("ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx");
let tools_mint = new PublicKey("tooLsNYLiVqzg8o4m3L2Uetbn62mvMWRqkog6PQeYKL");
let ammo_mint = new PublicKey("ammoK8AkX2wnebQb35cDAZtTkvsXQbi82cGeTnUvvfK");
let fuel_mint = new PublicKey("fueL3hBZjLLLJHiFH9cqZoozTG3XQZ53diwFPwbzNim");
let food_mint = new PublicKey("foodQJAztMzX1DKpLaiounNe2BDMds5RNuPC6jsNrDG");
let polaris_exp_mint = new PublicKey("PXPZdvfDgao5uEJGqpUjEE1ieWsAMBNwi1rdwJymYDg");


class page extends Component {
  state = {
    priceDisplay:"Current Price",
    missingAccountInstructions:null,
    atlasGlow:"glowing-red",
    ammoGlow:"glowing-red",
    fuelGlow:"glowing-red",
    foodGlow:"glowing-red",
    toolsGlow:"glowing-red",
    pxpGlow:"glowing-red",
    foodSupplyAmountDisplay:"...",
    fuelSupplyAmountDisplay:"...",
    ammoSupplyAmountDisplay:"...",
    toolsSupplyAmountDisplay:"...",
    walletHTML:"Connect Wallet",
    renderControl: "...",
    userPubKey: "...",
    foodMSRdisplay: "...",
    fuelMSRdisplay: "...",
    ammoMSRdisplay: "...",
    toolsMSRdisplay: "...",
    foodMSRP: "...",
    fuelMSRP: "...",
    ammoMSRP: "...",
    toolsMSRP: "...",
    marketFoodSupplyAmount: "...",
    marketFuelSupplyAmount: "...",
    marketAmmoSupplyAmount: "...",
    marketToolsSupplyAmount: "...",
    marketAtlasSupplyAmount: "...",
    user_star_atlas_account: null,
    user_tools_account: null,
    user_ammo_account: null,
    user_fuel_account: null,
    user_food_account: null,
    user_polaris_exp_account: null,
    userStarAtlasSupplyAmount: "...",
    userFoodSupplyAmount: "...",
    userFuelSupplyAmount: "...",
    userAmmoSupplyAmount: "...",
    userToolsSupplyAmount: "...",
    userPolarisExpSupplyAmount: null,
    foodAmount: 0,
    fuelAmount: 0,
    ammoAmount: 0,
    toolsAmount: 0,
    display: "customer",
    actionButton: "Buy",
    customerButtonColor: "#e36414",
    providerButtonColor: "#000815CF",
    activeColor: "#e36414",
    inActiveColor: "#e3631415",
    marketFee: 0.1,
    amountBoxText: "Buying Amount",
    marketQtyBoxText: "Mrkt QTY",

    // Alex Update
    activeToggleBtn: "customer",
  };

  async getProvider() {
    if ("phantom" in window) {
      const provider = window.phantom?.solana;

      if (provider?.isPhantom) {
        return provider;
      } else {
      }
    } else {
      return false;
    }
  }

  async getAndDecodeMarketplaceAccountData(
    connection: Connection,
    pubKey: PublicKey
  ) {
    // Fetch the raw account data
    let accountInfo = await connection.getAccountInfo(pubKey);
    if (accountInfo === null) {
      throw "Invalid public key or the account does not exist.";
    }

    // Decode the account data
    let decodedData = MarketPlaceDataLayout.decode(accountInfo.data);

    // Convert 'admin_pubkey' from Buffer to a Solana public key object
    decodedData.admin_pubkey = new PublicKey(decodedData.admin_pubkey);

    return decodedData;
  }

  async getBalance(connection: Connection, pubKey: PublicKey) {
    let accountInfo = await connection.getParsedAccountInfo(pubKey);
    if (accountInfo.value === null) {
      throw "Invalid public key or the account does not exist.";
    }

    if ("parsed" in accountInfo.value.data) {
    } else {
      alert("Problem Deserializing Account Ammount");
      return 0;
    }

    let tokenAccountInfo = accountInfo.value.data.parsed.info;
    let balance = tokenAccountInfo.tokenAmount.uiAmount;
    return balance;
  }

  async checkAccountForMint(ownerPubkeyStringbase58: any, mintsObj: any) {
    console.log("fetching accounts");
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

    console.log(accounts)
    console.log(mintsObj)

    console.log(
      `Found ${accounts.length} token account(s) for wallet ${MY_WALLET_ADDRESS}: `
    );

    // Prepare an object to store the results
    let results: Record<string, any | "null"> = Object.keys(mintsObj).reduce(
      (acc, key) => ({ ...acc, [key]: "null" }),
      {}
    );

    // Array of mints values for checking
    const mintsValues = Object.values(mintsObj);

    // Check each account
    accounts.forEach((account) => {
      if ("parsed" in account.account.data) {
      } else {
        alert("Problem Deserializing Account Ammount");
        return 0;
      }

      let accountMint = account.account.data.parsed.info.mint;

      // If the account's mint is in the mints array, mark it as 'found'
      if (mintsValues.includes(accountMint)) {
        // Find the key corresponding to this mint value
        const correspondingKey = Object.keys(mintsObj).find(
          (key) => mintsObj[key] === accountMint
        );

        if (correspondingKey !== undefined) {
          results[correspondingKey] = account;
        } else {
          // Handle the case where correspondingKey is undefined
        }
      }
    });

    return results;
  }

  formatNumber(num: any) {
    if (num < 1000) {
      // return the same number to 1 decimal place
      return num;
    } else if (num < 1000000) {
      // convert to K and fix to 1 decimal
      return (num / 1000).toFixed(1) + "K";
    } else if (num < 1000000000) {
      // convert to M and fix to 1 decimal
      return (num / 1000000).toFixed(1) + "M";
    } else {
      // convert to B and fix to 1 decimal
      return (num / 1000000000).toFixed(1) + "B";
    }
  }

  async sendRawTransaction(instructionArray: any, userPubKey: PublicKey) {
    // Create a transaction
    const transaction = new Transaction();
    transaction.feePayer = new PublicKey(userPubKey);

    instructionArray.forEach((element:any) => {
      transaction.add(element);
    });

    var { blockhash } = await connection.getRecentBlockhash();



    console.log(blockhash);
    transaction.recentBlockhash = blockhash;

    let provider = await this.getProvider();

    const signedTransaction = await provider.signTransaction(transaction);

    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize(),
      { skipPreflight: true }
    );

    console.log(signature);


    try {
      console.log(`Transaction sent, signature: ${signature}`);
    
      // Now we want to verify if the transaction was confirmed
      const confirmation = await connection.confirmTransaction(signature, 'confirmed'); // or use 'finalized' depending on the desired commitment level
      console.log('Transaction confirmed:', confirmation);
      this.setState({renderControl:"main"})

    
    } catch (error) {
      alert("Error sending transaction:" + String(error));
      this.setState({renderControl:"renderTokenCheckPoint"})

    }



  }

  async createAccountForUserIx(mintPubkey: PublicKey, userPubKey: PublicKey) {
    // calculate ATA
    let ata = await getAssociatedTokenAddress(
      mintPubkey, // mint
      userPubKey // owner
    );
    console.log(`ATA: ${ata.toBase58()}`);

    // if your wallet is off-curve, you should use
    // let ata = await getAssociatedTokenAddress(
    //   mintPubkey, // mint
    //   alice.publicKey // owner
    //   true, // allowOwnerOffCurve
    // );

    return createAssociatedTokenAccountInstruction(
      userPubKey, // payer
      ata, // ata
      userPubKey, // owner
      mintPubkey // mint
    );
  }


  async componentDidMount() {

    //Wallet Check
    console.log("Wallet Check");


    let provider = await this.getProvider();


    if (provider == false) {
      this.setState({ renderControl: "noWallet" });
    } else {
      const resp = await provider.connect();
      console.log("FeePayer:" + resp.publicKey.toString());

      try {
        this.setState({ userPubKey: resp.publicKey.toString() });
      } catch (error) {
        console.log(error);
        return
      }

    let userPubkey = new PublicKey(resp.publicKey.toString())


    let mintsObj = 
    {
      star_atlas_mint:star_atlas_mint.toBase58(),
      ammo_mint:ammo_mint.toBase58(),
      fuel_mint:fuel_mint.toBase58(),
      food_mint:food_mint.toBase58(),
      tools_mint:tools_mint.toBase58(),
      polaris_exp_mint:polaris_exp_mint.toBase58()
    }


    console.log("Token Check");
    let mintsObjRet = await this.checkAccountForMint(resp.publicKey.toString(),mintsObj)

    console.log(mintsObjRet)

    let hasAllAccounts=true;
    let missingAccountInstructions :any = [];
    if(mintsObjRet.star_atlas_mint !="null")
    {
      this.setState({atlasGlow:"glowing-green"})
    }else{
      hasAllAccounts=false;
      missingAccountInstructions.push(await this.createAccountForUserIx(star_atlas_mint,userPubkey))
    }

    if(mintsObjRet.ammo_mint !="null")
    {
      this.setState({ammoGlow:"glowing-green"})
    }else{
      hasAllAccounts=false;
      missingAccountInstructions.push(await this.createAccountForUserIx(ammo_mint,userPubkey))

    }

    if(mintsObjRet.fuel_mint !="null")
    {
      this.setState({fuelGlow:"glowing-green"})
    }else{
      hasAllAccounts=false;
      missingAccountInstructions.push(await this.createAccountForUserIx(fuel_mint,userPubkey))

    }

    if(mintsObjRet.food_mint !="null")
    {
      this.setState({foodGlow:"glowing-green"})
    }else{
      hasAllAccounts=false;
      missingAccountInstructions.push(await this.createAccountForUserIx(food_mint,userPubkey))

    }


    if(mintsObjRet.tools_mint !="null")
    {
      this.setState({toolsGlow:"glowing-green"})
    }else{
      hasAllAccounts=false;
      missingAccountInstructions.push(await this.createAccountForUserIx(tools_mint,userPubkey))

    }

    
    if(mintsObjRet.polaris_exp_mint !="null")
    {
      this.setState({pxpGlow:"glowing-green"})
    }else{
      hasAllAccounts=false;
      missingAccountInstructions.push(await this.createAccountForUserIx(polaris_exp_mint,userPubkey))
    }


    if(hasAllAccounts)
    {
      this.setState({renderControl: "main"})

    }else{
      this.setState({renderControl: "TokenCheckPoint",
      missingAccountInstructions:missingAccountInstructions})
    }



      //MarketCheck

      // ProgramID: PLRSkbYoHcazB4qAx47S3Kgm4BRRjFFLfLQ5Trc8yif
      // pdaPublicKey: EVckUhHX1YaNRmJ5adjagw7x2Fri6N7vDM2JUkMDCyrY
      // market_config_account_publicKey: EvzdWfb5pmAoyVvXEWHQwju447RfVkcz4owePHFvbTQZ

      let marketConfigData = await fetchAccountData(connection,"EvzdWfb5pmAoyVvXEWHQwju447RfVkcz4owePHFvbTQZ",5,1000)
      let decodedData = await MarketPlaceDataLayout.decode(marketConfigData.data);

      let marketPlaceFoodAmount = await this.getBalance(connection,pda_food_tokenAccount)
      let marketPlaceToolsAmount = await this.getBalance(connection,pda_tools_mint_tokenAccount)
      let marketPlaceAmmoAmount = await this.getBalance(connection,pda_ammo_mint_tokenAccount)
      let marketPlaceFuelAmount = await this.getBalance(connection,pda_fuel_mint_tokenAccount)
      let marketPlaceAtlasAmount = await this.getBalance(connection,pda_star_atlas_account)


      console.log(decodedData)

      this.setState({

        //diaplay ui
        foodSupplyAmountDisplay: marketPlaceFoodAmount,
        fuelSupplyAmountDisplay: marketPlaceFuelAmount,
        ammoSupplyAmountDisplay: marketPlaceAmmoAmount,
        toolsSupplyAmountDisplay: marketPlaceToolsAmount,
        ammoMSRdisplay : decodedData.ammo_price,
        fuelMSRdisplay : decodedData.fuel,
        toolsMSRdisplay : decodedData.tool,
        foodMSRdisplay : decodedData.food,

        //number ammounts
        marketFoodSupplyAmount: marketPlaceFoodAmount,
        marketFuelSupplyAmount: marketPlaceFuelAmount,
        marketAmmoSupplyAmount: marketPlaceAmmoAmount,
        marketToolsSupplyAmount :marketPlaceToolsAmount,
        marketAtlasSupplyAmount :marketPlaceAtlasAmount,
        foodMSRP: decodedData.food,
        fuelMSRP : decodedData.fuel,
        ammoMSRP:  decodedData.ammo_price,
        toolsMSRP: decodedData.tool
      })


      this.setState({
        walletHTML: resp.publicKey.toString().slice(0, 3) + "..." +  resp.publicKey.toString().slice(-3)
      })

    }
  }

  async walletClick() {
    alert("Change Wallet Using Phantom Extension")
  }

  async create_polaris_buy_instruction(resource_type: any, buy_ammount: any) {
    let [pdaPublicKey, _nonce] = await PublicKey.findProgramAddress(
      [seeds],
      programId
    );
    console.log("pda: " + pdaPublicKey.toBase58());

    var iX = 0;
    var iXBuffer = Buffer.alloc(1);
    iXBuffer.writeUint8(iX);

    var nonceBuffer = Buffer.alloc(1);
    nonceBuffer.writeUint8(_nonce);

    var buy_ammountBuffer = Buffer.alloc(8);
    buy_ammountBuffer.writeUint8(buy_ammount);

    var dataBuffer = Buffer.concat([
      iXBuffer,
      seeds,
      nonceBuffer,
      buy_ammountBuffer,
    ]);

    let resourceMints = [food_mint, fuel_mint, ammo_mint, tools_mint];
    let userResourceAccounts = [
      this.state.user_food_account,
      this.state.user_fuel_account,
      this.state.user_ammo_account,
      this.state.user_tools_account,
    ];
    let pdaResourceAccounts = [
      pda_food_tokenAccount,
      pda_fuel_mint_tokenAccount,
      pda_ammo_mint_tokenAccount,
      pda_tools_mint_tokenAccount,
    ];

    if (resource_type > -1 && resource_type < 4) {
    } else {
      console.log("Invalid Buy Operation");
      return 0;
    }

    if (this.state.userPubKey !== null) {
    } else {
      alert("User Pubkey Undefined");
      return 0;
    }

    if (this.state.user_star_atlas_account !== null) {
    } else {
      alert("User Star Atlas Account Undefined");
      return 0;
    }

    if (this.state.user_polaris_exp_account !== null) {
    } else {
      alert("User PXP account is Undefined");
      return 0;
    }

    let userResAccountFix = null;

    let resourceAccount = userResourceAccounts[resource_type];
    if (resourceAccount !== null) {
      userResAccountFix = new PublicKey(resourceAccount);
    } else {
      // Handle the case where resourceAccount is null

      switch (resource_type) {
        case 0:
          alert("User Food Account Undefined");
          break;
        case 1:
          alert("User Fuel Account Undefined");
          break;

        case 2:
          alert("User Ammo Account Undefined");
          break;

        case 3:
          alert("User Tools Account Undefined");
          break;

        default:
          break;
      }
      return 0;
    }

    // Create the instruction to send data
    let instructionData2 = {
      keys: [
        {
          pubkey: new PublicKey(this.state.userPubKey),
          isSigner: true,
          isWritable: false,
        }, //user + feePayer
        { pubkey: pdaPublicKey, isSigner: false, isWritable: false }, //pda

        { pubkey: star_atlas_mint, isSigner: false, isWritable: false }, // star atlas mint
        {
          pubkey: new PublicKey(this.state.user_star_atlas_account),
          isSigner: false,
          isWritable: true,
        }, //user star atlas account
        { pubkey: pda_star_atlas_account, isSigner: false, isWritable: true }, //pda star atlas account

        {
          pubkey: resourceMints[resource_type],
          isSigner: false,
          isWritable: false,
        }, // resource mint
        { pubkey: userResAccountFix, isSigner: false, isWritable: true }, //user resource account
        {
          pubkey: pdaResourceAccounts[resource_type],
          isSigner: false,
          isWritable: true,
        }, //pda resource account
        {
          pubkey: new PublicKey("5RWZnLxovGyWsn3KuWbcBnBNpbJ8FH8eLvxztZaZmWzh"),
          isSigner: false,
          isWritable: true,
        }, //fee account

        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, //systemProgram
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }, //token program

        { pubkey: polaris_exp_mint, isSigner: false, isWritable: true }, //reward mint
        {
          pubkey: new PublicKey(this.state.user_polaris_exp_account),
          isSigner: false,
          isWritable: true,
        }, //reward account of the user
        { pubkey: marketConfigAccount, isSigner: false, isWritable: true }, //marketplace account
      ],
      programId,
      data: dataBuffer,
    };

    let polaris_buy_instruction = new TransactionInstruction(instructionData2);

    console.log("PDA resource account: " + pdaResourceAccounts[resource_type]);

    return polaris_buy_instruction;
  }

  async create_polaris_sell_instruction(resource_type: any, sell_ammount: any) {
    let [pdaPublicKey, _nonce] = await PublicKey.findProgramAddress(
      [seeds],
      programId
    );
    console.log("pda: " + pdaPublicKey.toBase58());

    var iX = 3;
    var iXBuffer = Buffer.alloc(1);
    iXBuffer.writeUint8(iX);

    var nonceBuffer = Buffer.alloc(1);
    nonceBuffer.writeUint8(_nonce);
    var dataBuffer = Buffer.concat([iXBuffer, seeds, nonceBuffer]);

    var sell_ammountBuffer = Buffer.alloc(8);
    sell_ammountBuffer.writeUint8(sell_ammount);

    var dataBuffer = Buffer.concat([
      iXBuffer,
      seeds,
      nonceBuffer,
      sell_ammountBuffer,
    ]);

    let resourceMints = [food_mint, fuel_mint, ammo_mint, tools_mint];
    let userResourceAccounts = [
      this.state.user_food_account,
      this.state.user_fuel_account,
      this.state.user_ammo_account,
      this.state.user_tools_account,
    ];
    let pdaResourceAccounts = [
      polaris_food_account,
      polaris_fuel_account,
      polaris_ammo_account,
      polaris_tools_account,
    ];

    if (resource_type > -1 && resource_type < 4) {
    } else {
      console.log("Invalid Sell Operation");
      return 0;
    }

    if (this.state.userPubKey !== null) {
    } else {
      alert("User Pubkey Undefined");
      return 0;
    }

    if (this.state.user_star_atlas_account !== null) {
    } else {
      alert("User Star Atlas Account Undefined");
      return 0;
    }

    if (this.state.user_polaris_exp_account !== null) {
    } else {
      alert("User PXP account is Undefined");
      return 0;
    }

    let userResAccountFix = null;

    let resourceAccount = userResourceAccounts[resource_type];
    if (resourceAccount !== null) {
      userResAccountFix = new PublicKey(resourceAccount);
    } else {
      // Handle the case where resourceAccount is null

      switch (resource_type) {
        case 0:
          alert("User Food Account Undefined");
          break;
        case 1:
          alert("User Fuel Account Undefined");
          break;

        case 2:
          alert("User Ammo Account Undefined");
          break;

        case 3:
          alert("User Tools Account Undefined");
          break;

        default:
          break;
      }
      return 0;
    }

    // Create the instruction to send data
    let instructionData2 = {
      keys: [
        {
          pubkey: new PublicKey(this.state.userPubKey),
          isSigner: true,
          isWritable: false,
        }, //user + feePayer
        { pubkey: pdaPublicKey, isSigner: false, isWritable: false }, //pda

        { pubkey: star_atlas_mint, isSigner: false, isWritable: false }, // star atlas mint
        {
          pubkey: new PublicKey(this.state.user_star_atlas_account),
          isSigner: false,
          isWritable: true,
        }, //user star atlas account
        { pubkey: pda_star_atlas_account, isSigner: false, isWritable: true }, //pda star atlas account

        {
          pubkey: resourceMints[resource_type],
          isSigner: false,
          isWritable: false,
        }, // resource mint
        { pubkey: userResAccountFix, isSigner: false, isWritable: true }, //user resource account
        {
          pubkey: pdaResourceAccounts[resource_type],
          isSigner: false,
          isWritable: true,
        }, //pda resource account -> 6/27 asked to move to polaris account instead

        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, //systemProgram
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }, //token program

        { pubkey: polaris_exp_mint, isSigner: false, isWritable: true }, //reward mint
        {
          pubkey: new PublicKey(this.state.user_polaris_exp_account),
          isSigner: false,
          isWritable: true,
        }, //reward account of the user
        { pubkey: marketConfigAccount, isSigner: false, isWritable: true }, //marketplace account
      ],
      programId,
      data: dataBuffer,
    };

    let sendDataIx2 = new TransactionInstruction(instructionData2);

    return sendDataIx2;
  }

  async callProgram() {
    var walletButton = document.getElementById("WalletButton");

    if (walletButton !== null) {
    } else {
      alert("Error in Wallet");
      return 0;
    }
    try {
      if (walletButton.innerHTML.length == 9) {
      } else {
        alert("Please Connect Wallet");
        return 0;
      }
    } catch (err) {
      // { code: 4001, message: 'User rejected the request.' }
    }

    if (this.state.userPubKey !== null) {
    } else {
      alert("User Pubkey Undefined");
      return 0;
    }

    // Create a transaction
    const transaction = new Transaction();
    transaction.feePayer = new PublicKey(this.state.userPubKey);

    let buyOrder = [
      this.state.foodAmount,
      this.state.fuelAmount,
      this.state.ammoAmount,
      this.state.toolsAmount,
    ];

    if (this.state.actionButton == "Buy") {
      console.log("buying resources");

      console.log(buyOrder);

      for (let index = 0; index < buyOrder.length; index++) {
        var element = buyOrder[index];

        if (element > 0) {
          console.log(index);
          console.log("creating buy order");
          let result = await this.create_polaris_sell_instruction(
            index,
            element
          );
          if (result instanceof TransactionInstruction) {
            let ix: TransactionInstruction = result;
            transaction.add(ix);
          } else {
            {
              alert(
                "Accounts Needed for Instruction Undefined please Try Again"
              );
              window.location.reload();
            }
          }
        }
      }
    } else {
      //max user
      console.log("selling resources");

      console.log(buyOrder);

      for (let index = 0; index < buyOrder.length; index++) {
        var element = buyOrder[index];

        if (element > 0) {
          let result = await this.create_polaris_sell_instruction(
            index,
            element
          );
          if (result instanceof TransactionInstruction) {
            let ix: TransactionInstruction = result;
            transaction.add(ix);
          } else {
            {
              alert(
                "Accounts Needed for Instruction Undefined please Try Again"
              );
              window.location.reload();
            }
          }
        }
      }
    }

    console.log(transaction.instructions.length);

    var { blockhash } = await connection.getRecentBlockhash();

    console.log(blockhash);

    transaction.recentBlockhash = blockhash;
    const signedTransaction = await provider.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize(),
      { skipPreflight: true }
    );

    console.log(signature);
  }

  customerClick() {
    this.setState({
      priceDisplay:"Current Price",
      activeToggleBtn: "customer",
      actionButton: "Buy",
      amountBoxText: "Buying Amount",
      marketQtyBoxText: "Mrkt QTY",
      //diaplay ui
      foodSupplyAmountDisplay: this.state.marketFoodSupplyAmount,
      fuelSupplyAmountDisplay: this.state.marketFuelSupplyAmount,
      ammoSupplyAmountDisplay: this.state.marketAmmoSupplyAmount,
      toolsSupplyAmountDisplay: this.state.marketToolsSupplyAmount,
      foodMSRdisplay : this.state.foodMSRP,
      fuelMSRdisplay : this.state.fuelMSRP,
      ammoMSRdisplay : this.state.ammoMSRP,
      toolsMSRdisplay : this.state.toolsMSRP,
    });

    let foodElement = document.getElementById("food");
    if (foodElement !== null && "value" in foodElement) {
      foodElement.value = null;
    }

    let fuelElement = document.getElementById("fuel");
    if (fuelElement !== null && "value" in fuelElement) {
      fuelElement.value = null;
    }

    let ammoElement = document.getElementById("ammo");
    if (ammoElement !== null && "value" in ammoElement) {
      ammoElement.value = null;
    }

    let toolsElement = document.getElementById("tools");
    if (toolsElement !== null && "value" in toolsElement) {
      toolsElement.value = null;
    }

    this.setState({ foodAmount: 0 });
    this.setState({ fuelAmount: 0 });
    this.setState({ ammoAmount: 0 });
    this.setState({ toolsAmount: 0 });
  }

  providerClick() {
    this.setState({
      priceDisplay:"Receive",
      activeToggleBtn: "provider",
      actionButton: "Sell",
      amountBoxText: "Selling Amount",
      marketQtyBoxText: "User QTY",
      foodMSRdisplay : String((Number(this.state.foodMSRP) - Number(this.state.foodMSRP)*0.10).toFixed(7)),
      fuelMSRdisplay : String((Number(this.state.fuelMSRP) - Number(this.state.fuelMSRP)*0.10).toFixed(7)),
      ammoMSRdisplay : String((Number(this.state.ammoMSRP) - Number(this.state.ammoMSRP)*0.10).toFixed(7)),
      toolsMSRdisplay : String((Number(this.state.toolsMSRP) - Number(this.state.toolsMSRP)*0.10).toFixed(7))
    });
    let foodElement = document.getElementById("food");
    if (foodElement !== null && "value" in foodElement) {
      foodElement.value = null;
    }

    let fuelElement = document.getElementById("fuel");
    if (fuelElement !== null && "value" in fuelElement) {
      fuelElement.value = null;
    }

    let ammoElement = document.getElementById("ammo");
    if (ammoElement !== null && "value" in ammoElement) {
      ammoElement.value = null;
    }

    let toolsElement = document.getElementById("tools");
    if (toolsElement !== null && "value" in toolsElement) {
      toolsElement.value = null;
    }

    this.setState({ foodAmount: 0 });
    this.setState({ fuelAmount: 0 });
    this.setState({ ammoAmount: 0 });
    this.setState({ toolsAmount: 0 });
  }

  changeAmount(event: any) {
    console.log(event.target.id);
    console.log(event.target.value);

    switch (event.target.id) {
      case "food":
        this.setState({ foodAmount: event.target.value });
        break;
      case "fuel":
        this.setState({ fuelAmount: event.target.value });
        break;
      case "ammo":
        this.setState({ ammoAmount: event.target.value });
        break;
      case "tools":
        this.setState({ toolsAmount: event.target.value });
        break;

      default:
        break;
    }
  }

  foodMaxClicked() {
    let foodInput = document.getElementById("food");

    if (this.state.actionButton == "Buy") {
      //max market

      if (foodInput !== null && "value" in foodInput) {
        foodInput.value = this.state.marketFoodSupplyAmount;
        this.setState({ foodAmount: this.state.marketFoodSupplyAmount });
      }
    } else {
      //max user
      if (foodInput !== null && "value" in foodInput) {
        foodInput.value = this.state.userFoodSupplyAmount;
        this.setState({ foodAmount: this.state.userFoodSupplyAmount });
      }
    }
  }

  fuelMaxClicked() {
    let fuelInput = document.getElementById("fuel");

    if (this.state.actionButton == "Buy") {
      //max market
      if (fuelInput !== null && "value" in fuelInput) {
        fuelInput.value = this.state.marketFuelSupplyAmount;
        this.setState({ fuelAmount: this.state.marketFuelSupplyAmount });
      }
    } else {
      //max user
      if (fuelInput !== null && "value" in fuelInput) {
        fuelInput.value = this.state.userFuelSupplyAmount;
        this.setState({ fuelAmount: this.state.userFuelSupplyAmount });
      }
    }
  }

  ammoMaxClicked() {
    let ammoInput = document.getElementById("ammo");

    if (this.state.actionButton == "Buy") {
      //max market
      if (ammoInput !== null && "value" in ammoInput) {
        ammoInput.value = this.state.marketAmmoSupplyAmount;
        this.setState({ ammoAmount: this.state.marketAmmoSupplyAmount });
      }
    } else {
      //max user
      if (ammoInput !== null && "value" in ammoInput) {
        ammoInput.value = this.state.userAmmoSupplyAmount;
        this.setState({ ammoAmount: this.state.userAmmoSupplyAmount });
      }
    }
  }

  toolsMaxClicked() {
    let toolsInput = document.getElementById("tools");

    if (this.state.actionButton == "Buy") {
      //max market
      if (toolsInput !== null && "value" in toolsInput) {
        toolsInput.value = this.state.marketToolsSupplyAmount;
        this.setState({ toolsAmount: this.state.marketToolsSupplyAmount });
      }
    } else {
      //max user
      if (toolsInput !== null && "value" in toolsInput) {
        toolsInput.value = this.state.userToolsSupplyAmount;
        this.setState({ toolsAmount: this.state.userToolsSupplyAmount });
      }
    }
  }

  renderNoWallet() {
    return (
      <div className='h-screen flex items-center flex-col justify-center text-white'>
        <p className='text-lg'>
          Phantom Wallet is Required to Use <strong>Polaris Fuel</strong>
        </p>
        <button
          className='bg-[#ab9ff2] hover:bg-[#e2dffe] text-black rounded-md mt-8 px-5 py-3'
          onClick={() => window.open("https://phantom.app/download", "_blank")}>
          Click to Navigate
        </button>
      </div>
    );
  }

  fixMissingTokens()
  {
    this.setState({renderControl:"TokenCheckPointLoading"})
    console.log(this.state.missingAccountInstructions)
    this.sendRawTransaction(this.state.missingAccountInstructions,new PublicKey(this.state.userPubKey))
  }


  
  renderTokenCheckPoint() {
    return(
      
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', overflow: 'hidden' }}>
      
          <h1 style={{ color: "white", fontSize: 50, marginBottom: '20px', marginTop: -100 }}>Polaris Fuel</h1>
          <h1 style={{ color: "white", fontSize: 30, marginBottom: '10px' }}>Token Check Point</h1>
      
          <img
            src="https://media.discordapp.net/attachments/1119286494453055528/1165779595136598126/IMG_0799.png?ex=654817da&is=6535a2da&hm=37942449e19300d6741995d091f830278e4129bb0bac022484df4812c20c22fa&=&width=1202&height=676"
            style={{
              zIndex: -2,
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.2 // Adjust the opacity value (0.0 - 1.0) to make it lighter
            }}
            alt="Background"
          />
          <button
          
          onClick={this.fixMissingTokens.bind(this)}
          
          style={{
            backgroundColor: "red",
            color: "white",
            padding: "10px 20px", // Specify padding as a string
            border: "none",
            borderRadius: "5px", // Specify borderRadius as a string
            cursor: "pointer",
            marginBottom: '50px'
          }}>Click to Fix Missing Token</button>
      
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <h1 className={this.state.atlasGlow} style={{ fontSize: 15 }}>ATLAS</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <h1 className={this.state.ammoGlow} style={{ fontSize: 15 }}>AMMO</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px',marginLeft:-10 }}>
            <h1 className={this.state.fuelGlow} style={{ color: "white", fontSize: 15 }}>FUEL</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px',marginLeft:-5  }}>
            <h1 className={this.state.foodGlow} style={{ color: "white", fontSize: 15 }}>FOOD</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <h1 className={this.state.toolsGlow} style={{ color: "white", fontSize: 15 }}>TOOLS</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px',marginLeft:-20  }}>
            <h1 className={this.state.pxpGlow} style={{ color: "white", fontSize: 15 }}>PXP</h1>
          </div>
      </div>
      
          )
      
  }

  renderTokenCheckPointLoading() {
    return(
      
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', overflow: 'hidden' }}>
      
          <h1 style={{ color: "white", fontSize: 50, marginBottom: '20px', marginTop: -100 }}>Polaris Fuel</h1>
          <h1 style={{ color: "white", fontSize: 30, marginBottom: '10px' }}>Token Check Point</h1>
      
          <img
            src="https://media.discordapp.net/attachments/1119286494453055528/1165779595136598126/IMG_0799.png?ex=654817da&is=6535a2da&hm=37942449e19300d6741995d091f830278e4129bb0bac022484df4812c20c22fa&=&width=1202&height=676"
            style={{
              zIndex: -2,
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.2 // Adjust the opacity value (0.0 - 1.0) to make it lighter
            }}
            alt="Background"
          />

      
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <h1 className={this.state.atlasGlow} style={{ fontSize: 15 }}>Sending Transaction...</h1>
          </div>

      </div>
      
          )
      
  }



  render() {




    if (this.state.renderControl == "noWallet") {
      return this.renderNoWallet();
    }
    
    else if (this.state.renderControl == "TokenCheckPoint") {
      return this.renderTokenCheckPoint();
    } 

    else if (this.state.renderControl == "TokenCheckPointLoading") {
      return this.renderTokenCheckPointLoading();
    } 
    
    else if (this.state.renderControl == "main") {

      return (
        <>
          <AppNavbar connectWallet={this.walletClick} walletHTML={this.state.walletHTML} />
          <main className='min-h-full h-full flex-1 flex items-center justify-center p-5 pt-24 lg:p-10'>
            <div className='max-w-lg lg:max-w-5xl w-full mx-auto'>
              <div className='px-3'>
                <div className='max-w-xs md:max-w-sm w-full mx-auto flex items-center rounded-2xl xl:rounded-base text-sm xl:text-base border-[1.5px] border-brand-primary overflow-hidden'>
                  <button
                    onClick={this.customerClick.bind(this)}
                    className={`${
                      this.state.activeToggleBtn == "customer"
                        ? "bg-brand-primary"
                        : "bg-brand-primary/10"
                    } flex-1 text-white font-medium py-3 xl:py-4 px-5`}>
                    Customer
                  </button>
                  <button
                    onClick={this.providerClick.bind(this)}
                    className={`${
                      this.state.activeToggleBtn == "provider"
                        ? "bg-brand-primary"
                        : "bg-brand-primary/10"
                    } flex-1 text-white font-medium py-3 xl:py-4 px-5`}>
                    Polaris Provider
                  </button>
                </div>
              </div>

              <div className='lg:grid grid-cols-5 text-white border border-slate-100/50 rounded-2xl divide-y lg:divide-y-0 lg:divide-x divide-slate-100/50 mt-5 lg:mt-10'>
                {/* Titles */}
                <div className='uppercase font-semibold py-2 lg:py-5'>
                  <h2 className='h-6 hidden lg:block'> {` `}</h2>
                  <div className='grid grid-cols-4 lg:block text-xs lg:text-sm xl:text-base text-center lg:space-y-3 px-5 lg:px-10 lg:mt-3'>
                    <p className='py-1.5 lg:py-3'>Food</p>
                    <p className='py-1.5 lg:py-3'>Fuel</p>
                    <p className='py-1.5 lg:py-3'>Ammo</p>
                    <p className='py-1.5 lg:py-3'>Tools</p>
                  </div>
                </div>
                <div className='py-3.5 lg:py-5'>
                  <h2 className='font-semibold text-sm xl:text-base text-center'>
                    {this.state.marketQtyBoxText}
                  </h2>
                  <div className='grid grid-cols-4 lg:block font-semibold text-center lg:space-y-3 px-2 lg:px-10 lg:mt-4'>
                    <p className='h-12 py-3'>
                      {this.state.foodSupplyAmountDisplay}
                    </p>
                    <p className='h-12 py-3'>
                      {this.state.fuelSupplyAmountDisplay}
                    </p>
                    <p className='h-12 py-3'>
                      {this.state.ammoSupplyAmountDisplay}
                    </p>
                    <p className='h-12 py-3'>
                      {this.state.toolsSupplyAmountDisplay}
                    </p>
                  </div>
                </div>
                {/* Current Price */}
                <div className='py-3.5 lg:py-5'>
                  <h2 className='font-semibold text-sm xl:text-base text-center'>
                    {this.state.priceDisplay}
                  </h2>
                  <div className='grid grid-cols-4 lg:block font-semibold lg:space-y-3 px-3 lg:px-10 mt-2 lg:mt-4'>
                    <p className='flex items-center justify-center lg:justify-start space-x-3 py-3'>
                      <span className='text-brand-primary'>
                        {this.state.foodMSRdisplay}
                      </span>
                      <span className='text-xs'> Atlas</span>
                    </p>
                    <p className='flex items-center justify-center lg:justify-start space-x-3 py-3'>
                      <span className='text-brand-primary'>
                        {this.state.fuelMSRdisplay}
                      </span>
                      <span className='text-xs'> Atlas</span>
                    </p>
                    <p className='flex items-center justify-center lg:justify-start space-x-3 py-3'>
                      <span className='text-brand-primary'>
                        {this.state.ammoMSRdisplay}
                      </span>
                      <span className='text-xs'> Atlas</span>
                    </p>
                    <p className='flex items-center justify-center lg:justify-start space-x-3 py-3'>
                      <span className='text-brand-primary'>
                        {this.state.toolsMSRdisplay}
                      </span>
                      <span className='text-xs'> Atlas</span>
                    </p>
                  </div>
                </div>

                {/* Buying / Selling Amount */}
                <div className='lg:col-span-2 py-3.5 lg:py-5'>
                  <h2 className='font-semibold text-sm xl:text-base text-center px-8'>
                    {this.state.amountBoxText}
                  </h2>
                  <div className='space-y-3 px-3 xl:pl-8 mt-4'>
                    {/* Food */}
                    <div className='flex items-center space-x-3 lg:space-x-5'>
                      <div className='w-52 shrink-0 relative bg-[#1c1e20] rounded-md py-2 px-3 lg:py-3'>
                        <input
                          id='food'
                          type='number'
                          className='bg-transparent text-sm'
                          placeholder='Enter Amount'
                          onChange={this.changeAmount.bind(this)}
                          onKeyPress={(event) => {
                            if (event.key === ".") event.preventDefault();
                          }}
                        />
                        <button
                          type='button'
                          className='absolute top-1/2 -translate-y-1/2 right-3 text-xs text-brand-primary font-extralight hover:font-light py-4'
                          onClick={this.foodMaxClicked.bind(this)}>
                          Max
                        </button>
                      </div>
                      <p className='flex items-center font-medium text-xs lg:text-sm xl:text-lg space-x-3 lg:space-x-5'>
                        <span className='text-brand-primary'>
                          {this.formatNumber(
                            (
                              Number(this.state.foodMSRdisplay) *
                              this.state.foodAmount
                            ).toFixed(4)
                          )}
                        </span>
                        <span> Atlas</span>
                      </p>
                    </div>

                    {/* Fuel */}
                    <div className='flex items-center space-x-3 lg:space-x-5'>
                      <div className='w-52 shrink-0 relative bg-[#1c1e20] rounded-md py-2 px-3 lg:py-3'>
                        <input
                          id='fuel'
                          type='number'
                          className='bg-transparent text-sm'
                          placeholder='Enter Amount'
                          onChange={this.changeAmount.bind(this)}
                          onKeyPress={(event) => {
                            if (event.key === ".") event.preventDefault();
                          }}
                        />
                        <button
                          type='button'
                          className='absolute top-1/2 -translate-y-1/2 right-3 text-xs text-brand-primary font-extralight hover:font-light py-4'
                          onClick={this.fuelMaxClicked.bind(this)}>
                          Max
                        </button>
                      </div>
                      <p className='flex items-center font-medium text-xs lg:text-sm xl:text-lg space-x-3 lg:space-x-5'>
                        <span className='text-brand-primary'>
                          {this.formatNumber(
                            (
                              Number(this.state.fuelMSRdisplay) *
                              this.state.fuelAmount
                            ).toFixed(4)
                          )}
                        </span>
                        <span> Atlas</span>
                      </p>
                    </div>

                    {/* Ammo */}
                    <div className='flex items-center space-x-3 lg:space-x-5'>
                      <div className='w-52 shrink-0 relative bg-[#1c1e20] rounded-md py-2 px-3 lg:py-3'>
                        <input
                          id='ammo'
                          type='number'
                          className='bg-transparent text-sm'
                          placeholder='Enter Amount'
                          onChange={this.changeAmount.bind(this)}
                          onKeyPress={(event) => {
                            if (event.key === ".") event.preventDefault();
                          }}
                        />
                        <button
                          type='button'
                          className='absolute top-1/2 -translate-y-1/2 right-3 text-xs text-brand-primary font-extralight hover:font-light py-4'
                          onClick={this.ammoMaxClicked.bind(this)}>
                          Max
                        </button>
                      </div>
                      <p className='flex items-center font-medium text-xs lg:text-sm xl:text-lg space-x-3 lg:space-x-5'>
                        <span className='text-brand-primary'>
                          {this.formatNumber(
                            (
                              Number(this.state.ammoMSRdisplay) *
                              this.state.ammoAmount
                            ).toFixed(4)
                          )}
                        </span>
                        <span> Atlas</span>
                      </p>
                    </div>

                    {/* Tools */}
                    <div className='flex items-center space-x-3 lg:space-x-5'>
                      <div className='w-52 shrink-0 relative bg-[#1c1e20] rounded-md py-2 px-3 lg:py-3'>
                        <input
                          id='tools'
                          type='number'
                          className='bg-transparent text-sm'
                          placeholder='Enter Amount'
                          onChange={this.changeAmount.bind(this)}
                          onKeyPress={(event) => {
                            if (event.key === ".") event.preventDefault();
                          }}
                        />
                        <button
                          type='button'
                          className='absolute top-1/2 -translate-y-1/2 right-3 text-xs text-brand-primary font-extralight hover:font-light py-4'
                          onClick={this.toolsMaxClicked.bind(this)}>
                          Max
                        </button>
                      </div>
                      <p className='flex items-center font-medium text-xs lg:text-sm xl:text-lg space-x-3 lg:space-x-5'>
                        <span className='text-brand-primary'>
                          {this.formatNumber(
                            (
                              Number(this.state.toolsMSRdisplay) *
                              this.state.toolsAmount
                            ).toFixed(4)
                          )}
                        </span>
                        <span> Atlas</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>


              {/* send button start */}
              <div className='text-center mt-6 lg:mt-8 xl:mt-12'>
                <button
                  id='Send'
                  className='hover:bg-brand-primary border border-brand-primary text-brand-primary hover:text-white lg:text-lg rounded-lg transition-colors duration-200 px-10 lg:px-16 py-2'
                  onClick={this.callProgram.bind(this)}>
                  {this.state.actionButton}
                </button>
              </div>
              {/* send button end */}



            </div>



          </main>
            <AppFooter formatNumber={this.formatNumber} userPolarisExpSupplyAmount={this.state.userPolarisExpSupplyAmount} />
        </>
      );
    }
  }
}

export default page;
