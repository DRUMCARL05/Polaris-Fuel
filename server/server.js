import express from 'express';
import cors from 'cors';
import { Connection, PublicKey } from '@solana/web3.js';
import { findOrCreateAssociatedTokenAccount, getTokenBalance, fetchAndDeserializeMarketAccountData } from './utils.js';

const programId = new PublicKey('9zYogG23hiVQLgFUrcVCNEpJaR6415bBotk8wwWYQDWL');
let atlasMint = new PublicKey("ATLADWy6dnnY3McjmRvuvRZHR4WjYYtGGKS3duedyBmy");

const app = express();
const port = 3000;

app.use(cors());

function convertToBase10(number, decimals) {
  const factor = Math.pow(10, decimals);
  return number / factor;
}

const auth = "PLRSGTRwq2rz8S62JFWbtFEixvetZ4v58KQWi21kLxg";

const mints = [
  "AMMUxMuL93NDbTzCE6ntjF8U6fMdtiw6VbXS3FiLfaZd", //devnet
  "tooLsNYLiVqzg8o4m3L2Uetbn62mvMWRqkog6PQeYKL",
  "fueL3hBZjLLLJHiFH9cqZoozTG3XQZ53diwFPwbzNim",
  "foodQJAztMzX1DKpLaiounNe2BDMds5RNuPC6jsNrDG",
  "HYDR4EPHJcDPcaLYUcNCtrXUdt1PnaN4MvE655pevBYp",
  "tiorehR1rLfeATZ96YoByUkvNFsBfUUSQWgSH2mizXL",
  "SiLiCA4xKGkyymB5XteUVmUeLqE4JGQTyWBpKFESLgh",
  "RCH1Zhg4zcSSQK8rw2s6rDMVsgBEWa4kiv1oLFndrN5",
  "Nitro6idW5JCb2ysUPGUAvVqv3HmUR7NVH7NdybGJ4L",
  "LUMACqD5LaKjs1AeuJYToybasTXoYQ7YkxJEc4jowNj",
  "FeorejFjRRAfusN9Fg3WjEZ1dRCf74o6xwT5vDt3R34J",
  "DMNDKqygEN3WXKVrAD4ofkYBc4CKNRhFUbXP4VK7a944",
  "CUore1tNkiubxSwDEtLc3Ybs1xfWLs8uGjyydUYZ25xc",
  "CARBWKWvxEuMcq3MqCxYfi7UoFVpL9c4rsQS99tw6i4X",
  "MASS9GqtJz6ABisAxcUn3FeR4phMqH1XfG6LPKJePog",
  "ARCoQ9dndpg6wE2rRexzfwgJR3NoWWhpcww3xQcQLukg"
];

