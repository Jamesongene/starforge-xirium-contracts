# Xirium (XRM) – StarForge Core Token

**Xirium** is the core ERC‑20 token of the StarForge universe, a Discord‑native sci‑fi strategy RPG. It powers crafting, repairs, battles, and progression, and can be staked in a refinery system to earn non‑withdrawable in‑game Refined Xirium.

---

## Deployed Contract

- **Network:** Abstract mainnet (chainId 2741)
- **Address:** `0x11aBDC739024ba889220BCaE119325C2071C1229`
- **Explorer:** https://explorer.abs.xyz/address/0x11aBDC739024ba889220BCaE119325C2071C1229

- **Name:** `Xirium`
- **Symbol:** `XRM`
- **Decimals:** `18`
- **Max Supply:** `1_000_000_000 * 10^18` (1 billion XRM)

---

## Roles & Permissions

- **Owner** (`owner()`)  
  - Can mint (`mint`, `mintBatch`, `mintSameAmountBatch`)
  - Can pause/unpause transfers and mints
  - Can set/revoke the `authorizedMinter`
  - Can recover ERC20 tokens accidentally sent to the contract
  - Can transfer ownership via 2‑step process (`transferOwnership` → `acceptOwnership`)

- **Authorized Minter** (`authorizedMinter`)  
  - Can mint rewards (`mintReward`, `mintRewardBatch`, `mintRewardSameAmountBatch`)
  - Intended for gameplay/earnings contracts (e.g., Play‑to‑Mine)

- **All users**  
  - Transfer, approve, burn (when not paused)

---

## Development & Deployment

This repo uses Hardhat with the `@matterlabs/hardhat-zksync` plugin to target Abstract (zkSync).

### Install

```bash
npm install
```

### Compile

```bash
npx hardhat compile
```

### Deploy

```bash
# Set DEPLOYER_PRIVATE_KEY in .env (do NOT commit .env)
npx hardhat deploy-zksync --script deploy.ts --network abstractMainnet
```

The deployment script lives at `deploy/deploy.ts`. It deploys `Xirium.sol` with:
- name: `"Xirium"`
- symbol: `"XRM"`
- maxSupply: `"1000000000000000000000000000"` (1 billion * 10^18)
- initialOwner: the address of `DEPLOYER_PRIVATE_KEY`

---

## Admin & Interaction Scripts

All scripts are in `scripts/` and target the deployed mainnet address. They read configuration from environment variables (`.env`).

### Owner scripts

- `mint-xirium.ts` – mint a single amount to one address  
  Env: `DEPLOYER_PRIVATE_KEY`, `MINT_TO`, `MINT_AMOUNT`

- `mint-batch-xirium.ts` – variable per‑address batch mint (`mintBatch`)  
  Env: `DEPLOYER_PRIVATE_KEY`, `MINT_BATCH_RECIPIENTS`, `MINT_BATCH_AMOUNTS`

- `mint-same-amount-batch-xirium.ts` – same amount to many addresses (`mintSameAmountBatch`)  
  Env: `DEPLOYER_PRIVATE_KEY`, `MINT_SAME_RECIPIENTS`, `MINT_SAME_AMOUNT`

- `set-authorized-minter.ts` – set the gameplay minter  
  Env: `DEPLOYER_PRIVATE_KEY`, `AUTHORIZED_MINTER`

- `revoke-authorized-minter.ts` – revoke the gameplay minter  
  Env: `DEPLOYER_PRIVATE_KEY`

- `pause-xirium.ts` – pause transfers and mints  
  Env: `DEPLOYER_PRIVATE_KEY`

- `unpause-xirium.ts` – unpause transfers and mints  
  Env: `DEPLOYER_PRIVATE_KEY`

- `transfer-ownership.ts` – start 2‑step ownership transfer  
  Env: `DEPLOYER_PRIVATE_KEY`, `NEW_OWNER_ADDRESS`

- `accept-ownership.ts` – accept ownership (run from the new owner)  
  Env: `PENDING_OWNER_PRIVATE_KEY`

### Utility

- `estimate-deploy-fee.ts` – estimate deployment cost on the current network  
  Env: `DEPLOYER_PRIVATE_KEY`

### Example usage

```bash
# Mint 1000 XRM to a wallet
export DEPLOYER_PRIVATE_KEY=...
export MINT_TO=0xABC...
export MINT_AMOUNT=1000
npx hardhat run scripts/mint-xirium.ts --network abstractMainnet

# Set authorized minter
export AUTHORIZED_MINTER=0xDEF...
npx hardhat run scripts/set-authorized-minter.ts --network abstractMainnet
```

---

## Project Structure

```
contracts/
  Xirium.sol           # ERC‑20 token with capped supply, owner/authorized minter, pause, burn

deploy/
  deploy.ts            # Deployment script

scripts/
  mint-xirium.ts
  mint-batch-xirium.ts
  mint-same-amount-batch-xirium.ts
  set-authorized-minter.ts
  revoke-authorized-minter.ts
  pause-xirium.ts
  unpause-xirium.ts
  transfer-ownership.ts
  accept-ownership.ts
  estimate-deploy-fee.ts

hardhat.config.ts
tsconfig.json
package.json
package-lock.json
README.md
Xirium_Mainnet_Deploy_Checklist.md
```

---

## Documentation

- `Xirium_Mainnet_Deploy_Checklist.md` – internal deployment and ops checklist (kept for transparency)

---

## License

MIT
