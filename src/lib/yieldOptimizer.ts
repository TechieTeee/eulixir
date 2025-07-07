import { ethers } from 'ethers';
import { GraphQLClient } from 'graphql-request';
import { EulerVaultConnector, VaultInfo } from './eulerVaultConnector';
import { EulerSwapConnector, LPPosition } from './eulerSwapConnector';

// Yield optimization interfaces
interface YieldOpportunity {
  id: string;
  protocol: 'EulerSwap' | 'Euler Vaults' | 'Uniswap V3' | 'Aave' | 'Compound';
  strategyType: 'Lending' | 'LP' | 'Leveraged LP' | 'Arbitrage' | 'Yield Farming';
  asset: string;
  assetSymbol: string;
  currentAPY: number;
  projectedAPY: number;
  tvl: number;
  risk: 'Low' | 'Medium' | 'High';
  riskScore: number; // 0-10
  liquidityScore: number; // 0-10
  gasCost: string;
  minDeposit: string;
  maxCapacity: string;
  timeToSetup: number; // minutes
  complexity: 'Simple' | 'Intermediate' | 'Advanced';
  requirements: string[];
  advantages: string[];
  risks: string[];
  estimatedGasUSD: number;
  netAPYAfterGas: number;
  confidence: number; // 0-1
  lastUpdated: string;
}

interface OptimizationStrategy {
  id: string;
  name: string;
  description: string;
  targetAPY: number;
  riskLevel: 'Conservative' | 'Moderate' | 'Aggressive';
  allocation: PortfolioAllocation[];
  rebalanceFrequency: 'Daily' | 'Weekly' | 'Monthly' | 'Threshold-based';
  rebalanceThreshold: number; // percentage
  maxSlippage: number;
  maxGasPerRebalance: string;
  totalAPY: number;
  sharpeRatio: number;
  maxDrawdown: number;
  requiredCapital: string;
  estimatedSetupTime: number;
  automationLevel: 'Manual' | 'Semi-auto' | 'Fully-auto';
}

interface PortfolioAllocation {
  protocol: string;
  strategy: string;
  asset: string;
  percentage: number;
  amount: string;
  currentAPY: number;
  riskScore: number;
}

interface RebalanceAction {
  id: string;
  type: 'Deposit' | 'Withdraw' | 'Swap' | 'Migrate' | 'Compound';
  fromProtocol?: string;
  toProtocol: string;
  asset: string;
  amount: string;
  reason: string;
  expectedGain: number;
  gasEstimate: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  deadline?: string;
  slippageTolerance: number;
  autoExecute: boolean;
}

interface YieldAnalytics {
  totalPortfolioValue: number;
  totalPortfolioValueUSD: number;
  weightedAverageAPY: number;
  totalYieldUSD24h: number;
  totalYieldUSD7d: number;
  totalYieldUSD30d: number;
  riskAdjustedReturn: number;
  portfolioSharpeRatio: number;
  diversificationScore: number;
  liquidityScore: number;
  impermanentLoss: number;
  totalFees: number;
  gasSpent: number;
  netReturn: number;
  benchmark: {
    strategy: string;
    apy: number;
    comparison: number; // difference vs benchmark
  };
  historicalPerformance: Array<{
    timestamp: string;
    totalValue: number;
    apy: number;
    yield: number;
    risk: number;
  }>;
}

interface AutoRebalanceConfig {
  enabled: boolean;
  maxSlippage: number;
  minYieldDifference: number; // minimum APY difference to trigger rebalance
  maxGasPerRebalance: string;
  rebalanceFrequency: number; // hours
  apyThreshold: number; // rebalance if APY drops below this
  ilThreshold: number; // rebalance if IL exceeds this percentage
  riskToleranceChange: number; // rebalance if risk score changes by this much
  whitelistedProtocols: string[];
  blacklistedProtocols: string[];
  emergencyWithdraw: {
    enabled: boolean;
    triggerConditions: string[];
    targetAsset: string;
  };
}

interface YieldForecast {
  asset: string;
  protocol: string;
  timeframe: '1d' | '7d' | '30d' | '90d';
  currentAPY: number;
  forecastedAPY: number;
  confidence: number;
  factors: Array<{
    factor: string;
    impact: number;
    confidence: number;
  }>;
  scenarios: Array<{
    scenario: 'Bullish' | 'Base' | 'Bearish';
    probability: number;
    apy: number;
    reasoning: string;
  }>;
}

