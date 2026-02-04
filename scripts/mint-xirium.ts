import { Wallet, Contract, Provider } from "zksync-ethers";
import * as dotenv from "dotenv";
import hre, { artifacts } from "hardhat";

dotenv.config();

const TOKEN_ADDRESS = "0x11aBDC739024ba889220BCaE119325C2071C1229";

function parseAmount(amountStr: string): bigint {
  // amountStr is in whole tokens, e.g. "100" => 100 * 10^18
  const base = BigInt(amountStr);
  const decimals = 18n;
  return base * 10n ** decimals;
}

async function main() {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  const to = process.env.MINT_TO;
  const amountStr = process.env.MINT_AMOUNT;

  if (!privateKey) {
    throw new Error("DEPLOYER_PRIVATE_KEY is not set in .env");
  }
  if (!to) {
    throw new Error("MINT_TO is not set (target address)");
  }
  if (!amountStr) {
    throw new Error("MINT_AMOUNT is not set (amount in whole tokens)");
  }

  const amount = parseAmount(amountStr);

  const rpcUrl = (hre.network.config as any).url as string | undefined;
  if (!rpcUrl) {
    throw new Error("No RPC url found in Hardhat network config");
  }

  const provider = new Provider(rpcUrl);
  const wallet = new Wallet(privateKey, provider);

  const artifact = await artifacts.readArtifact("Xirium");
  const token = new Contract(TOKEN_ADDRESS, artifact.abi, wallet);

  console.log(`Minting ${amountStr} XRM to ${to} on ${hre.network.name}...`);

  const tx = await token.mint(to, amount);
  console.log("Mint tx sent:", tx.hash);
  await tx.wait();

  console.log("Mint confirmed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
