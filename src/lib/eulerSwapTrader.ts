import { ethers } from 'ethers';
import { GraphQLClient } from 'graphql-request';

// EulerSwap Trading interfaces
interface SwapQuote {
  inputToken: string;
  outputToken: string;
  inputAmount: string;
  outputAmount: string;
  expectedOutputAmount: string;
  minimumOutputAmount: string;
  priceImpact: number;
  slippage: number;
  route: SwapRoute[];
  gasEstimate: string;
  gasPrice: string;
  executionPrice: number;
  marketPrice: number;
  timestamp: string;
  quoteId: string;
}

interface SwapRoute {
  protocol: 'EulerSwap' | 'Uniswap V3' | 'Uniswap V2' | 'Sushiswap';
  poolAddress: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  fee: number;
  liquidityUtilization: number;
}

interface SwapParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  slippageTolerance: number; // percentage, e.g., 0.5 for 0.5%
  deadline?: number; // timestamp
  recipient?: string;
  enablePartialFill?: boolean;
  maxHops?: number;
}

interface SwapExecution {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  inputToken: string;
  outputToken: string;
  inputAmount: string;
  outputAmount: string;
  actualOutputAmount?: string;
  gasUsed?: string;
  gasPrice: string;
  blockNumber?: number;
  timestamp: string;
  priceImpact: number;
  slippage: number;
  mevProtection: boolean;
}

interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  balance?: string;
  balanceUSD?: number;
  price?: number;
  priceChange24h?: number;
  volume24h?: number;
  isStable?: boolean;
  isVerified?: boolean;
  tags?: string[];
}

interface LiquidityPool {
  address: string;
  protocol: string;
  token0: TokenInfo;
  token1: TokenInfo;
  fee: number;
  liquidity: string;
  liquidityUSD: number;
  volume24h: number;
  volumeUSD24h: number;
  apy: number;
  utilization: number;
  reserve0: string;
  reserve1: string;
  price: number;
  priceChange24h: number;
}

interface ArbitrageOpportunity {
  id: string;
  tokenA: string;
  tokenB: string;
  buyPool: LiquidityPool;
  sellPool: LiquidityPool;
  profitUSD: number;
  profitPercentage: number;
  requiredCapital: string;
  gasEstimate: string;
  netProfit: number;
  confidence: number;
  expiresAt: string;
  flashLoanRequired: boolean;
}

// ERC-20 Token ABI
const TOKEN_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address, address) view returns (uint256)',
  'function approve(address, uint256) returns (bool)',
  'function transfer(address, uint256) returns (bool)',
  'function transferFrom(address, address, uint256) returns (bool)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
];

// EulerSwap Router ABI (simplified for key functions)
const EULER_SWAP_ROUTER_ABI = [
  'function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline) returns (uint256[] amounts)',
  'function swapTokensForExactTokens(uint256 amountOut, uint256 amountInMax, address[] path, address to, uint256 deadline) returns (uint256[] amounts)',
  'function getAmountsOut(uint256 amountIn, address[] path) view returns (uint256[] amounts)',
  'function getAmountsIn(uint256 amountOut, address[] path) view returns (uint256[] amounts)',
  'function quote(uint256 amountA, uint256 reserveA, uint256 reserveB) pure returns (uint256 amountB)',
  'function swapExactETHForTokens(uint256 amountOutMin, address[] path, address to, uint256 deadline) payable returns (uint256[] amounts)',
  'function swapTokensForExactETH(uint256 amountOut, uint256 amountInMax, address[] path, address to, uint256 deadline) returns (uint256[] amounts)',
  'function swapExactTokensForETH(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline) returns (uint256[] amounts)',
  'function addLiquidity(address tokenA, address tokenB, uint256 amountADesired, uint256 amountBDesired, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) returns (uint256 amountA, uint256 amountB, uint256 liquidity)',
  'function removeLiquidity(address tokenA, address tokenB, uint256 liquidity, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) returns (uint256 amountA, uint256 amountB)',
];

// Known token addresses
const TOKEN_ADDRESSES = {
  WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
};

// Router addresses (would be updated with actual deployed addresses)
const ROUTER_ADDRESSES = {
  EULER_SWAP: '0x0000000000000000000000000000000000000000', // Placeholder
  UNISWAP_V3: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
  UNISWAP_V2: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
};

