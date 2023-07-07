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


//update to mainnet
let connection = new Connection(clusterApiUrl('devnet'));
let marketConfigAccount = new PublicKey("DpTW34MTR79ckQHkygyvgDvEMrbdSm5oo83Hdgn9nzGK");

let pda_star_atlas_account = new PublicKey('GJNKMrcsH5m7vem9WSxs7SEpMrHeihNqtQg6CzCFuhPY')
let pda_tools_mint_tokenAccount = new PublicKey('B9xSJqsBuy9Xj3kCpsh8ZpJpphyU62aaNCqmbL5qsxjC')
let pda_ammo_mint_tokenAccount = new PublicKey('EtgTTdct3r8kJgUmjiWWBrPHG9g5rBhUFouc9npvG6t9')
let pda_fuel_mint_tokenAccount = new PublicKey('8LG7PKi9GyxM7Nm3EVaYDG18fBfwjo5boNtAF5ZiW7KL')
let pda_food_mint_tokenAccount = new PublicKey('BeLzpdSP3bsuieattadMFseup9gkuNfNV1Grde134CFH')

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
    userFoodSupplyAmount:"...",
    userFuelSupplyAmount:"...",
    userAmmoSupplyAmount:"...",
    userToolsSupplyAmount:"...",
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

  async checkAccountForMint(ownerPubkeyStringbase58) {
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


    console.log(accounts[1].account.data.parsed.info.mint)

    return accounts

    // Loop through each token account and check if it matches the mint address
    for (const account of parsedTokenAccounts.value) {
        const accountMintAddress = account.account.data.parsed.info.mint;
        if (accountMintAddress === mintAddress.toString()) {
            console.log(`Account ${account.pubkey.toBase58()} is associated with mint address ${mintAddress.toString()}`);
            return true;
        }
    }

    // If no matching account is found, return false
    console.log(`No accounts found for owner ${ownerPubkeyString} associated with mint address ${mintAddressString}`);
    return false;
}


walletConnected()
{
  console.log("wallet connected")
}

