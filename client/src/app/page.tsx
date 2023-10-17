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

let provider: any;
const BufferLayout = require("buffer-layout");

// Define the account data structure
const MarketPlaceDataLayout = BufferLayout.struct([
  BufferLayout.u8("is_initialized"),
  BufferLayout.u8("reward"),
  BufferLayout.f64("ammo"),
  BufferLayout.f64("food"),
  BufferLayout.f64("fuel"),
  BufferLayout.f64("tools"),
  BufferLayout.seq(BufferLayout.u8(), 32, "admin_pubkey"),
]);

//generate pda
let str = "POLARIS-VAULT";
let seeds = Buffer.from(str, "utf-8"); // or 'ascii', 'base64', etc. depending on your needs

let createAccountInstructionArray: any = [];

//let star_atlas_mint = new solanaWeb3.PublicKey('ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx');

//devnet accounts
let connection = new Connection(clusterApiUrl("devnet"));
let programId = new PublicKey("ESL7g6h1tZrehkAVXPYmowa43JxurCmJ81A9eFCwZxy9");
let marketConfigAccount = new PublicKey(
  "DpTW34MTR79ckQHkygyvgDvEMrbdSm5oo83Hdgn9nzGK"
);

let pda_star_atlas_account = new PublicKey(
  "GJNKMrcsH5m7vem9WSxs7SEpMrHeihNqtQg6CzCFuhPY"
);
let pda_tools_mint_tokenAccount = new PublicKey(
  "B9xSJqsBuy9Xj3kCpsh8ZpJpphyU62aaNCqmbL5qsxjC"
);
let pda_ammo_mint_tokenAccount = new PublicKey(
  "EtgTTdct3r8kJgUmjiWWBrPHG9g5rBhUFouc9npvG6t9"
);
let pda_fuel_mint_tokenAccount = new PublicKey(
  "8LG7PKi9GyxM7Nm3EVaYDG18fBfwjo5boNtAF5ZiW7KL"
);
let pda_food_mint_tokenAccount = new PublicKey(
  "BeLzpdSP3bsuieattadMFseup9gkuNfNV1Grde134CFH"
);

let star_atlas_mint = new PublicKey(
  "ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx"
);
let tools_mint = new PublicKey("tooLsNYLiVqzg8o4m3L2Uetbn62mvMWRqkog6PQeYKL");
let ammo_mint = new PublicKey("ammoK8AkX2wnebQb35cDAZtTkvsXQbi82cGeTnUvvfK");
let fuel_mint = new PublicKey("fueL3hBZjLLLJHiFH9cqZoozTG3XQZ53diwFPwbzNim");
let food_mint = new PublicKey("foodQJAztMzX1DKpLaiounNe2BDMds5RNuPC6jsNrDG");
let polaris_exp_mint = new PublicKey(
  "BT8FRmq3K58YTMDVGiu8gevdLQmnVrXNAprJYxwheXtw"
);

//destination wallet when resources are sold
//PLRSGTRwq2rz8S62JFWbtFEixvetZ4v58KQWi21kLxg
let polaris_tools_account = new PublicKey(
  "51CQRTPagzt8MX6KBAoAyTfDqM9n4NvepjC4fuZ5fgqu"
);
let polaris_ammo_account = new PublicKey(
  "HhZpu7GvaAcU752HeYCApTvjLd9yY66hyRqvbfFxCXd4"
);
let polaris_fuel_account = new PublicKey(
  "Gdghebj3V9deG9FuNfS43kDmzTsL5keHYXeCeReaH1bX"
);
let polaris_food_account = new PublicKey(
  "9RQnXdVethx19HF9eaT688Sux5t6WcQcycLCJgKJGDru"
);

