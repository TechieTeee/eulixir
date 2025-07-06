"use client";

import { useEffect, useState } from "react";
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
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

const MotionCard = motion(Card);

interface PoolData {
  timestamp: string;
  apy: number;
}

interface PortfolioAsset {
  token: string;
  amount: number;
  valueUSD: number;
}

export default function Dashboard() {
  const [poolData, setPoolData] = useState<PoolData[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioAsset[]>([]);
  const [riskScore, setRiskScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/pool");
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        // Set data with proper fallbacks
        setPoolData(data.apyData || []);
        setPortfolio(data.portfolio || []);
        setRiskScore(data.riskScore || 0);
      } catch (error) {
        console.error("Error fetching pool data:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Chart.js configuration for APY line chart
  const chartData = {
    datasets: [
      {
        label: "Pool APY (%)",
        data: poolData.map((point) => ({
          x: new Date(point.timestamp).getTime(),
          y: point.apy,
        })),
        borderColor: "rgba(255, 202, 40, 0.8)",
        backgroundColor: "rgba(255, 202, 40, 0.2)",
        pointBackgroundColor: "rgba(255, 202, 40, 1)",
        pointBorderColor: "rgba(255, 255, 255, 0.8)",
        tension: 0.4,
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true, 
        labels: { color: "#FAFAFA" } 
      },
      tooltip: { 
        backgroundColor: "rgba(29, 32, 44, 0.9)",
        titleColor: "#FAFAFA",
        bodyColor: "#FAFAFA",
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
          displayFormats: {
            day: 'MMM dd'
          }
        },
        title: { 
          display: true, 
          text: "Date", 
          color: "#FAFAFA" 
        },
        grid: { color: "rgba(156, 39, 176, 0.2)" },
        ticks: { color: "#FAFAFA" },
      },
      y: {
        title: { 
          display: true, 
          text: "APY (%)", 
          color: "#FAFAFA" 
        },
        grid: { color: "rgba(156, 39, 176, 0.2)" },
        ticks: { 
          color: "#FAFAFA",
          callback: function(value: string | number) {
            return Number(value).toFixed(1) + '%';
          }
        },
      },
    },
  } as const;

  // Calculate total portfolio value
  const totalPortfolioValue = portfolio.reduce((sum, asset) => sum + asset.valueUSD, 0);

  if (loading) {
    return (
      <Box p={8} bgGradient="linear(to-br, gray.900, purple.900, blue.900)">
        <Center height="400px">
          <Spinner size="xl" color="purple.400" />
        </Center>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={8} bgGradient="linear(to-br, gray.900, purple.900, blue.900)">
        <Alert status="error" bg="red.800" borderColor="red.600">
          <AlertIcon />
          Error loading dashboard: {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={8} bgGradient="linear(to-br, gray.900, purple.900, blue.900)" minHeight="100vh">
      <Heading 
        as="h2" 
        size="xl" 
        mb={6}
        color="white"
        textAlign="center"
        textShadow="0 0 20px rgba(147, 51, 234, 0.5)"
      >
        Eulixir Dashboard
      </Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          bg="gray.800"
          borderColor="purple.500"
          borderWidth="1px"
          _hover={{ 
            transform: "translateY(-4px)",
            boxShadow: "0 8px 25px rgba(147, 51, 234, 0.3)"
          }}
        >
          <CardBody>
            <Text color="cyan.300" mb={2} fontWeight="bold" fontSize="lg">
              Pool APY History
            </Text>
            <Box height="300px">
              {poolData.length > 0 ? (
                <Line data={chartData} options={chartOptions} />
              ) : (
                <Center height="100%">
                  <Text color="gray.400">No APY data available</Text>
                </Center>
              )}
            </Box>
            <Text color="gray.400" mt={4} fontSize="sm">
              {poolData.length > 0 && `Current APY: ${poolData[poolData.length - 1]?.apy.toFixed(2)}%`}
            </Text>
          </CardBody>
        </MotionCard>

        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          bg="gray.800"
          borderColor="purple.500"
          borderWidth="1px"
          _hover={{ 
            transform: "translateY(-4px)",
            boxShadow: "0 8px 25px rgba(147, 51, 234, 0.3)"
          }}
        >
          <CardBody>
            <Text color="purple.300" mb={2} fontWeight="bold" fontSize="lg">
              Portfolio Overview
            </Text>
            {portfolio.length > 0 ? (
              <>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th color="gray.300" borderColor="gray.600">Token</Th>
                      <Th color="gray.300" borderColor="gray.600">Amount</Th>
                      <Th color="gray.300" borderColor="gray.600">Value (USD)</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {portfolio.map((asset, index) => (
                      <Tr key={index}>
                        <Td color="gray.200" borderColor="gray.600">{asset.token}</Td>
                        <Td color="gray.200" borderColor="gray.600">
                          {asset.amount.toFixed(asset.token === 'USDC' ? 2 : 6)}
                        </Td>
                        <Td color="gray.200" borderColor="gray.600">
                          ${asset.valueUSD.toFixed(2)}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
                <Text color="green.300" mt={2} fontWeight="bold" fontSize="sm">
                  Total Value: ${totalPortfolioValue.toFixed(2)}
                </Text>
              </>
            ) : (
              <Center height="200px">
                <Text color="gray.400">No portfolio data available</Text>
              </Center>
            )}
            <Text color="gray.400" mt={4} fontSize="sm">
              Your positions in Euler Finance
            </Text>
          </CardBody>
        </MotionCard>

        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          bg="gray.800"
          borderColor="purple.500"
          borderWidth="1px"
          _hover={{ 
            transform: "translateY(-4px)",
            boxShadow: "0 8px 25px rgba(147, 51, 234, 0.3)"
          }}
        >
          <CardBody>
            <Text color="violet.300" mb={2} fontWeight="bold" fontSize="lg">
              Protocol Risk Score
            </Text>
            <Text 
              fontSize="4xl" 
              color={riskScore > 3 ? "red.400" : riskScore > 2 ? "yellow.400" : "green.400"}
              fontWeight="bold"
              textShadow="0 0 10px rgba(147, 51, 234, 0.5)"
            >
              {riskScore.toFixed(1)}/5
            </Text>
            <Text color="gray.400" mt={2} fontSize="sm">
              {riskScore <= 2 ? "Low Risk" : riskScore <= 3 ? "Medium Risk" : "High Risk"}
            </Text>
            <Text color="gray.400" mt={4} fontSize="sm">
              Based on protocol utilization and market conditions
            </Text>
          </CardBody>
        </MotionCard>
      </SimpleGrid>
    </Box>
  );
}