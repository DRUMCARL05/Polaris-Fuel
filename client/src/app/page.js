"use client";
import { useState, useEffect } from "react";
import MyAlert from "./myalert"; // Import the custom alert component
import bg from "../../public/backgroundButtonManage.png";
import { PiWalletLight } from "react-icons/pi";

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

import {
  programId,
  connection,
  feePubKey,
  atlasMint,
  ammoMint,
  rewardMint,
} from "./global.js";
import Mobiel from "@/components/Mobile";

const Nav = dynamic(() => import("@/components/nav.client"), { ssr: false });
const ScrollerDesktop = dynamic(
  () => import("@/components/scrollerDesktop.client"),
  {
    ssr: false,
  }
);
const ScrollerMobile = dynamic(
  () => import("@/components/scrollerMobile.client"),
  {
    ssr: false,
  }
);
const Bottom = dynamic(() => import("@/components/bottom.client"), {
  ssr: false,
});

let ammoAuth = new PublicKey("PLRSGTRwq2rz8S62JFWbtFEixvetZ4v58KQWi21kLxg");

export default function Home() {
  const [activeTab, setActiveTab] = useState("Buy");
  const [buttonText, setButtonText] = useState("Connect Wallet");
  const [isLoading, setIsLoading] = useState(true);
  const [isDesktop, setIsDesktop] = useState(true);
  const [usrObject, setUsrObject] = useState({ pubkey: "", pxp: "" });
  const [categories, setCategories] = useState([]);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [pxp, setPxp] = useState(0);

  const [indexA, setIndexA] = useState(0); // Toggles between 0 and 1
  const [indexB, setIndexB] = useState(0); // Enumerates between 0 and 12

  let startX = 0;
  let startY = 0;

  const handleTouchStart = (event) => {
    // Get the initial touch coordinates
    const touch = event.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
  };

  const [buttonBottom, setButtonBottom] = useState(40); // default value

  useEffect(() => {
    const bottomNav = document.getElementById("bottomNav");
    if (bottomNav) {
      const bottomNavHeight = bottomNav.offsetHeight;
      setButtonBottom(bottomNavHeight + 10); // Adjust this value to position the button above the bottom nav
    }
  }, []);

  const handleTouchMove = (event) => {
    if (!startX || !startY) {
      return;
    }

    const touch = event.touches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;

    // Vertical swipe: Toggle indexA between 0 and 1 on both up and down swipes
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      setIndexA((prevIndexA) => {
        if (prevIndexA === 1) {
          // Ensure indexB is <= 3 before switching to indexA = 0
          if (indexB > 3) {
            setIndexB(3); // Limit indexB to 3
          }
          return 0; // Switch to indexA = 0
        } else {
          return 1; // Switch to indexA = 1
        }
      });
    }

    // Horizontal swipe: Adjust indexB within the appropriate range
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      setIndexB((prevIndexB) => {
        // Define maxB based on indexA
        const maxB = indexA === 0 ? 3 : 11;

        let newIndexB = prevIndexB + (deltaX > 0 ? 1 : -1); // Swipe right: +1, Swipe left: -1

        // Ensure indexB loops around within its respective range
        if (newIndexB < 0) newIndexB = maxB; // Loop back to maxB if below 0
        if (newIndexB > maxB) newIndexB = 0; // Loop back to 0 if above maxB

        return newIndexB;
      });
    }

    // Reset touch start positions
    startX = 0;
    startY = 0;
  };

  useEffect(() => {
    // Add event listeners for touch events
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);

    // Cleanup listeners on component unmount
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [indexA, indexB]); // Ensure indexA and indexB are in the dependency array

  const [isBuyLoading, setIsBuyLoading] = useState("");
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

  function convertToBase10(number, decimals) {
    const factor = Math.pow(10, decimals);
    return number / factor;
  }

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
      ).amount;
      let atlasBalanceInVault = await getTokenBalance(
        pdaAtlasInfo.ata.toBase58()
      ).amount;

      console.log({ resourceBalanceinVault, atlasBalanceInVault });

      let TradeData = await fetchAndDeserializeMarketAccountData(
        marketPDA.toBase58()
      );
      console.log(TradeData.beneficiary_resource_account);
      console.log(TradeData.beneficiary_atlast_account);
      console.log(TradeData);

      console.log(resourceBalanceinVault.amount < TradeData.minimum_buy_qty);
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
    console.log("Checking Mobile");
    // Function to check the width of the window
    const checkIfDesktop = () => {
      if (window.innerWidth > 768) {
        // Assuming 768px is the threshold for desktop
        setIsDesktop(true);
      } else {
        setIsDesktop(false);
      }
    };

    // Call the function initially
    checkIfDesktop();

    // Add event listener to update the value when window is resized
    window.addEventListener("resize", checkIfDesktop);

    // Cleanup function to remove the event listener on component unmount
    return () => {
      window.removeEventListener("resize", checkIfDesktop);
    };
  }, []); // Empty dependency array ensures it runs only on mount/unmount

  useEffect(() => {
    const storedUsrObject = localStorage.getItem("usrObject");
    console.log("use effect on first load");

    const initialize = async () => {
      console.log("Init Called");
      if (storedUsrObject) {
        try {
          const parsedUsrObject = JSON.parse(storedUsrObject);
          let pxpRewardAta = await findOrCreateAssociatedTokenAccount(
            rewardMint,
            null,
            new PublicKey(parsedUsrObject.pubkey)
          );

          let userPxpBalance = await getTokenBalance(
            pxpRewardAta.ata.toBase58()
          );

          console.log("UserPxpBalance");
          console.log(userPxpBalance);

          setPxp(
            convertToBase10(userPxpBalance.amount, userPxpBalance.decimals)
          );

          setUsrObject(parsedUsrObject);
          setButtonText(
            parsedUsrObject.pubkey.slice(0, 3) +
              "..." +
              parsedUsrObject.pubkey.slice(-3)
          );
        } catch (error) {
          console.error("Error processing usrObject:", error);
        }
      }

      const fetchMarketStatus = async () => {
        try {
          const response = await fetch(
            "https://polaris.cheaprpc.com:3000/market-status"
          );
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data = await response.json();
          console.log("Market Status:", data);

          // Set the fetched data to the categories state
          setCategories(data);

          // Set loading to false after 2 seconds
          const timer = setTimeout(() => {
            setIsLoading(false);
          }, 2000);

          // Cleanup the timeout if the component is unmounted before the timer finishes
          return () => clearTimeout(timer);
        } catch (error) {
          console.error("There was a problem with the fetch operation:", error);
        }
      };

      try {
        console.log("App Loaded");
        await fetchMarketStatus(); // Fetch market status on app load
      } catch (error) {
        console.error(error);
      }
    };

    initialize();
  }, []); // Empty dependency array ensures this runs once on mount

  // useEffect(() => {
  //   console.log("Categories updated:", categories);
  // }, [categories]); // This will log whenever categories change

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

      return tokenAmount;
    } catch (error) {
      console.error("Error fetching token balance:", error);
      return 0;
    }
  }

  function handleMultiplier(asset, multiplier) {
    console.log(activeTab);
    console.log(asset);
    console.log(multiplier);

    //check if buying less than minimum
    if (asset.multiplier + multiplier <= 0) {
      if (activeTab == "Buy") {
        setAlertMessage("Can't buy less than a million units.");
      }
      if (activeTab == "Sell") {
        setAlertMessage("Can't sell less than a million units.");
      }
      setIsAlertOpen(true); // Trigger the alert with the message
      //alert("Can't buy less than a million units")
      return 0;
    }

    if (activeTab == "Buy") {
      console.log(asset);
      console.log(asset.resourceBalanceinVault);
      const minimumBuyQty = parseInt(asset.minimum_buy_qty, 10); // e.g., 1 million units
      const adjustedAmount = minimumBuyQty * multiplier; // Positive or negative depending on multiplier
      const availableBalance = parseInt(asset.resourceBalanceinVault, 10);
      // Calculate the new balance based on the multiplier
      let newBalance = availableBalance - adjustedAmount;
      // If the user is trying to subtract from the vault (increase purchase)
      if (newBalance < 0) {
        setAlertMessage(
          "Trying to buy more assets than are available in the vault."
        );
        setIsAlertOpen(true); // Trigger the alert with the message
        //alert("Trying to buy more assets than are available in the vault.");
        return 0;
      }
      console.log("Handling multiplier for asset:", asset.name);
      console.log("Multiplier value:", multiplier);
      console.log("Adjusted amount:", adjustedAmount);
      console.log("New balance:", newBalance);
      //set multiplier
      setCategories((prevCategories) => {
        return prevCategories.map((category) => {
          console.log("Checking category:", category.name);
          const updatedAssets = category.assets.map((a) => {
            console.log("Checking asset:", a.name);
            if (a.name === asset.name) {
              console.log("Found matching asset:", a.name);
              console.log("Old multiplier:", a.multiplier);
              // Adjust multiplier, ensure it doesn’t go below 0
              const newMultiplier = Math.max(a.multiplier + multiplier, 0);
              console.log("New multiplier:", newMultiplier);
              return {
                ...a,
                resourceBalanceinVault: newBalance.toString(),
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

    if (activeTab == "Sell") {
      console.log(asset);
      console.log(asset.atlasBalanceInVault);
      const minimum_sell_qty = parseInt(asset.minimum_sell_qty, 10); // e.g., 1 million units

      console.log(minimum_sell_qty);
      console.log(asset.multiplier + multiplier);
      console.log(asset.sell_price);

      const adjustedAmount = asset.sell_price * multiplier; // Positive or negative depending on multiplier
      const availableBalance = parseInt(asset.atlasBalanceInVault, 10);
      // Calculate the new balance based on the multiplier
      console.log(adjustedAmount);
      console.log(availableBalance);

      let newBalance = availableBalance - adjustedAmount;
      // If the user is trying to subtract from the vault (increase purchase)
      if (newBalance < 0) {
        setAlertMessage(
          "Trying to buy more assets than are available in the vault."
        );
        setIsAlertOpen(true); // Trigger the alert with the message
        //alert("Trying to buy more assets than are available in the vault.");
        return 0;
      }
      console.log("Handling multiplier for asset:", asset.name);
      console.log("Multiplier value:", multiplier);
      console.log("Adjusted amount:", adjustedAmount);
      console.log("New balance:", newBalance);
      //set multiplier
      setCategories((prevCategories) => {
        return prevCategories.map((category) => {
          console.log("Checking category:", category.name);
          const updatedAssets = category.assets.map((a) => {
            console.log("Checking asset:", a.name);
            if (a.name === asset.name) {
              console.log("Found matching asset:", a.name);
              console.log("Old multiplier:", a.multiplier);
              // Adjust multiplier, ensure it doesn’t go below 0
              const newMultiplier = Math.max(a.multiplier + multiplier, 0);
              console.log("New multiplier:", newMultiplier);
              return {
                ...a,
                atlasBalanceInVault: newBalance.toString(),
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
  }

  async function buttonClick(asset) {
    console.log(asset);
    setIsBuyLoading(asset.name);

    const provider = getProvider(); // see "Detecting the Provider"
    let pubkey58;
    try {
      const resp = await provider.connect();
      console.log(resp.publicKey.toString(), "public api");
      pubkey58 = resp.publicKey.toString();
      // 26qv4GCcx98RihuK3c4T6ozB3J7L6VwCuFVc7Ta2A3Uo
    } catch (err) {
      alert("Phantom Wallet Needed to use blendhit");
      setIsBuyLoading(null);
      return;
      // { code: 4001, message: 'User rejected the request.' }
    }

    let payer = new PublicKey(pubkey58);

    console.log(asset);

    //generate pda
    let marketSeeds = [
      new PublicKey(asset.vaultAuth).toBuffer(),
      new PublicKey(asset.mint).toBuffer(),
    ];

    // Generate the PDA
    const [marketPDA, marketBump] = PublicKey?.findProgramAddressSync(
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
      new PublicKey(asset.mint),
      payer,
      payer
    );

    let pdaAtlasInfo = await findOrCreateAssociatedTokenAccount(
      atlasMint,
      payer,
      marketPDA
    );
    let pdaResourceInfo = await findOrCreateAssociatedTokenAccount(
      new PublicKey(asset.mint),
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
        new PublicKey(asset.vaultAuth),
        new PublicKey(asset.mint),
        userResourceAccountInfo.ata,
        pdaResourceInfo.ata,
        new PublicKey(TradeData.beneficiary_atlast_account),
        new PublicKey(configData.fee_star_atlas_account),
        new PublicKey(configData.fee_sol_account),
        asset.multiplier
      );
    }

    if (activeTab == "Sell") {
      console.log(
        "User is selling resources with multiplier:",
        asset.name,
        asset.multiplier
      );

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

      console.log("Reward Mint");
      console.log(rewardMint.toBase58());

      console.log("marketPDA");
      console.log(marketPDA.toBase58());

      polarisIx = createSellInstruction(
        programId,
        payer,
        marketPDA,
        userAtlasInfo.ata,
        pdaAtlasInfo.ata,
        new PublicKey(asset.vaultAuth),
        new PublicKey(asset.mint),
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

    try {
      let signedTransaction = await provider.signTransaction(transaction);
      console.log(signedTransaction);
      const serializedTransaction = signedTransaction.serialize();

      const transactionId = await connection.sendRawTransaction(
        serializedTransaction,
        {
          skipPreflight: true,
        }
      );

      setAlertMessage("Transaction Submitted");
      setIsAlertOpen(true); // Trigger the alert with the message
      setIsBuyLoading(null);
      console.log(transactionId);
    } catch (error) {
      setAlertMessage("Transaction Cancelled");
      setIsAlertOpen(true); // Trigger the alert with the message
      setIsBuyLoading(null);
    }
  }

  const numberToScale = (number) => {
    const num = parseFloat(number);
    if (isNaN(num)) return "";
    if (num >= 1e9) return `${(num / 1e9).toFixed(0)} B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(0)} M`;
    if (num >= 1e3 && num < 1e5) return num.toFixed(0); // Allow 4 digits for 1k-9999 range
    if (num >= 1e3) return `${(num / 1e3).toFixed(0)} K`; // Rounds after 10k
    return num.toString();
  };

  const buttonPressed = (tab) => {
    setActiveTab(tab);
    // Any other logic you want to perform when a tab is pressed
  };

  async function connectWallet() {
    if (buttonText !== "Connect Wallet") {
      setButtonText("Connect Wallet");
      deleteUsrObject();
    } else {
      const provider = getProvider(); // see "Detecting the Provider"
      let pubkey58;
      try {
        const resp = await provider.connect();
        console.log(resp.publicKey.toString());
        pubkey58 = resp.publicKey.toString();
        updateUsrObject(pubkey58, 0);
        const formattedPubkey =
          pubkey58.length <= 6
            ? pubkey58
            : `${pubkey58.slice(0, 3)}...${pubkey58.slice(-3)}`;

        // Now you can use formattedPubkey as needed
        console.log(formattedPubkey);
        console.log(pubkey58);

        // console.log(firstThree+"..."+lastThree)
        setButtonText(formattedPubkey);
      } catch (err) {
        alert("Phantom Wallet Needed to use blendhit");
        alert(err);
        return;
        // { code: 4001, message: 'User rejected the request.' }
      }
    }
  }

  function handleLinkClick(link) {
    setActiveTab(link);
    buttonPressed(link);
  }

  return (
    <div style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
      {isLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundImage:
              'url("https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExYmhybWU4bDhrODJtb3ZydWIxZ3ZpNXg3azc3YTJjNnIyajMzc2xqNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Ilu6c4Ohog14k4WHHy/giphy-downsized-large.gif")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backgroundBlendMode: "overlay",
            zIndex: 9999,
            pointerEvents: "none",
            display: "flex", // Flexbox container
            justifyContent: "center", // Center horizontally
            alignItems: "center", // Center vertically
            textAlign: "center", // Center text inside the flex container
          }}
        >
          <div>
            <h1 style={{ margin: 0 }}>Polaris Fuel</h1>
            <h4 style={{ margin: "10px 0" }}>loading...</h4>
          </div>
        </div>
      )}

      {isDesktop ? (
        <div className="desktopVersion">
          <MyAlert
            isOpen={isAlertOpen}
            onClose={() => setIsAlertOpen(false)}
            message={alertMessage} // Pass the message prop
          />
          <div className="glow"></div>
          <Nav
            deleteUsrObject={deleteUsrObject}
            updateUsrObject={updateUsrObject}
            setButtonText={setButtonText}
            getProvider={getProvider}
            buttonText={buttonText}
            activeLink={activeTab}
            onLinkClick={buttonPressed}
            connectWallet={connectWallet}
          >
            <ScrollerDesktop
              handleMultiplier={handleMultiplier}
              categories={categories}
              buttonClick={buttonClick}
              activeTab={activeTab}
              isBuyLoading={isBuyLoading}
            />
          </Nav>
          <Bottom pxp={pxp} />
        </div>
      ) : (
        <div>
          <Mobiel
            categories={categories}
            activeTab={activeTab}
            numberToScale={numberToScale}
            isBuyLoading={isBuyLoading}
            indexA={indexA}
            indexB={indexB}
            handleMultiplier={handleMultiplier}
            buttonClick={buttonClick}
            connectWallet={connectWallet}
            buttonText={buttonText}
            handleLinkClick={handleLinkClick}
          />
          <button
            onClick={connectWallet}
            className="connectWallet"
            style={{
              backgroundImage: `url(${bg.src})`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              width: "120%",
              height: 30,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: "none",
              cursor: "pointer",
              userSelect: "none",
              position: "fixed",
              bottom: buttonBottom - 12, // Dynamic bottom position
              marginLeft: -30,
            }}
          >
            <PiWalletLight className="walletIcon" />
            {buttonText}
          </button>
          <Bottom pxp={pxp} />
        </div>
      )}
    </div>
  );
}