async componentDidMount(){

  provider = await this.getProvider()
    
  console.log(provider)
  try {
    const resp = await provider.connect();
    console.log(resp.publicKey.toString());
    this.setState({userPubKey:resp.publicKey.toString()})
    let parsedTokenAccounts = await this.checkAccountForMint(resp.publicKey.toString())
    console.log(parsedTokenAccounts)
  } catch (err) {
      // { code: 4001, message: 'User rejected the request.' }
  }


  let market_config_data = await this.getAndDecodeMarketplaceAccountData(connection,marketConfigAccount)

  let market_atlas =  await this.getBalance(connection,pda_star_atlas_account)
  let market_food = await this.getBalance(connection,pda_food_mint_tokenAccount)
  let market_fuel = await this.getBalance(connection,pda_fuel_mint_tokenAccount)
  let market_ammo = await this.getBalance(connection,pda_ammo_mint_tokenAccount)
  let market_tools = await this.getBalance(connection,pda_tools_mint_tokenAccount)

  console.log()


  this.setState({
    foodSupplyAmountDisplay:market_food,
    fuelSupplyAmountDisplay:market_fuel,
    ammoSupplyAmountDisplay:market_ammo,
    toolsSupplyAmountDisplay:market_tools,
    marketFoodSupplyAmount:market_food,
    marketFuelSupplyAmount:market_fuel,
    marketAmmoSupplyAmount:market_ammo,
    marketToolsSupplyAmount:market_tools,
  })



  console.log(market_config_data.admin_pubkey.toBase58())



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

  async callProgram()
  {
    console.log("Calling Program")
    const resp = await provider.connect();
    console.log(resp.publicKey.toString()); 
    var { blockhash } = await connection.getRecentBlockhash();

    console.log(blockhash)

    // Create a transaction
    const transaction = new Transaction();
    transaction.feePayer =new PublicKey(resp.publicKey.toString());
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
    })

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
    })

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
                  <button style={{ position: 'relative', left: '-2.5rem',cursor: 'pointer', background: 'none', outline: 'none', border: 'none', backgroundColor: 'none', color: '#E36414', fontSize: 12, fontWeight: 200}}>Max</button>
                  <span style={{color: '#E36414', fontSize: 18}}>{(this.state.foodMSRdisplay*this.state.foodAmount).toFixed(6)} <span style={{color: '#f0f0f0', paddingLeft: 15}}>  Atlas</span></span>
                </div>
                
                <div style={{marginTop: 12}} className="buyingAmount">
                  <input type="text" style={{ border: 'none', fontSize: 16, background: '#1C1E20', padding: '0.8rem', outline: '#E36414', color: '#f0f0f0', borderRadius: '5px' }}  placeholder='Enter Amount' id='fuel' onChange={this.changeAmount.bind(this)} onKeyPress={event => {if(event.key === '.') event.preventDefault();}}/>
                  <button style={{ position: 'relative', left: '-2.5rem',cursor: 'pointer', background: 'none', outline: 'none', border: 'none', backgroundColor: 'none', color: '#E36414', fontSize: 12, fontWeight: 200}}>Max</button>
                  <span style={{color: '#E36414', fontSize: 18}}>{(this.state.fuelMSRdisplay*this.state.fuelAmount).toFixed(6)} <span style={{color: '#f0f0f0', paddingLeft: 15}}>  Atlas</span></span>
                </div>
                
                <div style={{marginTop: 12}} className="buyingAmount">
                  <input type="text" style={{ border: 'none', fontSize: 16, background: '#1C1E20', padding: '0.8rem', outline: '#E36414', color: '#f0f0f0', borderRadius: '5px' }}  placeholder='Enter Amount' id='ammo' onChange={this.changeAmount.bind(this)} onKeyPress={event => {if(event.key === '.') event.preventDefault();}}/>
                  <button style={{ position: 'relative', left: '-2.5rem',cursor: 'pointer', background: 'none', outline: 'none', border: 'none', backgroundColor: 'none', color: '#E36414', fontSize: 12, fontWeight: 200}}>Max</button>
                  <span style={{color: '#E36414', fontSize: 18}}>{(this.state.ammoMSRdisplay*this.state.ammoAmount).toFixed(6)} <span style={{color: '#f0f0f0', paddingLeft: 15}}>  Atlas</span></span>
                </div>
                
                <div style={{marginTop: 12}} className="buyingAmount">
                  <input type="text" style={{ border: 'none', fontSize: 16, background: '#1C1E20', padding: '0.8rem', outline: '#E36414', color: '#f0f0f0', borderRadius: '5px' }}  placeholder='Enter Amount' id='tools' onChange={this.changeAmount.bind(this)} onKeyPress={event => {if(event.key === '.') event.preventDefault();}}/>
                  <button style={{ fontSize: 12, position: 'relative', left: '-2.5rem',cursor: 'pointer', background: 'none', outline: 'none', border: 'none', backgroundColor: 'none', color: '#E36414', fontWeight: 200}}>Max</button>
                  <span style={{color: '#E36414', fontSize: 18}}>{(this.state.toolsMSRdisplay*this.state.toolsAmount).toFixed(6)} <span style={{color: '#f0f0f0', paddingLeft: 15}}>  Atlas</span></span>
                </div>
              </div>
            </div>
          </div>
      </div>

      {/* MARKET UI ENDS HERE */}

      
      {/* Action Button Starts HERE */}
        <button style={{marginTop:"50px", width:"200px", marginLeft: "auto", marginRight: "auto", display: "block", height:50, fontSize: 18, color: '#E36414', background: 'none', border: '1px solid #E36414', borderRadius: 10, outline: 'none', cursor: 'pointer'}} id="Send" onClick={this.callProgram}>{this.state.actionButton}</button>
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
            <h3 className="pxp" style={{ color: '#E36414', marginLeft: '0.5rem' }}>126,000</h3>
          </div>
        </div>
      {/* FOOTER ENDS HERE */}


      </div>
    );
  }
}

export default page;