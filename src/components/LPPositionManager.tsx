"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Badge,
  Progress,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useToast,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Switch,
  FormControl,
  FormLabel,
  Select,
  NumberInput,
  NumberInputField,
  Divider,
} from '@chakra-ui/react';
import { Line, Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  DollarSign,
  PieChart,
  Activity,
  Settings,
  Shield,
  Zap,
  BarChart3,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';

const MotionCard = motion(Card);

interface LPPosition {
  id: string;
  protocol: string;
  pair: string;
  token0: string;
  token1: string;
  liquidity: number;
  valueUSD: number;
  apy: number;
  feesEarned: number;
  impermanentLoss: number;
  inRange: boolean;
  age: number;
  status: 'healthy' | 'warning' | 'danger';
}

interface HedgingStrategy {
  id: string;
  name: string;
  effectiveness: number;
  cost: number;
  complexity: string;
  description: string;
  active: boolean;
}

export default function LPPositionManager() {
  const [positions, setPositions] = useState<LPPosition[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<LPPosition | null>(null);
  const [hedgingStrategies, setHedgingStrategies] = useState<HedgingStrategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRebalance, setAutoRebalance] = useState(false);
  const [ilThreshold, setIlThreshold] = useState(5);
  const [rebalanceFrequency, setRebalanceFrequency] = useState('daily');
  
  const toast = useToast();
  const { isOpen: isHedgingOpen, onOpen: onHedgingOpen, onClose: onHedgingClose } = useDisclosure();
  const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure();

  // Mock data
  useEffect(() => {
    const mockPositions: LPPosition[] = [
      {
        id: 'pos-1',
        protocol: 'EulerSwap',
        pair: 'USDC/WETH',
        token0: 'USDC',
        token1: 'WETH',
        liquidity: 50000,
        valueUSD: 12450,
        apy: 18.5,
        feesEarned: 245.7,
        impermanentLoss: -2.3,
        inRange: true,
        age: 45,
        status: 'healthy'
      },
      {
        id: 'pos-2',
        protocol: 'Uniswap V3',
        pair: 'WBTC/WETH',
        token0: 'WBTC',
        token1: 'WETH',
        liquidity: 25000,
        valueUSD: 8750,
        apy: 24.2,
        feesEarned: 180.3,
        impermanentLoss: -4.8,
        inRange: false,
        age: 22,
        status: 'warning'
      },
      {
        id: 'pos-3',
        protocol: 'EulerSwap',
        pair: 'USDC/WBTC',
        token0: 'USDC',
        token1: 'WBTC',
        liquidity: 75000,
        valueUSD: 18200,
        apy: 15.7,
        feesEarned: 320.5,
        impermanentLoss: -8.2,
        inRange: true,
        age: 67,
        status: 'danger'
      }
    ];

    const mockStrategies: HedgingStrategy[] = [
      {
        id: 'options-collar',
        name: 'Options Collar',
        effectiveness: 85,
        cost: 2.5,
        complexity: 'Medium',
        description: 'Protect against IL using options strategies',
        active: false
      },
      {
        id: 'perp-hedge',
        name: 'Perpetual Futures',
        effectiveness: 92,
        cost: 1.8,
        complexity: 'High',
        description: 'Hedge using perpetual futures contracts',
        active: true
      },
      {
        id: 'rebalancing',
        name: 'Auto Rebalancing',
        effectiveness: 65,
        cost: 0.8,
        complexity: 'Low',
        description: 'Automatically rebalance when out of range',
        active: true
      }
    ];

    setPositions(mockPositions);
    setHedgingStrategies(mockStrategies);
    setLoading(false);
  }, []);

  const totalValue = positions.reduce((sum, pos) => sum + pos.valueUSD, 0);
  const totalFees = positions.reduce((sum, pos) => sum + pos.feesEarned, 0);
  const avgAPY = positions.reduce((sum, pos) => sum + pos.apy, 0) / positions.length;
  const totalIL = positions.reduce((sum, pos) => sum + Math.abs(pos.impermanentLoss), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'green';
      case 'warning': return 'yellow';
      case 'danger': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'danger': return <XCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const handleRebalance = (positionId: string) => {
    toast({
      title: "Rebalancing Position",
      description: "Your LP position is being rebalanced to optimal range",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleHedgeActivation = (strategyId: string, active: boolean) => {
    setHedgingStrategies(prev =>
      prev.map(strategy =>
        strategy.id === strategyId ? { ...strategy, active } : strategy
      )
    );

    toast({
      title: active ? "Hedging Activated" : "Hedging Deactivated",
      description: `${hedgingStrategies.find(s => s.id === strategyId)?.name} has been ${active ? 'activated' : 'deactivated'}`,
      status: active ? "success" : "warning",
      duration: 3000,
      isClosable: true,
    });
  };

  // IL Chart Data
  const ilChartData = {
    labels: ['7d ago', '6d ago', '5d ago', '4d ago', '3d ago', '2d ago', '1d ago', 'Now'],
    datasets: [
      {
        label: 'IL %',
        data: [-1.2, -2.1, -1.8, -3.4, -4.2, -3.9, -4.5, -4.8],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        titleColor: "#FAFAFA",
        bodyColor: "#FAFAFA",
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "rgba(255, 255, 255, 0.6)" }
      },
      y: {
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        ticks: { 
          color: "rgba(255, 255, 255, 0.6)",
          callback: function(value: any) {
            return value + '%';
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <Box p={8} textAlign="center">
        <Text color="gray.400">Loading LP positions...</Text>
      </Box>
    );
  }

  return (
    <Box p={6} bg="rgba(15, 15, 35, 0.95)" minHeight="100vh">
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <VStack align="start" spacing={1}>
          <Text fontSize="2xl" fontWeight="bold" color="white">
            LP Position Manager
          </Text>
          <Text color="gray.400">
            Monitor and optimize your liquidity provider positions
          </Text>
        </VStack>
        
        <HStack spacing={3}>
          <Button
            leftIcon={<Settings className="w-4 h-4" />}
            colorScheme="purple"
            variant="outline"
            size="sm"
            onClick={onSettingsOpen}
          >
            Settings
          </Button>
          <Button
            leftIcon={<Shield className="w-4 h-4" />}
            colorScheme="orange"
            variant="outline"
            size="sm"
            onClick={onHedgingOpen}
          >
            Hedging
          </Button>
        </HStack>
      </Flex>

      {/* Summary Stats */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          bg="rgba(26, 32, 44, 0.8)"
          border="1px solid"
          borderColor="rgba(255, 255, 255, 0.1)"
        >
          <CardBody>
            <Stat>
              <StatLabel color="gray.400">Total Value</StatLabel>
              <StatNumber color="green.400">${totalValue.toLocaleString()}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                +12.3% this month
              </StatHelpText>
            </Stat>
          </CardBody>
        </MotionCard>

        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          bg="rgba(26, 32, 44, 0.8)"
          border="1px solid"
          borderColor="rgba(255, 255, 255, 0.1)"
        >
          <CardBody>
            <Stat>
              <StatLabel color="gray.400">Total Fees Earned</StatLabel>
              <StatNumber color="blue.400">${totalFees.toFixed(2)}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                +5.2% this week
              </StatHelpText>
            </Stat>
          </CardBody>
        </MotionCard>

        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          bg="rgba(26, 32, 44, 0.8)"
          border="1px solid"
          borderColor="rgba(255, 255, 255, 0.1)"
        >
          <CardBody>
            <Stat>
              <StatLabel color="gray.400">Average APY</StatLabel>
              <StatNumber color="purple.400">{avgAPY.toFixed(1)}%</StatNumber>
              <StatHelpText>Across all positions</StatHelpText>
            </Stat>
          </CardBody>
        </MotionCard>

        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          bg="rgba(26, 32, 44, 0.8)"
          border="1px solid"
          borderColor="rgba(255, 255, 255, 0.1)"
        >
          <CardBody>
            <Stat>
              <StatLabel color="gray.400">Total IL</StatLabel>
              <StatNumber color="red.400">-{totalIL.toFixed(1)}%</StatNumber>
              <StatHelpText>
                <Tooltip label="Hedging strategies active">
                  <Badge colorScheme="green" size="sm">Protected</Badge>
                </Tooltip>
              </StatHelpText>
            </Stat>
          </CardBody>
        </MotionCard>
      </SimpleGrid>

      {/* Main Content */}
      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={8} mb={8}>
        {/* Positions Table */}
        <Card
          bg="rgba(26, 32, 44, 0.8)"
          border="1px solid"
          borderColor="rgba(255, 255, 255, 0.1)"
        >
          <CardHeader>
            <Text fontSize="lg" fontWeight="bold" color="white">
              Active Positions
            </Text>
          </CardHeader>
          <CardBody>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th color="gray.300" fontSize="xs">PAIR</Th>
                  <Th color="gray.300" fontSize="xs">VALUE</Th>
                  <Th color="gray.300" fontSize="xs">APY</Th>
                  <Th color="gray.300" fontSize="xs">IL</Th>
                  <Th color="gray.300" fontSize="xs">STATUS</Th>
                  <Th color="gray.300" fontSize="xs">ACTION</Th>
                </Tr>
              </Thead>
              <Tbody>
                {positions.map((position) => (
                  <Tr key={position.id} _hover={{ bg: "rgba(255, 255, 255, 0.02)" }}>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text color="white" fontWeight="medium" fontSize="sm">
                          {position.pair}
                        </Text>
                        <Text color="gray.400" fontSize="xs">
                          {position.protocol}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Text color="white" fontWeight="medium">
                        ${position.valueUSD.toLocaleString()}
                      </Text>
                    </Td>
                    <Td>
                      <Text color="green.400" fontWeight="bold">
                        {position.apy.toFixed(1)}%
                      </Text>
                    </Td>
                    <Td>
                      <Text color={position.impermanentLoss < -5 ? "red.400" : "yellow.400"}>
                        {position.impermanentLoss.toFixed(1)}%
                      </Text>
                    </Td>
                    <Td>
                      <HStack>
                        <Badge
                          colorScheme={getStatusColor(position.status)}
                          size="sm"
                          variant="subtle"
                        >
                          {getStatusIcon(position.status)}
                        </Badge>
                        {!position.inRange && (
                          <Badge colorScheme="orange" size="sm">
                            Out of Range
                          </Badge>
                        )}
                      </HStack>
                    </Td>
                    <Td>
                      <Button
                        size="xs"
                        colorScheme="blue"
                        variant="outline"
                        onClick={() => handleRebalance(position.id)}
                        isDisabled={position.inRange}
                      >
                        Rebalance
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>

        {/* IL Tracking Chart */}
        <Card
          bg="rgba(26, 32, 44, 0.8)"
          border="1px solid"
          borderColor="rgba(255, 255, 255, 0.1)"
        >
          <CardHeader>
            <Text fontSize="lg" fontWeight="bold" color="white">
              Impermanent Loss Tracking
            </Text>
          </CardHeader>
          <CardBody>
            <Box height="250px">
              <Line data={ilChartData} options={chartOptions} />
            </Box>
            <Divider my={4} borderColor="rgba(255, 255, 255, 0.1)" />
            <VStack spacing={2}>
              <HStack justify="space-between" w="full">
                <Text color="gray.400" fontSize="sm">Current IL:</Text>
                <Text color="red.400" fontWeight="bold">-4.8%</Text>
              </HStack>
              <HStack justify="space-between" w="full">
                <Text color="gray.400" fontSize="sm">Max IL (7d):</Text>
                <Text color="red.500" fontWeight="bold">-4.8%</Text>
              </HStack>
              <HStack justify="space-between" w="full">
                <Text color="gray.400" fontSize="sm">Protection Level:</Text>
                <Badge colorScheme="green" size="sm">85% Protected</Badge>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Hedging Strategies Modal */}
      <Modal isOpen={isHedgingOpen} onClose={onHedgingClose} size="xl">
        <ModalOverlay />
        <ModalContent bg="rgba(26, 32, 44, 0.95)" border="1px solid" borderColor="rgba(255, 255, 255, 0.1)">
          <ModalHeader color="white">Hedging Strategies</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              {hedgingStrategies.map((strategy) => (
                <Card
                  key={strategy.id}
                  w="full"
                  bg="rgba(255, 255, 255, 0.05)"
                  border="1px solid"
                  borderColor="rgba(255, 255, 255, 0.1)"
                >
                  <CardBody>
                    <Flex justify="space-between" align="center">
                      <VStack align="start" spacing={2}>
                        <HStack>
                          <Text color="white" fontWeight="bold">
                            {strategy.name}
                          </Text>
                          <Badge
                            colorScheme={strategy.complexity === 'Low' ? 'green' : 
                                       strategy.complexity === 'Medium' ? 'yellow' : 'red'}
                            size="sm"
                          >
                            {strategy.complexity}
                          </Badge>
                        </HStack>
                        <Text color="gray.400" fontSize="sm">
                          {strategy.description}
                        </Text>
                        <HStack spacing={4}>
                          <Text color="gray.300" fontSize="sm">
                            Effectiveness: {strategy.effectiveness}%
                          </Text>
                          <Text color="gray.300" fontSize="sm">
                            Cost: {strategy.cost}%
                          </Text>
                        </HStack>
                      </VStack>
                      <Switch
                        colorScheme="green"
                        isChecked={strategy.active}
                        onChange={(e) => handleHedgeActivation(strategy.id, e.target.checked)}
                      />
                    </Flex>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="purple" onClick={onHedgingClose}>
              Done
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Settings Modal */}
      <Modal isOpen={isSettingsOpen} onClose={onSettingsClose}>
        <ModalOverlay />
        <ModalContent bg="rgba(26, 32, 44, 0.95)" border="1px solid" borderColor="rgba(255, 255, 255, 0.1)">
          <ModalHeader color="white">LP Manager Settings</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel color="gray.300">Auto Rebalancing</FormLabel>
                <Switch
                  colorScheme="purple"
                  isChecked={autoRebalance}
                  onChange={(e) => setAutoRebalance(e.target.checked)}
                />
              </FormControl>

              <FormControl>
                <FormLabel color="gray.300">IL Alert Threshold (%)</FormLabel>
                <NumberInput
                  value={ilThreshold}
                  onChange={(value) => setIlThreshold(Number(value))}
                  min={1}
                  max={20}
                >
                  <NumberInputField
                    bg="rgba(255, 255, 255, 0.1)"
                    border="1px solid"
                    borderColor="rgba(255, 255, 255, 0.2)"
                    color="white"
                  />
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel color="gray.300">Rebalance Frequency</FormLabel>
                <Select
                  value={rebalanceFrequency}
                  onChange={(e) => setRebalanceFrequency(e.target.value)}
                  bg="rgba(255, 255, 255, 0.1)"
                  border="1px solid"
                  borderColor="rgba(255, 255, 255, 0.2)"
                  color="white"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="purple" onClick={onSettingsClose}>
              Save Settings
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}