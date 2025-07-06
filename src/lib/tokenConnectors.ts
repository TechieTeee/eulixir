import { ethers } from 'ethers';
import { GraphQLClient } from 'graphql-request';

// Token addresses on Ethereum mainnet
export const TOKEN_ADDRESSES = {
  WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
};

// Oracle addresses
export const PRICE_FEEDS = {
  ETH_USD: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
  BTC_USD: '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c',
  USDC_USD: '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6',
};

// Subgraph endpoints
const UNISWAP_V3_SUBGRAPH = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3';
// const AAVE_V3_SUBGRAPH = 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3';
// const COMPOUND_V3_SUBGRAPH = 'https://api.thegraph.com/subgraphs/name/graphprotocol/compound-v3';

interface TokenData {
  token: string;
  address: string;
  price: number;
  volume24h: number;
  liquidity: number;
  priceChange24h: number;
  timestamp: string;
}

interface LendingRate {
  protocol: string;
  token: string;
  supplyAPY: number;
  borrowAPY: number;
  totalSupplied: number;
  totalBorrowed: number;
  utilizationRate: number;
  timestamp: string;
}

interface WETHMetrics extends TokenData {
  ethPremium: number; // Premium of WETH over ETH
  unwrapVolume: number; // Volume of WETH -> ETH unwrapping
  gasEfficiency: number; // Gas cost efficiency for wrapping/unwrapping
  dexArbitrageOpportunities: number;
}

interface USDCMetrics extends TokenData {
  supplyGrowth: number; // 24h supply change
  depegRisk: number; // Distance from $1.00
  circulation: number; // Circulating supply
  yieldSpread: number; // Difference between highest and lowest yields
  topYieldProtocol: string;
}

interface WBTCMetrics extends TokenData {
  backingRatio: number; // WBTC supply / BTC backing
  mintBurnActivity: number; // 24h mint/burn volume
  custodianHealth: number; // Health score of custodians
  btcPremium: number; // Premium of WBTC over BTC
  custodians: string[];
}

// WETH Data Connector
export class WETHConnector {
  private provider: ethers.providers.JsonRpcProvider;
  private uniswapClient: GraphQLClient;

  constructor(rpcUrl: string) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    this.uniswapClient = new GraphQLClient(UNISWAP_V3_SUBGRAPH);
  }

  async getWETHData(): Promise<WETHMetrics> {
    try {
      // Get basic token data
      const basicData = await this.getBasicTokenData('WETH');
      
      // Get WETH-specific metrics
      const wethSpecificData = await this.getWETHSpecificMetrics();
      
      return {
        ...basicData,
        ...wethSpecificData
      };
    } catch (error) {
      console.error('Error fetching WETH data:', error);
      throw error;
    }
  }

  private async getBasicTokenData(token: string): Promise<TokenData> {
    // This would integrate with real APIs
    // For now, return mock data
    return {
      token,
      address: TOKEN_ADDRESSES.WETH,
      price: 2400, // Mock ETH price
      volume24h: 1500000000,
      liquidity: 800000000,
      priceChange24h: 2.5,
      timestamp: new Date().toISOString()
    };
  }

  private async getWETHSpecificMetrics(): Promise<Partial<WETHMetrics>> {
    // Get WETH-specific data
    const ethPrice = await this.getETHPrice();
    const wethPrice = ethPrice; // WETH should be 1:1 with ETH
    
    return {
      ethPremium: (wethPrice - ethPrice) / ethPrice * 100, // Should be ~0
      unwrapVolume: 50000000, // Mock unwrap volume
      gasEfficiency: 0.95, // Mock gas efficiency score
      dexArbitrageOpportunities: 3 // Mock arbitrage opportunities
    };
  }

  private async getETHPrice(): Promise<number> {
    // Get ETH price from Chainlink
    const chainlinkABI = [
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

    try {
      const priceFeed = new ethers.Contract(PRICE_FEEDS.ETH_USD, chainlinkABI, this.provider);
      const [, price] = await priceFeed.latestRoundData();
      return Number(ethers.utils.formatUnits(price, 8));
    } catch (error) {
      console.error('Error fetching ETH price:', error);
      return 2400; // Fallback price
    }
  }

  async getLendingRates(): Promise<LendingRate[]> {
    // Get WETH lending rates from various protocols
    const rates: LendingRate[] = [];
    
    // Mock data for different protocols
    const protocols = ['Aave V3', 'Compound V3', 'Euler Finance'];
    
    for (const protocol of protocols) {
      rates.push({
        protocol,
        token: 'WETH',
        supplyAPY: Math.random() * 5 + 1, // 1-6% APY
        borrowAPY: Math.random() * 3 + 3, // 3-6% APY
        totalSupplied: Math.random() * 1000000 + 500000,
        totalBorrowed: Math.random() * 500000 + 200000,
        utilizationRate: Math.random() * 60 + 20, // 20-80%
        timestamp: new Date().toISOString()
      });
    }
    
    return rates;
  }
}

