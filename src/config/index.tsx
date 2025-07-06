import { cookieStorage, createStorage, http } from '@wagmi/core';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, sepolia } from '@reown/appkit/networks';

// Environment variables with better validation
export const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;
const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

// Validate required environment variables
if (!projectId) {
  throw new Error('NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID is required');
}

if (!alchemyApiKey) {
  console.warn('NEXT_PUBLIC_ALCHEMY_API_KEY is not set, using public RPC endpoints');
}

// Network configuration
export const networks = [mainnet, sepolia];

// RPC URL configuration with fallbacks
const getRpcUrl = (network: 'mainnet' | 'sepolia'): string => {
  if (alchemyApiKey) {
    return `https://eth-${network}.g.alchemy.com/v2/${alchemyApiKey}`;
  }
  
  // Fallback to public RPC endpoints
  const publicRpcUrls = {
    mainnet: 'https://eth.llamarpc.com',
    sepolia: 'https://rpc.sepolia.org',
  };
  
  return publicRpcUrls[network];
};

// Wagmi adapter configuration
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks,
  transports: {
    [mainnet.id]: http(getRpcUrl('mainnet'), {
      // Add retry configuration for better reliability
      retryCount: 3,
      retryDelay: 1000,
    }),
    [sepolia.id]: http(getRpcUrl('sepolia'), {
      retryCount: 3,
      retryDelay: 1000,
    }),
  },
});

// Export wagmi config
export const config = wagmiAdapter.wagmiConfig;

// Helper function to get current network
export const getCurrentNetwork = () => {
  const isDev = process.env.NODE_ENV === 'development';
  const forceTestnet = process.env.NEXT_PUBLIC_NETWORK === 'sepolia';
  
  return forceTestnet || isDev ? sepolia : mainnet;
};

// Helper function to check if we're on testnet
export const isTestnet = () => {
  return getCurrentNetwork().id === sepolia.id;
};

// Export network constants for use in other parts of the app
export const NETWORK_CONFIG = {
  mainnet: {
    id: mainnet.id,
    name: mainnet.name,
    rpcUrl: getRpcUrl('mainnet'),
    chainlinkEthUsd: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
    usdcAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    wethAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  },
  sepolia: {
    id: sepolia.id,
    name: sepolia.name,
    rpcUrl: getRpcUrl('sepolia'),
    // Sepolia testnet addresses (these may need to be updated based on actual deployments)
    chainlinkEthUsd: '0x694AA1769357215DE4FAC081bf1f309aDC325306', // Sepolia ETH/USD feed
    usdcAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Sepolia USDC (example)
    wethAddress: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', // Sepolia WETH (example)
  },
} as const;

// Helper to get network-specific addresses
export const getNetworkConfig = (networkId?: number) => {
  const currentNetworkId = networkId || getCurrentNetwork().id;
  return currentNetworkId === mainnet.id ? NETWORK_CONFIG.mainnet : NETWORK_CONFIG.sepolia;
};