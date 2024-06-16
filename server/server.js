const express = require('express');
const { Connection, PublicKey } = require('@solana/web3.js');
const { findOrCreateAssociatedTokenAccount, getTokenBalance, fetchAndDeserializeMarketAccountData } = require('./utils');

const app = express();
const port = 3000;

const auth = "PLRSGTRwq2rz8S62JFWbtFEixvetZ4v58KQWi21kLxg";
const mints = [
  "ammoK8AkX2wnebQb35cDAZtTkvsXQbi82cGeTnUvvfK",
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
      { name: 'Ammo', mint: mints[0], vaultAuth: auth, beneficiary_percent: 0, beneficiary_atlast_account: "", beneficiary_resource_account: "", minimum_buy_qty: '100000', minimum_sell_qty: '100000', sell_price: "20", buy_price: '20', rarity: 'Common', soldOut: false },
      { name: 'Food', mint: mints[3], vaultAuth: auth, beneficiary_percent: 0, beneficiary_atlast_account: "", beneficiary_resource_account: "", minimum_buy_qty: '100000', minimum_sell_qty: '100000', sell_price: "20", buy_price: '293', rarity: 'Common', soldOut: false },
      { name: 'Fuel', mint: mints[2], vaultAuth: auth, beneficiary_percent: 0, beneficiary_atlast_account: "", beneficiary_resource_account: "", minimum_buy_qty: '100000', minimum_sell_qty: '100000', sell_price: "20", buy_price: '10', rarity: 'Common', soldOut: false },
      { name: 'Toolkit', mint: mints[1], vaultAuth: auth, beneficiary_percent: 0, beneficiary_atlast_account: "", beneficiary_resource_account: "", minimum_buy_qty: '100000', minimum_sell_qty: '100000', sell_price: "20", buy_price: '5', rarity: 'Common', soldOut: false }
    ]
  },
  {
    name: 'Raw Material',
    assets: [
      { name: 'Arco', mint: mints[15], vaultAuth: auth, beneficiary_percent: 0, beneficiary_atlast_account: "", beneficiary_resource_account: "", minimum_buy_qty: '100000', minimum_sell_qty: '100000', sell_price: "20", buy_price: '293', rarity: 'Common', soldOut: false },
      { name: 'Biomass', mint: mints[14], vaultAuth: auth, beneficiary_percent: 0, beneficiary_atlast_account: "", beneficiary_resource_account: "", minimum_buy_qty: '100000', minimum_sell_qty: '100000', sell_price: "20", buy_price: '29', rarity: 'Common', soldOut: false },
      { name: 'Copper Ore', mint: mints[12], vaultAuth: auth, beneficiary_percent: 0, beneficiary_atlast_account: "", beneficiary_resource_account: "", minimum_buy_qty: '100000', minimum_sell_qty: '100000', sell_price: "20", buy_price: '15', rarity: 'Common', soldOut: false },
      { name: 'Carbon', mint: mints[11], vaultAuth: auth, beneficiary_percent: 0, beneficiary_atlast_account: "", beneficiary_resource_account: "", minimum_buy_qty: '100000', minimum_sell_qty: '100000', sell_price: "20", buy_price: '1', rarity: 'Common', soldOut: false },
      { name: 'Diamond', mint: mints[10], vaultAuth: auth, beneficiary_percent: 0, beneficiary_atlast_account: "", beneficiary_resource_account: "", minimum_buy_qty: '100000', minimum_sell_qty: '100000', sell_price: "20", buy_price: '1', rarity: 'Common', soldOut: false },
      { name: 'Hydrogen', mint: mints[4], vaultAuth: auth, beneficiary_percent: 0, beneficiary_atlast_account: "", beneficiary_resource_account: "", minimum_buy_qty: '100000', minimum_sell_qty: '100000', sell_price: "20", buy_price: '1', rarity: 'Common', soldOut: false },
      { name: 'Iron Ore', mint: mints[9], vaultAuth: auth, beneficiary_percent: 0, beneficiary_atlast_account: "", beneficiary_resource_account: "", minimum_buy_qty: '100000', minimum_sell_qty: '100000', sell_price: "20", buy_price: '1', rarity: 'Common', soldOut: false },
      { name: 'Lumanite', mint: mints[8], vaultAuth: auth, beneficiary_percent: 0, beneficiary_atlast_account: "", beneficiary_resource_account: "", minimum_buy_qty: '100000', minimum_sell_qty: '100000', sell_price: "20", buy_price: '1', rarity: 'Common', soldOut: false },
      { name: 'Nitrogen', mint: mints[7], vaultAuth: auth, beneficiary_percent: 0, beneficiary_atlast_account: "", beneficiary_resource_account: "", minimum_buy_qty: '100000', minimum_sell_qty: '100000', sell_price: "20", buy_price: '1', rarity: 'Common', soldOut: false },
      { name: 'Rochinol', mint: mints[6], vaultAuth: auth, beneficiary_percent: 0, beneficiary_atlast_account: "", beneficiary_resource_account: "", minimum_buy_qty: '100000', minimum_sell_qty: '100000', sell_price: "20", buy_price: '1', rarity: 'Common', soldOut: false },
      { name: 'Silica', mint: mints[5], vaultAuth: auth, beneficiary_percent: 0, beneficiary_atlast_account: "", beneficiary_resource_account: "", minimum_buy_qty: '100000', minimum_sell_qty: '100000', sell_price: "20", buy_price: '1', rarity: 'Common', soldOut: false },
      { name: 'Titanium Ore', mint: mints[16], vaultAuth: auth, beneficiary_percent: 0, beneficiary_atlast_account: "", beneficiary_resource_account: "", minimum_buy_qty: '100000', minimum_sell_qty: '100000', sell_price: "20", buy_price: '1', rarity: 'Common', soldOut: false }
    ]
  }
];