// USDC Data Connector
export class USDCConnector {
  private provider: ethers.providers.JsonRpcProvider;

  constructor(rpcUrl: string) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  }

  async getUSDCData(): Promise<USDCMetrics> {
    try {
      const basicData = await this.getBasicTokenData('USDC');
      const usdcSpecificData = await this.getUSDCSpecificMetrics();
      
      return {
        ...basicData,
        ...usdcSpecificData
      };
    } catch (error) {
      console.error('Error fetching USDC data:', error);
      throw error;
    }
  }

  private async getBasicTokenData(token: string): Promise<TokenData> {
    return {
      token,
      address: TOKEN_ADDRESSES.USDC,
      price: 1.0001, // USDC should be ~$1
      volume24h: 2000000000,
      liquidity: 1500000000,
      priceChange24h: 0.01,
      timestamp: new Date().toISOString()
    };
  }

  private async getUSDCSpecificMetrics(): Promise<Partial<USDCMetrics>> {
    // Get USDC supply data
    const totalSupply = await this.getUSDCSupply();
    
    return {
      supplyGrowth: 0.5, // 0.5% daily growth
      depegRisk: 0.0001, // Very low depeg risk
      circulation: totalSupply,
      yieldSpread: 2.5, // 2.5% spread between protocols
      topYieldProtocol: 'Aave V3'
    };
  }

  private async getUSDCSupply(): Promise<number> {
    // Get USDC total supply from contract
    const usdcABI = [
      {
        constant: true,
        inputs: [],
        name: 'totalSupply',
        outputs: [{ name: '', type: 'uint256' }],
        type: 'function',
      },
    ];

    try {
      const usdcContract = new ethers.Contract(TOKEN_ADDRESSES.USDC, usdcABI, this.provider);
      const supply = await usdcContract.totalSupply();
      return Number(ethers.utils.formatUnits(supply, 6)); // USDC has 6 decimals
    } catch (error) {
      console.error('Error fetching USDC supply:', error);
      return 25000000000; // Fallback ~25B USDC
    }
  }

  async getYieldComparison(): Promise<LendingRate[]> {
    const rates: LendingRate[] = [];
    const protocols = ['Aave V3', 'Compound V3', 'Euler Finance', 'MakerDAO'];
    
    for (const protocol of protocols) {
      rates.push({
        protocol,
        token: 'USDC',
        supplyAPY: Math.random() * 4 + 2, // 2-6% APY
        borrowAPY: Math.random() * 2 + 4, // 4-6% APY
        totalSupplied: Math.random() * 2000000000 + 1000000000,
        totalBorrowed: Math.random() * 1000000000 + 500000000,
        utilizationRate: Math.random() * 70 + 15, // 15-85%
        timestamp: new Date().toISOString()
      });
    }
    
    return rates.sort((a, b) => b.supplyAPY - a.supplyAPY);
  }
}

// WBTC Data Connector
export class WBTCConnector {
  private provider: ethers.providers.JsonRpcProvider;

