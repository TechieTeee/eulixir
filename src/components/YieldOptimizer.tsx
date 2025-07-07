'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Select,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  SimpleGrid,
  Divider,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Switch,
  FormControl,
  FormLabel,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Icon,
} from '@chakra-ui/react';
import { CheckIcon, WarningIcon, InfoIcon } from '@chakra-ui/icons';
import { useAccount } from 'wagmi';
import { 
  YieldOptimizer as YieldOptimizerEngine,
  YieldOpportunity,
  OptimizationStrategy,
  YieldAnalytics,
  RebalanceAction,
  AutoRebalanceConfig
} from '@/lib/yieldOptimizer';
import { getCurrentNetwork } from '@/config';

interface YieldOptimizerProps {
  onOptimizationComplete?: (strategy: OptimizationStrategy) => void;
}

export default function YieldOptimizer({ onOptimizationComplete }: YieldOptimizerProps) {
  const { address, isConnected } = useAccount();
  const { isOpen: isStrategyOpen, onOpen: onStrategyOpen, onClose: onStrategyClose } = useDisclosure();
  const { isOpen: isRebalanceOpen, onOpen: onRebalanceOpen, onClose: onRebalanceClose } = useDisclosure();
  const toast = useToast();

  const [optimizer, setOptimizer] = useState<YieldOptimizerEngine | null>(null);
  const [opportunities, setOpportunities] = useState<YieldOpportunity[]>([]);
  const [strategies, setStrategies] = useState<OptimizationStrategy[]>([]);
  const [analytics, setAnalytics] = useState<YieldAnalytics | null>(null);
  const [rebalanceActions, setRebalanceActions] = useState<RebalanceAction[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<OptimizationStrategy | null>(null);
  const [selectedAsset, setSelectedAsset] = useState('USDC');
  const [amount, setAmount] = useState('1000');
  const [riskTolerance, setRiskTolerance] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [portfolioValue, setPortfolioValue] = useState(10000);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [autoRebalanceConfig, setAutoRebalanceConfig] = useState<AutoRebalanceConfig>({
    enabled: false,
    maxSlippage: 1.0,
    minYieldDifference: 2.0,
    maxGasPerRebalance: '0.02',
    rebalanceFrequency: 24,
    apyThreshold: 5.0,
    ilThreshold: 5.0,
    riskToleranceChange: 2.0,
    whitelistedProtocols: ['EulerSwap', 'Euler Vaults'],
    blacklistedProtocols: [],
    emergencyWithdraw: {
      enabled: true,
      triggerConditions: ['Health factor < 1.1', 'IL > 20%'],
      targetAsset: 'USDC',
    },
  });

  // Initialize optimizer
  useEffect(() => {
    const network = getCurrentNetwork();
    const rpcUrl = `https://eth-${network.name}.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;
    const optimizerInstance = new YieldOptimizerEngine(rpcUrl);
    setOptimizer(optimizerInstance);
  }, []);

  // Load data
  useEffect(() => {
    if (optimizer) {
      loadData();
    }
  }, [optimizer, address, selectedAsset, amount, riskTolerance, portfolioValue]);

  const loadData = async () => {
    if (!optimizer) return;
    
    setLoadingData(true);
    try {
      // Load opportunities and strategies
      const [oppsData, strategiesData] = await Promise.all([
        optimizer.findYieldOpportunities(selectedAsset, amount, riskTolerance),
        optimizer.generateOptimizationStrategies(portfolioValue, riskTolerance as any),
      ]);
      
      setOpportunities(oppsData);
      setStrategies(strategiesData);
      
      // Load analytics and rebalance actions if connected
      if (address && isConnected) {
        const { analytics: analyticsData, rebalanceActions: actionsData } = 
          await optimizer.analyzePortfolio(address);
        setAnalytics(analyticsData);
        setRebalanceActions(actionsData);
      }
    } catch (error) {
      console.error('Error loading yield optimization data:', error);
      toast({
        title: 'Error loading data',
        description: 'Failed to load yield optimization data. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoadingData(false);
    }
  };

  const executeRebalance = async (action: RebalanceAction) => {
    if (!optimizer || !address) return;

    setLoading(true);
    try {
      // In a real implementation, this would execute the rebalance action
      toast({
        title: 'Rebalance initiated',
        description: `${action.type} action for ${action.asset} has been started`,
        status: 'info',
        duration: 5000,
        isClosable: true,
      });

      // Simulate execution time
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: 'Rebalance completed',
        description: `Successfully ${action.type.toLowerCase()}ed ${action.amount} ${action.asset}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Refresh data
      await loadData();
    } catch (error) {
      console.error('Error executing rebalance:', error);
      toast({
        title: 'Rebalance failed',
        description: error instanceof Error ? error.message : 'Failed to execute rebalance',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const executeStrategy = async (strategy: OptimizationStrategy) => {
    if (!optimizer || !address) return;

    setLoading(true);
    try {
      toast({
        title: 'Strategy deployment started',
        description: `Deploying ${strategy.name} strategy`,
        status: 'info',
        duration: 5000,
        isClosable: true,
      });

      // Simulate strategy execution
      await new Promise(resolve => setTimeout(resolve, 3000));

      toast({
        title: 'Strategy deployed successfully',
        description: `${strategy.name} is now active`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      if (onOptimizationComplete) {
        onOptimizationComplete(strategy);
      }

      await loadData();
    } catch (error) {
      console.error('Error executing strategy:', error);
      toast({
        title: 'Strategy deployment failed',
        description: error instanceof Error ? error.message : 'Failed to deploy strategy',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Low': case 'Conservative': return 'green';
      case 'Medium': case 'Moderate': return 'yellow';
      case 'High': case 'Aggressive': return 'red';
      default: return 'gray';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatAPY = (apy: number) => {
    return `${apy.toFixed(2)}%`;
  };

  if (loadingData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading yield optimization data...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl" fontWeight="bold">Yield Optimization Engine</Text>
            <Text color="gray.400" fontSize="sm">
              Maximize returns with intelligent portfolio management
            </Text>
          </VStack>
          <Button colorScheme="blue" onClick={loadData} isLoading={loadingData}>
            Refresh Data
          </Button>
        </HStack>

        {/* Connection Warning */}
        {!isConnected && (
          <Alert status="warning">
            <AlertIcon />
            <AlertTitle>Wallet not connected!</AlertTitle>
            <AlertDescription>
              Connect your wallet to access advanced optimization features.
            </AlertDescription>
          </Alert>
        )}

        {/* Configuration */}
        <Card>
          <CardHeader>
            <Text fontSize="lg" fontWeight="bold">Optimization Settings</Text>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
              <FormControl>
                <FormLabel>Asset</FormLabel>
                <Select
                  value={selectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value)}
                >
                  <option value="USDC">USDC</option>
                  <option value="WETH">WETH</option>
                  <option value="WBTC">WBTC</option>
                  <option value="DAI">DAI</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Amount</FormLabel>
                <Input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1000"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Portfolio Value ($)</FormLabel>
                <Input
                  value={portfolioValue}
                  onChange={(e) => setPortfolioValue(Number(e.target.value))}
                  type="number"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Risk Tolerance</FormLabel>
                <Box>
                  <Slider
                    value={riskTolerance === 'Low' ? 1 : riskTolerance === 'Medium' ? 2 : 3}
                    onChange={(value) => {
                      setRiskTolerance(value === 1 ? 'Low' : value === 2 ? 'Medium' : 'High');
                    }}
                    min={1}
                    max={3}
                    step={1}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                  <HStack justify="space-between" mt={1}>
                    <Text fontSize="xs" color="green.500">Low</Text>
                    <Text fontSize="xs" color="yellow.500">Medium</Text>
                    <Text fontSize="xs" color="red.500">High</Text>
                  </HStack>
                </Box>
              </FormControl>
            </SimpleGrid>
          </CardBody>
        </Card>

        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>Opportunities</Tab>
            <Tab>Strategies</Tab>
            <Tab>Portfolio Analytics</Tab>
            <Tab>Auto-Rebalance</Tab>
          </TabList>

          <TabPanels>
            {/* Opportunities Tab */}
            <TabPanel>
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
                {opportunities.map((opp) => (
                  <Card key={opp.id} borderWidth={1} borderRadius="lg">
                    <CardHeader>
                      <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                          <Text fontSize="lg" fontWeight="bold">{opp.protocol}</Text>
                          <Text fontSize="sm" color="gray.600">{opp.strategyType}</Text>
                        </VStack>
                        <Badge colorScheme={getRiskColor(opp.risk)}>{opp.risk} Risk</Badge>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <VStack align="stretch" spacing={3}>
                        <SimpleGrid columns={2} spacing={2}>
                          <Stat size="sm">
                            <StatLabel>Current APY</StatLabel>
                            <StatNumber fontSize="md" color="green.500">
                              {formatAPY(opp.currentAPY)}
                            </StatNumber>
                          </Stat>
                          <Stat size="sm">
                            <StatLabel>Projected APY</StatLabel>
                            <StatNumber fontSize="md" color="blue.500">
                              {formatAPY(opp.projectedAPY)}
                            </StatNumber>
                          </Stat>
                        </SimpleGrid>
                        
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">Net APY (after gas)</Text>
                          <Text fontSize="sm" fontWeight="bold" color="green.500">
                            {formatAPY(opp.netAPYAfterGas)}
                          </Text>
                        </HStack>
                        
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">Setup Time</Text>
                          <Text fontSize="sm">{opp.timeToSetup} min</Text>
                        </HStack>
                        
                        <Box>
                          <Text fontSize="sm" mb={1}>Liquidity Score</Text>
                          <Progress
                            value={opp.liquidityScore * 10}
                            colorScheme="blue"
                            size="sm"
                          />
                        </Box>
                        
                        <Accordion allowToggle size="sm">
                          <AccordionItem>
                            <AccordionButton>
                              <Box flex="1" textAlign="left">
                                <Text fontSize="sm">View Details</Text>
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel pb={4}>
                              <VStack align="stretch" spacing={2}>
                                <Text fontSize="xs" fontWeight="bold">Advantages:</Text>
                                {opp.advantages.map((adv, i) => (
                                  <HStack key={i} spacing={2}>
                                    <Icon as={CheckIcon} color="green.500" boxSize={3} />
                                    <Text fontSize="xs">{adv}</Text>
                                  </HStack>
                                ))}
                                
                                <Text fontSize="xs" fontWeight="bold" mt={2}>Risks:</Text>
                                {opp.risks.map((risk, i) => (
                                  <HStack key={i} spacing={2}>
                                    <Icon as={WarningIcon} color="red.500" boxSize={3} />
                                    <Text fontSize="xs">{risk}</Text>
                                  </HStack>
                                ))}
                              </VStack>
                            </AccordionPanel>
                          </AccordionItem>
                        </Accordion>
                        
                        <Button 
                          size="sm" 
                          colorScheme="blue"
                          isDisabled={!isConnected}
                        >
                          Deploy Strategy
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </TabPanel>

            {/* Strategies Tab */}
            <TabPanel>
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
                {strategies.map((strategy) => (
                  <Card key={strategy.id} borderWidth={1} borderRadius="lg">
                    <CardHeader>
                      <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                          <Text fontSize="lg" fontWeight="bold">{strategy.name}</Text>
                          <Badge colorScheme={getRiskColor(strategy.riskLevel)}>
                            {strategy.riskLevel}
                          </Badge>
                        </VStack>
                        <VStack align="end" spacing={1}>
                          <Text fontSize="2xl" fontWeight="bold" color="green.500">
                            {formatAPY(strategy.totalAPY)}
                          </Text>
                          <Text fontSize="xs" color="gray.500">Target APY</Text>
                        </VStack>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <VStack align="stretch" spacing={3}>
                        <Text fontSize="sm" color="gray.600">
                          {strategy.description}
                        </Text>
                        
                        <SimpleGrid columns={3} spacing={2}>
                          <Stat size="sm">
                            <StatLabel fontSize="xs">Sharpe Ratio</StatLabel>
                            <StatNumber fontSize="sm">{strategy.sharpeRatio}</StatNumber>
                          </Stat>
                          <Stat size="sm">
                            <StatLabel fontSize="xs">Max Drawdown</StatLabel>
                            <StatNumber fontSize="sm" color="red.500">
                              {strategy.maxDrawdown.toFixed(1)}%
                            </StatNumber>
                          </Stat>
                          <Stat size="sm">
                            <StatLabel fontSize="xs">Setup Time</StatLabel>
                            <StatNumber fontSize="sm">{strategy.estimatedSetupTime}m</StatNumber>
                          </Stat>
                        </SimpleGrid>
                        
                        <Divider />
                        
                        <Box>
                          <Text fontSize="sm" fontWeight="bold" mb={2}>Allocation:</Text>
                          <VStack spacing={1}>
                            {strategy.allocation.map((alloc, i) => (
                              <HStack key={i} justify="space-between" w="100%">
                                <Text fontSize="xs">{alloc.strategy}</Text>
                                <HStack spacing={2}>
                                  <Text fontSize="xs" color="gray.500">
                                    {alloc.percentage}%
                                  </Text>
                                  <Text fontSize="xs" fontWeight="bold">
                                    {formatAPY(alloc.currentAPY)}
                                  </Text>
                                </HStack>
                              </HStack>
                            ))}
                          </VStack>
                        </Box>
                        
                        <Button 
                          size="sm" 
                          colorScheme="blue"
                          onClick={() => {
                            setSelectedStrategy(strategy);
                            onStrategyOpen();
                          }}
                          isDisabled={!isConnected}
                        >
                          Deploy Strategy
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </TabPanel>

            {/* Portfolio Analytics Tab */}
            <TabPanel>
              {analytics ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  <Card>
                    <CardBody>
                      <Stat>
                        <StatLabel>Total Portfolio Value</StatLabel>
                        <StatNumber>{formatCurrency(analytics.totalPortfolioValueUSD)}</StatNumber>
                        <StatHelpText>
                          <StatArrow type="increase" />
                          {analytics.netReturn.toFixed(2)}% net return
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                  
                  <Card>
                    <CardBody>
                      <Stat>
                        <StatLabel>Weighted Average APY</StatLabel>
                        <StatNumber>{formatAPY(analytics.weightedAverageAPY)}</StatNumber>
                        <StatHelpText>
                          vs {formatAPY(analytics.benchmark.apy)} benchmark
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                  
                  <Card>
                    <CardBody>
                      <Stat>
                        <StatLabel>Portfolio Sharpe Ratio</StatLabel>
                        <StatNumber>{analytics.portfolioSharpeRatio.toFixed(2)}</StatNumber>
                        <StatHelpText>Risk-adjusted return</StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                  
                  <Card>
                    <CardBody>
                      <Stat>
                        <StatLabel>Yield (30d)</StatLabel>
                        <StatNumber color="green.500">
                          {formatCurrency(analytics.totalYieldUSD30d)}
                        </StatNumber>
                        <StatHelpText>Monthly earnings</StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                  
                  <Card>
                    <CardBody>
                      <Stat>
                        <StatLabel>Impermanent Loss</StatLabel>
                        <StatNumber color="red.500">
                          {analytics.impermanentLoss.toFixed(2)}%
                        </StatNumber>
                        <StatHelpText>Current IL exposure</StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                  
                  <Card>
                    <CardBody>
                      <Stat>
                        <StatLabel>Diversification Score</StatLabel>
                        <StatNumber>{analytics.diversificationScore.toFixed(1)}/10</StatNumber>
                        <StatHelpText>Portfolio balance</StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                </SimpleGrid>
              ) : (
                <Box textAlign="center" py={10}>
                  <Text color="gray.500">
                    {isConnected ? 'No portfolio data available' : 'Connect wallet to view analytics'}
                  </Text>
                </Box>
              )}
              
              {rebalanceActions.length > 0 && (
                <Card mt={6}>
                  <CardHeader>
                    <HStack justify="space-between">
                      <Text fontSize="lg" fontWeight="bold">Recommended Actions</Text>
                      <Button size="sm" colorScheme="blue" onClick={onRebalanceOpen}>
                        Review All
                      </Button>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <Table size="sm">
                      <Thead>
                        <Tr>
                          <Th>Action</Th>
                          <Th>Asset</Th>
                          <Th>Expected Gain</Th>
                          <Th>Priority</Th>
                          <Th>Execute</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {rebalanceActions.slice(0, 3).map((action) => (
                          <Tr key={action.id}>
                            <Td>{action.type}</Td>
                            <Td>{action.asset}</Td>
                            <Td color="green.500">+{action.expectedGain.toFixed(2)}%</Td>
                            <Td>
                              <Badge 
                                colorScheme={
                                  action.priority === 'High' ? 'red' :
                                  action.priority === 'Medium' ? 'yellow' : 'green'
                                }
                              >
                                {action.priority}
                              </Badge>
                            </Td>
                            <Td>
                              <Button
                                size="xs"
                                colorScheme="blue"
                                onClick={() => executeRebalance(action)}
                                isLoading={loading}
                                isDisabled={!action.autoExecute}
                              >
                                Execute
                              </Button>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </CardBody>
                </Card>
              )}
            </TabPanel>

            {/* Auto-Rebalance Tab */}
            <TabPanel>
              <Card>
                <CardHeader>
                  <HStack justify="space-between">
                    <Text fontSize="lg" fontWeight="bold">Auto-Rebalance Configuration</Text>
                    <Switch
                      isChecked={autoRebalanceConfig.enabled}
                      onChange={(e) => setAutoRebalanceConfig({
                        ...autoRebalanceConfig,
                        enabled: e.target.checked
                      })}
                      colorScheme="blue"
                    />
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl>
                        <FormLabel>Max Slippage (%)</FormLabel>
                        <Input
                          value={autoRebalanceConfig.maxSlippage}
                          onChange={(e) => setAutoRebalanceConfig({
                            ...autoRebalanceConfig,
                            maxSlippage: Number(e.target.value)
                          })}
                          type="number"
                          step="0.1"
                        />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Min Yield Difference (%)</FormLabel>
                        <Input
                          value={autoRebalanceConfig.minYieldDifference}
                          onChange={(e) => setAutoRebalanceConfig({
                            ...autoRebalanceConfig,
                            minYieldDifference: Number(e.target.value)
                          })}
                          type="number"
                          step="0.1"
                        />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>APY Threshold (%)</FormLabel>
                        <Input
                          value={autoRebalanceConfig.apyThreshold}
                          onChange={(e) => setAutoRebalanceConfig({
                            ...autoRebalanceConfig,
                            apyThreshold: Number(e.target.value)
                          })}
                          type="number"
                          step="0.1"
                        />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>IL Threshold (%)</FormLabel>
                        <Input
                          value={autoRebalanceConfig.ilThreshold}
                          onChange={(e) => setAutoRebalanceConfig({
                            ...autoRebalanceConfig,
                            ilThreshold: Number(e.target.value)
                          })}
                          type="number"
                          step="0.1"
                        />
                      </FormControl>
                    </SimpleGrid>
                    
                    <Alert status="info">
                      <AlertIcon />
                      <AlertDescription>
                        Auto-rebalancing will monitor your positions and execute optimizations
                        based on these thresholds. Ensure you have sufficient ETH for gas fees.
                      </AlertDescription>
                    </Alert>
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* Strategy Execution Modal */}
      <Modal isOpen={isStrategyOpen} onClose={onStrategyClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Deploy {selectedStrategy?.name}</ModalHeader>
          <ModalBody>
            {selectedStrategy && (
              <VStack spacing={4} align="stretch">
                <Text>{selectedStrategy.description}</Text>
                
                <SimpleGrid columns={2} spacing={4}>
                  <Stat>
                    <StatLabel>Target APY</StatLabel>
                    <StatNumber>{formatAPY(selectedStrategy.totalAPY)}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Required Capital</StatLabel>
                    <StatNumber>{formatCurrency(Number(selectedStrategy.requiredCapital))}</StatNumber>
                  </Stat>
                </SimpleGrid>
                
                <Alert status="warning">
                  <AlertIcon />
                  <AlertDescription>
                    This strategy involves {selectedStrategy.riskLevel.toLowerCase()} risk.
                    Please review all parameters before proceeding.
                  </AlertDescription>
                </Alert>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onStrategyClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={() => {
                if (selectedStrategy) executeStrategy(selectedStrategy);
                onStrategyClose();
              }}
              isLoading={loading}
            >
              Deploy Strategy
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}