let categories = [
  {
    name: 'Consumables',
    assets: [
      { name: 'Ammo', soldOut: null, mint: mints[0], vaultAuth: auth, beneficiary_percent: null, beneficiary_atlast_account: null, beneficiary_resource_account: null, minimum_buy_qty: null, minimum_sell_qty: null, sell_price: null, buy_price: null, rarity: 'Common', resourceBalanceinVault: null, atlasBalanceInVault: null },
      { name: 'Food', soldOut: true, mint: mints[3], vaultAuth: auth, beneficiary_percent: null, beneficiary_atlast_account: null, beneficiary_resource_account: null, minimum_buy_qty: null, minimum_sell_qty: null, sell_price: null, buy_price: null, rarity: 'Common', resourceBalanceinVault: null, atlasBalanceInVault: null },
      { name: 'Fuel', soldOut: true, mint: mints[2], vaultAuth: auth, beneficiary_percent: null, beneficiary_atlast_account: null, beneficiary_resource_account: null, minimum_buy_qty: null, minimum_sell_qty: null, sell_price: null, buy_price: null, rarity: 'Common', resourceBalanceinVault: null, atlasBalanceInVault: null },
      { name: 'Toolkit', soldOut: true, mint: mints[1], vaultAuth: auth, beneficiary_percent: null, beneficiary_atlast_account: null, beneficiary_resource_account: null, minimum_buy_qty: null, minimum_sell_qty: null, sell_price: null, buy_price: null, rarity: 'Common', resourceBalanceinVault: null, atlasBalanceInVault: null }
    ]
  },
  {
    name: 'Raw Material',
    assets: [
      { name: 'Arco', soldOut: true, mint: mints[15], vaultAuth: auth, beneficiary_percent: null, beneficiary_atlast_account: null, beneficiary_resource_account: null, minimum_buy_qty: null, minimum_sell_qty: null, sell_price: null, buy_price: null, rarity: 'Common', resourceBalanceinVault: null, atlasBalanceInVault: null },
      { name: 'Biomass', soldOut: true, mint: mints[14], vaultAuth: auth, beneficiary_percent: null, beneficiary_atlast_account: null, beneficiary_resource_account: null, minimum_buy_qty: null, minimum_sell_qty: null, sell_price: null, buy_price: null, rarity: 'Common', resourceBalanceinVault: null, atlasBalanceInVault: null },
      { name: 'Copper Ore', soldOut: true, mint: mints[12], vaultAuth: auth, beneficiary_percent: null, beneficiary_atlast_account: null, beneficiary_resource_account: null, minimum_buy_qty: null, minimum_sell_qty: null, sell_price: null, buy_price: null, rarity: 'Common', resourceBalanceinVault: null, atlasBalanceInVault: null },
      { name: 'Carbon', soldOut: true, mint: mints[11], vaultAuth: auth, beneficiary_percent: null, beneficiary_atlast_account: null, beneficiary_resource_account: null, minimum_buy_qty: null, minimum_sell_qty: null, sell_price: null, buy_price: null, rarity: 'Common', resourceBalanceinVault: null, atlasBalanceInVault: null },
      { name: 'Diamond', soldOut: true, mint: mints[10], vaultAuth: auth, beneficiary_percent: null, beneficiary_atlast_account: null, beneficiary_resource_account: null, minimum_buy_qty: null, minimum_sell_qty: null, sell_price: null, buy_price: null, rarity: 'Common', resourceBalanceinVault: null, atlasBalanceInVault: null },
      { name: 'Hydrogen', soldOut: true, mint: mints[4], vaultAuth: auth, beneficiary_percent: null, beneficiary_atlast_account: null, beneficiary_resource_account: null, minimum_buy_qty: null, minimum_sell_qty: null, sell_price: null, buy_price: null, rarity: 'Common', resourceBalanceinVault: null, atlasBalanceInVault: null },
      { name: 'Iron Ore', soldOut: true, mint: mints[9], vaultAuth: auth, beneficiary_percent: null, beneficiary_atlast_account: null, beneficiary_resource_account: null, minimum_buy_qty: null, minimum_sell_qty: null, sell_price: null, buy_price: null, rarity: 'Common', resourceBalanceinVault: null, atlasBalanceInVault: null },
      { name: 'Lumanite', soldOut: true, mint: mints[8], vaultAuth: auth, beneficiary_percent: null, beneficiary_atlast_account: null, beneficiary_resource_account: null, minimum_buy_qty: null, minimum_sell_qty: null, sell_price: null, buy_price: null, rarity: 'Common', resourceBalanceinVault: null, atlasBalanceInVault: null },
      { name: 'Nitrogen', soldOut: true, mint: mints[7], vaultAuth: auth, beneficiary_percent: null, beneficiary_atlast_account: null, beneficiary_resource_account: null, minimum_buy_qty: null, minimum_sell_qty: null, sell_price: null, buy_price: null, rarity: 'Common', resourceBalanceinVault: null, atlasBalanceInVault: null },
      { name: 'Rochinol', soldOut: true, mint: mints[6], vaultAuth: auth, beneficiary_percent: null, beneficiary_atlast_account: null, beneficiary_resource_account: null, minimum_buy_qty: null, minimum_sell_qty: null, sell_price: null, buy_price: null, rarity: 'Common', resourceBalanceinVault: null, atlasBalanceInVault: null },
      { name: 'Silica', soldOut: true, mint: mints[5], vaultAuth: auth, beneficiary_percent: null, beneficiary_atlast_account: null, beneficiary_resource_account: null, minimum_buy_qty: null, minimum_sell_qty: null, sell_price: null, buy_price: null, rarity: 'Common', resourceBalanceinVault: null, atlasBalanceInVault: null },
      { name: 'Titanium Ore', soldOut: true, mint: mints[16], vaultAuth: auth, beneficiary_percent: null, beneficiary_atlast_account: null, beneficiary_resource_account: null, minimum_buy_qty: null, minimum_sell_qty: null, sell_price: null, buy_price: null, rarity: 'Common', resourceBalanceinVault: null, atlasBalanceInVault: null }
    ]
  }
];

