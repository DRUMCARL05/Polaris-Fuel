import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';

const connection = new Connection('https://devnet.helius-rpc.com/?api-key=5f494e50-2433-4bec-8e68-0823bae9d973');

async function findOrCreateAssociatedTokenAccount(mintPublicKey, payer, owner) {
  const ata = await getAssociatedTokenAddress(mintPublicKey, owner, true, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
  
  let ataInfo = await connection.getAccountInfo(ata);
  if (ataInfo) {
    console.log("Associated Token Account already exists:", ata.toBase58());
    return { hasAta: true, ata, ataIx: null };
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

    return { hasAta: false, ata, ataIx };
  }
}

async function getTokenBalance(tokenAccountPubkeyBase58) {
  try {
    const publicKey = new PublicKey(tokenAccountPubkeyBase58);
    const tokenAccountInfo = await connection.getParsedAccountInfo(publicKey);

    if (tokenAccountInfo.value === null) {
      console.log('Token account not found');
      return;
    }

    const parsedInfo = tokenAccountInfo.value.data.parsed.info;
    const tokenAmount = parsedInfo.tokenAmount;

    console.log(`Token Balance: ${tokenAmount.amount}`);
    console.log(`Decimals: ${tokenAmount.decimals}`);

    return tokenAmount.amount;
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return 0;
  }
}

async function fetchAndDeserializeMarketAccountData(accountPublicKeyBase58) {
  try {
    const accountInfo = await connection.getAccountInfo(new PublicKey(accountPublicKeyBase58));

    if (!accountInfo || !accountInfo.data) {
      console.error('Failed to fetch data or data not found');
      return {
        vault_owner: '',
        vault_pubkey: ''
      };
    }

    const data = Buffer.from(accountInfo.data);

    let TradeData = {
      minimum_buy_qty: data.readBigUInt64LE(0),
      buy_price: data.readDoubleLE(8),
      minimum_sell_qty: data.readBigUInt64LE(16),
      sell_price: data.readDoubleLE(24),
      beneficiary_atlast_account: new PublicKey(data.slice(32, 64)).toBase58(),
      beneficiary_resource_account: new PublicKey(data.slice(64, 96)).toBase58(),
      beneficiary_percent: data.readFloatLE(96)
    };

    return TradeData;
  } catch (error) {
    console.error('Error fetching or deserializing account data:', error);
    return null;
  }
}

export {
  findOrCreateAssociatedTokenAccount,
  getTokenBalance,
  fetchAndDeserializeMarketAccountData
};
