"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  Card,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  Flex,
  Badge,
  Button,
  HStack,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  Avatar,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAccount } from 'wagmi';
import LoadingSpinner from './LoadingSpinner';

// Lazy load heavy components
const WalletConnection = lazy(() => import('./WalletConnection'));
const Line = lazy(() => import('react-chartjs-2').then(module => ({ default: module.Line })));
const Doughnut = lazy(() => import('react-chartjs-2').then(module => ({ default: module.Doughnut })));
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  CategoryScale,
  ArcElement,
  BarElement,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  CategoryScale,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  BarElement
);

const MotionCard = motion(Card);
const MotionBox = motion(Box);

interface PoolData {
  timestamp: string;
  apy: number;
}

interface PortfolioAsset {
  token: string;
  amount: number;
  valueUSD: number;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  suffix?: string;
  color?: string;
  icon?: string;
  description?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  suffix = "", 
  color = "purple.400",
  description 
}) => (
  <MotionBox
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.3 }}
    bg="rgba(26, 32, 44, 0.8)"
    backdropFilter="blur(10px)"
    borderRadius="xl"
    border="1px solid"
    borderColor="rgba(255, 255, 255, 0.1)"
    p={6}
    _hover={{
      transform: "translateY(-2px)",
      boxShadow: "0 20px 40px rgba(147, 51, 234, 0.2)",
      borderColor: "rgba(147, 51, 234, 0.4)"
    }}
  >
    <Stat>
      <StatLabel color="gray.400" fontSize="sm" fontWeight="medium">
        {title}
      </StatLabel>
      <StatNumber color={color} fontSize="2xl" fontWeight="bold">
        {typeof value === 'number' ? value.toFixed(2) : value}{suffix}
      </StatNumber>
      {change !== undefined && (
        <StatHelpText>
          <StatArrow type={change >= 0 ? "increase" : "decrease"} />
          {Math.abs(change).toFixed(2)}%
        </StatHelpText>
      )}
      {description && (
        <Text color="gray.500" fontSize="xs" mt={1}>
          {description}
        </Text>
      )}
    </Stat>
  </MotionBox>
);