export class YieldOptimizer {
  private provider: ethers.providers.JsonRpcProvider;
  private vaultConnector: EulerVaultConnector;
  private swapConnector: EulerSwapConnector;
  private graphClient: GraphQLClient;
  
  constructor(
    rpcUrl: string,
    signerOrProvider?: ethers.Signer | ethers.providers.Provider,
    subgraphUrl?: string
  ) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    this.vaultConnector = new EulerVaultConnector(rpcUrl, signerOrProvider);
    this.swapConnector = new EulerSwapConnector(rpcUrl);
    this.graphClient = new GraphQLClient(
      subgraphUrl || 'https://api.goldsky.com/api/public/project_clm0q3e5p03g101ic3u4r6c4e/subgraphs/euler-vault/stable/gn'
    );
  }

  // Find optimal yield opportunities
  async findYieldOpportunities(
    asset: string, 
    amount: string, 
    riskTolerance: 'Low' | 'Medium' | 'High'
  ): Promise<YieldOpportunity[]> {
    try {
      const opportunities: YieldOpportunity[] = [];
      
      // Get opportunities from various protocols
      const [vaultOpps, lpOpps, crossProtocolOpps] = await Promise.all([
        this.getVaultOpportunities(asset, amount),
        this.getLPOpportunities(asset, amount),
        this.getCrossProtocolOpportunities(asset, amount),
      ]);
      
      opportunities.push(...vaultOpps, ...lpOpps, ...crossProtocolOpps);
      
      // Filter by risk tolerance
      const filteredOpps = opportunities.filter(opp => {
        if (riskTolerance === 'Low') return opp.riskScore <= 3;
        if (riskTolerance === 'Medium') return opp.riskScore <= 6;
        return true; // High risk tolerance accepts all
      });
      
      // Sort by risk-adjusted return
      return filteredOpps.sort((a, b) => b.netAPYAfterGas - a.netAPYAfterGas);
    } catch (error) {
      console.error('Error finding yield opportunities:', error);
      return [];
    }
  }

  // Generate optimization strategies
  async generateOptimizationStrategies(
    portfolioValue: number,
    riskLevel: 'Conservative' | 'Moderate' | 'Aggressive'
  ): Promise<OptimizationStrategy[]> {
    try {
      const strategies: OptimizationStrategy[] = [];
      
      // Conservative strategy
      if (riskLevel === 'Conservative' || riskLevel === 'Moderate') {
        strategies.push({
          id: 'conservative-yield',
          name: 'Conservative Yield Strategy',
          description: 'Focus on stable, low-risk yields with minimal IL exposure',
          targetAPY: 6.5,
          riskLevel: 'Conservative',
          allocation: [
            {
              protocol: 'Euler Vaults',
              strategy: 'USDC Lending',
              asset: 'USDC',
              percentage: 60,
              amount: (portfolioValue * 0.6).toString(),
              currentAPY: 5.5,
              riskScore: 2,
            },
            {
              protocol: 'Euler Vaults',
              strategy: 'WETH Lending',
              asset: 'WETH',
              percentage: 30,
              amount: (portfolioValue * 0.3).toString(),
              currentAPY: 6.8,
              riskScore: 3,
            },
            {
              protocol: 'EulerSwap',
              strategy: 'USDC/DAI LP',
              asset: 'USDC-DAI',
              percentage: 10,
              amount: (portfolioValue * 0.1).toString(),
              currentAPY: 12.2,
              riskScore: 2,
            },
          ],
          rebalanceFrequency: 'Weekly',
          rebalanceThreshold: 2.0,
          maxSlippage: 0.5,
          maxGasPerRebalance: '0.01',
          totalAPY: 6.2,
          sharpeRatio: 2.8,
          maxDrawdown: 5.2,
          requiredCapital: portfolioValue.toString(),
          estimatedSetupTime: 15,
          automationLevel: 'Semi-auto',
        });
      }
      
      // Moderate strategy
      if (riskLevel === 'Moderate' || riskLevel === 'Aggressive') {
        strategies.push({
          id: 'balanced-yield',
          name: 'Balanced Yield Strategy',
          description: 'Mix of lending and LP positions for optimal risk-adjusted returns',
          targetAPY: 12.8,
          riskLevel: 'Moderate',
          allocation: [
            {
              protocol: 'EulerSwap',
              strategy: 'WETH/USDC LP',
              asset: 'WETH-USDC',
              percentage: 40,
              amount: (portfolioValue * 0.4).toString(),
              currentAPY: 15.2,
              riskScore: 5,
            },
            {
              protocol: 'Euler Vaults',
              strategy: 'Leveraged WETH',
              asset: 'WETH',
              percentage: 35,
              amount: (portfolioValue * 0.35).toString(),
              currentAPY: 12.8,
              riskScore: 6,
            },
            {
              protocol: 'Euler Vaults',
              strategy: 'USDC Lending',
              asset: 'USDC',
              percentage: 25,
              amount: (portfolioValue * 0.25).toString(),
              currentAPY: 5.5,
              riskScore: 2,
            },
          ],
          rebalanceFrequency: 'Threshold-based',
          rebalanceThreshold: 3.0,
          maxSlippage: 1.0,
          maxGasPerRebalance: '0.02',
          totalAPY: 12.5,
          sharpeRatio: 2.1,
          maxDrawdown: 12.8,
          requiredCapital: portfolioValue.toString(),
          estimatedSetupTime: 25,
          automationLevel: 'Fully-auto',
        });
      }
      
      // Aggressive strategy
      if (riskLevel === 'Aggressive') {
        strategies.push({
          id: 'aggressive-yield',
          name: 'High-Yield Aggressive Strategy',
          description: 'Maximum yield through leveraged positions and volatile pairs',
          targetAPY: 25.5,
          riskLevel: 'Aggressive',
          allocation: [
            {
              protocol: 'EulerSwap',
              strategy: 'WETH/WBTC LP',
              asset: 'WETH-WBTC',
              percentage: 50,
              amount: (portfolioValue * 0.5).toString(),
              currentAPY: 28.7,
              riskScore: 8,
            },
            {
              protocol: 'Euler Vaults',
              strategy: 'Leveraged WBTC',
              asset: 'WBTC',
              percentage: 30,
              amount: (portfolioValue * 0.3).toString(),
              currentAPY: 22.1,
              riskScore: 7,
            },
            {
              protocol: 'EulerSwap',
              strategy: 'Arbitrage Bot',
              asset: 'Multi',
              percentage: 20,
              amount: (portfolioValue * 0.2).toString(),
              currentAPY: 18.5,
              riskScore: 9,
            },
          ],
          rebalanceFrequency: 'Daily',
          rebalanceThreshold: 5.0,
          maxSlippage: 2.0,
          maxGasPerRebalance: '0.05',
          totalAPY: 24.8,
          sharpeRatio: 1.4,
          maxDrawdown: 28.5,
          requiredCapital: portfolioValue.toString(),
          estimatedSetupTime: 45,
          automationLevel: 'Fully-auto',
        });
      }
      
      return strategies;
    } catch (error) {
      console.error('Error generating optimization strategies:', error);
      return [];
    }
  }

  // Analyze current portfolio and suggest rebalancing
  async analyzePortfolio(userAddress: string): Promise<{
    analytics: YieldAnalytics;
    rebalanceActions: RebalanceAction[];
  }> {
    try {
      // Get current positions
      const [vaultPositions, lpPositions] = await Promise.all([
        this.vaultConnector.getUserVaultPositions(userAddress),
        this.swapConnector.getUserLPPositions(userAddress),
      ]);

      // Calculate portfolio analytics
      const analytics = await this.calculateYieldAnalytics(vaultPositions, lpPositions);
      
      // Generate rebalance recommendations
      const rebalanceActions = await this.generateRebalanceActions(
        vaultPositions, 
        lpPositions, 
        analytics
      );

      return { analytics, rebalanceActions };
    } catch (error) {
      console.error('Error analyzing portfolio:', error);
      throw error;
    }
  }

  // Auto-rebalance portfolio based on configuration
  async autoRebalance(
    userAddress: string, 
    config: AutoRebalanceConfig
  ): Promise<RebalanceAction[]> {
    if (!config.enabled) {
      return [];
    }

    try {
      const { analytics, rebalanceActions } = await this.analyzePortfolio(userAddress);
      
      // Filter actions based on config
      const autoActions = rebalanceActions.filter(action => {
        // Check if action meets minimum yield difference
        if (action.expectedGain < config.minYieldDifference) return false;
        
        // Check gas limits
        if (Number(action.gasEstimate) > Number(config.maxGasPerRebalance)) return false;
        
        // Check protocol whitelist/blacklist
        if (config.whitelistedProtocols.length > 0 && 
            !config.whitelistedProtocols.includes(action.toProtocol)) return false;
        if (config.blacklistedProtocols.includes(action.toProtocol)) return false;
        
        return action.autoExecute && action.priority !== 'Low';
      });

      return autoActions;
    } catch (error) {
      console.error('Error in auto-rebalance:', error);
      return [];
    }
  }

  // Generate yield forecasts
  async generateYieldForecasts(assets: string[]): Promise<YieldForecast[]> {
    try {
      const forecasts: YieldForecast[] = [];
      
      for (const asset of assets) {
        // Mock forecast data - in real implementation would use ML models
        const forecast: YieldForecast = {
          asset,
          protocol: 'EulerSwap',
          timeframe: '30d',
          currentAPY: 12.5,
          forecastedAPY: 13.8,
          confidence: 0.78,
          factors: [
            { factor: 'TVL Growth', impact: 1.2, confidence: 0.85 },
            { factor: 'Market Volatility', impact: -0.8, confidence: 0.72 },
            { factor: 'Borrowing Demand', impact: 2.1, confidence: 0.91 },
          ],
          scenarios: [
            { scenario: 'Bullish', probability: 0.3, apy: 16.2, reasoning: 'Increased TVL and borrowing demand' },
            { scenario: 'Base', probability: 0.5, apy: 13.8, reasoning: 'Steady market conditions' },
            { scenario: 'Bearish', probability: 0.2, apy: 9.1, reasoning: 'Market downturn reduces demand' },
          ],
        };
        
        forecasts.push(forecast);
      }
      
      return forecasts;
    } catch (error) {
      console.error('Error generating yield forecasts:', error);
      return [];
    }
  }

  // Private helper methods
  private async getVaultOpportunities(asset: string, amount: string): Promise<YieldOpportunity[]> {
    const vaults = await this.vaultConnector.getAvailableVaults();
    const opportunities: YieldOpportunity[] = [];
    
    for (const vault of vaults) {
      if (vault.assetSymbol.toLowerCase() === asset.toLowerCase()) {
        opportunities.push({
          id: `vault_${vault.address}`,
          protocol: 'Euler Vaults',
          strategyType: 'Lending',
          asset: vault.asset,
          assetSymbol: vault.assetSymbol,
          currentAPY: vault.supplyAPY,
          projectedAPY: vault.supplyAPY * 1.05, // 5% optimistic projection
          tvl: Number(vault.totalAssets),
          risk: vault.utilization > 0.8 ? 'Medium' : 'Low',
          riskScore: Math.min(vault.utilization * 10, 8),
          liquidityScore: vault.utilization < 0.9 ? 9 : 6,
          gasCost: '0.01',
          minDeposit: '100',
          maxCapacity: vault.maxCapacity,
          timeToSetup: 5,
          complexity: 'Simple',
          requirements: ['ERC-20 token approval'],
          advantages: ['Low risk', 'High liquidity', 'Predictable returns'],
          risks: ['Smart contract risk', 'Protocol risk'],
          estimatedGasUSD: 25,
          netAPYAfterGas: vault.supplyAPY - 0.1,
          confidence: 0.95,
          lastUpdated: new Date().toISOString(),
        });
      }
    }
    
    return opportunities;
  }

  private async getLPOpportunities(asset: string, amount: string): Promise<YieldOpportunity[]> {
    // Mock LP opportunities
    return [
      {
        id: 'lp_weth_usdc',
        protocol: 'EulerSwap',
        strategyType: 'LP',
        asset: 'WETH-USDC',
        assetSymbol: 'WETH-USDC',
        currentAPY: 15.2,
        projectedAPY: 16.8,
        tvl: 24500000,
        risk: 'Medium',
        riskScore: 5,
        liquidityScore: 8,
        gasCost: '0.03',
        minDeposit: '1000',
        maxCapacity: ethers.constants.MaxUint256.toString(),
        timeToSetup: 10,
        complexity: 'Intermediate',
        requirements: ['Both tokens', 'IL understanding'],
        advantages: ['Higher yields', 'Fee collection', 'Active liquidity'],
        risks: ['Impermanent loss', 'Price volatility', 'Smart contract risk'],
        estimatedGasUSD: 75,
        netAPYAfterGas: 14.8,
        confidence: 0.82,
        lastUpdated: new Date().toISOString(),
      },
    ];
  }

  private async getCrossProtocolOpportunities(asset: string, amount: string): Promise<YieldOpportunity[]> {
    // Mock cross-protocol opportunities
    return [
      {
        id: 'aave_usdc_lending',
        protocol: 'Aave',
        strategyType: 'Lending',
        asset: 'USDC',
        assetSymbol: 'USDC',
        currentAPY: 4.2,
        projectedAPY: 4.5,
        tvl: 1200000000,
        risk: 'Low',
        riskScore: 2,
        liquidityScore: 10,
        gasCost: '0.02',
        minDeposit: '1',
        maxCapacity: ethers.constants.MaxUint256.toString(),
        timeToSetup: 5,
        complexity: 'Simple',
        requirements: ['ERC-20 token approval'],
        advantages: ['Battle-tested', 'High liquidity', 'Insurance fund'],
        risks: ['Lower yields', 'Protocol risk'],
        estimatedGasUSD: 50,
        netAPYAfterGas: 4.0,
        confidence: 0.98,
        lastUpdated: new Date().toISOString(),
      },
    ];
  }

  private async calculateYieldAnalytics(vaultPositions: any[], lpPositions: any[]): Promise<YieldAnalytics> {
    // Mock analytics calculation
    const totalValue = 50000;
    
    return {
      totalPortfolioValue: totalValue,
      totalPortfolioValueUSD: totalValue,
      weightedAverageAPY: 12.8,
      totalYieldUSD24h: totalValue * 0.128 / 365,
      totalYieldUSD7d: totalValue * 0.128 / 52,
      totalYieldUSD30d: totalValue * 0.128 / 12,
      riskAdjustedReturn: 8.5,
      portfolioSharpeRatio: 1.8,
      diversificationScore: 7.2,
      liquidityScore: 8.5,
      impermanentLoss: -2.1,
      totalFees: 125.50,
      gasSpent: 89.25,
      netReturn: 11.2,
      benchmark: {
        strategy: 'HODL ETH',
        apy: 8.5,
        comparison: 4.3,
      },
      historicalPerformance: [
        { timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), totalValue: 48500, apy: 11.2, yield: 180, risk: 5.2 },
        { timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), totalValue: 49200, apy: 12.1, yield: 195, risk: 5.8 },
        { timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), totalValue: 49800, apy: 12.8, yield: 210, risk: 6.1 },
        { timestamp: new Date().toISOString(), totalValue, apy: 12.8, yield: 225, risk: 5.9 },
      ],
    };
  }

  private async generateRebalanceActions(
    vaultPositions: any[], 
    lpPositions: any[], 
    analytics: YieldAnalytics
  ): Promise<RebalanceAction[]> {
    const actions: RebalanceAction[] = [];
    
    // Mock rebalance action
    if (analytics.weightedAverageAPY < 10) {
      actions.push({
        id: 'rebalance_1',
        type: 'Migrate',
        fromProtocol: 'Aave',
        toProtocol: 'EulerSwap',
        asset: 'USDC',
        amount: '5000',
        reason: 'Higher yield opportunity available',
        expectedGain: 3.2,
        gasEstimate: '0.025',
        priority: 'Medium',
        slippageTolerance: 0.5,
        autoExecute: true,
      });
    }
    
    return actions;
  }
}

export type {
  YieldOpportunity,
  OptimizationStrategy,
  PortfolioAllocation,
  RebalanceAction,
  YieldAnalytics,
  AutoRebalanceConfig,
  YieldForecast,
};