'use client';

import { useState, useEffect, Suspense } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  SimpleGrid,
  Divider,
  Spinner,
} from '@chakra-ui/react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { 
  EulerVaultConnector, 
  VaultInfo, 
  UserVaultPosition, 
  VaultStrategy 
} from '@/lib/eulerVaultConnector';
import { getCurrentNetwork } from '@/config';
import YieldOptimizer from './YieldOptimizer';

interface VaultManagerProps {
  onVaultAction?: (action: string, vaultAddress: string, amount: string) => void;
}

export default function VaultManager({ onVaultAction }: VaultManagerProps) {
  const { address, isConnected } = useAccount();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [vaultConnector, setVaultConnector] = useState<EulerVaultConnector | null>(null);
  const [vaults, setVaults] = useState<VaultInfo[]>([]);
  const [userPositions, setUserPositions] = useState<UserVaultPosition[]>([]);
  const [strategies, setStrategies] = useState<VaultStrategy[]>([]);
  const [selectedVault, setSelectedVault] = useState<VaultInfo | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<VaultStrategy | null>(null);
  const [actionType, setActionType] = useState<'deposit' | 'withdraw' | 'borrow' | 'repay'>('deposit');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Initialize vault connector
  useEffect(() => {
    const network = getCurrentNetwork();
    const rpcUrl = `https://eth-${network.name}.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;
    const connector = new EulerVaultConnector(rpcUrl);
    setVaultConnector(connector);
  }, []);

  // Load vault data
  useEffect(() => {
    if (vaultConnector) {
      loadVaultData();
    }
  }, [vaultConnector, address]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadVaultData = async () => {
    if (!vaultConnector) return;
    
    setLoadingData(true);
    try {
      // Load vaults and strategies
      const [vaultsData, strategiesData] = await Promise.all([
        vaultConnector.getAvailableVaults(),
        vaultConnector.getVaultStrategies(),
      ]);
      
      setVaults(vaultsData);
      setStrategies(strategiesData);
      
      // Load user positions if connected
      if (address && isConnected) {
        const positions = await vaultConnector.getUserVaultPositions(address);
        setUserPositions(positions);
      }
    } catch (error) {
      console.error('Error loading vault data:', error);
      toast({
        title: 'Error loading vault data',
        description: 'Failed to load vault information. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleVaultAction = async (action: 'deposit' | 'withdraw' | 'borrow' | 'repay') => {
    if (!vaultConnector || !selectedVault || !amount) return;
    
    setLoading(true);
    try {
      let tx: ethers.ContractTransaction;
      
      switch (action) {
        case 'deposit':
          tx = await vaultConnector.deposit(selectedVault.address, amount);
          break;
        case 'withdraw':
          tx = await vaultConnector.withdraw(selectedVault.address, amount);
          break;
        case 'borrow':
          tx = await vaultConnector.borrow(selectedVault.address, amount);
          break;
        case 'repay':
          tx = await vaultConnector.repay(selectedVault.address, amount);
          break;
        default:
          throw new Error('Invalid action');
      }
      
      toast({
        title: `${action.charAt(0).toUpperCase() + action.slice(1)} transaction submitted`,
        description: `Transaction hash: ${tx.hash}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Wait for transaction confirmation
      await tx.wait();
      
      toast({
        title: 'Transaction confirmed',
        description: `${action.charAt(0).toUpperCase() + action.slice(1)} completed successfully`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Refresh data and close modal
      await loadVaultData();
      onClose();
      setAmount('');
      
      // Notify parent component
      if (onVaultAction) {
        onVaultAction(action, selectedVault.address, amount);
      }
    } catch (error) {
      console.error(`Error ${action}ing:`, error);
      toast({
        title: `${action.charAt(0).toUpperCase() + action.slice(1)} failed`,
        description: error instanceof Error ? error.message : 'Transaction failed. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const openVaultModal = (vault: VaultInfo, action: 'deposit' | 'withdraw' | 'borrow' | 'repay') => {
    setSelectedVault(vault);
    setActionType(action);
    onOpen();
  };

  const openStrategyModal = (strategy: VaultStrategy) => {
    setSelectedStrategy(strategy);
    onOpen();
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Low': return 'green';
      case 'Medium': return 'yellow';
      case 'High': return 'red';
      default: return 'gray';
    }
  };

  const formatAPY = (apy: number) => {
    return `${apy.toFixed(2)}%`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };


  if (loadingData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading vault data...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <Text fontSize="2xl" fontWeight="bold">EulerSwap Vault Manager</Text>
          <Button colorScheme="blue" onClick={loadVaultData} isLoading={loadingData}>
            Refresh Data
          </Button>
        </HStack>

        {/* Connection Warning */}
        {!isConnected && (
          <Alert status="warning">
            <AlertIcon />
            <AlertTitle>Wallet not connected!</AlertTitle>
            <AlertDescription>
              Please connect your wallet to interact with vaults.
            </AlertDescription>
          </Alert>
        )}

        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>Available Vaults</Tab>
            <Tab>My Positions</Tab>
            <Tab>Strategies</Tab>
            <Tab>Yield Optimizer</Tab>
          </TabList>

          <TabPanels>
            {/* Available Vaults Tab */}
            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {vaults.map((vault) => (
                  <Card key={vault.address} borderWidth={1} borderRadius="lg">
                    <CardHeader>
                      <HStack justify="space-between">
                        <Text fontSize="lg" fontWeight="bold">{vault.name}</Text>
                        <Badge colorScheme="blue">{vault.symbol}</Badge>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <VStack align="stretch" spacing={3}>
                        <SimpleGrid columns={2} spacing={2}>
                          <Stat size="sm">
                            <StatLabel>Supply APY</StatLabel>
                            <StatNumber fontSize="md" color="green.500">
                              {formatAPY(vault.supplyAPY)}
                            </StatNumber>
                          </Stat>
                          <Stat size="sm">
                            <StatLabel>Borrow APY</StatLabel>
                            <StatNumber fontSize="md" color="red.500">
                              {formatAPY(vault.borrowAPY)}
                            </StatNumber>
                          </Stat>
                        </SimpleGrid>
                        
                        <Box>
                          <Text fontSize="sm" mb={1}>Utilization</Text>
                          <Progress 
                            value={vault.utilization * 100} 
                            colorScheme={vault.utilization > 0.8 ? 'red' : 'green'}
                            size="sm"
                          />
                          <Text fontSize="xs" color="gray.500">
                            {(vault.utilization * 100).toFixed(1)}%
                          </Text>
                        </Box>
                        
                        <Divider />
                        
                        <HStack spacing={2}>
                          <Button 
                            size="sm" 
                            colorScheme="green" 
                            onClick={() => openVaultModal(vault, 'deposit')}
                            isDisabled={!isConnected}
                          >
                            Deposit
                          </Button>
                          <Button 
                            size="sm" 
                            colorScheme="blue" 
                            onClick={() => openVaultModal(vault, 'withdraw')}
                            isDisabled={!isConnected}
                          >
                            Withdraw
                          </Button>
                          <Button 
                            size="sm" 
                            colorScheme="orange" 
                            onClick={() => openVaultModal(vault, 'borrow')}
                            isDisabled={!isConnected}
                          >
                            Borrow
                          </Button>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </TabPanel>

            {/* My Positions Tab */}
            <TabPanel>
              {userPositions.length > 0 ? (
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Vault</Th>
                      <Th>Asset</Th>
                      <Th>Supplied</Th>
                      <Th>Borrowed</Th>
                      <Th>Net Position</Th>
                      <Th>Health Factor</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {userPositions.map((position) => (
                      <Tr key={position.vaultAddress}>
                        <Td>{position.vaultName}</Td>
                        <Td>{position.assetSymbol}</Td>
                        <Td>
                          <Text>{formatCurrency(position.assetsUSD)}</Text>
                          <Text fontSize="sm" color="gray.500">
                            {formatAPY(position.supplyAPY)}
                          </Text>
                        </Td>
                        <Td>
                          <Text>{formatCurrency(position.borrowBalanceUSD)}</Text>
                          <Text fontSize="sm" color="gray.500">
                            {formatAPY(position.borrowAPY)}
                          </Text>
                        </Td>
                        <Td>
                          <Text 
                            color={position.netPositionUSD >= 0 ? 'green.500' : 'red.500'}
                            fontWeight="bold"
                          >
                            {formatCurrency(position.netPositionUSD)}
                          </Text>
                        </Td>
                        <Td>
                          <Badge 
                            colorScheme={position.healthFactor > 2 ? 'green' : 
                                       position.healthFactor > 1.5 ? 'yellow' : 'red'}
                          >
                            {position.healthFactor.toFixed(2)}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={1}>
                            <Button 
                              size="xs" 
                              colorScheme="blue"
                              onClick={() => {
                                const vault = vaults.find(v => v.address === position.vaultAddress);
                                if (vault) openVaultModal(vault, 'withdraw');
                              }}
                            >
                              Withdraw
                            </Button>
                            <Button 
                              size="xs" 
                              colorScheme="green"
                              onClick={() => {
                                const vault = vaults.find(v => v.address === position.vaultAddress);
                                if (vault) openVaultModal(vault, 'repay');
                              }}
                            >
                              Repay
                            </Button>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              ) : (
                <Box textAlign="center" py={10}>
                  <Text fontSize="lg" color="gray.500">
                    {isConnected ? 'No vault positions found' : 'Connect wallet to view positions'}
                  </Text>
                </Box>
              )}
            </TabPanel>

            {/* Strategies Tab */}
            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {strategies.map((strategy) => (
                  <Card key={strategy.id} borderWidth={1} borderRadius="lg">
                    <CardHeader>
                      <HStack justify="space-between">
                        <Text fontSize="lg" fontWeight="bold">{strategy.name}</Text>
                        <Badge colorScheme={getRiskColor(strategy.riskLevel)}>
                          {strategy.riskLevel} Risk
                        </Badge>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <VStack align="stretch" spacing={3}>
                        <Text fontSize="sm" color="gray.600">
                          {strategy.description}
                        </Text>
                        
                        <SimpleGrid columns={2} spacing={2}>
                          <Stat size="sm">
                            <StatLabel>Target APY</StatLabel>
                            <StatNumber fontSize="md" color="green.500">
                              {formatAPY(strategy.targetAPY)}
                            </StatNumber>
                          </Stat>
                          <Stat size="sm">
                            <StatLabel>Min. Deposit</StatLabel>
                            <StatNumber fontSize="md">
                              {formatCurrency(Number(strategy.minimumDeposit))}
                            </StatNumber>
                          </Stat>
                        </SimpleGrid>
                        
                        <Box>
                          <Text fontSize="sm" fontWeight="bold" mb={1}>Strategy Steps:</Text>
                          <VStack align="stretch" spacing={1}>
                            {strategy.steps.slice(0, 3).map((step, index) => (
                              <Text key={index} fontSize="xs" color="gray.600">
                                {index + 1}. {step}
                              </Text>
                            ))}
                          </VStack>
                        </Box>
                        
                        <Button 
                          size="sm" 
                          colorScheme="purple" 
                          onClick={() => openStrategyModal(strategy)}
                          isDisabled={!isConnected}
                        >
                          View Strategy
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </TabPanel>

            {/* Yield Optimizer Tab */}
            <TabPanel>
              <Suspense fallback={<Spinner size="xl" />}>
                <YieldOptimizer onOptimizationComplete={(strategy) => {
                  console.log('Optimization strategy completed:', strategy);
                  // Refresh vault data when optimization completes
                  loadVaultData();
                }} />
              </Suspense>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* Action Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedVault ? 
              `${actionType.charAt(0).toUpperCase() + actionType.slice(1)} ${selectedVault.assetSymbol}` :
              selectedStrategy ? `${selectedStrategy.name} Strategy` : ''
            }
          </ModalHeader>
          <ModalBody>
            {selectedVault && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    {actionType === 'deposit' && 'Enter amount to deposit'}
                    {actionType === 'withdraw' && 'Enter amount to withdraw'}
                    {actionType === 'borrow' && 'Enter amount to borrow'}
                    {actionType === 'repay' && 'Enter amount to repay'}
                  </Text>
                  <Input
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    type="number"
                    step="0.01"
                  />
                </Box>
                
                <SimpleGrid columns={2} spacing={4}>
                  <Stat size="sm">
                    <StatLabel>Current APY</StatLabel>
                    <StatNumber fontSize="md">
                      {formatAPY(actionType === 'deposit' || actionType === 'withdraw' ? 
                        selectedVault.supplyAPY : selectedVault.borrowAPY)}
                    </StatNumber>
                  </Stat>
                  <Stat size="sm">
                    <StatLabel>Utilization</StatLabel>
                    <StatNumber fontSize="md">
                      {(selectedVault.utilization * 100).toFixed(1)}%
                    </StatNumber>
                  </Stat>
                </SimpleGrid>
              </VStack>
            )}
            
            {selectedStrategy && (
              <VStack spacing={4} align="stretch">
                <Text fontSize="sm" color="gray.600">
                  {selectedStrategy.description}
                </Text>
                
                <SimpleGrid columns={2} spacing={4}>
                  <Stat size="sm">
                    <StatLabel>Target APY</StatLabel>
                    <StatNumber fontSize="md">{formatAPY(selectedStrategy.targetAPY)}</StatNumber>
                  </Stat>
                  <Stat size="sm">
                    <StatLabel>Max Leverage</StatLabel>
                    <StatNumber fontSize="md">{selectedStrategy.maxLeverage}x</StatNumber>
                  </Stat>
                </SimpleGrid>
                
                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={2}>Pros:</Text>
                  <VStack align="stretch" spacing={1}>
                    {selectedStrategy.pros.map((pro, index) => (
                      <Text key={index} fontSize="xs" color="green.600">
                        ✓ {pro}
                      </Text>
                    ))}
                  </VStack>
                </Box>
                
                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={2}>Cons:</Text>
                  <VStack align="stretch" spacing={1}>
                    {selectedStrategy.cons.map((con, index) => (
                      <Text key={index} fontSize="xs" color="red.600">
                        ✗ {con}
                      </Text>
                    ))}
                  </VStack>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            {selectedVault && (
              <Button 
                colorScheme="blue" 
                onClick={() => handleVaultAction(actionType)}
                isLoading={loading}
                isDisabled={!amount || Number(amount) <= 0}
              >
                {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
              </Button>
            )}
            {selectedStrategy && (
              <Button colorScheme="purple" onClick={onClose}>
                Implement Strategy
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}