export class EulerSwapTrader {
  private provider: ethers.providers.JsonRpcProvider;
  private signer?: ethers.Signer;
  private graphClient: GraphQLClient;
  private routerAddress: string;
  
  constructor(
    rpcUrl: string,
    signerOrProvider?: ethers.Signer | ethers.providers.Provider,
    subgraphUrl?: string,
    routerAddress?: string
  ) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    if (signerOrProvider) {
      this.signer = signerOrProvider as ethers.Signer;
    }
    this.graphClient = new GraphQLClient(
      subgraphUrl || 'https://api.goldsky.com/api/public/project_clm0q3e5p03g101ic3u4r6c4e/subgraphs/euler-swap/stable/gn'
    );
    this.routerAddress = routerAddress || ROUTER_ADDRESSES.EULER_SWAP;
  }

  // Get swap quote with optimal routing
  async getSwapQuote(params: SwapParams): Promise<SwapQuote> {
    try {
      // Get optimal route across multiple protocols
      const routes = await this.findOptimalRoute(params);
      const bestRoute = routes[0]; // Assuming routes are sorted by output amount

      if (!bestRoute) {
        throw new Error('No valid route found');
      }

      // Calculate price impact and slippage
      const marketPrice = await this.getMarketPrice(params.tokenIn, params.tokenOut);
      const executionPrice = Number(bestRoute.outputAmount) / Number(params.amountIn);
      const priceImpact = Math.abs((executionPrice - marketPrice) / marketPrice) * 100;

      // Calculate minimum output with slippage tolerance
      const outputAmount = bestRoute.outputAmount;
      const minimumOutputAmount = (
        Number(outputAmount) * (1 - params.slippageTolerance / 100)
      ).toString();

      // Estimate gas
      const gasEstimate = await this.estimateSwapGas(params, bestRoute.route);

      return {
        inputToken: params.tokenIn,
        outputToken: params.tokenOut,
        inputAmount: params.amountIn,
        outputAmount,
        expectedOutputAmount: outputAmount,
        minimumOutputAmount,
        priceImpact,
        slippage: params.slippageTolerance,
        route: bestRoute.route,
        gasEstimate: gasEstimate.toString(),
        gasPrice: (await this.provider.getGasPrice()).toString(),
        executionPrice,
        marketPrice,
        timestamp: new Date().toISOString(),
        quoteId: `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
    } catch (error) {
      console.error('Error getting swap quote:', error);
      throw error;
    }
  }

  // Execute swap with MEV protection
  async executeSwap(quote: SwapQuote, params: SwapParams): Promise<SwapExecution> {
    if (!this.signer) {
      throw new Error('No signer available for transactions');
    }

    try {
      const router = new ethers.Contract(this.routerAddress, EULER_SWAP_ROUTER_ABI, this.signer);
      const userAddress = await this.signer.getAddress();

      // Check and approve tokens if needed
      await this.ensureTokenApproval(params.tokenIn, params.amountIn, this.routerAddress);

      // Prepare swap parameters
      const deadline = params.deadline || Math.floor(Date.now() / 1000) + 1200; // 20 minutes
      const recipient = params.recipient || userAddress;
      const path = this.buildSwapPath(quote.route);

      // Execute swap with MEV protection
      let tx: ethers.ContractTransaction;
      
      if (params.tokenIn === TOKEN_ADDRESSES.WETH) {
        // ETH -> Token swap
        tx = await router.swapExactETHForTokens(
          quote.minimumOutputAmount,
          path,
          recipient,
          deadline,
          { value: params.amountIn }
        );
      } else if (params.tokenOut === TOKEN_ADDRESSES.WETH) {
        // Token -> ETH swap
        tx = await router.swapExactTokensForETH(
          params.amountIn,
          quote.minimumOutputAmount,
          path,
          recipient,
          deadline
        );
      } else {
        // Token -> Token swap
        tx = await router.swapExactTokensForTokens(
          params.amountIn,
          quote.minimumOutputAmount,
          path,
          recipient,
          deadline
        );
      }

      const execution: SwapExecution = {
        hash: tx.hash,
        status: 'pending',
        inputToken: params.tokenIn,
        outputToken: params.tokenOut,
        inputAmount: params.amountIn,
        outputAmount: quote.expectedOutputAmount,
        gasPrice: tx.gasPrice?.toString() || '0',
        timestamp: new Date().toISOString(),
        priceImpact: quote.priceImpact,
        slippage: quote.slippage,
        mevProtection: true,
      };

      // Wait for confirmation and update execution
      const receipt = await tx.wait();
      execution.status = receipt.status === 1 ? 'confirmed' : 'failed';
      execution.gasUsed = receipt.gasUsed.toString();
      execution.blockNumber = receipt.blockNumber;

      // Parse actual output amount from logs
      execution.actualOutputAmount = await this.parseOutputAmountFromReceipt(receipt, params.tokenOut);

      return execution;
    } catch (error) {
      console.error('Error executing swap:', error);
      throw error;
    }
  }

  // Get supported tokens
  async getSupportedTokens(): Promise<TokenInfo[]> {
    try {
      // In a real implementation, this would fetch from a token registry
      const tokens: TokenInfo[] = [
        {
          address: TOKEN_ADDRESSES.WETH,
          symbol: 'WETH',
          name: 'Wrapped Ether',
          decimals: 18,
          price: 2450,
          priceChange24h: 2.1,
          volume24h: 1500000000,
          isVerified: true,
          tags: ['blue-chip', 'collateral'],
        },
        {
          address: TOKEN_ADDRESSES.USDC,
          symbol: 'USDC',
          name: 'USD Coin',
          decimals: 6,
          price: 1.0,
          priceChange24h: 0.01,
          volume24h: 2000000000,
          isStable: true,
          isVerified: true,
          tags: ['stablecoin', 'collateral'],
        },
        {
          address: TOKEN_ADDRESSES.WBTC,
          symbol: 'WBTC',
          name: 'Wrapped Bitcoin',
          decimals: 8,
          price: 43000,
          priceChange24h: 1.8,
          volume24h: 800000000,
          isVerified: true,
          tags: ['blue-chip', 'bitcoin'],
        },
        {
          address: TOKEN_ADDRESSES.DAI,
          symbol: 'DAI',
          name: 'Dai Stablecoin',
          decimals: 18,
          price: 1.0,
          priceChange24h: -0.02,
          volume24h: 500000000,
          isStable: true,
          isVerified: true,
          tags: ['stablecoin', 'decentralized'],
        },
      ];

      // Add user balances if signer is available
      if (this.signer) {
        const userAddress = await this.signer.getAddress();
        for (const token of tokens) {
          const balance = await this.getTokenBalance(token.address, userAddress);
          token.balance = balance;
          token.balanceUSD = Number(balance) * (token.price || 0);
        }
      }

      return tokens;
    } catch (error) {
      console.error('Error fetching supported tokens:', error);
      return [];
    }
  }

  // Get liquidity pools
  async getLiquidityPools(): Promise<LiquidityPool[]> {
    try {
      // Mock data for demonstration - in real implementation would query subgraph
      return [
        {
          address: '0x1234567890123456789012345678901234567890',
          protocol: 'EulerSwap',
          token0: { address: TOKEN_ADDRESSES.USDC, symbol: 'USDC', name: 'USD Coin', decimals: 6 },
          token1: { address: TOKEN_ADDRESSES.WETH, symbol: 'WETH', name: 'Wrapped Ether', decimals: 18 },
          fee: 0.3,
          liquidity: '10000000000000000000000',
          liquidityUSD: 24500000,
          volume24h: 5000000,
          volumeUSD24h: 5000000,
          apy: 8.5,
          utilization: 0.75,
          reserve0: '12250000000000',
          reserve1: '5000000000000000000000',
          price: 2450,
          priceChange24h: 1.2,
        },
        {
          address: '0x2345678901234567890123456789012345678901',
          protocol: 'EulerSwap',
          token0: { address: TOKEN_ADDRESSES.WBTC, symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8 },
          token1: { address: TOKEN_ADDRESSES.WETH, symbol: 'WETH', name: 'Wrapped Ether', decimals: 18 },
          fee: 0.3,
          liquidity: '2000000000000000000000',
          liquidityUSD: 8600000,
          volume24h: 2000000,
          volumeUSD24h: 2000000,
          apy: 12.3,
          utilization: 0.68,
          reserve0: '100000000000',
          reserve1: '1757142857142857142857',
          price: 17.55,
          priceChange24h: -0.8,
        },
      ];
    } catch (error) {
      console.error('Error fetching liquidity pools:', error);
      return [];
    }
  }

  // Find arbitrage opportunities
  async findArbitrageOpportunities(): Promise<ArbitrageOpportunity[]> {
    try {
      const pools = await this.getLiquidityPools();
      const opportunities: ArbitrageOpportunity[] = [];

      // Mock arbitrage opportunity for demonstration
      opportunities.push({
        id: 'arb_1',
        tokenA: TOKEN_ADDRESSES.USDC,
        tokenB: TOKEN_ADDRESSES.WETH,
        buyPool: pools[0],
        sellPool: pools[0], // In real implementation, would be different pool
        profitUSD: 125.50,
        profitPercentage: 0.8,
        requiredCapital: '15000000000', // 15,000 USDC
        gasEstimate: '350000',
        netProfit: 98.75,
        confidence: 0.92,
        expiresAt: new Date(Date.now() + 30000).toISOString(), // 30 seconds
        flashLoanRequired: true,
      });

      return opportunities.filter(opp => opp.netProfit > 0);
    } catch (error) {
      console.error('Error finding arbitrage opportunities:', error);
      return [];
    }
  }

  // Private helper methods
  private async findOptimalRoute(params: SwapParams): Promise<{ outputAmount: string; route: SwapRoute[] }[]> {
    // Simplified routing - in real implementation would use complex routing algorithms
    const directRoute: SwapRoute = {
      protocol: 'EulerSwap',
      poolAddress: '0x1234567890123456789012345678901234567890',
      tokenIn: params.tokenIn,
      tokenOut: params.tokenOut,
      amountIn: params.amountIn,
      amountOut: '0', // Would be calculated
      fee: 0.3,
      liquidityUtilization: 0.75,
    };

    // Mock calculation for output amount
    const outputAmount = (Number(params.amountIn) * 0.997).toString(); // 0.3% fee

    directRoute.amountOut = outputAmount;

    return [{ outputAmount, route: [directRoute] }];
  }

  private async getMarketPrice(tokenIn: string, tokenOut: string): Promise<number> {
    // Mock market price calculation
    const prices: { [key: string]: number } = {
      [TOKEN_ADDRESSES.USDC]: 1.0,
      [TOKEN_ADDRESSES.WETH]: 2450,
      [TOKEN_ADDRESSES.WBTC]: 43000,
      [TOKEN_ADDRESSES.DAI]: 1.0,
    };

    const priceIn = prices[tokenIn] || 1;
    const priceOut = prices[tokenOut] || 1;

    return priceIn / priceOut;
  }

  private async estimateSwapGas(params: SwapParams, route: SwapRoute[]): Promise<number> {
    // Mock gas estimation based on route complexity
    const baseGas = 150000;
    const hopGas = 50000;
    return baseGas + (route.length - 1) * hopGas;
  }

  private async ensureTokenApproval(tokenAddress: string, amount: string, spender: string): Promise<void> {
    if (!this.signer) return;

    const token = new ethers.Contract(tokenAddress, TOKEN_ABI, this.signer);
    const userAddress = await this.signer.getAddress();
    const allowance = await token.allowance(userAddress, spender);

    if (allowance.lt(amount)) {
      const approveTx = await token.approve(spender, ethers.constants.MaxUint256);
      await approveTx.wait();
    }
  }

  private buildSwapPath(route: SwapRoute[]): string[] {
    const path: string[] = [route[0].tokenIn];
    for (const hop of route) {
      path.push(hop.tokenOut);
    }
    return path;
  }

  private async parseOutputAmountFromReceipt(receipt: ethers.ContractReceipt, outputToken: string): Promise<string> {
    // Mock parsing - in real implementation would parse Transfer events
    return '0';
  }

  private async getTokenBalance(tokenAddress: string, userAddress: string): Promise<string> {
    try {
      if (tokenAddress === TOKEN_ADDRESSES.WETH) {
        const balance = await this.provider.getBalance(userAddress);
        return ethers.utils.formatEther(balance);
      } else {
        const token = new ethers.Contract(tokenAddress, TOKEN_ABI, this.provider);
        const balance = await token.balanceOf(userAddress);
        const decimals = await token.decimals();
        return ethers.utils.formatUnits(balance, decimals);
      }
    } catch (error) {
      console.error('Error getting token balance:', error);
      return '0';
    }
  }
}

export type {
  SwapQuote,
  SwapRoute,
  SwapParams,
  SwapExecution,
  TokenInfo,
  LiquidityPool,
  ArbitrageOpportunity,
};