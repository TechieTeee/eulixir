"use client";

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  HStack,
  Text,
  VStack,
  Avatar,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Tooltip,
  Flex,
} from '@chakra-ui/react';
import { createAppKit } from '@reown/appkit/react';
import { wagmiAdapter, projectId, networks } from '@/config';
import { useAccount, useBalance, useDisconnect, useEnsName } from 'wagmi';
import { formatEther } from 'viem';
import { 
  Wallet, 
  LogOut, 
  Copy, 
  ExternalLink,
  ChevronDown,
  AlertCircle,
  CheckCircle 
} from 'lucide-react';

// Initialize AppKit
const appKit = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  defaultNetwork: networks[0],
  metadata: {
    name: 'Eulixir',
    description: 'Advanced DeFi Analytics Platform',
    url: 'https://eulixir.com',
    icons: ['https://eulixir.com/icon.png']
  },
  features: {
    analytics: true,
    email: false,
    socials: [],
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': 'rgb(147, 51, 234)',
    '--w3m-border-radius-master': '12px',
  }
});

interface WalletConnectionProps {
  compact?: boolean;
  showBalance?: boolean;
  showNetwork?: boolean;
}

export default function WalletConnection({ 
  compact = false, 
  showBalance = true,
  showNetwork = true 
}: WalletConnectionProps) {
  const { address, isConnected, chain } = useAccount();
  const { data: balance } = useBalance({ address });
  const { data: ensName } = useEnsName({ address });
  const { disconnect } = useDisconnect();
  const toast = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleConnect = () => {
    appKit.open();
  };

  const handleDisconnect = () => {
    disconnect();
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected successfully",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const openExplorer = () => {
    if (address && chain) {
      const explorerUrl = chain.blockExplorers?.default?.url;
      if (explorerUrl) {
        window.open(`${explorerUrl}/address/${address}`, '_blank');
      }
    }
  };

  const formatAddress = (addr: string): string => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatBalance = (balance: bigint): string => {
    const ethBalance = parseFloat(formatEther(balance));
    if (ethBalance < 0.0001) return '< 0.0001';
    if (ethBalance < 1) return ethBalance.toFixed(4);
    return ethBalance.toFixed(3);
  };

  const getNetworkStatus = () => {
    if (!chain) return { color: 'gray', status: 'Unknown' };
    
    const isMainnet = chain.id === 1;
    return {
      color: isMainnet ? 'green' : 'yellow',
      status: isMainnet ? 'Mainnet' : chain.name || 'Testnet'
    };
  };

  // Don't render on server to avoid hydration issues
  if (!isClient) {
    return (
      <Button
        variant="outline"
        colorScheme="purple"
        size={compact ? "sm" : "md"}
        isLoading
        loadingText="Loading..."
      />
    );
  }

  if (!isConnected || !address) {
    return (
      <Button
        leftIcon={<Wallet className="w-4 h-4" />}
        onClick={handleConnect}
        colorScheme="purple"
        variant="solid"
        size={compact ? "sm" : "md"}
        _hover={{
          transform: "translateY(-1px)",
          boxShadow: "0 8px 25px rgba(147, 51, 234, 0.3)"
        }}
      >
        Connect Wallet
      </Button>
    );
  }

  if (compact) {
    return (
      <Menu>
        <MenuButton
          as={Button}
          rightIcon={<ChevronDown className="w-3 h-3" />}
          size="sm"
          variant="outline"
          colorScheme="purple"
        >
          <HStack spacing={2}>
            <Box
              w={2}
              h={2}
              borderRadius="full"
              bg="green.400"
            />
            <Text fontSize="sm">
              {ensName || formatAddress(address)}
            </Text>
          </HStack>
        </MenuButton>
        <MenuList
          bg="rgba(26, 32, 44, 0.95)"
          border="1px solid"
          borderColor="rgba(255, 255, 255, 0.1)"
        >
          <MenuItem onClick={copyAddress} icon={<Copy className="w-4 h-4" />}>
            Copy Address
          </MenuItem>
          <MenuItem onClick={openExplorer} icon={<ExternalLink className="w-4 h-4" />}>
            View on Explorer
          </MenuItem>
          <MenuItem onClick={() => appKit.open()} icon={<Wallet className="w-4 h-4" />}>
            Wallet Settings
          </MenuItem>
          <MenuItem onClick={handleDisconnect} icon={<LogOut className="w-4 h-4" />} color="red.400">
            Disconnect
          </MenuItem>
        </MenuList>
      </Menu>
    );
  }

  const networkStatus = getNetworkStatus();

  return (
    <HStack spacing={4}>
      {/* Network Status */}
      {showNetwork && (
        <Tooltip label={`Connected to ${networkStatus.status}`}>
          <Badge
            colorScheme={networkStatus.color}
            variant="subtle"
            display="flex"
            alignItems="center"
            gap={1}
            px={2}
            py={1}
          >
            <Box
              w={2}
              h={2}
              borderRadius="full"
              bg={`${networkStatus.color}.400`}
            />
            {networkStatus.status}
          </Badge>
        </Tooltip>
      )}

      {/* Balance Display */}
      {showBalance && balance && (
        <VStack spacing={0} align="end">
          <Text fontSize="sm" fontWeight="bold" color="white">
            {formatBalance(balance.value)} ETH
          </Text>
          <Text fontSize="xs" color="gray.400">
            ${(parseFloat(formatEther(balance.value)) * 2450).toFixed(2)}
          </Text>
        </VStack>
      )}

      {/* Wallet Menu */}
      <Menu>
        <MenuButton
          as={Button}
          rightIcon={<ChevronDown className="w-4 h-4" />}
          variant="outline"
          colorScheme="purple"
          size="md"
          _hover={{
            transform: "translateY(-1px)",
            boxShadow: "0 8px 25px rgba(147, 51, 234, 0.2)"
          }}
        >
          <HStack spacing={3}>
            <Avatar size="sm" name={address} bg="purple.500" />
            <VStack spacing={0} align="start">
              <Text fontSize="sm" fontWeight="bold">
                {ensName || formatAddress(address)}
              </Text>
              <HStack spacing={1}>
                <CheckCircle className="w-3 h-3 text-green-400" />
                <Text fontSize="xs" color="green.400">
                  Connected
                </Text>
              </HStack>
            </VStack>
          </HStack>
        </MenuButton>

        <MenuList
          bg="rgba(26, 32, 44, 0.95)"
          border="1px solid"
          borderColor="rgba(255, 255, 255, 0.1)"
          minW="250px"
        >
          {/* Wallet Info */}
          <Box px={3} py={2}>
            <VStack spacing={2} align="start">
              <HStack justify="space-between" w="full">
                <Text fontSize="xs" color="gray.400">WALLET ADDRESS</Text>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={copyAddress}
                  leftIcon={<Copy className="w-3 h-3" />}
                >
                  Copy
                </Button>
              </HStack>
              <Text fontSize="sm" fontFamily="mono" color="white">
                {formatAddress(address)}
              </Text>
              
              {balance && (
                <>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="xs" color="gray.400">BALANCE</Text>
                  </HStack>
                  <Text fontSize="sm" fontWeight="bold" color="green.400">
                    {formatBalance(balance.value)} ETH
                  </Text>
                </>
              )}
            </VStack>
          </Box>

          <Box h="1px" bg="rgba(255, 255, 255, 0.1)" my={2} />

          {/* Menu Items */}
          <MenuItem onClick={() => appKit.open()} icon={<Wallet className="w-4 h-4" />}>
            Wallet Settings
          </MenuItem>
          <MenuItem onClick={openExplorer} icon={<ExternalLink className="w-4 h-4" />}>
            View on Explorer
          </MenuItem>
          <MenuItem onClick={handleDisconnect} icon={<LogOut className="w-4 h-4" />} color="red.400">
            Disconnect Wallet
          </MenuItem>
        </MenuList>
      </Menu>
    </HStack>
  );
}

// Connection Status Component
export function ConnectionStatus() {
  const { isConnected, address } = useAccount();

  return (
    <HStack spacing={2}>
      <Box
        w={3}
        h={3}
        borderRadius="full"
        bg={isConnected ? "green.400" : "red.400"}
      />
      <Text fontSize="sm" color="gray.400">
        {isConnected ? `Connected: ${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Not Connected'}
      </Text>
    </HStack>
  );
}

// Wallet Guard Component - wraps components that require wallet connection
export function WalletGuard({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        minH="300px"
        bg="rgba(26, 32, 44, 0.8)"
        borderRadius="xl"
        border="1px solid"
        borderColor="rgba(255, 255, 255, 0.1)"
        p={8}
      >
        <VStack spacing={4}>
          <Wallet size={48} color="rgba(147, 51, 234, 0.6)" />
          <VStack spacing={2} textAlign="center">
            <Text fontSize="lg" fontWeight="bold" color="white">
              Wallet Connection Required
            </Text>
            <Text color="gray.400" maxW="400px">
              Please connect your wallet to access this feature and view your personalized DeFi data.
            </Text>
          </VStack>
          <WalletConnection />
        </VStack>
      </Flex>
    );
  }

  return <>{children}</>;
}