function removeKeys(arr, keys) {
  arr.forEach(obj => {
    keys.forEach(key => {
      delete obj[key];
    });
  });
}

async function getMarketStatus(resourceAuth, resourceMint, categoryName, assetName) {
  console.log("Getting mint:", resourceMint.toBase58());
  try {
    let marketSeeds = [resourceAuth.toBuffer(), resourceMint.toBuffer()];
    const [marketPDA, marketBump] = PublicKey.findProgramAddressSync(marketSeeds, programId);

    console.log("Market PDA:", marketPDA.toBase58());

    let pdaResourceInfo = await findOrCreateAssociatedTokenAccount(resourceMint, null, marketPDA);
    let pdaAtlasInfo = await findOrCreateAssociatedTokenAccount(atlasMint, null, marketPDA);

    let resourceBalanceinVault = await getTokenBalance(pdaResourceInfo.ata.toBase58());
    let atlasBalanceInVault = await getTokenBalance(pdaAtlasInfo.ata.toBase58());

    if (resourceBalanceinVault && atlasBalanceInVault) {
      let TradeData = await fetchAndDeserializeMarketAccountData(marketPDA.toBase58());

      TradeData.resourceBalanceinVault = convertToBase10(resourceBalanceinVault, 0);
      TradeData.atlasBalanceInVault = convertToBase10(atlasBalanceInVault, 8);

      updateAssetInfo(categoryName, assetName, TradeData);
    }

    const data = categories.flatMap(category => category.assets);
    const keysToRemove = ["beneficiary_resource_account", "beneficiary_atlast_account", "vaultAuth", "beneficiary_percent", "mint", "rarity"];
    removeKeys(data, keysToRemove);

    console.table(data);
  } catch (error) {
    console.log(error);
  }
}

function updateAssetInfo(categoryName, assetName, newInfo) {
  for (let category of categories) {
    if (category.name === categoryName) {
      for (let asset of category.assets) {
        if (asset.name === assetName) {
          asset.minimum_buy_qty = newInfo.minimum_buy_qty.toString();
          asset.buy_price = newInfo.buy_price.toString();
          asset.minimum_sell_qty = newInfo.minimum_sell_qty.toString();
          asset.sell_price = newInfo.sell_price.toString();
          asset.beneficiary_atlast_account = newInfo.beneficiary_atlast_account;
          asset.beneficiary_resource_account = newInfo.beneficiary_resource_account;
          asset.beneficiary_percent = newInfo.beneficiary_percent;
          asset.resourceBalanceinVault = newInfo.resourceBalanceinVault.toString();
          asset.atlasBalanceInVault = newInfo.atlasBalanceInVault.toString();
          asset.soldOut = newInfo.resourceBalanceinVault < newInfo.minimum_buy_qty;
        }
      }
    }
  }
}

function getCategoryAndAssetNames() {
  const categoryAssetPairs = [];
  for (let category of categories) {
    for (let asset of category.assets) {
      categoryAssetPairs.push({ categoryName: category.name, assetName: asset.name });
    }
  }
  return categoryAssetPairs;
}

let categoryAssetPairs = getCategoryAndAssetNames();
let pairIndex = 0;

setInterval(async () => {
  try {
    const { categoryName, assetName } = categoryAssetPairs[pairIndex];
    await getMarketStatus(new PublicKey(auth), new PublicKey(mints[pairIndex]), categoryName, assetName);
    pairIndex = (pairIndex + 1) % categoryAssetPairs.length;
  } catch (error) {
    console.error('Error during scheduled market status update:', error);
  }
}, 10000);

app.get('/market-status', (req, res) => {
  res.json(categories);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

await getMarketStatus(new PublicKey(auth), new PublicKey(mints[pairIndex]), categoryAssetPairs[pairIndex].categoryName, categoryAssetPairs[pairIndex].assetName);
pairIndex = (pairIndex + 1) % categoryAssetPairs.length;
