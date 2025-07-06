import { ethers } from 'ethers';
import { GraphQLClient } from 'graphql-request';

// EulerSwap specific interfaces
interface LPPosition extends Record<string, unknown> {
  id: string;
  poolAddress: string;
  token0: {
    symbol: string;
    address: string;
    decimals: number;
  };
  token1: {
    symbol: string;
    address: string;
    decimals: number;
  };
  liquidity: string;
  amount0: number;
  amount1: number;
  valueUSD: number;
  entryPrice0: number;
  entryPrice1: number;
  currentPrice0: number;
  currentPrice1: number;
  feesEarned0: number;
  feesEarned1: number;
  feesEarnedUSD: number;
  impermanentLoss: number;
  impermanentLossUSD: number;
  totalReturn: number;
  totalReturnUSD: number;
  apy: number;
  age: number; // Days since position opened
  lastUpdate: string;
}

interface YieldMetrics {
  positionId: string;
  dailyAPY: number;
  weeklyAPY: number;
  monthlyAPY: number;
  annualizedAPY: number;
  feeAPY: number;
  rewardsAPY: number;
  totalAPY: number;
  volumeAPY: number; // APY from trading volume
  liquidityUtilization: number;
  feeTier: number;
  priceRange: {
    lower: number;
    upper: number;
    current: number;
    inRange: boolean;
  };
}

interface ImpermanentLossData {
  positionId: string;
  currentIL: number; // Current IL percentage
  currentILUSD: number; // Current IL in USD
  maxIL: number; // Maximum IL experienced
  maxILUSD: number; // Maximum IL in USD
  ilHistory: Array<{
    timestamp: string;
    ilPercentage: number;
    ilUSD: number;
    token0Price: number;
    token1Price: number;
  }>;
  hedgingRecommendations: Array<{
    strategy: string;
    description: string;
    cost: number;
    effectiveness: number; // 0-1 scale
    complexity: 'Low' | 'Medium' | 'High';
  }>;
}

interface PositionPerformance {
  positionId: string;
  hodlValue: number; // Value if tokens were just held
  lpValue: number; // Current LP position value
  totalFees: number;
  netPerformance: number; // LP value + fees - hodl value
  netPerformancePercent: number;
  performanceHistory: Array<{
    timestamp: string;
    hodlValue: number;
    lpValue: number;
    fees: number;
    netPerformance: number;
  }>;
}

interface HedgingStrategy {
  id: string;
  name: string;
  description: string;
  targetIL: number; // Target IL to hedge against
  cost: number; // Cost as percentage of position
  effectiveness: number; // 0-1 effectiveness score
  complexity: 'Low' | 'Medium' | 'High';
  steps: string[];
  pros: string[];
  cons: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
}

export class EulerSwapConnector {
  private provider: ethers.providers.JsonRpcProvider;
  private graphClient: GraphQLClient;
  
