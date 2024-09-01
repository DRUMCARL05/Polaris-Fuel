"use client";
import { useState, useEffect } from "react";
import "../styles/homepage.css";
import dynamic from "next/dynamic";
import {
  createBuyInstruction,
  createSellInstruction,
} from "@polaris-fuel/web3.js";
import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createTransferInstruction,
} from "@solana/spl-token";

const Nav = dynamic(() => import("@/components/nav.client"), { ssr: false });
const Scroller = dynamic(() => import("@/components/scroller.client"), {
  ssr: false,
});
const Bottom = dynamic(() => import("@/components/bottom.client"), {
  ssr: false,
});

const programId = new PublicKey("9zYogG23hiVQLgFUrcVCNEpJaR6415bBotk8wwWYQDWL");
let ammoMint = new PublicKey("AMMUxMuL93NDbTzCE6ntjF8U6fMdtiw6VbXS3FiLfaZd");
let atlasMint = new PublicKey("ATLADWy6dnnY3McjmRvuvRZHR4WjYYtGGKS3duedyBmy");

let ammoAuth = new PublicKey("PLRSGTRwq2rz8S62JFWbtFEixvetZ4v58KQWi21kLxg");
let feePubKey = new PublicKey("5SYuwdp6eL8rSjfRWJ45P6WRLeV9Vnegxf8p2jrJh4xb");

let rewardMint = new PublicKey("29MBBn147j7NdaYA215ysqxwrKec6B8Aqhnm8QoxsErf");

let connection = new Connection(
  "https://devnet.helius-rpc.com/?api-key=5f494e50-2433-4bec-8e68-0823bae9d973"
);

