import { Wallet } from "zksync-ethers";
import { Deployer } from "@matterlabs/hardhat-zksync";
import hre from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error("DEPLOYER_PRIVATE_KEY is not set in the environment (.env)");
  }

  // Use the same constructor parameters as the real deploy script
  const wallet = new Wallet(privateKey);
  const deployer = new Deployer(hre, wallet);
  const artifact = await deployer.loadArtifact("Xirium");

  const name = "Xirium";
  const symbol = "XRM";
  const maxSupply = "1000000000000000000000000000"; // 1 billion * 10^18
  const initialOwner = wallet.address;

  console.log(`Estimating deploy fee for Xirium on network: ${hre.network.name}`);

  const feeInWei = await deployer.estimateDeployFee(artifact, [
    name,
    symbol,
    maxSupply,
    initialOwner,
  ]);

  console.log("Estimated deploy fee (wei):", feeInWei.toString());

  const feeInEth = hre.ethers.formatEther(feeInWei.toString());
  console.log("Estimated deploy fee (ETH):", feeInEth);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
