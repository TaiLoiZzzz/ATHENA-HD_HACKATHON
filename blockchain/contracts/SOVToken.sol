// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SOVToken
 * @dev Implementation of SOV-Token for ATHENA Platform
 * This contract manages the SOV-Token ecosystem including minting, burning, and marketplace transactions
 */

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SOVToken is ERC20, Ownable, Pausable, ReentrancyGuard {
    
    // Token earning rates (tokens per VND spent)
    uint256 public constant STANDARD_RATE = 1; // 1 SOV-Token per 10,000 VND
    uint256 public constant VND_DIVISOR = 10000;
    uint256 public constant PRIME_MULTIPLIER = 150; // 1.5x for ATHENA Prime users
    uint256 public constant MULTIPLIER_DIVISOR = 100;
    
    // Marketplace fee (1-2%)
    uint256 public marketplaceFeePercent = 150; // 1.5%
    uint256 public constant FEE_DIVISOR = 10000;
    
    // Maximum supply (optional - can be set to prevent inflation)
    uint256 public maxSupply = 1000000000 * 10**18; // 1 billion tokens
    
    // Events
    event TokensEarned(address indexed user, uint256 amount, string serviceType, uint256 vndSpent);
    event TokensRedeemed(address indexed user, uint256 amount, string redeemType);
    event MarketplaceTrade(address indexed buyer, address indexed seller, uint256 amount, uint256 price, uint256 fee);
    event MarketplaceFeeUpdated(uint256 oldFee, uint256 newFee);
    
    // User data structures
    mapping(address => bool) public athenaPrimeUsers;
    mapping(address => uint256) public totalEarned;
    mapping(address => uint256) public totalSpent;
    
    // Authorized services that can mint tokens
    mapping(address => bool) public authorizedServices;
    
    // Marketplace order structure
    struct MarketplaceOrder {
        address user;
        uint256 amount;
        uint256 pricePerToken; // Price in wei per token
        bool isActive;
        bool isBuyOrder; // true for buy, false for sell
        uint256 timestamp;
    }
    
    mapping(uint256 => MarketplaceOrder) public marketplaceOrders;
    uint256 public nextOrderId = 1;
    
    // Active orders tracking
    uint256[] public activeBuyOrders;
    uint256[] public activeSellOrders;
    
    constructor() ERC20("SOV-Token", "SOV") {
        // Mint initial supply to contract owner for initial distribution
        _mint(msg.sender, 1000000 * 10**18); // 1 million tokens for initial liquidity
    }
    
    /**
     * @dev Modifier to check if caller is an authorized service
     */
    modifier onlyAuthorizedService() {
        require(authorizedServices[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }
    
    /**
     * @dev Add authorized service that can mint tokens
     */
    function addAuthorizedService(address service) external onlyOwner {
        authorizedServices[service] = true;
    }
    
    /**
     * @dev Remove authorized service
     */
    function removeAuthorizedService(address service) external onlyOwner {
        authorizedServices[service] = false;
    }
    
    /**
     * @dev Set ATHENA Prime status for user
     */
    function setAthenaPrimeStatus(address user, bool isPrime) external onlyAuthorizedService {
        athenaPrimeUsers[user] = isPrime;
    }
    
    /**
     * @dev Calculate tokens to be earned based on VND spent
     */
    function calculateTokensEarned(address user, uint256 vndAmount) public view returns (uint256) {
        uint256 baseTokens = (vndAmount * STANDARD_RATE) / VND_DIVISOR;
        
        if (athenaPrimeUsers[user]) {
            return (baseTokens * PRIME_MULTIPLIER) / MULTIPLIER_DIVISOR;
        }
        
        return baseTokens;
    }
    
    /**
     * @dev Mint tokens when user makes a purchase
     */
    function earnTokens(address user, uint256 vndAmount, string calldata serviceType) 
        external 
        onlyAuthorizedService 
        whenNotPaused 
    {
        require(user != address(0), "Invalid user address");
        require(vndAmount > 0, "Amount must be positive");
        
        uint256 tokensToMint = calculateTokensEarned(user, vndAmount);
        require(totalSupply() + tokensToMint <= maxSupply, "Would exceed max supply");
        
        _mint(user, tokensToMint);
        totalEarned[user] += tokensToMint;
        
        emit TokensEarned(user, tokensToMint, serviceType, vndAmount);
    }
    
    /**
     * @dev Burn tokens when user redeems them
     */
    function redeemTokens(address user, uint256 amount, string calldata redeemType) 
        external 
        onlyAuthorizedService 
        whenNotPaused 
    {
        require(user != address(0), "Invalid user address");
        require(amount > 0, "Amount must be positive");
        require(balanceOf(user) >= amount, "Insufficient balance");
        
        _burn(user, amount);
        totalSpent[user] += amount;
        
        emit TokensRedeemed(user, amount, redeemType);
    }
    
    /**
     * @dev Create a marketplace buy order
     */
    function createBuyOrder(uint256 amount, uint256 pricePerToken) 
        external 
        payable 
        whenNotPaused 
        nonReentrant 
    {
        require(amount > 0, "Amount must be positive");
        require(pricePerToken > 0, "Price must be positive");
        
        uint256 totalCost = amount * pricePerToken;
        require(msg.value >= totalCost, "Insufficient payment");
        
        marketplaceOrders[nextOrderId] = MarketplaceOrder({
            user: msg.sender,
            amount: amount,
            pricePerToken: pricePerToken,
            isActive: true,
            isBuyOrder: true,
            timestamp: block.timestamp
        });
        
        activeBuyOrders.push(nextOrderId);
        nextOrderId++;
        
        // Refund excess payment
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }
    }
    
    /**
     * @dev Create a marketplace sell order
     */
    function createSellOrder(uint256 amount, uint256 pricePerToken) 
        external 
        whenNotPaused 
        nonReentrant 
    {
        require(amount > 0, "Amount must be positive");
        require(pricePerToken > 0, "Price must be positive");
        require(balanceOf(msg.sender) >= amount, "Insufficient token balance");
        
        // Lock tokens by transferring to contract
        _transfer(msg.sender, address(this), amount);
        
        marketplaceOrders[nextOrderId] = MarketplaceOrder({
            user: msg.sender,
            amount: amount,
            pricePerToken: pricePerToken,
            isActive: true,
            isBuyOrder: false,
            timestamp: block.timestamp
        });
        
        activeSellOrders.push(nextOrderId);
        nextOrderId++;
    }
    
    /**
     * @dev Execute a marketplace trade
     */
    function executeTrade(uint256 buyOrderId, uint256 sellOrderId, uint256 tradeAmount) 
        external 
        onlyAuthorizedService 
        whenNotPaused 
        nonReentrant 
    {
        MarketplaceOrder storage buyOrder = marketplaceOrders[buyOrderId];
        MarketplaceOrder storage sellOrder = marketplaceOrders[sellOrderId];
        
        require(buyOrder.isActive && sellOrder.isActive, "Orders must be active");
        require(buyOrder.isBuyOrder && !sellOrder.isBuyOrder, "Invalid order types");
        require(tradeAmount > 0, "Trade amount must be positive");
        require(tradeAmount <= buyOrder.amount && tradeAmount <= sellOrder.amount, "Insufficient order amounts");
        require(buyOrder.pricePerToken >= sellOrder.pricePerToken, "Price mismatch");
        
        uint256 tradeValue = tradeAmount * sellOrder.pricePerToken;
        uint256 marketplaceFee = (tradeValue * marketplaceFeePercent) / FEE_DIVISOR;
        uint256 sellerReceives = tradeValue - marketplaceFee;
        
        // Transfer tokens from contract (locked sell order) to buyer
        _transfer(address(this), buyOrder.user, tradeAmount);
        
        // Transfer payment to seller
        payable(sellOrder.user).transfer(sellerReceives);
        
        // Transfer marketplace fee to owner
        payable(owner()).transfer(marketplaceFee);
        
        // Update order amounts
        buyOrder.amount -= tradeAmount;
        sellOrder.amount -= tradeAmount;
        
        // Deactivate orders if fully filled
        if (buyOrder.amount == 0) {
            buyOrder.isActive = false;
            _removeFromActiveOrders(buyOrderId, true);
        }
        
        if (sellOrder.amount == 0) {
            sellOrder.isActive = false;
            _removeFromActiveOrders(sellOrderId, false);
        }
        
        emit MarketplaceTrade(buyOrder.user, sellOrder.user, tradeAmount, sellOrder.pricePerToken, marketplaceFee);
    }
    
    /**
     * @dev Cancel a marketplace order
     */
    function cancelOrder(uint256 orderId) external nonReentrant {
        MarketplaceOrder storage order = marketplaceOrders[orderId];
        require(order.user == msg.sender, "Not order owner");
        require(order.isActive, "Order not active");
        
        order.isActive = false;
        
        if (order.isBuyOrder) {
            // Refund ETH to buyer
            uint256 refundAmount = order.amount * order.pricePerToken;
            payable(msg.sender).transfer(refundAmount);
            _removeFromActiveOrders(orderId, true);
        } else {
            // Return locked tokens to seller
            _transfer(address(this), msg.sender, order.amount);
            _removeFromActiveOrders(orderId, false);
        }
    }
    
    /**
     * @dev Internal function to remove order from active arrays
     */
    function _removeFromActiveOrders(uint256 orderId, bool isBuyOrder) internal {
        uint256[] storage orders = isBuyOrder ? activeBuyOrders : activeSellOrders;
        
        for (uint256 i = 0; i < orders.length; i++) {
            if (orders[i] == orderId) {
                orders[i] = orders[orders.length - 1];
                orders.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Update marketplace fee (only owner)
     */
    function updateMarketplaceFee(uint256 newFeePercent) external onlyOwner {
        require(newFeePercent <= 500, "Fee too high (max 5%)"); // Maximum 5% fee
        
        uint256 oldFee = marketplaceFeePercent;
        marketplaceFeePercent = newFeePercent;
        
        emit MarketplaceFeeUpdated(oldFee, newFeePercent);
    }
    
    /**
     * @dev Get active buy orders
     */
    function getActiveBuyOrders() external view returns (uint256[] memory) {
        return activeBuyOrders;
    }
    
    /**
     * @dev Get active sell orders
     */
    function getActiveSellOrders() external view returns (uint256[] memory) {
        return activeSellOrders;
    }
    
    /**
     * @dev Get user's trading statistics
     */
    function getUserStats(address user) external view returns (uint256 earned, uint256 spent, bool isPrime) {
        return (totalEarned[user], totalSpent[user], athenaPrimeUsers[user]);
    }
    
    /**
     * @dev Emergency functions
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Override transfer functions to add pause functionality
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount) 
        internal 
        override 
        whenNotPaused 
    {
        super._beforeTokenTransfer(from, to, amount);
    }
    
    /**
     * @dev Withdraw contract balance (only owner, for emergency)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