class page extends Component {
  state = {
    renderControl: "...",
    userPubKey: null,
    foodMSRdisplay: "...",
    fuelMSRdisplay: "...",
    ammoMSRdisplay: "...",
    toolsMSRdisplay: "...",
    foodMSRP: "...",
    fuelMSRP: "...",
    ammoMSRP: "...",
    toolsMSRP: "...",
    foodSupplyAmountDisplay: "...",
    fuelSupplyAmountDisplay: "...",
    ammoSupplyAmountDisplay: "...",
    toolsSupplyAmountDisplay: "...",
    marketFoodSupplyAmount: "...",
    marketFuelSupplyAmount: "...",
    marketAmmoSupplyAmount: "...",
    marketToolsSupplyAmount: "...",
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

  async sendRawTransaction(instructionArray: [], userPubKey: PublicKey) {
    // Create a transaction
    const transaction = new Transaction();
    transaction.feePayer = new PublicKey(userPubKey);

    instructionArray.forEach((element) => {
      transaction.add(element);
    });

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

    //createAssociatedTokenAccountInstruction(userPubKey,ata,userPubKey,mintPubkey)
  }

  async setAccounts(parsedTokenAccounts: any, userPubKey: string) {
    console.log(userPubKey);

    //atlas
    try {
      this.setState({
        user_star_atlas_account:
          parsedTokenAccounts.user_star_atlas_account.pubkey,
        userStarAtlasSupplyAmount:
          parsedTokenAccounts.user_star_atlas_account.account.data.parsed.info
            .tokenAmount.amount,
      });
    } catch (error) {
      console.log("User has no Atlas Account");
      createAccountInstructionArray.push(
        await this.createAccountForUserIx(
          star_atlas_mint,
          new PublicKey(userPubKey)
        )
      );
    }

    //tool
    try {
      this.setState({
        user_tools_account: parsedTokenAccounts.user_tools_account.pubkey,
        userToolsSupplyAmount:
          parsedTokenAccounts.user_tools_account.account.data.parsed.info
            .tokenAmount.amount,
      });
    } catch (error) {
      console.log("User has no tools account");

      createAccountInstructionArray.push(
        await this.createAccountForUserIx(tools_mint, new PublicKey(userPubKey))
      );
    }

    //ammo
    try {
      this.setState({
        user_ammo_account: parsedTokenAccounts.user_ammo_account.pubkey,
        userAmmoSupplyAmount:
          parsedTokenAccounts.user_ammo_account.account.data.parsed.info
            .tokenAmount.amount,
      });
    } catch (error) {
      console.log("User has no anmmo account");
      // create user account

      createAccountInstructionArray.push(
        await this.createAccountForUserIx(ammo_mint, new PublicKey(userPubKey))
      );
    }

    //fuel
    try {
      this.setState({
        user_fuel_account: parsedTokenAccounts.user_fuel_account.pubkey,
        userFuelSupplyAmount:
          parsedTokenAccounts.user_fuel_account.account.data.parsed.info
            .tokenAmount.amount,
      });
    } catch (error) {
      console.log("User has no fuel account");

      createAccountInstructionArray.push(
        await this.createAccountForUserIx(fuel_mint, new PublicKey(userPubKey))
      );
    }

    //food
    try {
      this.setState({
        user_food_account: parsedTokenAccounts.user_food_account.pubkey,
        userFoodSupplyAmount:
          parsedTokenAccounts.user_food_account.account.data.parsed.info
            .tokenAmount.amount,
      });
    } catch (error) {
      console.log("User has no food account");

      createAccountInstructionArray.push(
        await this.createAccountForUserIx(food_mint, new PublicKey(userPubKey))
      );
    }

    //polaris exp
    try {
      this.setState({
        user_polaris_exp_account:
          parsedTokenAccounts.user_polaris_exp_account.pubkey,
        userPolarisExpSupplyAmount:
          parsedTokenAccounts.user_polaris_exp_account.account.data.parsed.info
            .tokenAmount.amount,
      });
    } catch (error) {
      console.log("User has no polaris account");
      createAccountInstructionArray.push(
        await this.createAccountForUserIx(
          polaris_exp_mint,
          new PublicKey(userPubKey)
        )
      );
    }

    console.log(createAccountInstructionArray);

    if (createAccountInstructionArray.length > 0) {
      // alert(
      //   "Wallet:" + userPubKey + "\nIs missing PolarisExp or Resource Accounts"
      // );
      await this.sendRawTransaction(
        createAccountInstructionArray,
        new PublicKey(userPubKey)
      );
    }
  }

  async changeToDevNet() {
    console.log("Chaning to Devnet");
    //devnet accounts
    connection = new Connection(clusterApiUrl("devnet"));
    marketConfigAccount = new PublicKey(
      "DpTW34MTR79ckQHkygyvgDvEMrbdSm5oo83Hdgn9nzGK"
    );

    pda_star_atlas_account = new PublicKey(
      "GJNKMrcsH5m7vem9WSxs7SEpMrHeihNqtQg6CzCFuhPY"
    );
    pda_tools_mint_tokenAccount = new PublicKey(
      "B9xSJqsBuy9Xj3kCpsh8ZpJpphyU62aaNCqmbL5qsxjC"
    );
    pda_ammo_mint_tokenAccount = new PublicKey(
      "EtgTTdct3r8kJgUmjiWWBrPHG9g5rBhUFouc9npvG6t9"
    );
    pda_fuel_mint_tokenAccount = new PublicKey(
      "8LG7PKi9GyxM7Nm3EVaYDG18fBfwjo5boNtAF5ZiW7KL"
    );
    pda_food_mint_tokenAccount = new PublicKey(
      "BeLzpdSP3bsuieattadMFseup9gkuNfNV1Grde134CFH"
    );

    star_atlas_mint = new PublicKey(
      "GpVqpNdUG8hJvyiNaDFnTnuiQV6EGFueduTBXAiPabWj"
    );
    tools_mint = new PublicKey("3y3D6wHa1dfz8VNVcnejLaLL8Ld41shTaAsjKMBgdzBr");
    ammo_mint = new PublicKey("9TrKEhszrsMKYHRBuiXxefcQ4Z1WcAjhdGDBqjw7yrY9");
    fuel_mint = new PublicKey("9htVnjLQByoQnucf5Bf2C7eDkhDax7rdU3FTo1KX3ewo");
    food_mint = new PublicKey("C769DzsozfZ3SmA8PcScM4hEvkyXiFdhKfKfMiyRVjWG");
    polaris_exp_mint = new PublicKey(
      "BT8FRmq3K58YTMDVGiu8gevdLQmnVrXNAprJYxwheXtw"
    );

    //destination wallet when resources are sold
    //PLRSGTRwq2rz8S62JFWbtFEixvetZ4v58KQWi21kLxg
    polaris_tools_account = new PublicKey(
      "51CQRTPagzt8MX6KBAoAyTfDqM9n4NvepjC4fuZ5fgqu"
    );
    polaris_ammo_account = new PublicKey(
      "HhZpu7GvaAcU752HeYCApTvjLd9yY66hyRqvbfFxCXd4"
    );
    polaris_fuel_account = new PublicKey(
      "Gdghebj3V9deG9FuNfS43kDmzTsL5keHYXeCeReaH1bX"
    );
    polaris_food_account = new PublicKey(
      "9RQnXdVethx19HF9eaT688Sux5t6WcQcycLCJgKJGDru"
    );
  }

  async componentDidMount() {
    console.log("Here");

    let provider = await this.getProvider();

    if (provider == false) {
      this.setState({ renderControl: "noWallet" });
    } else {
      this.setState({ renderControl: "main" });

      const resp = await provider.connect();
      console.log("FeePayer:" + resp.publicKey.toString());

      try {
        this.setState({ userPubKey: resp.publicKey.toString() }, () => {
          //console.log(this.state.userPubKey)
        });
      } catch (error) {
        console.log(error);
      }

      let walletButton = document.getElementById("WalletButton");

      if (walletButton !== null) {
        walletButton.innerHTML =
          resp.publicKey.toString().slice(0, 3) +
          "..." +
          resp.publicKey.toString().slice(-3);
      }

      let mintFilter = {
        user_star_atlas_account: star_atlas_mint.toBase58(),
        user_tools_account: tools_mint.toBase58(),
        user_ammo_account: ammo_mint.toBase58(),
        user_fuel_account: fuel_mint.toBase58(),
        user_food_account: food_mint.toBase58(),
        user_polaris_exp_account: polaris_exp_mint.toBase58(),
      };

      let parsedTokenAccounts = await this.checkAccountForMint(
        resp.publicKey.toString(),
        mintFilter
      );

      console.log(parsedTokenAccounts);

      localStorage.setItem(
        resp.publicKey.toString(),
        JSON.stringify(parsedTokenAccounts)
      );

      await this.setAccounts(parsedTokenAccounts, resp.publicKey.toString());
    }
  }

  async walletClick() {
    var walletButton = document.getElementById("WalletButton");

    if (walletButton !== null) {
    } else {
      alert("Error in Wallet");
      return 0;
    }
    try {
      if (walletButton.innerHTML.length == 9) {
        console.log("Connected Here");
        provider.disconnect();
        walletButton.innerHTML = "Connect Wallet";
      } else {
        const resp = await provider.connect();
        console.log(resp.publicKey.toString());
        walletButton.innerHTML =
          resp.publicKey.toString().slice(0, 3) +
          "..." +
          resp.publicKey.toString().slice(-3);
      }
    } catch (err) {
      // { code: 4001, message: 'User rejected the request.' }
    }
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
      pda_food_mint_tokenAccount,
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
      activeToggleBtn: "customer",
      actionButton: "Buy",
      amountBoxText: "Buying Amount",
      marketQtyBoxText: "Mrkt QTY",
      foodMSRdisplay: this.state.foodMSRP,
      fuelMSRdisplay: this.state.fuelMSRP,
      ammoMSRdisplay: this.state.ammoMSRP,
      toolsMSRdisplay: this.state.toolsMSRP,
      foodSupplyAmountDisplay: this.formatNumber(
        this.state.marketFoodSupplyAmount
      ),
      fuelSupplyAmountDisplay: this.formatNumber(
        this.state.marketFuelSupplyAmount
      ),
      ammoSupplyAmountDisplay: this.formatNumber(
        this.state.marketAmmoSupplyAmount
      ),
      toolsSupplyAmountDisplay: this.formatNumber(
        this.state.marketToolsSupplyAmount
      ),
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
      activeToggleBtn: "provider",
      actionButton: "Sell",
      amountBoxText: "Selling Amount",
      marketQtyBoxText: "User QTY",
      foodMSRdisplay: Number(
        this.state.foodMSRP + Number(this.state.foodMSRP) * this.state.marketFee
      ).toFixed(6),
      fuelMSRdisplay: Number(
        this.state.fuelMSRP + Number(this.state.fuelMSRP) * this.state.marketFee
      ).toFixed(6),
      ammoMSRdisplay: Number(
        this.state.ammoMSRP + Number(this.state.ammoMSRP) * this.state.marketFee
      ).toFixed(6),
      toolsMSRdisplay: Number(
        this.state.toolsMSRP +
          Number(this.state.toolsMSRP) * this.state.marketFee
      ).toFixed(6),
      foodSupplyAmountDisplay: this.formatNumber(
        this.state.userFoodSupplyAmount
      ),
      fuelSupplyAmountDisplay: this.formatNumber(
        this.state.userFuelSupplyAmount
      ),
      ammoSupplyAmountDisplay: this.formatNumber(
        this.state.userAmmoSupplyAmount
      ),
      toolsSupplyAmountDisplay: this.formatNumber(
        this.state.userToolsSupplyAmount
      ),
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

  render() {
    if (this.state.renderControl == "noWallet") {
      return this.renderNoWallet();
    } else if (this.state.renderControl == "main") {
      return (
        <>
          <AppNavbar connectWallet={this.walletClick} />
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
                    Current Price
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
                          type='text'
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
                          {/* {this.formatNumber(
                            (
                              Number(this.state.foodMSRdisplay) *
                              this.state.foodAmount
                            ).toFixed(6)
                          )} */}
                          0.0000
                        </span>
                        <span> Atlas</span>
                      </p>
                    </div>

                    {/* Fuel */}
                    <div className='flex items-center space-x-3 lg:space-x-5'>
                      <div className='w-52 shrink-0 relative bg-[#1c1e20] rounded-md py-2 px-3 lg:py-3'>
                        <input
                          id='fuel'
                          type='text'
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
                          {/* {this.formatNumber(
                            (
                              Number(this.state.fuelMSRdisplay) *
                              this.state.fuelAmount
                            ).toFixed(6)
                          )} */}
                          0.0000
                        </span>
                        <span> Atlas</span>
                      </p>
                    </div>

                    {/* Ammo */}
                    <div className='flex items-center space-x-3 lg:space-x-5'>
                      <div className='w-52 shrink-0 relative bg-[#1c1e20] rounded-md py-2 px-3 lg:py-3'>
                        <input
                          id='fuel'
                          type='ammo'
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
                            ).toFixed(6)
                          )}
                        </span>
                        <span> Atlas</span>
                      </p>
                    </div>

                    {/* Tools */}
                    <div className='flex items-center space-x-3 lg:space-x-5'>
                      <div className='w-52 shrink-0 relative bg-[#1c1e20] rounded-md py-2 px-3 lg:py-3'>
                        <input
                          id='fuel'
                          type='ammo'
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
                            ).toFixed(6)
                          )}
                        </span>
                        <span> Atlas</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className='text-center mt-6 lg:mt-8 xl:mt-12'>
                <button
                  id='Send'
                  className='hover:bg-brand-primary border border-brand-primary text-brand-primary hover:text-white lg:text-lg rounded-lg transition-colors duration-200 px-10 lg:px-16 py-2'
                  onClick={this.callProgram.bind(this)}>
                  {this.state.actionButton}
                </button>
              </div>
            </div>
          </main>
          <footer className='border-t border-gray-100/60 px-4 lg:px-10 py-5'>
            <div className='max-w-screen-2xl mx-auto flex items-center justify-between text-sm'>
              <div className='flex items-center space-x-2'>
                <p className='text-white font-medium'>Membership Level: </p>
                <div className='w-4 h-4 shrink-0 border-4 border-brand-primary rounded-full'></div>
                <p className='text-brand-primary'>Bronze</p>
              </div>

              <div className='flex items-center space-x-2'>
                <p className='text-white font-medium'>Current PXP: </p>
                <p className='text-brand-primary'>
                  {this.formatNumber(this.state.userPolarisExpSupplyAmount)}
                </p>
              </div>
            </div>
          </footer>
        </>
      );
    }
  }
}

export default page;
