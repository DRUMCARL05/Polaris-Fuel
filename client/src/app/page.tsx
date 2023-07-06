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

let provider: {
  disconnect(): unknown;
  signAndSendTransaction(transaction: Transaction): { signature: any; } | PromiseLike<{ signature: any; }>; connect: (arg0: { onlyIfTrusted: boolean; } | undefined) => void; on: (arg0: string, arg1: () => void) => void; 
};

let connection = new Connection(clusterApiUrl('devnet'));


class page extends Component {

  state={
    provider:null,
    foodMSRdisplay:0.000529,
    fuelMSRdisplay:0.001290,
    ammoMSRdisplay:0.001935,
    toolsMSRdisplay:0.001566,
    foodMSRPbuy:0.000529,
    fuelMSRPbuy:0.001290,
    ammoMSRPbuy:0.001935,
    toolsMSRPbuy:0.001566,
    foodMSRPsell:0.000529,
    fuelMSRPsell:0.000529,
    ammoMSRPsell:0.000529,
    toolsMSRPsell:0.000529,
    foodSupplyAmmount:10000,
    fuelSupplyAmmount:8000,
    ammoSupplyAmmount:6000,
    toolsSupplyAmmount:3000,
    foodAmmount:0,
    fuelAmmount:0,
    ammoAmmount:0,
    toolsAmmount:0,
    display:"customer",
    actionButton:"Buy",
    customerButtonColor:"#e36414",
    providerButtonColor:"#000815CF",
    activeColor:"#e36414",
    inActiveColor:"#000814BF",
    marketFee:0.10,
    ammountBoxText:"Buying Ammount",
    marketQtyBoxText:"Market QTY",

  }

  async getProvider(){
    if ('phantom' in window) {
      const provider = window.phantom?.solana;

      console.log(provider)
  
      if (provider?.isPhantom) {
        return provider;
      }
    }
  
    window.open('https://phantom.app/', '_blank');
  };

