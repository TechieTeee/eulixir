import { ethers } from 'ethers';
import { GraphQLClient } from 'graphql-request';

// EulerSwap Vault interfaces based on ERC-4626 and EVK
interface VaultInfo {
  address: string;
  name: string;
  symbol: string;
  asset: string;
  assetSymbol: string;
  assetDecimals: number;
  totalAssets: string;
  totalSupply: string;
  pricePerShare: string;
  supplyAPY: number;
  borrowAPY: number;
  utilization: number;
  maxCapacity: string;
  totalBorrowed: string;
  availableLiquidity: string;
  governor: string;
  feeReceiver: string;
  protocolFeeShare: number;
  interestFee: number;
  lastUpdateTimestamp: string;
}

interface UserVaultPosition {
  vaultAddress: string;
  vaultName: string;
  assetSymbol: string;
  shares: string;
  assets: string;
  assetsUSD: number;
  borrowBalance: string;
  borrowBalanceUSD: number;
  netPosition: number;
  netPositionUSD: number;
  supplyAPY: number;
  borrowAPY: number;
  healthFactor: number;
  canBorrow: boolean;
  maxBorrowAmount: string;
  maxWithdrawAmount: string;
  collateralEnabled: boolean;
  lastUpdateTimestamp: string;
}

interface VaultStrategy {
  id: string;
  name: string;
  description: string;
  vaultAddress: string;
  assetSymbol: string;
  targetAPY: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  strategyType: 'Lending' | 'Leverage' | 'Arbitrage' | 'Hedge';
  requiredCollateral: number;
  maxLeverage: number;
  steps: string[];
  pros: string[];
  cons: string[];
  estimatedGasCost: string;
  minimumDeposit: string;
}

interface VaultPerformanceMetrics {
  vaultAddress: string;
  totalValueLocked: string;
  totalValueLockedUSD: number;
  dailyVolume: string;
  dailyVolumeUSD: number;
  weeklyAPY: number;
  monthlyAPY: number;
  cumulativeReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  historicalAPY: Array<{
    timestamp: string;
    supplyAPY: number;
    borrowAPY: number;
    utilization: number;
    totalAssets: string;
  }>;
}

// ERC-4626 Vault ABI (simplified for key functions)
const VAULT_ABI = [
  // ERC-4626 Standard Functions
  'function asset() view returns (address)',
  'function totalAssets() view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function convertToShares(uint256 assets) view returns (uint256)',
  'function convertToAssets(uint256 shares) view returns (uint256)',
  'function maxDeposit(address) view returns (uint256)',
  'function maxMint(address) view returns (uint256)',
  'function maxWithdraw(address) view returns (uint256)',
  'function maxRedeem(address) view returns (uint256)',
  'function previewDeposit(uint256 assets) view returns (uint256)',
  'function previewMint(uint256 shares) view returns (uint256)',
  'function previewWithdraw(uint256 assets) view returns (uint256)',
  'function previewRedeem(uint256 shares) view returns (uint256)',
  'function deposit(uint256 assets, address receiver) returns (uint256)',
  'function mint(uint256 shares, address receiver) returns (uint256)',
  'function withdraw(uint256 assets, address receiver, address owner) returns (uint256)',
  'function redeem(uint256 shares, address receiver, address owner) returns (uint256)',
  
  // EVK Specific Functions
  'function borrow(uint256 amount, address receiver) returns (uint256)',
  'function repay(uint256 amount, address receiver) returns (uint256)',
  'function liquidate(address violator, address collateral, uint256 repayAssets, uint256 minYieldBalance) returns (uint256)',
  'function getAccountLiquidity(address account) view returns (uint256, uint256)',
  'function getVaultConfig() view returns (tuple(address governor, address feeReceiver, uint256 protocolFeeShare, uint256 interestFee))',
  'function getInterestRate() view returns (uint256)',
  'function getUtilization() view returns (uint256)',
  'function collateralLTV(address collateral) view returns (uint256)',
  'function borrowLTV(address collateral) view returns (uint256)',
  
  // Events
  'event Deposit(address indexed caller, address indexed owner, uint256 assets, uint256 shares)',
  'event Withdraw(address indexed caller, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)',
  'event Borrow(address indexed caller, address indexed receiver, uint256 amount)',
  'event Repay(address indexed caller, address indexed receiver, uint256 amount)',
];

// ERC-20 Token ABI for asset operations
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

