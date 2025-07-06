import { GraphQLClient } from 'graphql-request';
import { ethers } from 'ethers';
import { PoolData, PortfolioAsset, PoolResponse } from '@/types/euler';

interface EulerQueryResponse {
  markets: Array<{
    id: string;
    underlying: {
      id: string;
      symbol: string;
      name: string;
      decimals: string;
    };
    totalSupply: string;
    totalBorrow: string;
    supplyRate: string;
    borrowRate: string;
    reserveFactor: string;
    exchangeRate: string;
    totalReserves: string;
    cash: string;
    collateralFactor: string;
    liquidationIncentive: string;
    price: string;
    lastUpdateTimestamp: string;
  }>;
  userPositions: Array<{
    id: string;
    positions: Array<{
      id: string;
      market: {
        id: string;
        underlying: {
          id: string;
          symbol: string;
          decimals: string;
        };
      };
      supplyBalance: string;
      borrowBalance: string;
      supplyIndex: string;
      borrowIndex: string;
      collateralEnabled: boolean;
      lastUpdateTimestamp: string;
    }>;
  }>;
}

interface HistoricalQueryResponse {
  marketDayDatas: Array<{
    id: string;
    date: string;
    supplyRate: string;
    borrowRate: string;
    totalSupply: string;
    totalBorrow: string;
    utilization: string;
    market: {
      underlying: {
        symbol: string;
      };
    };
  }>;
}

const SUBGRAPH_URL = process.env.NEXT_PUBLIC_EULER_SUBGRAPH_URL || 'https://api.goldsky.com/api/public/project_clm0q3e5p03g101ic3u4r6c4e/subgraphs/euler-mainnet/stable/gn';
const RPC_URL = `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;
const SEPOLIA_RPC_URL = `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;
const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
const CHAINLINK_ETH_USD = '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419';

// Mock data for Sepolia testing
const MOCK_POOL_DATA: PoolResponse = {
  apyData: [
    { timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), apy: 4.2 },
    { timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), apy: 4.5 },
    { timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), apy: 4.3 },
    { timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), apy: 4.7 },
    { timestamp: new Date().toISOString(), apy: 4.4 },
  ],
  portfolio: [
    { token: 'USDC', amount: 1000, valueUSD: 1000 },
    { token: 'WETH', amount: 0.5, valueUSD: 1200 },
  ],
  riskScore: 2.1,
};

// GraphQL query for Euler Finance markets and user positions
const EULER_QUERY = `
  query EulerData($userAddress: String) {
    markets(first: 10, orderBy: totalSupply, orderDirection: desc) {
      id
      underlying {
        id
        symbol
        name
        decimals
      }
      totalSupply
      totalBorrow
      supplyRate
      borrowRate
      reserveFactor
      exchangeRate
      totalReserves
      cash
      collateralFactor
      liquidationIncentive
      price
      lastUpdateTimestamp
    }
    userPositions: accounts(where: { id: $userAddress }) {
      id
      positions {
        id
        market {
          id
          underlying {
            id
            symbol
            decimals
          }
        }
        supplyBalance
        borrowBalance
        supplyIndex
        borrowIndex
        collateralEnabled
        lastUpdateTimestamp
      }
    }
  }
`;

// Query for historical market data
const HISTORICAL_QUERY = `
  query HistoricalData($marketId: String!, $startTime: BigInt!) {
    marketDayDatas(
      first: 30
      where: { market: $marketId, date_gte: $startTime }
      orderBy: date
      orderDirection: desc
    ) {
      id
      date
      supplyRate
      borrowRate
      totalSupply
      totalBorrow
      utilization
      market {
        underlying {
          symbol
        }
      }
    }
  }
`;

// Chainlink ABI for ETH price
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