  constructor(rpcUrl: string) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  }

  async getWBTCData(): Promise<WBTCMetrics> {
    try {
      const basicData = await this.getBasicTokenData('WBTC');
      const wbtcSpecificData = await this.getWBTCSpecificMetrics();
      
      return {
        ...basicData,
        ...wbtcSpecificData
      };
    } catch (error) {
      console.error('Error fetching WBTC data:', error);
      throw error;
    }
  }

  private async getBasicTokenData(token: string): Promise<TokenData> {
    return {
      token,
      address: TOKEN_ADDRESSES.WBTC,
      price: 43000, // Mock BTC price
      volume24h: 800000000,
      liquidity: 400000000,
      priceChange24h: 1.8,
      timestamp: new Date().toISOString()
    };
  }

  private async getWBTCSpecificMetrics(): Promise<Partial<WBTCMetrics>> {
    const wbtcSupply = await this.getWBTCSupply();
    const btcBacking = await this.getBTCBacking();
    
    return {
      backingRatio: btcBacking / wbtcSupply,
      mintBurnActivity: 150, // Mock daily mint/burn volume
      custodianHealth: 0.95, // 95% health score
      btcPremium: 0.02, // 2% premium over BTC
      custodians: ['BitGo', 'Coinbase Custody']
    };
  }

  private async getWBTCSupply(): Promise<number> {
    const wbtcABI = [
      {
        constant: true,
        inputs: [],
        name: 'totalSupply',
        outputs: [{ name: '', type: 'uint256' }],
        type: 'function',
      },
    ];

    try {
      const wbtcContract = new ethers.Contract(TOKEN_ADDRESSES.WBTC, wbtcABI, this.provider);
      const supply = await wbtcContract.totalSupply();
      return Number(ethers.utils.formatUnits(supply, 8)); // WBTC has 8 decimals
    } catch (error) {
      console.error('Error fetching WBTC supply:', error);
      return 150000; // Fallback ~150k WBTC
    }
  }

  private async getBTCBacking(): Promise<number> {
    // In a real implementation, this would check actual BTC addresses
    // For now, return mock data based on supply
    const supply = await this.getWBTCSupply();
    return supply * 1.001; // Slight over-collateralization
  }

  async getCustodianHealth(): Promise<{ custodian: string; health: number; btcHoldings: number }[]> {
    return [
      {
        custodian: 'BitGo',
        health: 0.98,
        btcHoldings: 100000
      },
      {
        custodian: 'Coinbase Custody',
        health: 0.96,
        btcHoldings: 50000
      }
    ];
  }
}

// Correlation Analysis
export class TokenCorrelationAnalyzer {
  async getCorrelationData(tokens: string[], timeframe: string = '24h'): Promise<Record<string, unknown>> {
    // Mock correlation matrix
    const correlationMatrix = {
      WETH_USDC: -0.15, // Negative correlation (WETH up, USDC stable)
      WETH_WBTC: 0.72,  // High positive correlation (both crypto assets)
      USDC_WBTC: -0.08, // Low correlation (stablecoin vs crypto)
    };

    const priceCorrelations = {
      '1h': { ...correlationMatrix },
      '24h': correlationMatrix,
      '7d': {
        WETH_USDC: -0.12,
        WETH_WBTC: 0.68,
        USDC_WBTC: -0.05,
      },
      '30d': {
        WETH_USDC: -0.18,
        WETH_WBTC: 0.75,
        USDC_WBTC: -0.12,
      }
    };

    return {
      timeframe,
      correlations: priceCorrelations[timeframe as keyof typeof priceCorrelations] || priceCorrelations['24h'],
      volatility: {
        WETH: 0.045, // 4.5% daily volatility
        USDC: 0.002, // 0.2% daily volatility
        WBTC: 0.038  // 3.8% daily volatility
      },
      timestamp: new Date().toISOString()
    };
  }

  async getArbitrageOpportunities(): Promise<Record<string, unknown>[]> {
    // Mock arbitrage opportunities
    return [
      {
        pair: 'WETH/USDC',
        dex1: 'Uniswap V3',
        dex2: 'Sushiswap',
        priceDiff: 0.15, // 0.15% price difference
        profitPotential: 0.12, // 0.12% profit after fees
        volume: 1000000,
        gasEstimate: 150000
      },
      {
        pair: 'WBTC/WETH',
        dex1: 'Curve',
        dex2: 'Balancer',
        priceDiff: 0.08,
        profitPotential: 0.05,
        volume: 500000,
        gasEstimate: 200000
      }
    ];
  }
}

// Factory function to create connectors
export function createTokenConnectors(rpcUrl: string) {
  return {
    weth: new WETHConnector(rpcUrl),
    usdc: new USDCConnector(rpcUrl),
    wbtc: new WBTCConnector(rpcUrl),
    correlation: new TokenCorrelationAnalyzer()
  };
}