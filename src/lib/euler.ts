import { ethers } from "ethers";
import { PoolData, PortfolioAsset, PoolResponse } from "@/types/euler";

// Alchemy Ethereum RPC (Sepolia testnet)
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;
const SWAP_CONTRACT_ADDRESS = "0x7123C8cBBD76c5C7fCC9f7150f23179bec0bA341";
const POOL_MANAGER_ADDRESS = "0x3520d5a913427E6F0D6A83E07ccD4A4da316e4d3";

// Sepolia testnet token addresses
const USDC_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"; // USDC on Sepolia
const WETH_ADDRESS = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14"; // WETH on Sepolia

// Chainlink ETH/USD price feed on Sepolia
const CHAINLINK_ETH_USD = "0x694AA1769357215DE4FAC081bf1f309aDC325306";

const CHAINLINK_ABI = [
  {
    constant: true,
    inputs: [],
    name: "latestRoundData",
    outputs: [
      { name: "roundId", type: "uint80" },
      { name: "answer", type: "int256" },
      { name: "startedAt", type: "uint256" },
      { name: "updatedAt", type: "uint256" },
      { name: "answeredInRound", type: "uint80" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const SWAP_ABI = [
  {
    type: "function",
    name: "getReserves",
    inputs: [],
    outputs: [
      { name: "", type: "uint112", internalType: "uint112" },
      { name: "", type: "uint112", internalType: "uint112" },
      { name: "", type: "uint32", internalType: "uint32" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAssets",
    inputs: [],
    outputs: [
      { name: "asset0", type: "address", internalType: "address" },
      { name: "asset1", type: "address", internalType: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "poolKey",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct PoolKey",
        components: [
          { name: "currency0", type: "address", internalType: "Currency" },
          { name: "currency1", type: "address", internalType: "Currency" },
          { name: "fee", type: "uint24", internalType: "uint24" },
          { name: "tickSpacing", type: "int24", internalType: "int24" },
          { name: "hooks", type: "address", internalType: "contract IHooks" },
        ],
      },
    ],
    stateMutability: "view",
  },
];

// Placeholder PoolManager ABI (update with actual ABI from Etherscan)
const POOL_MANAGER_ABI = [
  {
    constant: true,
    inputs: [{ name: "user", type: "address" }],
    name: "getLiquidityPositions",
    outputs: [
      {
        components: [
          { name: "token", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "tickLower", type: "int24" },
          { name: "tickUpper", type: "int24" },
        ],
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export async function getPoolData(userAddress?: string): Promise<PoolResponse> {
  try {
    // Validate RPC URL
    if (!RPC_URL) {
      throw new Error("RPC_URL environment variable is not set");
    }

    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const swapContract = new ethers.Contract(
      SWAP_CONTRACT_ADDRESS,
      SWAP_ABI,
      provider
    );
    const poolManager = new ethers.Contract(
      POOL_MANAGER_ADDRESS,
      POOL_MANAGER_ABI,
      provider
    );
    const chainlink = new ethers.Contract(
      CHAINLINK_ETH_USD,
      CHAINLINK_ABI,
      provider
    );

    // Verify USDC/WETH pool and get asset order
    const [asset0, asset1] = await swapContract.getAssets();
    const asset0Lower = asset0.toLowerCase();
    const asset1Lower = asset1.toLowerCase();
    const usdcLower = USDC_ADDRESS.toLowerCase();
    const wethLower = WETH_ADDRESS.toLowerCase();

    // Check if this is a USDC/WETH pool
    const isValidPool = 
      (asset0Lower === usdcLower && asset1Lower === wethLower) ||
      (asset0Lower === wethLower && asset1Lower === usdcLower);

    if (!isValidPool) {
      throw new Error("Contract does not match USDC/WETH pool");
    }

    // Determine which asset is which
    const isUsdcFirst = asset0Lower === usdcLower;
    
    // Fetch reserves and calculate meaningful APY
    const [reserve0, reserve1] = await swapContract.getReserves();
    
    // Get pool key for fee information
    const poolKey = await swapContract.poolKey();
    const feeRate = Number(poolKey.fee) / 1000000; // Convert from basis points to decimal
    
    // Calculate reserves in proper units
    const usdcReserve = isUsdcFirst 
      ? Number(ethers.utils.formatUnits(reserve0, 6))
      : Number(ethers.utils.formatUnits(reserve1, 6));
    const wethReserve = isUsdcFirst 
      ? Number(ethers.utils.formatUnits(reserve1, 18))
      : Number(ethers.utils.formatUnits(reserve0, 18));

    // Fetch WETH price from Chainlink
    const [, ethPrice] = await chainlink.latestRoundData();
    const wethPriceUSD = Number(ethers.utils.formatUnits(ethPrice, 8)); // Chainlink returns 8 decimals

    // Calculate total liquidity in USD
    const totalLiquidityUSD = usdcReserve + (wethReserve * wethPriceUSD);
    
    // Mock APY calculation based on fee rate and liquidity utilization
    // Note: On Sepolia, liquidity and volume are typically much lower than mainnet
    const dailyVolumeEstimate = totalLiquidityUSD * 0.05; // Lower turnover on testnet (5% vs 10%)
    const dailyFees = dailyVolumeEstimate * feeRate;
    const annualFees = dailyFees * 365;
    const apy = (annualFees / totalLiquidityUSD) * 100;

    // Generate historical APY data (mock data for demonstration)
    const currentTime = new Date();
    const apyData: PoolData[] = [];
    for (let i = 4; i >= 0; i--) {
      const timestamp = new Date(currentTime);
      timestamp.setDate(currentTime.getDate() - i);
      // Add some variance to mock historical data
      const variance = (Math.random() - 0.5) * 0.1; // ±5% variance
      apyData.push({ 
        timestamp: timestamp.toISOString(), 
        apy: Math.max(0, apy * (1 + variance)) 
      });
    }

    // Fetch user portfolio
    const portfolio: PortfolioAsset[] = [];
    if (userAddress && ethers.utils.isAddress(userAddress)) {
      try {
        const positions = await poolManager.getLiquidityPositions(userAddress);
        for (const pos of positions) {
          const tokenAddress = pos.token.toLowerCase();
          
          // Determine token type and format amount correctly
          let tokenName: string;
          let amount: number;
          let decimals: number;
          
          if (tokenAddress === usdcLower) {
            tokenName = "USDC";
            decimals = 6;
            amount = Number(ethers.utils.formatUnits(pos.amount, decimals));
          } else if (tokenAddress === wethLower) {
            tokenName = "WETH";
            decimals = 18;
            amount = Number(ethers.utils.formatUnits(pos.amount, decimals));
          } else {
            // Skip unknown tokens
            continue;
          }

          // Calculate USD value
          const valueUSD = tokenName === "USDC" ? amount : amount * wethPriceUSD;
          
          portfolio.push({
            token: tokenName,
            amount,
            valueUSD,
          });
        }
      } catch (error) {
        console.warn("Failed to fetch user positions:", error);
        // Continue without portfolio data rather than failing entirely
      }
    }

    // Calculate impermanent loss risk based on price volatility
    // Note: Testnet prices may be less stable than mainnet
    const priceRatio = wethPriceUSD / (usdcReserve / wethReserve);
    const ilRisk = Math.abs(Math.log(priceRatio)) * 100; // Simplified IL risk metric

    return { 
      apyData, 
      portfolio, 
      ilRisk: Math.min(ilRisk, 15) // Higher cap for testnet due to potential price instability
    };
  } catch (error) {
    console.error("Error fetching EulerSwap pool data:", error);
    throw new Error(`Failed to fetch EulerSwap pool data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}