  constructor(rpcUrl: string, subgraphUrl?: string) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    this.graphClient = new GraphQLClient(
      subgraphUrl || 'https://api.goldsky.com/api/public/project_clm0q3e5p03g101ic3u4r6c4e/subgraphs/euler-swap/stable/gn'
    );
  }

  async getUserLPPositions(userAddress: string): Promise<LPPosition[]> {
    const query = `
      query GetUserPositions($user: String!) {
        positions(where: { owner: $user, liquidity_gt: 0 }) {
          id
          pool {
            id
            token0 {
              id
              symbol
              decimals
            }
            token1 {
              id
              symbol
              decimals
            }
            feeTier
          }
          liquidity
          depositedToken0
          depositedToken1
          withdrawnToken0
          withdrawnToken1
          collectedFeesToken0
          collectedFeesToken1
          transaction {
            timestamp
          }
        }
      }
    `;

    try {
      const response = await this.graphClient.request(query, { user: userAddress.toLowerCase() });
      
      return Promise.all((response as { positions: Record<string, unknown>[] }).positions.map(async (pos: Record<string, unknown>) => {
        const position = await this.enrichPositionData(pos);
        return position;
      }));
    } catch (error) {
      console.error('Error fetching LP positions:', error);
      // Return mock data for demo
      return this.getMockLPPositions();
    }
  }

  private async enrichPositionData(rawPosition: Record<string, unknown>): Promise<LPPosition> {
    // Type assertions for safe property access
    const pool = rawPosition.pool as { id: string; token0: { id: string }; token1: { id: string } };
    const transaction = rawPosition.transaction as { timestamp: string };
    
    // Calculate current token amounts and values
    const currentPrice0 = await this.getTokenPrice(pool.token0.id);
    const currentPrice1 = await this.getTokenPrice(pool.token1.id);
    
    // Mock calculations for demonstration
    const amount0 = 1000; // Would calculate from liquidity and current price
    const amount1 = 2400; // Would calculate from liquidity and current price
    const valueUSD = amount0 * currentPrice0 + amount1 * currentPrice1;
    
    const entryPrice0 = currentPrice0 * 0.95; // Mock entry price
    const entryPrice1 = currentPrice1 * 0.98;
    
    const feesEarned0 = parseFloat(String(rawPosition.collectedFeesToken0 || '0'));
    const feesEarned1 = parseFloat(String(rawPosition.collectedFeesToken1 || '0'));
    const feesEarnedUSD = feesEarned0 * currentPrice0 + feesEarned1 * currentPrice1;
    
    // Calculate impermanent loss
    const il = this.calculateImpermanentLoss(entryPrice0, entryPrice1, currentPrice0, currentPrice1);
    
    return {
      id: String(rawPosition.id),
      poolAddress: pool.id,
      token0: { symbol: 'TOKEN0', address: String(pool.token0.id), decimals: 18 },
      token1: { symbol: 'TOKEN1', address: String(pool.token1.id), decimals: 18 },
      liquidity: String(rawPosition.liquidity),
      amount0,
      amount1,
      valueUSD,
      entryPrice0,
      entryPrice1,
      currentPrice0,
      currentPrice1,
      feesEarned0,
      feesEarned1,
      feesEarnedUSD,
      impermanentLoss: il.percentage,
      impermanentLossUSD: il.usd,
      totalReturn: (valueUSD + feesEarnedUSD) / (amount0 * entryPrice0 + amount1 * entryPrice1) - 1,
      totalReturnUSD: valueUSD + feesEarnedUSD - (amount0 * entryPrice0 + amount1 * entryPrice1),
      apy: 12.5, // Mock APY calculation
      age: Math.floor((Date.now() - parseInt(transaction.timestamp) * 1000) / (24 * 60 * 60 * 1000)),
      lastUpdate: new Date().toISOString()
    };
  }

  async getYieldMetrics(positionId: string): Promise<YieldMetrics> {
    // In a real implementation, this would analyze historical data
    return {
      positionId,
      dailyAPY: 0.15,
      weeklyAPY: 1.1,
      monthlyAPY: 4.8,
      annualizedAPY: 12.5,
      feeAPY: 8.2,
      rewardsAPY: 4.3,
      totalAPY: 12.5,
      volumeAPY: 7.1,
      liquidityUtilization: 0.68,
      feeTier: 3000, // 0.3%
      priceRange: {
        lower: 2200,
        upper: 2800,
        current: 2450,
        inRange: true
      }
    };
  }

  async getImpermanentLossData(positionId: string): Promise<ImpermanentLossData> {
    // Generate mock IL history
    const ilHistory = [];
    const now = Date.now();
    for (let i = 30; i >= 0; i--) {
      const timestamp = new Date(now - i * 24 * 60 * 60 * 1000).toISOString();
      ilHistory.push({
        timestamp,
        ilPercentage: Math.random() * 5 - 0.5, // -0.5% to 4.5%
        ilUSD: (Math.random() * 500 - 50), // -$50 to $450
        token0Price: 1 + (Math.random() - 0.5) * 0.1, // USDC price variation
        token1Price: 2400 + (Math.random() - 0.5) * 400 // ETH price variation
      });
    }

    return {
      positionId,
      currentIL: 2.3,
      currentILUSD: 125,
      maxIL: 4.7,
      maxILUSD: 280,
      ilHistory,
      hedgingRecommendations: this.getHedgingRecommendations()
    };
  }

  async getPositionPerformance(positionId: string): Promise<PositionPerformance> {
    // Mock performance data
    const performanceHistory = [];
    const now = Date.now();
    for (let i = 30; i >= 0; i--) {
      const timestamp = new Date(now - i * 24 * 60 * 60 * 1000).toISOString();
      const hodlValue = 5000 + (Math.random() - 0.5) * 1000;
      const lpValue = hodlValue * 0.98 + Math.random() * 100; // Slightly less due to IL
      const fees = Math.random() * 50 + (30 - i) * 2; // Accumulating fees
      
      performanceHistory.push({
        timestamp,
        hodlValue,
        lpValue,
        fees,
        netPerformance: lpValue + fees - hodlValue
      });
    }

    const latest = performanceHistory[performanceHistory.length - 1];
    
    return {
      positionId,
      hodlValue: latest.hodlValue,
      lpValue: latest.lpValue,
      totalFees: latest.fees,
      netPerformance: latest.netPerformance,
      netPerformancePercent: (latest.netPerformance / latest.hodlValue) * 100,
      performanceHistory
    };
  }

  private async getTokenPrice(tokenAddress: string): Promise<number> {
    // Mock token prices
    const mockPrices: { [key: string]: number } = {
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 1.0001, // USDC
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 2450,   // WETH
      '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': 43000,  // WBTC
    };
    
    return mockPrices[tokenAddress.toLowerCase()] || 100;
  }

  private calculateImpermanentLoss(
    entryPrice0: number,
    entryPrice1: number,
    currentPrice0: number,
    currentPrice1: number
  ): { percentage: number; usd: number } {
    // Simplified IL calculation
    const priceRatioEntry = entryPrice1 / entryPrice0;
    const priceRatioCurrent = currentPrice1 / currentPrice0;
    const priceRatioChange = priceRatioCurrent / priceRatioEntry;
    
    // IL formula: 2*sqrt(ratio) / (1 + ratio) - 1
    const il = (2 * Math.sqrt(priceRatioChange)) / (1 + priceRatioChange) - 1;
    const ilPercentage = il * 100;
    
    // Estimate USD value (simplified)
    const initialValue = 5000; // Mock initial position value
    const ilUSD = initialValue * Math.abs(il);
    
    return {
      percentage: ilPercentage,
      usd: ilUSD
    };
  }

  private getHedgingRecommendations(): Array<{
    strategy: string;
    description: string;
    cost: number;
    effectiveness: number;
    complexity: 'Low' | 'Medium' | 'High';
  }> {
    return [
      {
        strategy: 'Options Collar',
        description: 'Buy puts and sell calls to limit downside and cap upside',
        cost: 2.5,
        effectiveness: 0.8,
        complexity: 'Medium'
      },
      {
        strategy: 'Perpetual Futures',
        description: 'Short perpetual futures to hedge price movements',
        cost: 1.2,
        effectiveness: 0.9,
        complexity: 'High'
      },
      {
        strategy: 'Correlation Trading',
        description: 'Trade correlated assets to offset IL',
        cost: 1.8,
        effectiveness: 0.6,
        complexity: 'Low'
      },
      {
        strategy: 'Dynamic Rebalancing',
        description: 'Automatically rebalance position based on price movements',
        cost: 0.8,
        effectiveness: 0.7,
        complexity: 'Medium'
      }
    ];
  }

  private getMockLPPositions(): LPPosition[] {
    return [
      {
        id: 'pos-1',
        poolAddress: '0x123...abc',
        token0: { symbol: 'USDC', address: TOKEN_ADDRESSES.USDC, decimals: 6 },
        token1: { symbol: 'WETH', address: TOKEN_ADDRESSES.WETH, decimals: 18 },
        liquidity: '1000000000000000000',
        amount0: 1000,
        amount1: 0.408,
        valueUSD: 2000,
        entryPrice0: 1.0,
        entryPrice1: 2400,
        currentPrice0: 1.0001,
        currentPrice1: 2450,
        feesEarned0: 12.5,
        feesEarned1: 0.005,
        feesEarnedUSD: 24.75,
        impermanentLoss: 1.2,
        impermanentLossUSD: 24,
        totalReturn: 2.1,
        totalReturnUSD: 42,
        apy: 15.2,
        age: 45,
        lastUpdate: new Date().toISOString()
      },
      {
        id: 'pos-2',
        poolAddress: '0x456...def',
        token0: { symbol: 'WBTC', address: TOKEN_ADDRESSES.WBTC, decimals: 8 },
        token1: { symbol: 'WETH', address: TOKEN_ADDRESSES.WETH, decimals: 18 },
        liquidity: '2000000000000000000',
        amount0: 0.05,
        amount1: 0.875,
        valueUSD: 4293,
        entryPrice0: 42000,
        entryPrice1: 2380,
        currentPrice0: 43000,
        currentPrice1: 2450,
        feesEarned0: 0.0002,
        feesEarned1: 0.008,
        feesEarnedUSD: 28.2,
        impermanentLoss: 0.8,
        impermanentLossUSD: 34.3,
        totalReturn: 1.8,
        totalReturnUSD: 77.3,
        apy: 18.7,
        age: 22,
        lastUpdate: new Date().toISOString()
      }
    ];
  }

  // Hedging strategies
  getAvailableHedgingStrategies(): HedgingStrategy[] {
    return [
      {
        id: 'options-collar',
        name: 'Options Collar Strategy',
        description: 'Protect against large price movements by buying protective puts and selling covered calls',
        targetIL: 5.0,
        cost: 2.5,
        effectiveness: 0.85,
        complexity: 'Medium',
        steps: [
          'Buy protective puts for both tokens',
          'Sell covered calls above current price',
          'Monitor positions daily',
          'Roll options before expiry'
        ],
        pros: [
          'Limited downside risk',
          'Generates premium income',
          'Customizable strike prices'
        ],
        cons: [
          'Caps upside potential',
          'Requires options trading knowledge',
          'Premium costs'
        ],
        riskLevel: 'Medium'
      },
      {
        id: 'perp-hedge',
        name: 'Perpetual Futures Hedge',
        description: 'Use perpetual futures to hedge against token price movements',
        targetIL: 3.0,
        cost: 1.8,
        effectiveness: 0.92,
        complexity: 'High',
        steps: [
          'Calculate hedge ratio',
          'Short perpetual futures',
          'Monitor funding rates',
          'Adjust position size dynamically'
        ],
        pros: [
          'High effectiveness',
          'No expiry dates',
          'Liquid markets'
        ],
        cons: [
          'Funding rate risk',
          'Requires margin',
          'Complex management'
        ],
        riskLevel: 'High'
      },
      {
        id: 'delta-neutral',
        name: 'Delta Neutral Strategy',
        description: 'Maintain market-neutral exposure through dynamic hedging',
        targetIL: 2.0,
        cost: 1.2,
        effectiveness: 0.78,
        complexity: 'High',
        steps: [
          'Calculate position delta',
          'Open offsetting positions',
          'Rebalance regularly',
          'Monitor correlation changes'
        ],
        pros: [
          'Market neutral',
          'Captures fees only',
          'Reduces volatility'
        ],
        cons: [
          'Frequent rebalancing',
          'Transaction costs',
          'Complex execution'
        ],
        riskLevel: 'Medium'
      },
      {
        id: 'range-rebalancing',
        name: 'Automated Range Rebalancing',
        description: 'Automatically rebalance LP position when prices move out of range',
        targetIL: 4.0,
        cost: 0.8,
        effectiveness: 0.65,
        complexity: 'Low',
        steps: [
          'Set price range boundaries',
          'Monitor price movements',
          'Auto-rebalance on breach',
          'Collect fees from new range'
        ],
        pros: [
          'Simple to implement',
          'Low maintenance',
          'Maximizes fee collection'
        ],
        cons: [
          'Gas costs for rebalancing',
          'Doesn\'t eliminate IL',
          'May miss price movements'
        ],
        riskLevel: 'Low'
      }
    ];
  }
}

// Token addresses (reusing from previous file)
const TOKEN_ADDRESSES = {
  WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
};

export type { LPPosition, YieldMetrics, ImpermanentLossData, PositionPerformance, HedgingStrategy };