// Known EulerSwap Vault Addresses (these would be updated with actual deployed addresses)
const KNOWN_VAULTS = {
  USDC: '0x0000000000000000000000000000000000000000', // Placeholder
  WETH: '0x0000000000000000000000000000000000000000', // Placeholder
  WBTC: '0x0000000000000000000000000000000000000000', // Placeholder
  DAI: '0x0000000000000000000000000000000000000000',  // Placeholder
};

export class EulerVaultConnector {
  private provider: ethers.providers.JsonRpcProvider;
  private signer?: ethers.Signer;
  private graphClient: GraphQLClient;
  
  constructor(
    rpcUrl: string, 
    signerOrProvider?: ethers.Signer | ethers.providers.Provider,
    subgraphUrl?: string
  ) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    if (signerOrProvider) {
      this.signer = signerOrProvider as ethers.Signer;
    }
    this.graphClient = new GraphQLClient(
      subgraphUrl || 'https://api.goldsky.com/api/public/project_clm0q3e5p03g101ic3u4r6c4e/subgraphs/euler-vault/stable/gn'
    );
  }

  // Get all available vaults
  async getAvailableVaults(): Promise<VaultInfo[]> {
    try {
      const vaults: VaultInfo[] = [];
      
      // For each known vault, get its info
      for (const [symbol, address] of Object.entries(KNOWN_VAULTS)) {
        if (address === '0x0000000000000000000000000000000000000000') continue;
        
        try {
          const vaultInfo = await this.getVaultInfo(address);
          vaults.push(vaultInfo);
        } catch (error) {
          console.warn(`Failed to get info for ${symbol} vault:`, error);
        }
      }
      
      // If no real vaults, return mock data
      if (vaults.length === 0) {
        return this.getMockVaults();
      }
      
      return vaults;
    } catch (error) {
      console.error('Error fetching available vaults:', error);
      return this.getMockVaults();
    }
  }

  // Get detailed information about a specific vault
  async getVaultInfo(vaultAddress: string): Promise<VaultInfo> {
    try {
      const vault = new ethers.Contract(vaultAddress, VAULT_ABI, this.provider);
      
      // Get basic vault info
      const [
        asset,
        totalAssets,
        totalSupply,
        name,
        symbol,
        vaultConfig,
        interestRate,
        utilization
      ] = await Promise.all([
        vault.asset(),
        vault.totalAssets(),
        vault.totalSupply(),
        vault.name?.() || 'Unknown Vault',
        vault.symbol?.() || 'VAULT',
        vault.getVaultConfig?.() || [ethers.constants.AddressZero, ethers.constants.AddressZero, 0, 0],
        vault.getInterestRate?.() || 0,
        vault.getUtilization?.() || 0,
      ]);

      // Get asset info
      const assetContract = new ethers.Contract(asset, TOKEN_ABI, this.provider);
      const [assetSymbol, assetDecimals] = await Promise.all([
        assetContract.symbol(),
        assetContract.decimals(),
      ]);

      // Calculate APY from interest rate (assuming per-second rate)
      const supplyAPY = this.calculateAPY(interestRate, utilization);
      const borrowAPY = supplyAPY * 1.2; // Approximate borrow rate

      // Calculate price per share
      const pricePerShare = totalSupply.gt(0) 
        ? totalAssets.mul(ethers.utils.parseUnits('1', 18)).div(totalSupply)
        : ethers.utils.parseUnits('1', 18);

      return {
        address: vaultAddress,
        name: name || `${assetSymbol} Vault`,
        symbol: symbol || `ev${assetSymbol}`,
        asset,
        assetSymbol,
        assetDecimals,
        totalAssets: totalAssets.toString(),
        totalSupply: totalSupply.toString(),
        pricePerShare: pricePerShare.toString(),
        supplyAPY,
        borrowAPY,
        utilization: Number(utilization) / 100,
        maxCapacity: ethers.constants.MaxUint256.toString(),
        totalBorrowed: '0', // Would need additional contract calls
        availableLiquidity: totalAssets.toString(),
        governor: vaultConfig[0] || ethers.constants.AddressZero,
        feeReceiver: vaultConfig[1] || ethers.constants.AddressZero,
        protocolFeeShare: Number(vaultConfig[2]) / 10000,
        interestFee: Number(vaultConfig[3]) / 10000,
        lastUpdateTimestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`Error getting vault info for ${vaultAddress}:`, error);
      throw error;
    }
  }

  // Get user's positions across all vaults
  async getUserVaultPositions(userAddress: string): Promise<UserVaultPosition[]> {
    try {
      const positions: UserVaultPosition[] = [];
      const vaults = await this.getAvailableVaults();
      
      for (const vault of vaults) {
        try {
          const position = await this.getUserVaultPosition(userAddress, vault.address);
          if (position && (Number(position.shares) > 0 || Number(position.borrowBalance) > 0)) {
            positions.push(position);
          }
        } catch (error) {
          console.warn(`Failed to get position for vault ${vault.address}:`, error);
        }
      }
      
      return positions;
    } catch (error) {
      console.error('Error fetching user vault positions:', error);
      return this.getMockUserPositions();
    }
  }

  // Get user's position in a specific vault
  async getUserVaultPosition(userAddress: string, vaultAddress: string): Promise<UserVaultPosition | null> {
    try {
      const vault = new ethers.Contract(vaultAddress, VAULT_ABI, this.provider);
      const vaultInfo = await this.getVaultInfo(vaultAddress);
      
      // Get user's balance and borrow info
      const [shares, borrowBalance, accountLiquidity] = await Promise.all([
        vault.balanceOf(userAddress),
        vault.borrowBalance?.(userAddress) || ethers.constants.Zero,
        vault.getAccountLiquidity?.(userAddress) || [ethers.constants.Zero, ethers.constants.Zero],
      ]);

      // Convert shares to assets
      const assets = shares.gt(0) ? await vault.convertToAssets(shares) : ethers.constants.Zero;
      
      // Calculate USD values (simplified)
      const assetPrice = await this.getAssetPrice(vaultInfo.assetSymbol);
      const assetsUSD = Number(ethers.utils.formatUnits(assets, vaultInfo.assetDecimals)) * assetPrice;
      const borrowBalanceUSD = Number(ethers.utils.formatUnits(borrowBalance, vaultInfo.assetDecimals)) * assetPrice;
      
      // Calculate net position
      const netPosition = Number(ethers.utils.formatUnits(assets, vaultInfo.assetDecimals)) - 
                          Number(ethers.utils.formatUnits(borrowBalance, vaultInfo.assetDecimals));
      
      // Calculate health factor
      const healthFactor = borrowBalance.gt(0) ? 
        Number(accountLiquidity[0]) / Number(borrowBalance) : 
        Number.MAX_SAFE_INTEGER;

      return {
        vaultAddress,
        vaultName: vaultInfo.name,
        assetSymbol: vaultInfo.assetSymbol,
        shares: shares.toString(),
        assets: assets.toString(),
        assetsUSD,
        borrowBalance: borrowBalance.toString(),
        borrowBalanceUSD,
        netPosition,
        netPositionUSD: netPosition * assetPrice,
        supplyAPY: vaultInfo.supplyAPY,
        borrowAPY: vaultInfo.borrowAPY,
        healthFactor,
        canBorrow: healthFactor > 1.2,
        maxBorrowAmount: '0', // Would need additional calculations
        maxWithdrawAmount: assets.toString(),
        collateralEnabled: true,
        lastUpdateTimestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`Error getting user position for vault ${vaultAddress}:`, error);
      return null;
    }
  }

  // Deposit assets into a vault
  async deposit(vaultAddress: string, amount: string, receiver?: string): Promise<ethers.ContractTransaction> {
    if (!this.signer) {
      throw new Error('No signer available for transactions');
    }

    const vault = new ethers.Contract(vaultAddress, VAULT_ABI, this.signer);
    const vaultInfo = await this.getVaultInfo(vaultAddress);
    
    // Check allowance and approve if needed
    const asset = new ethers.Contract(vaultInfo.asset, TOKEN_ABI, this.signer);
    const userAddress = await this.signer.getAddress();
    const allowance = await asset.allowance(userAddress, vaultAddress);
    const amountBN = ethers.utils.parseUnits(amount, vaultInfo.assetDecimals);
    
    if (allowance.lt(amountBN)) {
      const approveTx = await asset.approve(vaultAddress, amountBN);
      await approveTx.wait();
    }
    
    // Deposit
    return vault.deposit(amountBN, receiver || userAddress);
  }

  // Withdraw assets from a vault
  async withdraw(vaultAddress: string, amount: string, receiver?: string): Promise<ethers.ContractTransaction> {
    if (!this.signer) {
      throw new Error('No signer available for transactions');
    }

    const vault = new ethers.Contract(vaultAddress, VAULT_ABI, this.signer);
    const userAddress = await this.signer.getAddress();
    const vaultInfo = await this.getVaultInfo(vaultAddress);
    const amountBN = ethers.utils.parseUnits(amount, vaultInfo.assetDecimals);
    
    return vault.withdraw(amountBN, receiver || userAddress, userAddress);
  }

  // Borrow from a vault
  async borrow(vaultAddress: string, amount: string, receiver?: string): Promise<ethers.ContractTransaction> {
    if (!this.signer) {
      throw new Error('No signer available for transactions');
    }

    const vault = new ethers.Contract(vaultAddress, VAULT_ABI, this.signer);
    const userAddress = await this.signer.getAddress();
    const vaultInfo = await this.getVaultInfo(vaultAddress);
    const amountBN = ethers.utils.parseUnits(amount, vaultInfo.assetDecimals);
    
    return vault.borrow(amountBN, receiver || userAddress);
  }

  // Repay borrowed amount
  async repay(vaultAddress: string, amount: string): Promise<ethers.ContractTransaction> {
    if (!this.signer) {
      throw new Error('No signer available for transactions');
    }

    const vault = new ethers.Contract(vaultAddress, VAULT_ABI, this.signer);
    const userAddress = await this.signer.getAddress();
    const vaultInfo = await this.getVaultInfo(vaultAddress);
    const amountBN = ethers.utils.parseUnits(amount, vaultInfo.assetDecimals);
    
    // Approve repayment
    const asset = new ethers.Contract(vaultInfo.asset, TOKEN_ABI, this.signer);
    const allowance = await asset.allowance(userAddress, vaultAddress);
    
    if (allowance.lt(amountBN)) {
      const approveTx = await asset.approve(vaultAddress, amountBN);
      await approveTx.wait();
    }
    
    return vault.repay(amountBN, userAddress);
  }

  // Get vault strategies
  getVaultStrategies(): VaultStrategy[] {
    return [
      {
        id: 'lending-strategy',
        name: 'Conservative Lending',
        description: 'Earn steady yield by providing liquidity to the vault',
        vaultAddress: KNOWN_VAULTS.USDC,
        assetSymbol: 'USDC',
        targetAPY: 5.5,
        riskLevel: 'Low',
        strategyType: 'Lending',
        requiredCollateral: 0,
        maxLeverage: 1,
        steps: [
          'Deposit USDC into vault',
          'Earn yield from borrowers',
          'Compound returns automatically',
          'Withdraw anytime'
        ],
        pros: [
          'Low risk',
          'Steady returns',
          'High liquidity',
          'No impermanent loss'
        ],
        cons: [
          'Lower potential returns',
          'Dependent on borrowing demand',
          'Smart contract risk'
        ],
        estimatedGasCost: '0.01',
        minimumDeposit: '100',
      },
      {
        id: 'leverage-strategy',
        name: 'Leveraged Lending',
        description: 'Amplify returns by borrowing against collateral to increase position size',
        vaultAddress: KNOWN_VAULTS.WETH,
        assetSymbol: 'WETH',
        targetAPY: 12.8,
        riskLevel: 'Medium',
        strategyType: 'Leverage',
        requiredCollateral: 150,
        maxLeverage: 3,
        steps: [
          'Deposit WETH as collateral',
          'Borrow additional WETH',
          'Deposit borrowed WETH for more yield',
          'Manage liquidation risk'
        ],
        pros: [
          'Higher potential returns',
          'Leveraged exposure',
          'Flexible leverage ratio'
        ],
        cons: [
          'Liquidation risk',
          'Higher complexity',
          'Interest rate risk'
        ],
        estimatedGasCost: '0.05',
        minimumDeposit: '1000',
      },
      {
        id: 'arbitrage-strategy',
        name: 'Cross-Vault Arbitrage',
        description: 'Exploit rate differences between different vaults',
        vaultAddress: KNOWN_VAULTS.DAI,
        assetSymbol: 'DAI',
        targetAPY: 8.2,
        riskLevel: 'Medium',
        strategyType: 'Arbitrage',
        requiredCollateral: 120,
        maxLeverage: 2,
        steps: [
          'Identify rate differentials',
          'Borrow from low-rate vault',
          'Lend to high-rate vault',
          'Monitor and rebalance'
        ],
        pros: [
          'Market neutral',
          'Consistent profits',
          'Automated execution'
        ],
        cons: [
          'Requires active monitoring',
          'Gas costs',
          'Rate convergence risk'
        ],
        estimatedGasCost: '0.03',
        minimumDeposit: '500',
      },
      {
        id: 'hedge-strategy',
        name: 'Delta-Neutral Hedge',
        description: 'Hedge market exposure while earning yield',
        vaultAddress: KNOWN_VAULTS.WBTC,
        assetSymbol: 'WBTC',
        targetAPY: 9.5,
        riskLevel: 'High',
        strategyType: 'Hedge',
        requiredCollateral: 200,
        maxLeverage: 2,
        steps: [
          'Deposit WBTC in vault',
          'Short equivalent amount via perps',
          'Earn lending yield',
          'Maintain delta neutrality'
        ],
        pros: [
          'Market neutral',
          'Earn yield without price risk',
          'Sophisticated strategy'
        ],
        cons: [
          'Complex management',
          'Funding costs',
          'Execution risk'
        ],
        estimatedGasCost: '0.08',
        minimumDeposit: '2000',
      }
    ];
  }

  // Helper methods
  private calculateAPY(interestRate: ethers.BigNumber, utilization: ethers.BigNumber): number {
    // Convert from per-second rate to annual percentage
    const ratePerSecond = Number(interestRate) / 1e18;
    const utilizationRate = Number(utilization) / 10000;
    
    if (ratePerSecond === 0) return 0;
    
    // Compound interest calculation
    const secondsPerYear = 365 * 24 * 60 * 60;
    const apy = (Math.pow(1 + ratePerSecond, secondsPerYear) - 1) * 100 * utilizationRate;
    
    return Math.min(Math.max(apy, 0), 100); // Clamp between 0 and 100%
  }

  private async getAssetPrice(symbol: string): Promise<number> {
    // Mock prices - in production, would use price oracles
    const mockPrices: { [key: string]: number } = {
      'USDC': 1.0,
      'DAI': 1.0,
      'WETH': 2450,
      'WBTC': 43000,
      'ETH': 2450,
    };
    
    return mockPrices[symbol.toUpperCase()] || 1;
  }

  private getMockVaults(): VaultInfo[] {
    return [
      {
        address: '0x1234567890123456789012345678901234567890',
        name: 'USDC Vault',
        symbol: 'evUSDC',
        asset: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        assetSymbol: 'USDC',
        assetDecimals: 6,
        totalAssets: '10000000000000',
        totalSupply: '9500000000000',
        pricePerShare: '1050000000000000000',
        supplyAPY: 5.5,
        borrowAPY: 7.2,
        utilization: 0.72,
        maxCapacity: ethers.constants.MaxUint256.toString(),
        totalBorrowed: '7200000000000',
        availableLiquidity: '2800000000000',
        governor: '0x0000000000000000000000000000000000000000',
        feeReceiver: '0x0000000000000000000000000000000000000000',
        protocolFeeShare: 0.1,
        interestFee: 0.05,
        lastUpdateTimestamp: new Date().toISOString(),
      },
      {
        address: '0x2345678901234567890123456789012345678901',
        name: 'WETH Vault',
        symbol: 'evWETH',
        asset: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        assetSymbol: 'WETH',
        assetDecimals: 18,
        totalAssets: '5000000000000000000000',
        totalSupply: '4800000000000000000000',
        pricePerShare: '1040000000000000000',
        supplyAPY: 6.8,
        borrowAPY: 8.9,
        utilization: 0.68,
        maxCapacity: ethers.constants.MaxUint256.toString(),
        totalBorrowed: '3400000000000000000000',
        availableLiquidity: '1600000000000000000000',
        governor: '0x0000000000000000000000000000000000000000',
        feeReceiver: '0x0000000000000000000000000000000000000000',
        protocolFeeShare: 0.1,
        interestFee: 0.05,
        lastUpdateTimestamp: new Date().toISOString(),
      }
    ];
  }

  private getMockUserPositions(): UserVaultPosition[] {
    return [
      {
        vaultAddress: '0x1234567890123456789012345678901234567890',
        vaultName: 'USDC Vault',
        assetSymbol: 'USDC',
        shares: '1000000000',
        assets: '1050000000',
        assetsUSD: 1050,
        borrowBalance: '200000000',
        borrowBalanceUSD: 200,
        netPosition: 850,
        netPositionUSD: 850,
        supplyAPY: 5.5,
        borrowAPY: 7.2,
        healthFactor: 5.25,
        canBorrow: true,
        maxBorrowAmount: '300000000',
        maxWithdrawAmount: '1050000000',
        collateralEnabled: true,
        lastUpdateTimestamp: new Date().toISOString(),
      }
    ];
  }
}

export type { 
  VaultInfo, 
  UserVaultPosition, 
  VaultStrategy, 
  VaultPerformanceMetrics 
};