export default function Dashboard() {
  const [poolData, setPoolData] = useState<PoolData[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioAsset[]>([]);
  const [riskScore, setRiskScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('7d');
  const router = useRouter();
  const { address, isConnected } = useAccount();

  // Fetch data from API
  const fetchData = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      
      setError(null);
      const url = address ? `/api/pool?userAddress=${address}` : "/api/pool";
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      setPoolData(data.apyData || []);
      setPortfolio(data.portfolio || []);
      setRiskScore(data.riskScore || 0);
    } catch (error) {
      console.error("Error fetching pool data:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate metrics
  const currentAPY = poolData.length > 0 ? poolData[poolData.length - 1]?.apy : 0;
  const apyChange = poolData.length > 1 ? 
    ((poolData[poolData.length - 1]?.apy - poolData[poolData.length - 2]?.apy) / poolData[poolData.length - 2]?.apy) * 100 : 0;
  
  const totalPortfolioValue = portfolio.reduce((sum, asset) => sum + asset.valueUSD, 0);
  const avgAPY = poolData.length > 0 ? poolData.reduce((sum, d) => sum + d.apy, 0) / poolData.length : 0;

  // Enhanced Chart Configuration
  const apyChartData = {
    datasets: [
      {
        label: "APY",
        data: poolData.map((point) => ({
          x: new Date(point.timestamp).getTime(),
          y: point.apy,
        })),
        borderColor: "rgb(147, 51, 234)",
        backgroundColor: "rgba(147, 51, 234, 0.1)",
        pointBackgroundColor: "rgb(147, 51, 234)",
        pointBorderColor: "rgba(255, 255, 255, 0.8)",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
        borderWidth: 3,
      },
    ],
  };

  const apyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: { display: false },
      tooltip: { 
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        titleColor: "#FAFAFA",
        bodyColor: "#FAFAFA",
        borderColor: "rgba(147, 51, 234, 0.5)",
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context: { parsed: { y: number } }) {
            return `APY: ${context.parsed.y.toFixed(2)}%`;
          }
        }
      },
    },
    scales: {
      x: {
        type: "time" as const,
        time: { 
          unit: "day" as const,
          displayFormats: { day: 'MMM dd' }
        },
        grid: { display: false },
        ticks: { 
          color: "rgba(255, 255, 255, 0.6)",
          font: { size: 12 }
        },
      },
      y: {
        grid: { 
          color: "rgba(255, 255, 255, 0.1)",
          drawBorder: false,
        },
        ticks: { 
          color: "rgba(255, 255, 255, 0.6)",
          font: { size: 12 },
          callback: function(value: string | number) {
            return Number(value).toFixed(1) + '%';
          }
        },
      },
    },
  } as const;

  // Portfolio Allocation Chart
  const portfolioChartData = {
    labels: portfolio.map(asset => asset.token),
    datasets: [{
      data: portfolio.map(asset => asset.valueUSD),
      backgroundColor: [
        'rgba(147, 51, 234, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ],
      borderColor: [
        'rgb(147, 51, 234)',
        'rgb(59, 130, 246)',
        'rgb(16, 185, 129)',
        'rgb(245, 158, 11)',
        'rgb(239, 68, 68)',
      ],
      borderWidth: 2,
    }]
  };

  const portfolioChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#FAFAFA',
          usePointStyle: true,
          padding: 20,
        }
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        titleColor: "#FAFAFA",
        bodyColor: "#FAFAFA",
        borderColor: "rgba(147, 51, 234, 0.5)",
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const value = context.parsed;
            const percentage = ((value / totalPortfolioValue) * 100).toFixed(1);
            return `${context.label}: $${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <Box 
        p={8} 
        bgGradient="linear(to-br, #0F0F23, #1A0B33, #0F0F23)" 
        minHeight="100vh"
        position="relative"
      >
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bgImage="radial-gradient(circle at 20% 50%, rgba(147, 51, 234, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)"
        />
        <Center height="100vh" position="relative">
          <VStack spacing={4}>
            <Spinner size="xl" color="purple.400" thickness="4px" />
            <Text color="gray.400" fontSize="lg">Loading your DeFi dashboard...</Text>
          </VStack>
        </Center>
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        p={8} 
        bgGradient="linear(to-br, #0F0F23, #1A0B33, #0F0F23)" 
        minHeight="100vh"
      >
        <Alert status="error" bg="rgba(220, 38, 38, 0.1)" borderColor="red.500" borderRadius="xl">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Text fontWeight="bold">Connection Error</Text>
            <Text fontSize="sm">Unable to fetch data: {error}</Text>
            <Button size="sm" colorScheme="red" variant="outline" onClick={() => fetchData()}>
              Retry
            </Button>
          </VStack>
        </Alert>
      </Box>
    );
  }

  return (
    <Box 
      p={8} 
      bgGradient="linear(to-br, #0F0F23, #1A0B33, #0F0F23)" 
      minHeight="100vh"
      position="relative"
    >
      {/* Animated Background */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bgImage="radial-gradient(circle at 20% 50%, rgba(147, 51, 234, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)"
        animation="float 20s ease-in-out infinite"
      />
      
      <Box position="relative" zIndex={1}>
        {/* Header */}
        <Flex justify="space-between" align="center" mb={8}>
          <VStack align="start" spacing={2}>
            <Heading 
              as="h1" 
              size="2xl" 
              bgGradient="linear(to-r, #9333EA, #3B82F6)"
              bgClip="text"
              fontWeight="bold"
            >
              Eulixir Analytics
            </Heading>
            <Text color="gray.400" fontSize="lg">
              Professional DeFi Portfolio Management
            </Text>
          </VStack>
          
          <HStack spacing={4}>
            <Button
              onClick={() => router.push('/positions')}
              colorScheme="green"
              variant="outline"
              size="sm"
            >
              LP Manager
            </Button>
            <Button
              onClick={() => router.push('/pipeline')}
              colorScheme="blue"
              variant="outline"
              size="sm"
            >
              ETL Pipeline Builder
            </Button>
            <Button
              onClick={() => fetchData(true)}
              isLoading={refreshing}
              loadingText="Refreshing"
              colorScheme="purple"
              variant="outline"
              size="sm"
            >
              Refresh Data
            </Button>
            <Badge colorScheme="green" variant="subtle" px={3} py={1}>
              Live
            </Badge>
            <Suspense fallback={<Spinner size="sm" />}>
              <WalletConnection compact showBalance={false} />
            </Suspense>
          </HStack>
        </Flex>

        {/* Key Metrics Row */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          <MetricCard
            title="Current APY"
            value={currentAPY}
            change={apyChange}
            suffix="%"
            color="green.400"
            description="Real-time yield"
          />
          <MetricCard
            title="Portfolio Value"
            value={`$${totalPortfolioValue.toFixed(2)}`}
            color="blue.400"
            description="Total position value"
          />
          <MetricCard
            title="Average APY"
            value={avgAPY}
            suffix="%"
            color="purple.400"
            description="7-day average"
          />
          <MetricCard
            title="Risk Score"
            value={`${riskScore.toFixed(1)}/5`}
            color={riskScore > 3 ? "red.400" : riskScore > 2 ? "yellow.400" : "green.400"}
            description="Protocol risk level"
          />
        </SimpleGrid>

        {/* Main Content Grid */}
        <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={8} mb={8}>
          {/* APY Chart */}
          <MotionCard
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            bg="rgba(26, 32, 44, 0.8)"
            backdropFilter="blur(10px)"
            borderRadius="xl"
            border="1px solid"
            borderColor="rgba(255, 255, 255, 0.1)"
            overflow="hidden"
          >
            <CardBody p={6}>
              <Flex justify="space-between" align="center" mb={4}>
                <VStack align="start" spacing={1}>
                  <Text color="white" fontSize="xl" fontWeight="bold">
                    APY Performance
                  </Text>
                  <Text color="gray.400" fontSize="sm">
                    Historical yield trends
                  </Text>
                </VStack>
                <HStack>
                  {['1d', '7d', '30d'].map((period) => (
                    <Button
                      key={period}
                      size="xs"
                      variant={selectedTimeframe === period ? "solid" : "ghost"}
                      colorScheme="purple"
                      onClick={() => setSelectedTimeframe(period)}
                    >
                      {period}
                    </Button>
                  ))}
                </HStack>
              </Flex>
              
              <Box height="300px">
                {poolData.length > 0 ? (
                  <Suspense fallback={<LoadingSpinner message="Loading chart..." size="md" />}>
                    <Line data={apyChartData} options={apyChartOptions} />
                  </Suspense>
                ) : (
                  <Center height="100%">
                    <Text color="gray.400">No data available</Text>
                  </Center>
                )}
              </Box>
            </CardBody>
          </MotionCard>

          {/* Portfolio Allocation */}
          <MotionCard
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            bg="rgba(26, 32, 44, 0.8)"
            backdropFilter="blur(10px)"
            borderRadius="xl"
            border="1px solid"
            borderColor="rgba(255, 255, 255, 0.1)"
            overflow="hidden"
          >
            <CardBody p={6}>
              <VStack align="start" spacing={1} mb={4}>
                <Text color="white" fontSize="xl" fontWeight="bold">
                  Portfolio Allocation
                </Text>
                <Text color="gray.400" fontSize="sm">
                  Asset distribution
                </Text>
              </VStack>
              
              <Box height="300px">
                {portfolio.length > 0 ? (
                  <Suspense fallback={<LoadingSpinner message="Loading chart..." size="md" />}>
                    <Doughnut data={portfolioChartData} options={portfolioChartOptions} />
                  </Suspense>
                ) : (
                  <Center height="100%">
                    <VStack spacing={4}>
                      <Text color="gray.400">No positions found</Text>
                      <Suspense fallback={<Spinner size="sm" />}>
                        <Button colorScheme="purple" variant="outline" size="sm">
                          Connect Wallet
                        </Button>
                      </Suspense>
                    </VStack>
                  </Center>
                )}
              </Box>
            </CardBody>
          </MotionCard>
        </SimpleGrid>

        {/* Portfolio Details */}
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          bg="rgba(26, 32, 44, 0.8)"
          backdropFilter="blur(10px)"
          borderRadius="xl"
          border="1px solid"
          borderColor="rgba(255, 255, 255, 0.1)"
          overflow="hidden"
        >
          <CardBody p={6}>
            <Flex justify="space-between" align="center" mb={6}>
              <VStack align="start" spacing={1}>
                <Text color="white" fontSize="xl" fontWeight="bold">
                  Position Details
                </Text>
                <Text color="gray.400" fontSize="sm">
                  Your active positions
                </Text>
              </VStack>
              <Button colorScheme="purple" variant="outline" size="sm">
                Export Data
              </Button>
            </Flex>
            
            {portfolio.length > 0 ? (
              <Table variant="simple" size="md">
                <Thead>
                  <Tr>
                    <Th color="gray.300" borderColor="rgba(255, 255, 255, 0.1)" fontSize="xs">
                      ASSET
                    </Th>
                    <Th color="gray.300" borderColor="rgba(255, 255, 255, 0.1)" fontSize="xs">
                      BALANCE
                    </Th>
                    <Th color="gray.300" borderColor="rgba(255, 255, 255, 0.1)" fontSize="xs">
                      USD VALUE
                    </Th>
                    <Th color="gray.300" borderColor="rgba(255, 255, 255, 0.1)" fontSize="xs">
                      ALLOCATION
                    </Th>
                    <Th color="gray.300" borderColor="rgba(255, 255, 255, 0.1)" fontSize="xs">
                      STATUS
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {portfolio.map((asset, index) => {
                    const allocation = (asset.valueUSD / totalPortfolioValue) * 100;
                    return (
                      <Tr key={index} _hover={{ bg: "rgba(255, 255, 255, 0.02)" }}>
                        <Td borderColor="rgba(255, 255, 255, 0.1)">
                          <HStack>
                            <Avatar size="sm" name={asset.token} bg="purple.500" />
                            <VStack align="start" spacing={0}>
                              <Text color="white" fontWeight="medium">{asset.token}</Text>
                              <Text color="gray.400" fontSize="xs">
                                {asset.token === 'USDC' ? 'USD Coin' : asset.token === 'WETH' ? 'Wrapped Ethereum' : asset.token}
                              </Text>
                            </VStack>
                          </HStack>
                        </Td>
                        <Td borderColor="rgba(255, 255, 255, 0.1)">
                          <Text color="gray.200" fontWeight="medium">
                            {asset.amount.toFixed(asset.token === 'USDC' ? 2 : 6)}
                          </Text>
                        </Td>
                        <Td borderColor="rgba(255, 255, 255, 0.1)">
                          <Text color="green.400" fontWeight="bold">
                            ${asset.valueUSD.toFixed(2)}
                          </Text>
                        </Td>
                        <Td borderColor="rgba(255, 255, 255, 0.1)">
                          <VStack align="start" spacing={1}>
                            <Text color="gray.200" fontSize="sm">
                              {allocation.toFixed(1)}%
                            </Text>
                            <Progress
                              value={allocation}
                              size="sm"
                              colorScheme="purple"
                              bg="rgba(255, 255, 255, 0.1)"
                              w="60px"
                            />
                          </VStack>
                        </Td>
                        <Td borderColor="rgba(255, 255, 255, 0.1)">
                          <Badge colorScheme="green" variant="subtle">
                            Active
                          </Badge>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            ) : (
              <Center py={12}>
                <VStack spacing={4}>
                  <Text color="gray.400" fontSize="lg">No positions to display</Text>
                  <Text color="gray.500" fontSize="sm">
                    Connect your wallet to view your DeFi positions
                  </Text>
                </VStack>
              </Center>
            )}
          </CardBody>
        </MotionCard>
      </Box>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
      `}</style>
    </Box>
  );
}