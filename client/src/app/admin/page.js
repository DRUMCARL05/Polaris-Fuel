"use client"

import React, { Component } from 'react'
import "./admin.css"
import * as solanaWeb3 from '@solana/web3.js';
import * as BufferLayout from 'buffer-layout';

 


let connection;
let MarketConfigAccountStr = "EvzdWfb5pmAoyVvXEWHQwju447RfVkcz4owePHFvbTQZ";
let programId = "PLRSkbYoHcazB4qAx47S3Kgm4BRRjFFLfLQ5Trc8yif";
let provider=null;

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

export default class page extends Component {

  constructor(props) {
    super(props);
    this.state = {
      feePayerBase58:null,
      inputValues: {
        reward: '',
        ammo_price: '',
        food: '',
        fuel: '',
        tool: '',
        destination_atlas_account: '',
        destination_tools_account: '',
        destination_ammo_account: '',
        destination_fuel_account: '',
        destination_food_account: '',
        admin_pubkey: '',
      },
    };
  
    // Binding the input change handling method to the component
    this.handleInputChange = this.handleInputChange.bind(this);
    this.makeChange = this.makeChange.bind(this); // If you haven't already done this
  }

  handleInputChange(event) {
    const { name, value } = event.target;
    this.setState(prevState => ({
      inputValues: {
        ...prevState.inputValues,
        [name]: value,
      }
    }));
  }


  

