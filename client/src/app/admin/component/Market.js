"use client"

import {React,useState} from 'react';
import styles from '../DataForm.module.css';
import { PublicKey } from '@solana/web3.js';

// Define the function component
const Greeting = ({onChainData,getMarketData,stockAtlas,stockResource}) => {


  const [amount, setAmount] = useState('');
  const [resourceAmmount, setresourceAmmount] = useState('');

  const numberToScale = (number) => {
    const num = parseFloat(number);
    if (isNaN(num)) return '';
    if (num >= 1e9) return `${(num / 1e9).toFixed(0)} B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(0)} M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(0)} K`;
    return num.toString();
};


  return (
    <div>
            <button style={{marginBottom:20}} onClick={getMarketData} type="submit" className={styles.button}>Get Vault Information</button>

            <div style={{ height: '2px', backgroundColor: 'black', width: '100%' }}></div>
            <div style={{color:"black",marginTop:10,marginBottom:30}}>Vault Owner:{onChainData.vault_owner}</div>

            <div style={{ height: '2px', backgroundColor: 'black', width: '100%' }}></div>
            <div style={{color:"black",marginTop:0}}>Vault Pubkey:{onChainData.vault_pubkey}</div>
            <div style={{color:"black",marginTop:20}}>Resource Ammount: {numberToScale(onChainData.resource_amount)}</div>
            <div style={{color:"black",marginTop:20,marginBottom:20}}>ATLAS Ammount: {numberToScale(onChainData.atlas_amount/100e6)}</div>

            <div style={{ height: '2px', backgroundColor: 'black', width: '100%' }}></div>
            <div style={{color:"black",marginTop:0}}>Minimum Buy Qty:{String(onChainData.minimum_buy_qty)}</div>
            <div style={{color:"black",marginTop:20}}>Total Buy Cost:{onChainData.buy_price}</div>
            <div style={{color:"black",marginTop:20}}>Minimum Sell Qty:{String(onChainData.minimum_sell_qty)}</div>
            <div style={{color:"black",marginTop:20,marginBottom:20}}>Total Sell Cost:{onChainData.sell_price}</div>

            <div style={{ height: '2px', backgroundColor: 'black', width: '100%' }}></div>
            <div style={{color:"black",marginTop:0}}>ATLAS_MINT:{onChainData.atlas_mint}</div>
            <div style={{color:"black",marginTop:0}}>beneficiary_atlast_account:{onChainData.beneficiary_atlast_account}</div>

            <div style={{color:"black",marginTop:20}}>Resource_MINT:{onChainData.resource_mint}</div>
            <div style={{color:"black",marginTop:0,marginBottom:20}}>beneficiary_resource_account:{onChainData.beneficiary_resource_account}</div>
            
            <div style={{ height: '2px', backgroundColor: 'black', width: '100%' }}></div>
            <div style={{color:"black",marginTop:0,marginBottom:40}}>beneficiary_percent:{onChainData.beneficiary_percent}</div>

            {String(onChainData.vault_owner).length === 0 ? (
                    <div style={{ display: 'flex', marginTop: 0 }}>

                    </div>
                ) : (

                  <div style={{ display: 'flex', marginTop: 0 }}>
                          <div style={{ display: 'flex', marginTop: 0 }}>
                            <div style={{color:"black", flex: 1, padding: '0 10px' }}> {/* Added padding for some space between columns */}
                              Send Atlas to Market: 
                              <div></div>
                              {numberToScale(amount)}

                              <br/>
                              <input type='number' placeholder='amount' value={amount} onChange={e => setAmount(e.target.value)}></input> {/* Corrected spelling of "amount" */}
                              <br/>
                              <button onClick={() => stockAtlas(amount)} className={styles.button}>Send ATLAS</button>
                            </div>
                            <div style={{ color:"black",flex: 1, padding: '0 10px' }}> {/* Duplicate styling for the second column */}
                              Send Resource to Market: 
                              <div></div>
                              {numberToScale(resourceAmmount)}
                              <br/>
                              <input type='number' placeholder='amount' value={resourceAmmount} onChange={e => setresourceAmmount(e.target.value)}></input>
                              <br/>
                              <button onClick={() => stockResource(resourceAmmount)} className={styles.button}>Send Resource</button>
                            </div>
                          </div>
                  </div>

                )}
    </div>
  );
};

export default Greeting;
