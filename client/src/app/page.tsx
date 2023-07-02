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
        <div className='navBar' style={{display:"flex",width:"100%"}}>
        <img style={{marginLeft:100}} width={200} src="https://cdn.discordapp.com/attachments/1121693555891638282/1124865911459958855/PXPtexture.png"></img>
        <h1 style={{color:"white",marginTop:80}}>Polaris</h1>
       
        <button onClick={this.customerClick.bind(this)} style={{marginLeft:"360px",width:"120px",height:"60px",marginTop:65,backgroundColor:this.state.customerButtonColor,color:"white"}}>Customer</button>
        <button onClick={this.providerClick.bind(this)} style={{marginLeft:"0px",width:"120px",height:"60px",marginTop:65,backgroundColor:this.state.providerButtonColor,color:"white"}}>Polaris Provider</button>
       
        <button style={{position:"absolute",right:200,top:80,width:200,height:60,backgroundColor:"#e36414",color:"white"}} id="WalletButton" onClick={this.walletClick}>Connect Wallet</button>
        </div>
        {/* NAVBAR ENDS HERE */}


       {/* MARKET UI STARTS HERE */}

       <div style={{display:"flex", justifyContent: "center", marginTop:"30px"}}>
          <div style={{display:"flex"}}>
            <div className='marketQTYBox'>
                <div style={{color:"white"}}>{this.state.marketQtyBoxText}</div>
                <input disabled id="food" placeholder={"food                  "+this.state.foodSupplyAmmount} ></input>
                <div></div>
                <input disabled id="fuel" placeholder={"fuel                   "+this.state.fuelSupplyAmmount} ></input>
                <div></div>
                <input disabled id="ammo" placeholder={"ammo               "+this.state.ammoSupplyAmmount}></input>
                <div></div>
                <input disabled id="tools" placeholder={"tools                 "+this.state.toolsSupplyAmmount} ></input>
            </div>
            <div className='currentPrices'>
                <div style={{color:"white"}}>  Current Price</div>
                <input disabled id="food" placeholder={"food                  "+this.state.foodMSRdisplay} ></input>
                <div></div>
                <input disabled id="fuel" placeholder={"fuel                   "+this.state.fuelMSRdisplay} ></input>
                <div></div>
                <input disabled id="ammo" placeholder={"ammo               "+this.state.ammoMSRdisplay}></input>
                <div></div>
                <input disabled id="tools" placeholder={"tools                 "+this.state.toolsMSRdisplay} ></input>
            </div>
            <div className='ammountBox'>
                <div style={{color:"white"}}>{this.state.ammountBoxText}</div>
                <div className='inputContainer' style={{position:"relative"}}>
                    <input type='number' onChange={this.changeAmmount.bind(this)} id="food" placeholder='Enter Amount' 
                          onKeyPress={event => {if(event.key === '.') event.preventDefault();}} ></input>
                    <button style={{position:"absolute",top:0,right:0}}>Max</button>
                </div>
                <div className='inputContainer' style={{position:"relative"}}>
                    <input type='number' onChange={this.changeAmmount.bind(this)} id="fuel" placeholder='Enter Amount'
                          onKeyPress={event => {if(event.key === '.') event.preventDefault();}} ></input>
                    <button style={{position:"absolute",top:0,right:0}}>Max</button>
                </div>
                <div className='inputContainer' style={{position:"relative"}}>
                    <input type='number' onChange={this.changeAmmount.bind(this)} id="ammo" placeholder='Enter Amount'
                          onKeyPress={event => {if(event.key === '.') event.preventDefault();}} ></input>
                    <button style={{position:"absolute",top:0,right:0}}>Max</button>
                </div>
                <div className='inputContainer' style={{position:"relative"}}>
                    <input type='number' onChange={this.changeAmmount.bind(this)} id="tools" placeholder='Enter Amount'
                          onKeyPress={event => {if(event.key === '.') event.preventDefault();}} ></input>
                    <button style={{position:"absolute",top:0,right:0}}>Max</button>
                </div>
            </div>
            <div style={{marginTop:"20px",marginLeft:"20px"}} className='total'>
                <div style={{marginTop:"2px",color:'white'}} > {(this.state.foodMSRdisplay*this.state.foodAmmount).toFixed(6)}   ATLAS</div>
                <div style={{marginTop:"2px",color:'white'}} > {(this.state.fuelMSRdisplay*this.state.fuelAmmount).toFixed(6)}   ATLAS</div>
                <div style={{marginTop:"2px",color:'white'}} > {(this.state.ammoMSRdisplay*this.state.ammoAmmount).toFixed(6)}   ATLAS</div>
                <div style={{marginTop:"2px",color:'white'}} > {(this.state.toolsMSRdisplay*this.state.toolsAmmount).toFixed(6)}   ATLAS</div>
            </div>
          </div>
      </div>

      {/* MARKET UI ENDS HERE */}

        
         {/* Action Button Starts HERE */}
        <button style={{marginTop:"30px", width:"150px", marginLeft: "auto", marginRight: "auto", display: "block",width:300,height:60}} id="Send" onClick={this.callProgram}>{this.state.actionButton}</button>
         {/* Action Button ends HERE */}


           {/* FOOTER STARTS HERE */}


          {/* FOOTER ENDS HERE */}


      </div>
    );
  }
}

export default page;