  async componentDidMount(){

    this.setState({
      foodMSRPsell:this.state.foodMSRPbuy+this.state.foodMSRPbuy*this.state.marketFee,
      fuelMSRPsell:this.state.fuelMSRPbuy+this.state.fuelMSRPbuy*this.state.marketFee,
      ammoMSRPsell:this.state.ammoMSRPbuy+this.state.ammoMSRPbuy*this.state.marketFee,
      toolsMSRPsell:this.state.toolsMSRPbuy+this.state.toolsMSRPbuy*this.state.marketFee
    })

    console.log(window.location.pathname)



    provider = await this.getProvider()
    
    // console.log(provider)
    // try {
    //   const resp = await provider.connect();
    //   console.log(resp.publicKey.toString());
    // } catch (err) {
    //     // { code: 4001, message: 'User rejected the request.' }
    // }

    provider.on("connect", () => console.log("connected!"));

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
      ammountBoxText:"Buying Amount",
      marketQtyBoxText:"Market QTY",
      foodMSRdisplay:this.state.foodMSRPbuy,
      fuelMSRdisplay:this.state.fuelMSRPbuy,
      ammoMSRdisplay:this.state.ammoMSRPbuy,
      toolsMSRdisplay:this.state.toolsMSRPbuy,
    })

  }

  providerClick()
  {
    this.setState({providerButtonColor:this.state.activeColor,
      customerButtonColor:this.state.inActiveColor,
      actionButton:"Sell",
      ammountBoxText:"Selling Amount",
      marketQtyBoxText:"User QTY",
      foodMSRdisplay:this.state.foodMSRPsell,
      fuelMSRdisplay:this.state.fuelMSRPsell,
      ammoMSRdisplay:this.state.ammoMSRPsell,
      toolsMSRdisplay:this.state.toolsMSRPsell,
    })

  }

  changeAmmount(event)
  {
    console.log(event.target.id)
    console.log(event.target.value)

    switch (event.target.id) {
      case "food":
        this.setState({foodAmmount:event.target.value})
      break;
      case "fuel":
        this.setState({fuelAmmount:event.target.value})
      break;
      case "ammo":
        this.setState({ammoAmmount:event.target.value})
      break;
      case "tools":
        this.setState({toolsAmmount:event.target.value})
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
            <button onClick={this.customerClick.bind(this)} style={{width:"170px",height:"60px",backgroundColor:this.state.customerButtonColor,color:"#f0f0f0", border: 'none', outline: 'none', fontSize: '17px', cursor: 'pointer'}}>Customers</button>
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
                <h3 style={{ color: '#f0f0f0', fontWeight: 300, marginBottom: 35}}>{this.state.foodSupplyAmmount}</h3>
                <h3 style={{ color: '#f0f0f0', fontWeight: 300, marginBottom: 35}}>{this.state.fuelSupplyAmmount}</h3>
                <h3 style={{ color: '#f0f0f0', fontWeight: 300, marginBottom: 35}}>{this.state.ammoSupplyAmmount}</h3>
                <h3 style={{ color: '#f0f0f0', fontWeight: 300, marginBottom: 35}}>{this.state.toolsSupplyAmmount}</h3>
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
              <h2 style={{ color: '#f0f0f0', fontWeight: 600 }}>{this.state.ammountBoxText}</h2>
              <div className="content" style={{ marginTop: '13px' }}>
                <div className="buyingAmount">
                  <input type="text" style={{ border: 'none', fontSize: 16, background: '#1C1E20', padding: '0.8rem', outline: '#E36414', color: '#f0f0f0', borderRadius: '5px' }}  placeholder='Enter Amount' id='food' onChange={this.changeAmmount.bind(this)} onKeyPress={event => {if(event.key === '.') event.preventDefault();}}/>
                  <button style={{ position: 'relative', left: '-2.5rem',cursor: 'pointer', background: 'none', outline: 'none', border: 'none', backgroundColor: 'none', color: '#E36414', fontSize: 12, fontWeight: 200}}>Max</button>
                  <span style={{color: '#E36414', fontSize: 18}}>{(this.state.foodMSRdisplay*this.state.foodAmmount).toFixed(6)} <span style={{color: '#f0f0f0', paddingLeft: 15}}>  Atlas</span></span>
                </div>
                
                <div style={{marginTop: 12}} className="buyingAmount">
                  <input type="text" style={{ border: 'none', fontSize: 16, background: '#1C1E20', padding: '0.8rem', outline: '#E36414', color: '#f0f0f0', borderRadius: '5px' }}  placeholder='Enter Amount' id='fuel' onChange={this.changeAmmount.bind(this)} onKeyPress={event => {if(event.key === '.') event.preventDefault();}}/>
                  <button style={{ position: 'relative', left: '-2.5rem',cursor: 'pointer', background: 'none', outline: 'none', border: 'none', backgroundColor: 'none', color: '#E36414', fontSize: 12, fontWeight: 200}}>Max</button>
                  <span style={{color: '#E36414', fontSize: 18}}>{(this.state.fuelMSRdisplay*this.state.fuelAmmount).toFixed(6)} <span style={{color: '#f0f0f0', paddingLeft: 15}}>  Atlas</span></span>
                </div>
                
                <div style={{marginTop: 12}} className="buyingAmount">
                  <input type="text" style={{ border: 'none', fontSize: 16, background: '#1C1E20', padding: '0.8rem', outline: '#E36414', color: '#f0f0f0', borderRadius: '5px' }}  placeholder='Enter Amount' id='ammo' onChange={this.changeAmmount.bind(this)} onKeyPress={event => {if(event.key === '.') event.preventDefault();}}/>
                  <button style={{ position: 'relative', left: '-2.5rem',cursor: 'pointer', background: 'none', outline: 'none', border: 'none', backgroundColor: 'none', color: '#E36414', fontSize: 12, fontWeight: 200}}>Max</button>
                  <span style={{color: '#E36414', fontSize: 18}}>{(this.state.ammoMSRdisplay*this.state.ammoAmmount).toFixed(6)} <span style={{color: '#f0f0f0', paddingLeft: 15}}>  Atlas</span></span>
                </div>
                
                <div style={{marginTop: 12}} className="buyingAmount">
                  <input type="text" style={{ border: 'none', fontSize: 16, background: '#1C1E20', padding: '0.8rem', outline: '#E36414', color: '#f0f0f0', borderRadius: '5px' }}  placeholder='Enter Amount' id='tools' onChange={this.changeAmmount.bind(this)} onKeyPress={event => {if(event.key === '.') event.preventDefault();}}/>
                  <button style={{ fontSize: 12, position: 'relative', left: '-2.5rem',cursor: 'pointer', background: 'none', outline: 'none', border: 'none', backgroundColor: 'none', color: '#E36414', fontWeight: 200}}>Max</button>
                  <span style={{color: '#E36414', fontSize: 18}}>{(this.state.toolsMSRdisplay*this.state.toolsAmmount).toFixed(6)} <span style={{color: '#f0f0f0', paddingLeft: 15}}>  Atlas</span></span>
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