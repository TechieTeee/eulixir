'use client';

import { useState, useEffect, useCallback } from 'react';
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
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  IconButton,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Switch,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { ArrowUpDownIcon, SettingsIcon, InfoIcon } from '@chakra-ui/icons';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { 
  EulerSwapTrader, 
  SwapQuote, 
  SwapParams, 
  TokenInfo,
  ArbitrageOpportunity 
} from '@/lib/eulerSwapTrader';
import { getCurrentNetwork } from '@/config';
import { SuccessOwl } from './OwlMascot';

interface SwapInterfaceProps {
  onSwapComplete?: (hash: string) => void;
  defaultTokenIn?: string;
  defaultTokenOut?: string;
}

export default function SwapInterface({ 
  onSwapComplete, 
  defaultTokenIn = 'USDC',
  defaultTokenOut = 'WETH' 
}: SwapInterfaceProps) {
  const { address, isConnected } = useAccount();
  const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure();
  const { isOpen: isQuoteOpen, onOpen: onQuoteOpen, onClose: onQuoteClose } = useDisclosure();
  const toast = useToast();

  const [trader, setTrader] = useState<EulerSwapTrader | null>(null);
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [tokenIn, setTokenIn] = useState<TokenInfo | null>(null);
  const [tokenOut, setTokenOut] = useState<TokenInfo | null>(null);
  const [amountIn, setAmountIn] = useState('');
  const [amountOut, setAmountOut] = useState('');
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [slippage, setSlippage] = useState(0.5);
  const [deadline, setDeadline] = useState(20);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [arbitrageOpps, setArbitrageOpps] = useState<ArbitrageOpportunity[]>([]);
  const [showSuccessOwl, setShowSuccessOwl] = useState(false);

  // Initialize trader
  useEffect(() => {
    const network = getCurrentNetwork();
    const rpcUrl = `https://eth-${network.name}.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;
    const traderInstance = new EulerSwapTrader(rpcUrl);
    setTrader(traderInstance);
  }, []);

  // Load tokens
  useEffect(() => {
    if (trader) {
      loadTokens();
      loadArbitrageOpportunities();
    }
  }, [trader, address]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh quotes
  useEffect(() => {
    if (autoRefresh && quote && amountIn && tokenIn && tokenOut) {
      const interval = setInterval(() => {
        getQuote();
      }, 10000); // Refresh every 10 seconds
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, quote, amountIn, tokenIn, tokenOut]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadTokens = async () => {
    if (!trader) return;
    
    try {
      const tokensData = await trader.getSupportedTokens();
      setTokens(tokensData);
      
      // Set default tokens
      const defaultIn = tokensData.find(t => t.symbol === defaultTokenIn);
      const defaultOut = tokensData.find(t => t.symbol === defaultTokenOut);
      
      if (defaultIn) setTokenIn(defaultIn);
      if (defaultOut) setTokenOut(defaultOut);
    } catch (error) {
      console.error('Error loading tokens:', error);
      toast({
        title: 'Error loading tokens',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const loadArbitrageOpportunities = async () => {
    if (!trader) return;
    
    try {
      const opps = await trader.findArbitrageOpportunities();
      setArbitrageOpps(opps);
    } catch (error) {
      console.error('Error loading arbitrage opportunities:', error);
    }
  };

  const getQuote = useCallback(async () => {
    if (!trader || !tokenIn || !tokenOut || !amountIn || Number(amountIn) <= 0) {
      setQuote(null);
      setAmountOut('');
      return;
    }

    setLoadingQuote(true);
    try {
      const params: SwapParams = {
        tokenIn: tokenIn.address,
        tokenOut: tokenOut.address,
        amountIn: ethers.utils.parseUnits(amountIn, tokenIn.decimals).toString(),
        slippageTolerance: slippage,
        deadline: Math.floor(Date.now() / 1000) + deadline * 60,
      };

      const quoteResult = await trader.getSwapQuote(params);
      setQuote(quoteResult);
      
      const outputAmount = ethers.utils.formatUnits(quoteResult.outputAmount, tokenOut.decimals);
      setAmountOut(outputAmount);
    } catch (error) {
      console.error('Error getting quote:', error);
      setQuote(null);
      setAmountOut('');
      toast({
        title: 'Quote failed',
        description: 'Unable to get swap quote. Please try again.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoadingQuote(false);
    }
  }, [trader, tokenIn, tokenOut, amountIn, slippage, deadline, toast]);

  // Get quote when inputs change
  useEffect(() => {
    const timer = setTimeout(() => {
      getQuote();
    }, 500); // Debounce

    return () => clearTimeout(timer);
  }, [getQuote]);

  const executeSwap = async () => {
    if (!trader || !quote || !tokenIn || !tokenOut || !isConnected) return;

    setLoading(true);
    try {
      const params: SwapParams = {
        tokenIn: tokenIn.address,
        tokenOut: tokenOut.address,
        amountIn: ethers.utils.parseUnits(amountIn, tokenIn.decimals).toString(),
        slippageTolerance: slippage,
        deadline: Math.floor(Date.now() / 1000) + deadline * 60,
      };

      const execution = await trader.executeSwap(quote, params);
      
      toast({
        title: 'Swap submitted',
        description: `Transaction hash: ${execution.hash}`,
        status: 'success',
        duration: 5000,
      });

      // Show success owl animation
      setShowSuccessOwl(true);
      setTimeout(() => setShowSuccessOwl(false), 3000);

      if (onSwapComplete) {
        onSwapComplete(execution.hash);
      }

      // Reset form
      setAmountIn('');
      setAmountOut('');
      setQuote(null);
      
      // Refresh balances
      await loadTokens();
    } catch (error) {
      console.error('Error executing swap:', error);
      toast({
        title: 'Swap failed',
        description: error instanceof Error ? error.message : 'Transaction failed',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const swapTokens = () => {
    const tempToken = tokenIn;
    setTokenIn(tokenOut);
    setTokenOut(tempToken);
    
    const tempAmount = amountIn;
    setAmountIn(amountOut);
    setAmountOut(tempAmount);
  };

  const setMaxAmount = () => {
    if (tokenIn?.balance) {
      setAmountIn(tokenIn.balance);
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

  const formatTokenAmount = (amount: string, decimals: number) => {
    const formatted = ethers.utils.formatUnits(amount, decimals);
    return Number(formatted).toFixed(6);
  };

  const getPriceImpactColor = (impact: number) => {
    if (impact < 1) return 'green';
    if (impact < 3) return 'yellow';
    return 'red';
  };

  return (
    <Box position="relative">
      {/* Success Owl Animation */}
      {showSuccessOwl && (
        <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" zIndex={1000}>
          <SuccessOwl />
        </Box>
      )}
      
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <Text fontSize="xl" fontWeight="bold">EulerSwap Trading</Text>
          <HStack spacing={2}>
            <Tooltip label="Swap Settings">
              <IconButton
                aria-label="Settings"
                icon={<SettingsIcon />}
                size="sm"
                variant="ghost"
                onClick={onSettingsOpen}
              />
            </Tooltip>
            <Switch
              size="sm"
              isChecked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <Text fontSize="sm" color="gray.500">Auto-refresh</Text>
          </HStack>
        </HStack>

        {/* Connection Warning */}
        {!isConnected && (
          <Alert status="warning" borderRadius="lg">
            <AlertIcon />
            <AlertTitle>Wallet not connected!</AlertTitle>
            <AlertDescription>Connect your wallet to start trading.</AlertDescription>
          </Alert>
        )}

        {/* Swap Interface */}
        <Card>
          <CardBody p={6}>
            <VStack spacing={4} align="stretch">
              {/* Token In */}
              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" color="gray.500">From</Text>
                  <HStack spacing={2}>
                    <Text fontSize="sm" color="gray.500">
                      Balance: {tokenIn?.balance || '0'}
                    </Text>
                    <Button size="xs" variant="ghost" onClick={setMaxAmount}>
                      MAX
                    </Button>
                  </HStack>
                </HStack>
                <HStack spacing={3}>
                  <Select
                    value={tokenIn?.address || ''}
                    onChange={(e) => {
                      const token = tokens.find(t => t.address === e.target.value);
                      setTokenIn(token || null);
                    }}
                    width="140px"
                  >
                    {tokens.map((token) => (
                      <option key={token.address} value={token.address}>
                        {token.symbol}
                      </option>
                    ))}
                  </Select>
                  <Input
                    placeholder="0.0"
                    value={amountIn}
                    onChange={(e) => setAmountIn(e.target.value)}
                    type="number"
                    step="any"
                  />
                </HStack>
                {tokenIn && amountIn && (
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    ≈ {formatCurrency(Number(amountIn) * (tokenIn.price || 0))}
                  </Text>
                )}
              </Box>

              {/* Swap Arrow */}
              <HStack justify="center">
                <IconButton
                  aria-label="Swap tokens"
                  icon={<ArrowUpDownIcon />}
                  size="sm"
                  variant="ghost"
                  onClick={swapTokens}
                  bg="gray.100"
                  _hover={{ bg: 'gray.200' }}
                />
              </HStack>

              {/* Token Out */}
              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" color="gray.500">To</Text>
                  <Text fontSize="sm" color="gray.500">
                    Balance: {tokenOut?.balance || '0'}
                  </Text>
                </HStack>
                <HStack spacing={3}>
                  <Select
                    value={tokenOut?.address || ''}
                    onChange={(e) => {
                      const token = tokens.find(t => t.address === e.target.value);
                      setTokenOut(token || null);
                    }}
                    width="140px"
                  >
                    {tokens.map((token) => (
                      <option key={token.address} value={token.address}>
                        {token.symbol}
                      </option>
                    ))}
                  </Select>
                  <Input
                    placeholder="0.0"
                    value={amountOut}
                    readOnly
                    bg="gray.50"
                  />
                </HStack>
                {tokenOut && amountOut && (
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    ≈ {formatCurrency(Number(amountOut) * (tokenOut.price || 0))}
                  </Text>
                )}
              </Box>

              {/* Quote Details */}
              {quote && (
                <Box bg="gray.50" p={4} borderRadius="lg">
                  <VStack spacing={2} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Rate</Text>
                      <Text fontSize="sm" fontWeight="medium">
                        1 {tokenIn?.symbol} = {quote.executionPrice.toFixed(6)} {tokenOut?.symbol}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Price Impact</Text>
                      <Badge colorScheme={getPriceImpactColor(quote.priceImpact)}>
                        {quote.priceImpact.toFixed(2)}%
                      </Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Minimum Received</Text>
                      <Text fontSize="sm" fontWeight="medium">
                        {formatTokenAmount(quote.minimumOutputAmount, tokenOut?.decimals || 18)} {tokenOut?.symbol}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Gas Estimate</Text>
                      <Text fontSize="sm" fontWeight="medium">
                        {Number(quote.gasEstimate).toLocaleString()} units
                      </Text>
                    </HStack>
                    {quote.route.length > 1 && (
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">Route</Text>
                        <Button size="xs" variant="link" onClick={onQuoteOpen}>
                          View Route <InfoIcon ml={1} boxSize={3} />
                        </Button>
                      </HStack>
                    )}
                  </VStack>
                </Box>
              )}

              {/* Loading indicator */}
              {loadingQuote && (
                <HStack justify="center" py={2}>
                  <Spinner size="sm" />
                  <Text fontSize="sm" color="gray.500">Getting best quote...</Text>
                </HStack>
              )}

              {/* Swap Button */}
              <Button
                colorScheme="blue"
                size="lg"
                onClick={executeSwap}
                isLoading={loading}
                loadingText="Swapping..."
                isDisabled={!isConnected || !quote || !amountIn || Number(amountIn) <= 0}
              >
                {!isConnected ? 'Connect Wallet' : 
                 !quote ? 'Enter Amount' : 
                 'Swap'}
              </Button>
            </VStack>
          </CardBody>
        </Card>

        {/* Arbitrage Opportunities */}
        {arbitrageOpps.length > 0 && (
          <Card>
            <CardHeader>
              <Text fontSize="lg" fontWeight="bold">Arbitrage Opportunities</Text>
            </CardHeader>
            <CardBody>
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Pair</Th>
                    <Th>Profit</Th>
                    <Th>Confidence</Th>
                    <Th>Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {arbitrageOpps.slice(0, 3).map((opp) => (
                    <Tr key={opp.id}>
                      <Td>
                        <Text fontSize="sm" fontWeight="medium">
                          {tokens.find(t => t.address === opp.tokenA)?.symbol}/
                          {tokens.find(t => t.address === opp.tokenB)?.symbol}
                        </Text>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" color="green.500" fontWeight="medium">
                            {formatCurrency(opp.profitUSD)}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {opp.profitPercentage.toFixed(2)}%
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Progress
                          value={opp.confidence * 100}
                          size="sm"
                          colorScheme="green"
                          width="60px"
                        />
                      </Td>
                      <Td>
                        <Button size="xs" colorScheme="green" variant="outline">
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
      </VStack>

      {/* Settings Modal */}
      <Modal isOpen={isSettingsOpen} onClose={onSettingsClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Swap Settings</ModalHeader>
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Slippage Tolerance (%)</FormLabel>
                <NumberInput
                  value={slippage}
                  onChange={(_, value) => setSlippage(value)}
                  min={0.1}
                  max={50}
                  step={0.1}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              
              <FormControl>
                <FormLabel>Transaction Deadline (minutes)</FormLabel>
                <NumberInput
                  value={deadline}
                  onChange={(_, value) => setDeadline(value)}
                  min={1}
                  max={180}
                  step={1}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onSettingsClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={onSettingsClose}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Quote Details Modal */}
      <Modal isOpen={isQuoteOpen} onClose={onQuoteClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Swap Route Details</ModalHeader>
          <ModalBody>
            {quote && (
              <VStack spacing={4} align="stretch">
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>Step</Th>
                      <Th>Protocol</Th>
                      <Th>Pool</Th>
                      <Th>Amount</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {quote.route.map((step, index) => (
                      <Tr key={index}>
                        <Td>{index + 1}</Td>
                        <Td>{step.protocol}</Td>
                        <Td>
                          <Text fontSize="xs" fontFamily="mono">
                            {step.poolAddress.slice(0, 8)}...
                          </Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm">
                            {formatTokenAmount(step.amountOut, tokenOut?.decimals || 18)}
                          </Text>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onQuoteClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}