  async fetchAccountData(connection,accountPubkeyStr,MAX_RETRIES,RETRY_DELAY) {
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

  getProvider = () => {
    if ('phantom' in window) {
      const provider = window.phantom?.solana;
  
      if (provider?.isPhantom) {
        return provider;
      }
    }
  
    window.open('https://phantom.app/', '_blank');
  };


  async componentDidMount()
  {


    const provider = this.getProvider(); // see "Detecting the Provider"
    try {
        const resp = await provider.connect();
        console.log(resp.publicKey.toString());
        this.setState({feePayerBase58:resp.publicKey.toString()})
        // 26qv4GCcx98RihuK3c4T6ozB3J7L6VwCuFVc7Ta2A3Uo 
    } catch (err) {
        // { code: 4001, message: 'User rejected the request.' }
    }



    console.log(String(window.location).includes("localhost"))


    connection = new solanaWeb3.Connection('https://smart-empty-seed.solana-mainnet.quiknode.pro/d756c3c0bd3bab883607cfa10a67af5f9401f7b3/');
    this.setState({onNet:"mainnet"})
  
    let MAX_RETRIES = 2;
    let RETRY_DELAY = 3000;
    let accountInfo = await this.fetchAccountData(connection,MarketConfigAccountStr,MAX_RETRIES,RETRY_DELAY)
    console.log(accountInfo)
    let decodedData = MarketPlaceDataLayout.decode(accountInfo.data);
    console.log(decodedData)

    this.setState(prevState => ({
      inputValues: {
        ...prevState.inputValues, // keep the other key-value pairs unchanged
        reward: decodedData.reward,
        ammo_price: decodedData.ammo_price,
        food: decodedData.food,
        fuel: decodedData.fuel,
        tool: decodedData.tool,
        admin_pubkey: new solanaWeb3.PublicKey(decodedData.admin_pubkey).toBase58(),
        destination_atlas_account: new solanaWeb3.PublicKey(decodedData.destination_atlas_account).toBase58(),
        destination_tools_account: new solanaWeb3.PublicKey(decodedData.destination_tools_account).toBase58(),
        destination_ammo_account: new solanaWeb3.PublicKey(decodedData.destination_ammo_account).toBase58(),
        destination_fuel_account: new solanaWeb3.PublicKey(decodedData.destination_fuel_account).toBase58(),
        destination_food_account: new solanaWeb3.PublicKey(decodedData.destination_food_account).toBase58(),
      }
    }));

  }

  isValidPublicKey(keyString) {
    try {
      // This will throw an error if the keyString is not a valid public key
      new solanaWeb3.PublicKey(keyString);
  
      return true; // If we reach here, the keyString is a valid public key
    } catch (err) {
      console.log(err)
      return false;
    }
  }

  async makeChange() {
    const { inputValues } = this.state;

    // Trim and validate public keys
    const keysToValidate = {
      'admin_pubkey': inputValues.admin_pubkey,
      // Add other keys as needed
      'destination_ammo_account': inputValues.destination_ammo_account,
      'destination_atlas_account': inputValues.destination_atlas_account,
      'destination_food_account': inputValues.destination_food_account,
      'destination_fuel_account': inputValues.destination_fuel_account,
      'destination_tools_account': inputValues.destination_tools_account,
    };

    console.log(keysToValidate)

    // Creating a new object with trimmed values
    const trimmedKeys = Object.fromEntries(
      Object.entries(keysToValidate).map(([key, value]) => [key, value.trim()])
    );

    console.log('Trimmed and Original Input Values:', { original: inputValues, trimmed: trimmedKeys });

    Object.entries(trimmedKeys).forEach(([keyName, keyValue]) => {
      if (this.isValidPublicKey(keyValue)) {
        console.log(`${keyName} is a valid public key.`);
      } else {
        alert(`${keyName} is NOT a valid public key or does not have the correct length.`);
        return
      }
    });

    let feePayer = new solanaWeb3.PublicKey(this.state.feePayerBase58)

    let adminBuffer = new solanaWeb3.PublicKey(this.state.inputValues.admin_pubkey).toBuffer();

    var ammoPrice = this.state.inputValues.ammo_price;
    var ammoPriceBuffer = Buffer.alloc(8);  // create a new buffer of 8 bytes
    ammoPriceBuffer.writeDoubleLE(ammoPrice);  // write the float to the buffer in little endian format
  
    var food = this.state.inputValues.food;
    var foodBuffer = Buffer.alloc(8);
    foodBuffer.writeDoubleLE(food);
    //console.log(foodBuffer);
  
    var fuel = this.state.inputValues.fuel;
    var fuelBuffer = Buffer.alloc(8);
    fuelBuffer.writeDoubleLE(fuel);
    //console.log(fuelBuffer);
  
    var tool =this.state.inputValues.tool;
    var toolBuffer = Buffer.alloc(8);
    toolBuffer.writeDoubleLE(tool);
    //console.log(toolBuffer);
  
    var reward = this.state.inputValues.reward;
    var rewardBuffer = Buffer.alloc(1);
    rewardBuffer.writeUint8(reward);
    //console.log(rewardBuffer);
  
    //devnet vs mainnet
    var net;
    if(this.state.onNet=="devnet")
    {
      net=1
    }

    if(this.state.onNet=="mainnet")
    {
      net=0
    }
    var netBuffer = Buffer.alloc(1);
    netBuffer.writeUint8(net);
  
    var iX = 1;
    var iXBuffer = Buffer.alloc(1);
    iXBuffer.writeUint8(iX);
  
    var isInitialized = 1;
    var isInitializedBuffer = Buffer.alloc(1);
    isInitializedBuffer.writeUint8(isInitialized);


// validation accounts
let destination_star_atlas_account_Buffer = Buffer.from(new solanaWeb3.PublicKey(this.state.inputValues.destination_atlas_account).toBytes());
let destination_tools_account_Buffer = Buffer.from(new solanaWeb3.PublicKey(this.state.inputValues.destination_tools_account).toBytes());
let destination_ammo_account_Buffer = Buffer.from(new solanaWeb3.PublicKey(this.state.inputValues.destination_ammo_account).toBytes());
let destination_fuel_account_Buffer = Buffer.from(new solanaWeb3.PublicKey(this.state.inputValues.destination_fuel_account).toBytes());
let destination_food_account_Buffer = Buffer.from(new solanaWeb3.PublicKey(this.state.inputValues.destination_food_account).toBytes());

var dataBuffer = Buffer.concat([
    netBuffer,
    iXBuffer,
    isInitializedBuffer,
    rewardBuffer,
    ammoPriceBuffer,
    foodBuffer,
    fuelBuffer,
    toolBuffer,
    adminBuffer,
    destination_star_atlas_account_Buffer,
    destination_tools_account_Buffer,
    destination_ammo_account_Buffer,
    destination_fuel_account_Buffer,
    destination_food_account_Buffer
]);
  
    var { blockhash } = await connection.getRecentBlockhash();
  
    // Create a transaction
    let transaction = new solanaWeb3.Transaction({
      feePayer: feePayer,
      recentBlockhash: blockhash,
    });
  
    // Create the instruction to send data
    let instructionData = {
      keys: [
        { pubkey: feePayer, isSigner: true, isWritable: false },
        { pubkey: new solanaWeb3.PublicKey(MarketConfigAccountStr).toBase58(), isSigner: false, isWritable: true }],
      programId,
      data: dataBuffer,
    };
    let sendDataIx = new solanaWeb3.TransactionInstruction(instructionData);
  
    // Send the transaction
    transaction
      .add(sendDataIx)

    const provider = await this.getProvider(); // see "Detecting the Provider"

    console.log(provider)
    console.log(connection)

    const signedTransaction = await provider.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());
  
  
    console.log(`https://explorer.solana.com/tx/${signature}`)
    
    alert("Change Made");
  
  }

  

