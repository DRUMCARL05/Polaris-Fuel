// components/DataForm.js
import { useState, useEffect } from 'react';
import styles from './DataForm.module.css';
import { Connection, PublicKey, Keypair, Transaction,TransactionInstruction,sendAndConfirmTransaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID,createAssociatedTokenAccountInstruction,getAssociatedTokenAddress,createTransferInstruction} from '@solana/spl-token';
import { createVaultInstruction } from '@polaris-fuel/web3.js'; // Adjust the path as necessary


let connection = new Connection('https://api.devnet.solana.com')
let feePubKey = new PublicKey("5SYuwdp6eL8rSjfRWJ45P6WRLeV9Vnegxf8p2jrJh4xb")
let atlasMint = new PublicKey("6VxFguWdAfjtQ42a6Bmv5cUfDUj5Fmo5Kw3bUE9NFwyA")
let ammoMint = new PublicKey("HJg1NRB3Ge1fxX9t3egseQmy4tst4jvxaHZ6eYMCacv4")
export const programId = new PublicKey('GAfmY5v9EoSaPDpSo7Zhnb1bD5cwSK7sEow1uDZ1wdZ8');


function DataForm() {
    const [formData, setFormData] = useState({
        category: 'AMMO', // Default category
        minimum_buy_qty: '',
        buy_price: '',
        minimum_sell_qty: '',
        sell_price: '',
        pubkey: '',
        beneficiary_percent: '',
    });

    const [onChainData, setOnChainData] = useState({
        minimum_buy_qty: '',
        buy_price: '',
        minimum_sell_qty: '',
        sell_price: '',
        pubkey: '',
        beneficiary_percent: '',
    });

    const [network, setNetwork] = useState("DevNet");

    const [pricePerUnitBuy, setPricePerUnitBuy] = useState('');
    const [pricePerUnitSell, setPricePerUnitSell] = useState('');


    const getProvider = () => {
        if ('phantom' in window && window.phantom != null) {
          const provider = window.phantom.solana;
      
          if (provider?.isPhantom) {
            return provider;
          }
        }
      
        window.open('https://phantom.app/', '_blank');
      };


      async function findOrCreateAssociatedTokenAccount(mintPublicKey,payer) {
        // Create a new connection to the Solana blockchain
    
        // Attempt to get the associated token account
        const ata = await getAssociatedTokenAddress(mintPublicKey,payer,true,TOKEN_PROGRAM_ID,ASSOCIATED_TOKEN_PROGRAM_ID)
    
        let ataInfo = await connection.getAccountInfo(ata);
        if (ataInfo) {
            console.log("Associated Token Account already exists:", ata.toBase58());
            return {"hasAta":true,"ata":ata,"ataIx":null}
        } else {
            console.log("No Associated Token Account found, creating one...");
        
            let ataIx =createAssociatedTokenAccountInstruction(
                payer,
                ata,
                payer,
                mintPublicKey,
                TOKEN_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID
            )
    
            return {"hasAta":false,"ata":ata,"ataIx":ataIx}
        }
    }
    

    function validateFormData() {
        const { category,beneficiary_percent, buy_price, minimum_buy_qty, minimum_sell_qty, pubkey, sell_price } = formData;
      
        // Check if any of the number fields are NaN or if the pubkey is empty
        if (isNaN(beneficiary_percent) || isNaN(buy_price) || isNaN(minimum_buy_qty) ||
            isNaN(minimum_sell_qty) || isNaN(sell_price) || pubkey.trim() === "") {
          console.log("Please fill out all required fields correctly.");
          return false;
        }

          // Convert each field to a string and check if it is effectively empty after trimming
        if (!String(beneficiary_percent).trim() || !String(buy_price).trim() || !String(minimum_buy_qty).trim() ||
        !String(minimum_sell_qty).trim() || !String(sell_price).trim() || !String(pubkey).trim() || !String(category).trim()) {
        console.log("Please fill out all required fields correctly.");
        return false;
        }

      
        // Additional checks can be added here if needed
        console.log("All data is valid.");
        return true;
      }
      

    async function submitAccount()
    {

        let resourceMint;
        switch (formData.category) {
            case "AMMO":
                resourceMint=new PublicKey("HJg1NRB3Ge1fxX9t3egseQmy4tst4jvxaHZ6eYMCacv4")
                break;
        
            default:
                alert("Only Ammo Valut can be created at this time")
                return
                break;
        }

        
        console.log(formData)
        if(!validateFormData(formData))
        {
            alert("Please fill out all required fields correctly.")
        }


        const provider = getProvider(); // see "Detecting the Provider"
        let pubkey58;
        try {
            const resp = await provider.connect();
            console.log(resp.publicKey.toString());
            pubkey58=resp.publicKey.toString();
            // 26qv4GCcx98RihuK3c4T6ozB3J7L6VwCuFVc7Ta2A3Uo 
        } catch (err) {
            alert("Phantom Wallet Needed to use blendhit")
            return
            // { code: 4001, message: 'User rejected the request.' }
        }
    
        let payer = new PublicKey(pubkey58);

        //generate pda
        let marketSeeds = [payer.toBuffer(),resourceMint.toBuffer()]
        // Generate the PDA
        const [marketPDA, marketBump] = PublicKey.findProgramAddressSync(
            marketSeeds,
            programId
        );

        const transaction = new Transaction();



        let userAtlasInfo = await findOrCreateAssociatedTokenAccount(atlasMint,payer)
        console.log("Has Atlas account:",userAtlasInfo.hasAta)
        console.log("User Atlas Account:",userAtlasInfo.ata.toBase58())
        if(userAtlasInfo.hasAta == false)
        {
            transaction.add(userAtlasInfo.ataIx)
        }



        let userAmmoInfo = await findOrCreateAssociatedTokenAccount(resourceMint,payer)
        console.log("Has Ammo account:",userAmmoInfo.hasAta)
        console.log("User Ammo account:",userAmmoInfo.hasAta)
        console.log(userAmmoInfo.ata.toBase58())
        if(userAmmoInfo.hasAta == false)
        {
            transaction.add(userAmmoInfo.ataIx)
        }

        let pdaAtlasInfo = await findOrCreateAssociatedTokenAccount(atlasMint,marketPDA)
        console.log("Has Atlas account:",pdaAtlasInfo.hasAta)
        console.log("User Atlas Account:",pdaAtlasInfo.ata.toBase58())
        if(pdaAtlasInfo.hasAta == false)
        {
            transaction.add(pdaAtlasInfo.ataIx)
        }


        let pdaAmmoInfo = await findOrCreateAssociatedTokenAccount(resourceMint,marketPDA)
        console.log("Has Atlas account:",pdaAmmoInfo.hasAta)
        console.log("User Atlas Account:",pdaAmmoInfo.ata.toBase58())
        if(pdaAmmoInfo.hasAta == false)
        {
            transaction.add(pdaAmmoInfo.ataIx)
        }


        let TradeData = {
            minimum_buy_qty: formData.minimum_buy_qty,
            buy_price: formData.buy_price,
            minimum_sell_qty: formData.minimum_sell_qty,
            sell_price: formData.sell_price,
            beneficiary_atlast_account: pdaAtlasInfo.ata.toBuffer(), // Assuming this is already a Buffer of 32 bytes
            beneficiary_resource_account: pdaAmmoInfo.ata.toBuffer(), // Assuming this is already a Buffer of 32 bytes
            beneficiary_percent: formData.beneficiary_percent, // Decimal value
        };



        let vaultIx = createVaultInstruction(
            payer,
            resourceMint,
            marketPDA,
            TradeData.minimum_buy_qty,
            TradeData.buy_price,
            TradeData.minimum_sell_qty,
            TradeData.sell_price,
            TradeData.beneficiary_atlast_account,
            TradeData.beneficiary_resource_account,
            TradeData.beneficiary_percent,
            programId
        )

        console.log(vaultIx)
        transaction.add(vaultIx)


        // Get the recent blockhash
        const { blockhash } = await connection.getRecentBlockhash();
        transaction.recentBlockhash = blockhash;

        // Set the transaction fee payer
        transaction.feePayer = provider.publicKey;

        // Sign the transaction with Phantom
        let signedTransaction = await provider.signTransaction(transaction);


        console.log(signedTransaction)

        // Serialize the transaction
        const serializedTransaction = signedTransaction.serialize();
        
        try {

            // Send the serialized transaction
            const transactionId = await connection.sendRawTransaction(serializedTransaction, {
                skipPreflight:true
            });
        
            console.log("Transaction ID:", transactionId);
            window.open(`https://explorer.solana.com/tx/${transactionId}?cluster=devnet`)

        } catch (error) {
            console.log(error)
        }

    }



    useEffect(() => {
        console.log("Loaded")
    },[])




    const handleChange = (e) => {
        const { name, value } = e.target;
        if(name=="beneficiary_percent")
        {
            if(value>100)
            {
                setFormData(prevState => ({
                    ...prevState,
                    [name]: 100
                }));
            }
            else
            {
                setFormData(prevState => ({
                    ...prevState,
                    [name]: value.trim()
                }));

            }
        }else
        {
            setFormData(prevState => ({
                ...prevState,
                [name]: value.trim()
            }));

        }

    }

    const handleNetwork = (e) => {
        const { name, value } = e.target;
        setNetwork(value)
    }

    useEffect(() => {
        if (formData.buy_price && formData.minimum_buy_qty && parseFloat(formData.minimum_buy_qty) > 0) {
            const pricePer = parseFloat(formData.buy_price) / parseFloat(formData.minimum_buy_qty);
            setPricePerUnitBuy(pricePer.toFixed(9));
        } else {
            setPricePerUnitBuy('');
        }

        if (formData.sell_price && formData.minimum_sell_qty && parseFloat(formData.minimum_sell_qty) > 0) {
            const pricePer = parseFloat(formData.sell_price) / parseFloat(formData.minimum_sell_qty);
            setPricePerUnitSell(pricePer.toFixed(9));
        } else {
            setPricePerUnitSell('');
        }
    }, [formData.buy_price, formData.minimum_buy_qty, formData.sell_price, formData.minimum_sell_qty]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const submitData = {
            category: formData.category,
            minimum_buy_qty: parseFloat(formData.minimum_buy_qty),
            buy_price: parseFloat(formData.buy_price),
            minimum_sell_qty: parseFloat(formData.minimum_sell_qty),
            sell_price: parseFloat(formData.sell_price),
            pubkey: formData.pubkey,
            beneficiary_percent: parseFloat(formData.beneficiary_percent),
        };
        console.log(submitData);
        // Further processing here, e.g., send to an API
    };

    const numberToScale = (number) => {
        const num = parseFloat(number);
        if (isNaN(num)) return '';
        if (num >= 1e9) return `${(num / 1e9).toFixed(0)} B`;
        if (num >= 1e6) return `${(num / 1e6).toFixed(0)} M`;
        if (num >= 1e3) return `${(num / 1e3).toFixed(0)} K`;
        return num.toString();
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
        <div style={{ flex: 1 }}>
        <div className={styles.formContainer}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <p>Category</p>
                <select name="category" value={formData.category} onChange={handleChange} className={styles.input}>
                    <option value="AMMO">AMMO</option>
                    <option value="FOOD">FOOD</option>
                    <option value="FUEL">FUEL</option>
                    <option value="TOOL">TOOL</option>
                </select><br />

                <p>Minimum Buy Quantity: {numberToScale(formData.minimum_buy_qty)}</p>
                <input type="number" name="minimum_buy_qty" min={0} value={formData.minimum_buy_qty} onChange={handleChange} className={styles.input} /><br />

                <p>Total Buy Price: {numberToScale(formData.buy_price)} ATLAS</p>
                <input type="number" step="1"  min={0} name="buy_price" value={formData.buy_price} onChange={handleChange} className={styles.input} /><br />
                <p>Buy Price Per Unit: {pricePerUnitBuy}</p>

                <p style={{marginTop: 50}}>Minimum Sell Quantity: {numberToScale(formData.minimum_sell_qty)}</p>
                <input type="number" name="minimum_sell_qty" min={0} value={formData.minimum_sell_qty} onChange={handleChange} className={styles.input} /><br />

                <p>Total Sell Price: {numberToScale(formData.sell_price)} ATLAS</p>
                <input type="number" step="1"  min={0} name="sell_price" value={formData.sell_price} onChange={handleChange} className={styles.input} /><br />
                <p>Sell Price Per Unit: {pricePerUnitSell} ATLAS</p>

                <p style={{marginTop: 50}}>Beneficiary Public Key</p>
                <input type="text" name="pubkey" value={formData.pubkey} onChange={handleChange} className={styles.input} /><br />
                
                <p>Beneficiary Percent</p>
                <input type="number" step="0.01" min={0} max={100} name="beneficiary_percent" value={formData.beneficiary_percent} onChange={handleChange} className={styles.input} /><br />
                
                <button onClick={submitAccount} type="submit" className={styles.button}>Submit</button>
            </form>
        </div>
        </div>
        <div style={{ flex: 1, backgroundColor: "#f5f5f5", padding: "20px", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column"}}>

          
          <div style={{marginTop:70,marginLeft:-5}}>
          <select name="category" value={network} onChange={handleNetwork} className={styles.input}>
                    <option value="DevNet">DevNet</option>
                    <option value="MainNet">MainNet</option>
          </select>
          </div>
          <div style={{fontWeight: "bold", fontSize: "18px", color: "#333" }}>
          Vault Pubkey: {formData.pubkey}  
          </div>

         <div>
         Resource Balance:

         </div>
         <div>
         ATLAS Balance:  

         </div>
            
          <p style={{marginTop:40}}>Minimum Buy Quantity: {numberToScale(formData.minimum_buy_qty)}</p>
          <p>Total Buy Price: {numberToScale(formData.buy_price)} ATLAS</p>
          <p style={{marginTop:40}}>Minimum Sell Quantity: {numberToScale(formData.minimum_buy_qty)}</p>
          <p>Total Sell Price: {numberToScale(formData.sell_price)} ATLAS</p>
          <p style={{marginTop:40}}>Beneficiary Pubkey: {numberToScale(formData.sell_price)}</p>
          <p>Resource Account: </p>
          <p>ATLAS Account: </p>
          <p style={{marginTop:40}}>Beneficiary Percent: {formData.beneficiary_percent}%</p>


          <button type="submit" className={styles.button}>Send Resource</button>
          <button type="submit" className={styles.button}>Send ATLAS</button>
          <button style={{marginTop:100}}type="submit" className={styles.buttonClose}>Close Account</button>

        </div>
      </div>
    );
}

export default DataForm;
