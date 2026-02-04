import { Wallet, Contract, Provider } from 'zksync-ethers';
import * as dotenv from 'dotenv';
import hre, { artifacts } from 'hardhat';

dotenv.config();

const TOKEN_ADDRESS = '0x11aBDC739024ba889220BCaE119325C2071C1229';

async function main() {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  const newMinter = process.env.AUTHORIZED_MINTER;

  if (!privateKey) {
    throw new Error('DEPLOYER_PRIVATE_KEY is not set in .env');
  }
  if (!newMinter) {
    throw new Error('AUTHORIZED_MINTER is not set in .env');
  }

  const rpcUrl = (hre.network.config as any).url as string | undefined;
  if (!rpcUrl) {
    throw new Error('No RPC url found in Hardhat network config');
  }

  const provider = new Provider(rpcUrl);
  const wallet = new Wallet(privateKey, provider);

  const artifact = await artifacts.readArtifact('Xirium');
  const token = new Contract(TOKEN_ADDRESS, artifact.abi, wallet);

  console.log(
    `Setting authorized minter to ${newMinter} on ${hre.network.name} for token ${TOKEN_ADDRESS}...`,
  );

  const tx = await token.setAuthorizedMinter(newMinter);
  console.log('Tx sent:', tx.hash);
  await tx.wait();

  console.log('Authorized minter updated.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
