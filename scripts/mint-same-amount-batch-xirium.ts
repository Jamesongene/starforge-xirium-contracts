import { Wallet, Contract, Provider } from 'zksync-ethers';
import * as dotenv from 'dotenv';
import hre, { artifacts } from 'hardhat';

dotenv.config();

const TOKEN_ADDRESS = '0x11aBDC739024ba889220BCaE119325C2071C1229';

function parseAmount(amountStr: string): bigint {
  const base = BigInt(amountStr);
  const decimals = 18n;
  return base * 10n ** decimals;
}

async function main() {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  const recipientsRaw = process.env.MINT_SAME_RECIPIENTS;
  const amountStr = process.env.MINT_SAME_AMOUNT;

  if (!privateKey) {
    throw new Error('DEPLOYER_PRIVATE_KEY is not set in .env');
  }
  if (!recipientsRaw) {
    throw new Error('MINT_SAME_RECIPIENTS is not set (comma-separated addresses)');
  }
  if (!amountStr) {
    throw new Error('MINT_SAME_AMOUNT is not set (amount in whole tokens)');
  }

  const recipients = recipientsRaw.split(',').map((s) => s.trim()).filter((s) => s.length > 0);

  if (recipients.length === 0) {
    throw new Error('No recipients provided');
  }

  const amount = parseAmount(amountStr);

  const rpcUrl = (hre.network.config as any).url as string | undefined;
  if (!rpcUrl) {
    throw new Error('No RPC url found in Hardhat network config');
  }

  const provider = new Provider(rpcUrl);
  const wallet = new Wallet(privateKey, provider);

  const artifact = await artifacts.readArtifact('Xirium');
  const token = new Contract(TOKEN_ADDRESS, artifact.abi, wallet);

  console.log(`Minting same-amount batch of ${amountStr} XRM to ${recipients.length} recipients on ${hre.network.name}...`);
  console.log('Recipients:', recipients);

  const tx = await token.mintSameAmountBatch(recipients, amount);
  console.log('Mint same-amount batch tx sent:', tx.hash);
  await tx.wait();

  console.log('Mint same-amount batch confirmed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