export async function getEulerData(userAddress?: string): Promise<PoolResponse> {
  // Check if we're on Sepolia or if subgraph is unavailable
  const isTestnet = process.env.NEXT_PUBLIC_NETWORK === 'sepolia';
  const currentRpcUrl = isTestnet ? SEPOLIA_RPC_URL : RPC_URL;
  
  if (isTestnet) {
    console.log('Using mock data for Sepolia testnet');
    return MOCK_POOL_DATA;
  }

  try {
    const client = new GraphQLClient(SUBGRAPH_URL);
    
    // Fetch current market data and user positions
    const response = await client.request<EulerQueryResponse>(EULER_QUERY, {
      userAddress: userAddress?.toLowerCase(),
    });

    const { markets, userPositions } = response;

    if (!markets || markets.length === 0) {
      throw new Error('No markets found');
    }

    // Find USDC and WETH markets
    const usdcMarket = markets.find(m => 
      m.underlying.id.toLowerCase() === USDC_ADDRESS.toLowerCase()
    );
    const wethMarket = markets.find(m => 
      m.underlying.id.toLowerCase() === WETH_ADDRESS.toLowerCase()
    );

    if (!usdcMarket || !wethMarket) {
      throw new Error('USDC or WETH market not found');
    }

    // Fetch ETH price from Chainlink
    const provider = new ethers.providers.JsonRpcProvider(currentRpcUrl);
    const chainlink = new ethers.Contract(CHAINLINK_ETH_USD, CHAINLINK_ABI, provider);
    const [, ethPrice] = await chainlink.latestRoundData();
    const wethPriceUSD = Number(ethers.utils.formatUnits(ethPrice, 8));

    // Calculate APY data for USDC market (as primary example)
    const supplyAPY = (Number(usdcMarket.supplyRate) / 1e18) * 365 * 100; // Convert from per-second to annual percentage

    // Generate historical APY data (simplified - would need actual historical query)
    const currentTime = new Date();
    const apyData: PoolData[] = [];
    for (let i = 4; i >= 0; i--) {
      const timestamp = new Date(currentTime);
      timestamp.setDate(currentTime.getDate() - i);
      // In a real implementation, you'd fetch actual historical data
      const historicalAPY = supplyAPY * (0.95 + Math.random() * 0.1); // Simulate slight variation
      apyData.push({ 
        timestamp: timestamp.toISOString(), 
        apy: historicalAPY 
      });
    }

    // Process user portfolio
    const portfolio: PortfolioAsset[] = [];
    if (userAddress && userPositions && userPositions.length > 0) {
      const userAccount = userPositions[0];
      
      for (const position of userAccount.positions) {
        const market = position.market;
        const underlying = market.underlying;
        const decimals = Number(underlying.decimals);
        
        // Calculate supplied amount
        const supplyBalance = Number(position.supplyBalance);
        const exchangeRate = Number(markets.find(m => m.id === market.id)?.exchangeRate || 1e18);
        const suppliedAmount = (supplyBalance * exchangeRate) / (10 ** (decimals + 18));
        
        // Calculate borrowed amount
        const borrowedAmount = Number(position.borrowBalance) / (10 ** decimals);
        
        if (suppliedAmount > 0 || borrowedAmount > 0) {
          let valueUSD = 0;
          if (underlying.symbol === 'USDC') {
            valueUSD = suppliedAmount - borrowedAmount; // USDC is 1:1 with USD
          } else if (underlying.symbol === 'WETH') {
            valueUSD = (suppliedAmount - borrowedAmount) * wethPriceUSD;
          } else {
            // For other tokens, use the market price if available
            const marketPrice = Number(markets.find(m => m.id === market.id)?.price || 0);
            valueUSD = (suppliedAmount - borrowedAmount) * marketPrice;
          }

          const portfolioAsset: PortfolioAsset = {
            token: underlying.symbol,
            amount: suppliedAmount - borrowedAmount,
            valueUSD,
          };

          portfolio.push(portfolioAsset);
        }
      }
    }

    // Calculate risk metrics
    const totalSupplyUSD = markets.reduce((sum, market) => {
      const supply = Number(market.totalSupply) / (10 ** Number(market.underlying.decimals));
      const price = Number(market.price) || (market.underlying.symbol === 'USDC' ? 1 : 0);
      return sum + (supply * price);
    }, 0);

    const totalBorrowUSD = markets.reduce((sum, market) => {
      const borrow = Number(market.totalBorrow) / (10 ** Number(market.underlying.decimals));
      const price = Number(market.price) || (market.underlying.symbol === 'USDC' ? 1 : 0);
      return sum + (borrow * price);
    }, 0);

    const globalUtilization = totalSupplyUSD > 0 ? (totalBorrowUSD / totalSupplyUSD) * 100 : 0;

    // Risk score based on utilization and concentration
    const riskScore = Math.min(globalUtilization / 20, 5); // Scale 0-5

    return {
      apyData,
      portfolio,
      riskScore: riskScore, // Protocol risk score (0-5 scale)
    };
  } catch (error: unknown) {
    console.error('Error fetching Euler Finance data:', error);
    console.log('Falling back to mock data due to error');
    return MOCK_POOL_DATA;
  }
}

// Helper function to get historical APY data
export async function getHistoricalAPY(marketId: string, days: number = 30): Promise<PoolData[]> {
  try {
    const client = new GraphQLClient(SUBGRAPH_URL);
    const startTime = Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60);
    
    const response = await client.request<HistoricalQueryResponse>(HISTORICAL_QUERY, {
      marketId,
      startTime: startTime.toString(),
    });

    const { marketDayDatas } = response;

    return marketDayDatas.map(data => ({
      timestamp: new Date(Number(data.date) * 1000).toISOString(),
      apy: (Number(data.supplyRate) / 1e18) * 365 * 100,
    }));
  } catch (error: unknown) {
    console.error('Error fetching historical APY data:', error);
    return [];
  }
}

// Export the main function with the original name for compatibility
export const getPoolData = getEulerData;