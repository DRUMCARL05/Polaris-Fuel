"use client"

import {React,useEffect} from 'react';
import styles from '../DataForm.module.css';
import { PublicKey } from '@solana/web3.js';

// Define the function component
const Greeting = ({onChainData,getMarketData}) => {



  return (
    <div>
            <button style={{marginBottom:20}} onClick={getMarketData} type="submit" className={styles.button}>Get Vault Information</button>

            <div style={{ height: '2px', backgroundColor: 'black', width: '100%' }}></div>
            <div style={{marginTop:10,marginBottom:30}}>Vault Owner:{onChainData.vault_owner}</div>

            <div style={{ height: '2px', backgroundColor: 'black', width: '100%' }}></div>
            <div style={{marginTop:0}}>Vault Pubkey:{onChainData.vault_pubkey}</div>
            <div style={{marginTop:20}}>AMMO Ammount:{onChainData.ammo_amount}</div>
            <div style={{marginTop:20,marginBottom:20}}>ATLAS Ammount:{onChainData.atlas_amount}</div>

            <div style={{ height: '2px', backgroundColor: 'black', width: '100%' }}></div>
            <div style={{marginTop:0}}>Minimum Buy Qty:{String(onChainData.minimum_buy_qty)}</div>
            <div style={{marginTop:20}}>Total Buy Cost:{onChainData.buy_price}</div>
            <div style={{marginTop:20}}>Minimum Sell Qty:{String(onChainData.minimum_sell_qty)}</div>
            <div style={{marginTop:20,marginBottom:20}}>Total Sell Cost:{onChainData.sell_price}</div>

            <div style={{ height: '2px', backgroundColor: 'black', width: '100%' }}></div>
            <div style={{marginTop:0}}>ATLAS_MINT:{onChainData.atlas_mint}</div>
            <div style={{marginTop:0}}>beneficiary_atlast_account:{onChainData.beneficiary_atlast_account}</div>

            <div style={{marginTop:20}}>Resource_MINT:{onChainData.resource_mint}</div>
            <div style={{marginTop:0,marginBottom:20}}>beneficiary_resource_account:{onChainData.beneficiary_resource_account}</div>
            
            <div style={{ height: '2px', backgroundColor: 'black', width: '100%' }}></div>
            <div style={{marginTop:0}}>beneficiary_percent:{onChainData.beneficiary_percent}</div>


            
    </div>
  );
};

export default Greeting;
