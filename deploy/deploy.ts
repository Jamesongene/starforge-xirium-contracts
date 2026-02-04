import { Wallet } from "zksync-ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync";
import * as dotenv from "dotenv";

dotenv.config();

export default async function (hre: HardhatRuntimeEnvironment) {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error("DEPLOYER_PRIVATE_KEY is not set in the environment (.env)");
  }

  const wallet = new Wallet(privateKey);
  const deployer = new Deployer(hre, wallet);
  const artifact = await deployer.loadArtifact("Xirium");

  const name = "Xirium";
  const symbol = "XRM";
  const maxSupply = "1000000000000000000000000000";
  const initialOwner = wallet.address;

  const tokenContract = await deployer.deploy(artifact, [
    name,
    symbol,
    maxSupply,
    initialOwner,
  ]);

  console.log("Xirium was deployed to", await tokenContract.getAddress());
}