export default function Home() {
  const [activeTab, setActiveTab] = useState("Buy");
  const [buttonText, setButtonText] = useState("Connect Wallet");
  const [isLoading, setIsLoading] = useState(true);
  const [usrObject, setUsrObject] = useState({ pubkey: "", pxp: "" });
  const [categories, setCategories] = useState([]);

  const updateCategoryAsset = (categoryName, assetName, key, value) => {
    setCategories((prevCategories) =>
      prevCategories.map((category) => {
        if (category.name === categoryName) {
          return {
            ...category,
            assets: category.assets.map((asset) => {
              if (asset.name === assetName) {
                return { ...asset, [key]: value };
              }
              return asset;
            }),
          };
        }
        return category;
      })
    );
  };

  async function getMarketStatus(resourceAuth, resourceMint) {
    try {
      console.log("Getting Vault Info");

      // Generate PDA
      let marketSeeds = [resourceAuth.toBuffer(), resourceMint.toBuffer()];
      const [marketPDA, marketBump] = PublicKey.findProgramAddressSync(
        marketSeeds,
        programId
      );

      console.log("Market PDA:", marketPDA.toBase58());

      let pdaResourceInfo = await findOrCreateAssociatedTokenAccount(
        resourceMint,
        null,
        marketPDA
      );
      let pdaAtlasInfo = await findOrCreateAssociatedTokenAccount(
        atlasMint,
        null,
        marketPDA
      );

      console.log("Getting PDA Balance");

      let resourceBalanceinVault = await getTokenBalance(
        pdaResourceInfo.ata.toBase58()
      );
      let atlasBalanceInVault = await getTokenBalance(
        pdaAtlasInfo.ata.toBase58()
      );

      console.log({ resourceBalanceinVault, atlasBalanceInVault });

      let TradeData = await fetchAndDeserializeMarketAccountData(
        marketPDA.toBase58()
      );
      console.log(TradeData.beneficiary_resource_account);
      console.log(TradeData.beneficiary_atlast_account);
      console.log(TradeData);

      console.log(resourceBalanceinVault < TradeData.minimum_buy_qty);
      console.log("Resource is sold out");

      updateCategoryAsset(
        "Consumables",
        "Ammo",
        "beneficiary_atlast_account",
        String(TradeData.beneficiary_atlast_account)
      );
      updateCategoryAsset(
        "Consumables",
        "Ammo",
        "beneficiary_percent",
        String(TradeData.beneficiary_percent)
      );
      updateCategoryAsset(
        "Consumables",
        "Ammo",
        "beneficiary_resource_account",
        String(TradeData.beneficiary_resource_account)
      );
      updateCategoryAsset(
        "Consumables",
        "Ammo",
        "buy_price",
        String(TradeData.buy_price)
      );
      updateCategoryAsset(
        "Consumables",
        "Ammo",
        "minimum_buy_qty",
        String(TradeData.minimum_buy_qty)
      );
      updateCategoryAsset(
        "Consumables",
        "Ammo",
        "minimum_sell_qty",
        String(TradeData.minimum_sell_qty)
      );
      updateCategoryAsset(
        "Consumables",
        "Ammo",
        "sell_price",
        String(TradeData.sell_price)
      );

      console.log("Categories Set");
      console.log(categories);
    } catch (error) {
      console.log(error);
    }
  }

  const updateUsrObject = (newPubkey, newPxp) => {
    const updatedUsrObject = { pubkey: newPubkey, pxp: newPxp };
    setUsrObject(updatedUsrObject);
    localStorage.setItem("usrObject", JSON.stringify(updatedUsrObject));
  };

  const deleteUsrObject = () => {
    localStorage.removeItem("usrObject");
    setUsrObject({ pubkey: "", pxp: "" });
  };

  useEffect(() => {
    setIsLoading(true);
    const storedUsrObject = localStorage.getItem("usrObject");
    console.log("use effect on first load");
    if (storedUsrObject) {
      try {
        const parsedUsrObject = JSON.parse(storedUsrObject);
        setUsrObject(parsedUsrObject);
        setButtonText(
          parsedUsrObject.pubkey.slice(0, 3) +
            "..." +
            parsedUsrObject.pubkey.slice(-3)
        );
      } catch (error) {
        console.error("Error parsing usrObject:", error);
      }
    }

    const fetchMarketStatus = async () => {
      console.log("fetchMarketStatus ============>>>>>>>>>>>>>>");
      try {
        setIsLoading(true);
        const response = await fetch(
          "http://polaris.cheaprpc.com:3000/market-status"
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log("Market Status:", data);

        setCategories(data);
        setIsLoading(false);
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
      }
    };

    const onBoot = async () => {
      try {
        console.log("App Loaded");
        await fetchMarketStatus(); // Fetch market status on app load
      } catch (error) {
        console.error(error);
      }
    };

    onBoot();
  }, []); // Empty dependency array ensures this runs once on mount

  useEffect(() => {
    console.log("Categories updated:", categories);
  }, [categories]); // This will log whenever categories change

  const getProvider = () => {
    if ("phantom" in window && window.phantom != null) {
      const provider = window.phantom.solana;

      if (provider?.isPhantom) {
        return provider;
      }
    }

    window.open("https://phantom.app/", "_blank");
  };

  async function fetchAndDeserializeMarketAccountData(accountPublicKeyBase58) {
    try {
      // Fetch the account info
      const accountInfo = await connection.getAccountInfo(
        new PublicKey(accountPublicKeyBase58)
      );

      if (!accountInfo || !accountInfo.data) {
        console.error("Failed to fetch data or data not found");
        return {
          vault_owner: "",
          vault_pubkey: "",
        };
      }

      // Assuming the data is a Buffer and contains the data serialized in a specific format
      // This is a hypothetical example of deserialization, adjust according to your actual data format
      const data = Buffer.from(accountInfo.data);

      // Deserialize data into the TradeData format
      let TradeData = {
        minimum_buy_qty: data.readBigUInt64LE(0),
        buy_price: data.readDoubleLE(8),
        minimum_sell_qty: data.readBigUInt64LE(16),
        sell_price: data.readDoubleLE(24),
        beneficiary_atlast_account: new PublicKey(
          data.slice(32, 64)
        ).toBase58(), // This assumes a 32-byte public key
        beneficiary_resource_account: new PublicKey(
          data.slice(64, 64 + 32)
        ).toBase58(), // This assumes a 32-byte public key
        beneficiary_percent: data.readFloatLE(64 + 32),
      };

      return TradeData;
    } catch (error) {
      console.error("Error fetching or deserializing account data:", error);
      return null;
    }
  }

  async function findOrCreateAssociatedTokenAccount(
    mintPublicKey,
    payer,
    owner
  ) {
    // Create a new connection to the Solana blockchain

    // Attempt to get the associated token account
    const ata = await getAssociatedTokenAddress(
      mintPublicKey,
      owner,
      true,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    let ataInfo = await connection.getAccountInfo(ata);
    if (ataInfo) {
      console.log("Associated Token Account already exists:", ata.toBase58());
      return { hasAta: true, ata: ata, ataIx: null };
    } else {
      console.log("No Associated Token Account found, creating one...");

      let ataIx = createAssociatedTokenAccountInstruction(
        payer,
        ata,
        owner,
        mintPublicKey,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      return { hasAta: false, ata: ata, ataIx: ataIx };
    }
  }

  async function fetchAndDeserializeMarketConfigAccountData(
    accountPublicKeyBase58
  ) {
    try {
      // Fetch the account info
      const accountInfo = await connection.getAccountInfo(
        new PublicKey(accountPublicKeyBase58)
      );

      if (!accountInfo || !accountInfo.data) {
        console.error("Failed to fetch data or data not found");
        return null;
      }

      // Assuming the data is a Buffer and contains the data serialized in a specific format
      // This is a hypothetical example of deserialization, adjust according to your actual data format
      const data = Buffer.from(accountInfo.data);

      console.log(data.length);

      // Deserialize data into the TradeData format
      let TradeData = {
        fee_sol_account: new PublicKey(data.slice(0, 32)).toBase58(), // This assumes a 32-byte public key
        fee_star_atlas_account: new PublicKey(data.slice(32, 64)).toBase58(),
        lamport_fee: data.readBigUInt64LE(64),
        star_atlas_fee_percentage: data.readFloatLE(64 + 8),
      };

      return TradeData;
    } catch (error) {
      console.error("Error fetching or deserializing account data:", error);
      return null;
    }
  }

  async function getTokenBalance(tokenAccountPubkeyBase58) {
    try {
      const publicKey = new PublicKey(tokenAccountPubkeyBase58);
      const tokenAccountInfo = await connection.getParsedAccountInfo(publicKey);

      if (tokenAccountInfo.value === null) {
        console.log("Token account not found");
        return;
      }

      const parsedInfo = tokenAccountInfo.value.data.parsed.info;
      const tokenAmount = parsedInfo.tokenAmount;

      console.log(`Token Balance: ${tokenAmount.amount}`);
      console.log(`Decimals: ${tokenAmount.decimals}`);

      return tokenAmount.amount;
    } catch (error) {
      console.error("Error fetching token balance:", error);
      return 0;
    }
  }

  function handleMultiplier(name, multiplier) {
    console.log("Handling multiplier for asset:", name);
    console.log("Multiplier value:", multiplier);

    setCategories((prevCategories) => {
      return prevCategories.map((category) => {
        console.log("Checking category:", category.name);
        const updatedAssets = category.assets.map((a) => {
          console.log("Checking asset:", a.name);
          if (a.name === name) {
            console.log("Found matching asset:", a.name);
            console.log("Old multiplier:", a.multiplier);
            const newMultiplier = a.multiplier + multiplier;
            console.log("New multiplier:", newMultiplier);

            return {
              ...a,
              multiplier: newMultiplier,
            };
          }
          return a;
        });

        return {
          ...category,
          assets: updatedAssets,
        };
      });
    });
  }
  async function buttonClick(asset, activeTap) {
    console.log(asset);

    const provider = getProvider(); // see "Detecting the Provider"
    let pubkey58;
    try {
      const resp = await provider.connect();
      console.log(resp.publicKey.toString());
      pubkey58 = resp.publicKey.toString();
      // 26qv4GCcx98RihuK3c4T6ozB3J7L6VwCuFVc7Ta2A3Uo
    } catch (err) {
      alert("Phantom Wallet Needed to use blendhit");
      return;
      // { code: 4001, message: 'User rejected the request.' }
    }

    let payer = new PublicKey(pubkey58);

    //generate pda
    let marketSeeds = [asset.vaultAuth.toBuffer(), asset.mint.toBuffer()];

    // Generate the PDA
    const [marketPDA, marketBump] = PublicKey.findProgramAddressSync(
      marketSeeds,
      programId
    );

    console.log("Market PDA:", marketPDA.toBase58());

    let userAtlasInfo = await findOrCreateAssociatedTokenAccount(
      atlasMint,
      payer,
      payer
    );
    console.log(userAtlasInfo.ata.toBase58());
    let userResourceAccountInfo = await findOrCreateAssociatedTokenAccount(
      asset.mint,
      payer,
      payer
    );

    let pdaAtlasInfo = await findOrCreateAssociatedTokenAccount(
      atlasMint,
      payer,
      marketPDA
    );
    let pdaResourceInfo = await findOrCreateAssociatedTokenAccount(
      asset.mint,
      payer,
      marketPDA
    );

    let TradeData = await fetchAndDeserializeMarketAccountData(
      marketPDA.toBase58()
    );
    console.log(TradeData.beneficiary_resource_account);
    console.log(TradeData.beneficiary_atlast_account);

    console.log(TradeData);

    console.log("Minimum Buy Qty:", Number(TradeData.minimum_buy_qty));
    getTokenBalance(pdaResourceInfo.ata.toBase58());

    let configProgramId = new PublicKey(
      "FgWVFPpFQpAk1NkXn6X7q9rUtk8sfq3nEbxE9THt2nmD"
    );

    //generate pda
    let configSeed = [
      new PublicKey("AqaFVQKnz3eByYAYF6S5v4jdrUabiRe8cesunjE9AboS").toBuffer(),
    ];
    // Generate the PDA
    const [configPDA, configBump] = PublicKey.findProgramAddressSync(
      configSeed,
      configProgramId
    );
    console.log("configPDA:", configPDA.toString());

    let configData = await fetchAndDeserializeMarketConfigAccountData(
      configPDA.toBase58()
    );
    console.log("Deseralized configData");
    console.log(configData);

    let transaction = new Transaction();

    let polarisIx;
    if (activeTab == "Buy") {
      polarisIx = createBuyInstruction(
        programId,
        payer,
        marketPDA,
        userAtlasInfo.ata,
        pdaAtlasInfo.ata,
        asset.vaultAuth,
        asset.mint,
        userResourceAccountInfo.ata,
        pdaResourceInfo.ata,
        new PublicKey(TradeData.beneficiary_atlast_account),
        new PublicKey(configData.fee_star_atlas_account),
        new PublicKey(configData.fee_sol_account),
        asset.multiplier
      );
    }

    if (activeTab == "Sell") {
      let rewardMintAccount = await findOrCreateAssociatedTokenAccount(
        rewardMint,
        payer,
        payer
      );

      console.log(
        "User has rewardMintAccount account:",
        rewardMintAccount.hasAta
      );
      console.log(
        "User rewardMintAccount account:",
        rewardMintAccount.ata.toBase58()
      );

      if (rewardMintAccount.hasAta == false) {
        transaction.add(rewardMintAccount.ataIx);
      }

      // derive the pda address for the Metadata account
      const rewardMintAuthPDA = PublicKey.findProgramAddressSync(
        [rewardMint.toBuffer()],
        programId
      )[0];

      polarisIx = createSellInstruction(
        programId,
        payer,
        marketPDA,
        userAtlasInfo.ata,
        pdaAtlasInfo.ata,
        asset.vaultAuth,
        asset.mint,
        userResourceAccountInfo.ata,
        pdaResourceInfo.ata,
        new PublicKey(TradeData.beneficiary_resource_account),
        new PublicKey(configData.fee_star_atlas_account),
        new PublicKey(configData.fee_sol_account),
        configPDA,
        rewardMint,
        rewardMintAccount.ata,
        rewardMintAuthPDA,
        asset.multiplier
      );
    }

    transaction.add(polarisIx);

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = provider.publicKey;

    let signedTransaction = await provider.signTransaction(transaction);
    console.log(signedTransaction);
    const serializedTransaction = signedTransaction.serialize();
    //  try {
    //     const transactionId = await connection.sendRawTransaction(serializedTransaction, {
    //         skipPreflight:true
    //     });
    //     console.log("Transaction ID:", transactionId);
    //     window.open(`https://explorer.solana.com/tx/${transactionId}?cluster=devnet`)
    //     } catch (error) {
    //         console.log(error)
    //  }

    const transactionId = await connection.sendRawTransaction(
      serializedTransaction,
      {
        skipPreflight: true,
      }
    );

    console.log(transactionId);
  }

  const buttonPressed = (tab) => {
    setActiveTab(tab);
    // Any other logic you want to perform when a tab is pressed
  };
  return (
    <div>
      <div className="mobileLayout">
        <div className="glow"></div>
        <Nav
          deleteUsrObject={deleteUsrObject}
          updateUsrObject={updateUsrObject}
          setButtonText={setButtonText}
          getProvider={getProvider}
          buttonText={buttonText}
          activeLink={activeTab}
          onLinkClick={buttonPressed}
        >
          {/* <Scroller
            handleMultiplier={handleMultiplier}
            categories={categories}
            buttonClick={buttonClick}
            activeTab={activeTab}
          /> */}
          <h2>hello</h2>
        </Nav>
        <Bottom pxp={0} />
      </div>
      <div className="desktopVersion">
        <div className="glow"></div>
        <Nav
          deleteUsrObject={deleteUsrObject}
          updateUsrObject={updateUsrObject}
          setButtonText={setButtonText}
          getProvider={getProvider}
          buttonText={buttonText}
          activeLink={activeTab}
          onLinkClick={buttonPressed}
        >
          {!isLoading ? (
            <Scroller
              handleMultiplier={handleMultiplier}
              categories={categories}
              buttonClick={buttonClick}
              activeTab={activeTab}
            />
          ) : (
            <div className="loaderContainer">
              <div className="loader" />
            </div>
          )}
        </Nav>
        <Bottom pxp={0} />
      </div>
    </div>
  );
}
