import { GraphQLClient } from 'graphql-request';
import { ethers } from 'ethers';
import { PoolData, PortfolioAsset, PoolResponse } from '@/types/euler';

const SUBGRAPH_URL = process.env.NEXT_PUBLIC_EULER_SUBGRAPH_URL || 'https://api.goldsky.com/api/public/project_clm0q3e5p03g101ic3u4r6c4e/subgraphs/euler-mainnet/stable/gn';
const RPC_URL = `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;
const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
const CHAINLINK_ETH_USD = '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419';

// GraphQL query for pool data and user positions
const POOL_QUERY = `
  query PoolData($poolId: String!, $userAddress: String) {
    pool(id: $poolId) {
      id
      currency0 { id }
      currency1 { id }
      fee
      totalLiquidity
      totalFees
    }
    accountPositions(where: { account: $userAddress, liquidity_gt: 0 }) {
      id
      token { id }
      liquidity
      tickLower
      tickUpper
    }
  }
`;

// Chainlink ABI for WETH price
const CHAINLINK_ABI = [
  {
    constant: true,
    inputs: [],
    name: 'latestRoundData',
    outputs: [
      { name: 'roundId', type: 'uint80' },
      { name: 'answer', type: 'int256' },
      { name: 'startedAt', type: 'uint256' },
      { name: 'updatedAt', type: 'uint256' },
      { name: 'answeredInRound', type: 'uint80' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

export async function getPoolData(userAddress?: string): Promise<PoolResponse> {
  try {
    const client = new GraphQLClient(SUBGRAPH_URL);
    const poolId = `${USDC_ADDRESS.toLowerCase()}-${WETH_ADDRESS.toLowerCase()}-3000`; // USDC/WETH, 0.3% fee
    const { pool, accountPositions } = await client.request(POOL_QUERY, {
      poolId,
      userAddress: userAddress?.toLowerCase(),
    });

    // Verify USDC/WETH pool
    if (!pool || (pool.currency0.id !== USDC_ADDRESS.toLowerCase() && pool.currency1.id !== WETH_ADDRESS.toLowerCase()) ||
        (pool.currency0.id !== WETH_ADDRESS.toLowerCase() && pool.currency1.id !== USDC_ADDRESS.toLowerCase())) {
      throw new Error('Pool does not match USDC/WETH');
    }

    // Calculate APY from fees and TVL
    const fee = Number(pool.fee) / 10000; // e.g., 3000 = 0.3%
    const tvlUSD = Number(pool.totalLiquidity) / 1e6; // Approximate USDC value
    const apy = (pool.totalFees / tvlUSD) * 365 * 100; // Annualized fee yield
    const currentTime = new Date();
    const apyData: PoolData[] = [];
    for (let i = 4; i >= 0; i--) {
      const timestamp = new Date(currentTime);
      timestamp.setDate(currentTime.getDate() - i);
      apyData.push({ timestamp: timestamp.toISOString(), apy });
    }

    // Fetch WETH price from Chainlink
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const chainlink = new ethers.Contract(CHAINLINK_ETH_USD, CHAINLINK_ABI, provider);
    const [, ethPrice] = await chainlink.latestRoundData();
    const wethPriceUSD = Number(ethers.formatUnits(ethPrice, 8));

    // Process user positions
    const portfolio: PortfolioAsset[] = [];
    if (userAddress && accountPositions) {
      for (const pos of accountPositions) {
        const token = pos.token.id.toLowerCase();
        const amount = Number(pos.liquidity) / (token === USDC_ADDRESS.toLowerCase() ? 1e6 : 1e18);
        const valueUSD = token === USDC_ADDRESS.toLowerCase() ? amount : amount * wethPriceUSD;
        portfolio.push({
          token: token === USDC_ADDRESS.toLowerCase() ? 'USDC' : 'WETH',
          amount,
          valueUSD,
        });
      }
    }

    // Estimate IL risk from tick range (simplified)
    const ilRisk = accountPositions?.length
      ? accountPositions.reduce((risk, pos) => {
          const rangeWidth = Math.abs(pos.tickUpper - pos.tickLower);
          return risk + (rangeWidth < 1000 ? 1.5 : 0.5); // Narrow range = higher IL risk
        }, 0) / accountPositions.length
      : 1.25;

    return { apyData, portfolio, ilRisk };
  } catch (error) {
    console.error('Error fetching EulerSwap pool data:', error);
    throw new Error('Failed to fetch EulerSwap pool data');
  }
}