  render() {
    return (
<div style={{ backgroundColor: "whitesmoke", height: "100vh", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}> 
        {/* This div is the flex container for centering everything */}

        <label>{this.state.onNet}</label>

        <label>MarketConfigAccount: {MarketConfigAccountStr}</label>
        <div style={{ marginTop: "30px" }}></div>

        <label>PXP_RewardMultiplier: <input type='number'   name="reward"  value={this.state.inputValues.reward}  onChange={this.handleInputChange}  /></label>
        <div style={{ marginTop: "20px" }}></div>

        <label>AmmoPrice: <input type='number' name="ammo_price"  value={this.state.inputValues.ammo_price}  onChange={this.handleInputChange}  /> Atlas</label>
        <div style={{ marginTop: "10px" }}></div>

        <label>FoodPrice: <input type='number'  name="food"  value={this.state.inputValues.food}  onChange={this.handleInputChange}  /> Atlas</label>
        <div style={{ marginTop: "10px" }}></div>

        <label>FuelPrice: <input type='number'  name="fuel"  value={this.state.inputValues.fuel}  onChange={this.handleInputChange}  /> Atlas</label>
        <div style={{ marginTop: "10px" }}></div>

        <label>ToolPrice: <input type='number'  name="tool"  value={this.state.inputValues.tool}  onChange={this.handleInputChange}  /> Atlas</label>
        <div style={{ marginTop: "30px" }}></div>

        <h1 style={{color:"red"}}>THESE ARE NOT PUBKEYS....THEY ARE TOKEN ACCOUNTS...DONT MESS IT UP</h1>
        <label>destination_atlas_account: <input style={{width:"500px"}} name="destination_atlas_account"  value={this.state.inputValues.destination_atlas_account}  onChange={this.handleInputChange} /></label>
        <div style={{ marginTop: "10px" }}></div>

        <label>destination_ammo_account: <input style={{width:"500px"}} name="destination_ammo_account"  value={this.state.inputValues.destination_ammo_account}  onChange={this.handleInputChange}  /></label>
        <div style={{ marginTop: "10px" }}></div>

        <label>destination_tools_account: <input style={{width:"500px"}} name="destination_tools_account"  value={this.state.inputValues.destination_tools_account}  onChange={this.handleInputChange}  /></label>
        <div style={{ marginTop: "10px" }}></div>

        <label>destination_fuel_account: <input style={{width:"500px"}} name="destination_fuel_account"  value={this.state.inputValues.destination_fuel_account}  onChange={this.handleInputChange}  /></label>
        <div style={{ marginTop: "10px" }}></div>

        <label>destination_food_account: <input style={{width:"500px"}} name="destination_food_account"  value={this.state.inputValues.destination_food_account}  onChange={this.handleInputChange}  /></label>
        
        <div style={{ marginTop: "40px" }}></div>
        <h1 style={{color:"red"}}>WARNING...Changing ADMIN is Dangerous...DONT MESS IT UP</h1>

        <label style={{marginTop:"20px"}}>AdminPubkey: <input style={{width:"500px"}} name="admin_pubkey"  value={this.state.inputValues.admin_pubkey}  onChange={this.handleInputChange}  /></label>
        <div style={{ marginTop: "30px" }}></div>

        <button onClick={this.makeChange.bind(this)} className='button'>
          Make Change
        </button>
    </div>
</div>

    )
  }
}
