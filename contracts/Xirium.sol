// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Admin Mintable Capped ERC20 Template
/// @notice Generic ERC-20 with burn, hard max supply cap, owner mint, and a single authorized external minter
contract Xirium is ERC20, ERC20Burnable, Ownable {
    /// @notice Maximum possible supply (immutable)
    uint256 public immutable MAX_SUPPLY;

    /// @notice Address authorized to mint rewards (e.g., gameplay/earning contract)
    address public authorizedMinter;

    /// @notice Emitted when the authorized minter is updated
    event AuthorizedMinterUpdated(address indexed newMinter);
    uint256 public maxBatchSize;
    event MaxBatchSizeUpdated(uint256 newMaxBatchSize);

    bool public paused;
    address private _pendingOwner;
    event Paused(address account);
    event Unpaused(address account);
    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);

    modifier whenNotPaused() {
        require(!paused, "paused");
        _;
    }

    modifier whenPaused() {
        require(paused, "not paused");
        _;
    }

    /// @notice Deploy a new admin-mintable capped ERC-20
    /// @param name_ Token name
    /// @param symbol_ Token symbol
    /// @param maxSupply_ Maximum supply in wei (e.g., 1_000_000e18)
    /// @param initialOwner Address that will own and control the contract
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 maxSupply_,
        address initialOwner
    ) ERC20(name_, symbol_) Ownable(initialOwner) {
        require(initialOwner != address(0), "owner=0");
        require(maxSupply_ > 0, "maxSupply=0");
        MAX_SUPPLY = maxSupply_;
        maxBatchSize = 200;
    }

    /// @notice Set or update the authorized external minter contract
    /// @dev Only callable by the owner
    /// @param _authorizedMinter Address of the minter contract allowed to call `mintReward`
    function setAuthorizedMinter(address _authorizedMinter) external onlyOwner {
        authorizedMinter = _authorizedMinter;
        emit AuthorizedMinterUpdated(_authorizedMinter);
    }

    function setMaxBatchSize(uint256 newSize) external onlyOwner {
        require(newSize > 0, "batch size=0");
        maxBatchSize = newSize;
        emit MaxBatchSizeUpdated(newSize);
    }

    function pause() external onlyOwner whenNotPaused {
        paused = true;
        emit Paused(msg.sender);
    }

    function unpause() external onlyOwner whenPaused {
        paused = false;
        emit Unpaused(msg.sender);
    }

    function pendingOwner() public view returns (address) {
        return _pendingOwner;
    }

    function transferOwnership(address newOwner) public override onlyOwner {
        require(newOwner != address(0), "new owner is zero");
        _pendingOwner = newOwner;
        emit OwnershipTransferStarted(owner(), newOwner);
    }

    function acceptOwnership() public {
        require(msg.sender == _pendingOwner, "not pending owner");
        _transferOwnership(_pendingOwner);
        _pendingOwner = address(0);
    }

    function revokeAuthorizedMinter() external onlyOwner {
        authorizedMinter = address(0);
        emit AuthorizedMinterUpdated(address(0));
    }

    function recoverERC20(address token, uint256 amount, address to) external onlyOwner {
        require(to != address(0), "zero to");
        require(token != address(this), "cannot recover own token");
        bool success = IERC20(token).transfer(to, amount);
        require(success, "recover failed");
    }

    /// @notice Mint new tokens as rewards (e.g., from gameplay/mining)
    /// @dev Callable only by the `authorizedMinter` contract. Enforces the max supply cap.
    /// @param to Recipient of the minted tokens
    /// @param amount Amount to mint
    function mintReward(address to, uint256 amount) external whenNotPaused {
        require(msg.sender == authorizedMinter, "Not authorized minter");
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        _mint(to, amount);
    }

    /// @notice Owner can mint tokens directly (e.g., for distributions/treasury)
    /// @dev Enforces the max supply cap
    /// @param to Recipient of the minted tokens
    /// @param amount Amount to mint
    function mint(address to, uint256 amount) external onlyOwner whenNotPaused {
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        _mint(to, amount);
    }

    /// @notice Owner can batch mint tokens to many recipients (variable amounts)
    /// @param recipients List of recipient addresses
    /// @param amounts List of token amounts corresponding to recipients
    function mintBatch(address[] calldata recipients, uint256[] calldata amounts) external onlyOwner whenNotPaused {
        require(recipients.length == amounts.length, "Length mismatch");
        require(recipients.length <= maxBatchSize, "Batch too large");
        uint256 total;
        for (uint256 i = 0; i < amounts.length; i++) {
            total += amounts[i];
        }
        require(totalSupply() + total <= MAX_SUPPLY, "Max supply exceeded");
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Zero recipient");
            _mint(recipients[i], amounts[i]);
        }
    }

    /// @notice Owner can batch mint the same amount to many recipients
    /// @param recipients List of recipient addresses
    /// @param amount Token amount to mint to each recipient
    function mintSameAmountBatch(address[] calldata recipients, uint256 amount) external onlyOwner whenNotPaused {
        require(recipients.length > 0, "Empty recipients");
        require(recipients.length <= maxBatchSize, "Batch too large");
        uint256 total = amount * recipients.length;
        require(totalSupply() + total <= MAX_SUPPLY, "Max supply exceeded");
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Zero recipient");
            _mint(recipients[i], amount);
        }
    }

    /// @notice Authorized minter can batch mint rewards (variable amounts)
    /// @param recipients List of recipient addresses
    /// @param amounts List of token amounts corresponding to recipients
    function mintRewardBatch(address[] calldata recipients, uint256[] calldata amounts) external whenNotPaused {
        require(msg.sender == authorizedMinter, "Not authorized minter");
        require(recipients.length == amounts.length, "Length mismatch");
        require(recipients.length <= maxBatchSize, "Batch too large");
        uint256 total;
        for (uint256 i = 0; i < amounts.length; i++) {
            total += amounts[i];
        }
        require(totalSupply() + total <= MAX_SUPPLY, "Max supply exceeded");
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Zero recipient");
            _mint(recipients[i], amounts[i]);
        }
    }

    /// @notice Authorized minter can batch mint the same amount to many recipients
    /// @param recipients List of recipient addresses
    /// @param amount Token amount to mint to each recipient
    function mintRewardSameAmountBatch(address[] calldata recipients, uint256 amount) external whenNotPaused {
        require(msg.sender == authorizedMinter, "Not authorized minter");
        require(recipients.length > 0, "Empty recipients");
        require(recipients.length <= maxBatchSize, "Batch too large");
        uint256 total = amount * recipients.length;
        require(totalSupply() + total <= MAX_SUPPLY, "Max supply exceeded");
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Zero recipient");
            _mint(recipients[i], amount);
        }
    }

    function transfer(address to, uint256 amount) public override whenNotPaused returns (bool) {
        return super.transfer(to, amount);
    }

    function transferFrom(address from, address to, uint256 amount) public override whenNotPaused returns (bool) {
        return super.transferFrom(from, to, amount);
    }

    function burn(uint256 amount) public override whenNotPaused {
        super.burn(amount);
    }

    function burnFrom(address account, uint256 amount) public override whenNotPaused {
        super.burnFrom(account, amount);
    }

}