// Solana connection
const connection = new Connection('https://devnet.helius-rpc.com/?api-key=5f494e50-2433-4bec-8e68-0823bae9d973');

async function getMarketStatus(resourceAuth, resourceMint) {
  try {
    console.log("Getting Vault Info");

    // Generate PDA
    let marketSeeds = [resourceAuth.toBuffer(), resourceMint.toBuffer()];
    const [marketPDA, marketBump] = PublicKey.findProgramAddressSync(marketSeeds, programId);

    console.log("Market PDA:", marketPDA.toBase58());

    let pdaResourceInfo = await findOrCreateAssociatedTokenAccount(resourceMint, null, marketPDA);
    let pdaAtlasInfo = await findOrCreateAssociatedTokenAccount(atlasMint, null, marketPDA);

    console.log("Getting PDA Balance");

    let resourceBalanceinVault = await getTokenBalance(pdaResourceInfo.ata.toBase58());
    let atlasBalanceInVault = await getTokenBalance(pdaAtlasInfo.ata.toBase58());

    console.log({ resourceBalanceinVault, atlasBalanceInVault });

    let TradeData = await fetchAndDeserializeMarketAccountData(marketPDA.toBase58());
    console.log(TradeData.beneficiary_resource_account);
    console.log(TradeData.beneficiary_atlast_account);
    console.log(TradeData);

    console.log(resourceBalanceinVault < TradeData.minimum_buy_qty);
    console.log("Resource is sold out");

    updateCategoryAsset("Consumables", "Ammo", "beneficiary_atlast_account", String(TradeData.beneficiary_atlast_account));
    updateCategoryAsset("Consumables", "Ammo", "beneficiary_percent", String(TradeData.beneficiary_percent));
    updateCategoryAsset("Consumables", "Ammo", "beneficiary_resource_account", String(TradeData.beneficiary_resource_account));
    updateCategoryAsset("Consumables", "Ammo", "buy_price", String(TradeData.buy_price));
    updateCategoryAsset("Consumables", "Ammo", "minimum_buy_qty", String(TradeData.minimum_buy_qty));
    updateCategoryAsset("Consumables", "Ammo", "minimum_sell_qty", String(TradeData.minimum_sell_qty));
    updateCategoryAsset("Consumables", "Ammo", "sell_price", String(TradeData.sell_price));

    console.log("Categories Set");
    console.log(categories);
  } catch (error) {
    console.log(error);
  }
}

function updateCategoryAsset(categoryName, assetName, key, value) {
  for (let category of categories) {
    if (category.name === categoryName) {
      for (let asset of category.assets) {
        if (asset.name === assetName) {
          asset[key] = value;
        }
      }
    }
  }
}

let mintIndex = 0;
setInterval(async () => {
  try {
    await getMarketStatus(new PublicKey(auth), new PublicKey(mints[mintIndex]));
    mintIndex = (mintIndex + 1) % mints.length; // Cycle through the mints array
  } catch (error) {
    console.error('Error during scheduled market status update:', error);
  }
}, 10000); // 10000 ms = 10 seconds

app.get('/market-status', (req, res) => {
  res.json(categories);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
