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
} from "chart.js";
import "chartjs-adapter-date-fns"; // For date handling in charts

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
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
  const [ilRisk, setIlRisk] = useState<number>(0);

  // Fetch data from API
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/pool");
        const data = await res.json();
        setPoolData(data.apyData);
        setPortfolio(data.portfolio);
        setIlRisk(data.ilRisk);
      } catch (error) {
        console.error("Error fetching pool data:", error);
      }
    }
    fetchData();
  }, []);

  // Chart.js configuration for APY line chart
  const chartData = {
    datasets: [
      {
        label: "USDC/WETH Pool APY (%)",
        data: poolData.map((point) => ({
          x: new Date(point.timestamp),
          y: point.apy,
        })),
        borderColor: "rgba(255, 202, 40, 0.8)", // gold.400
        backgroundColor: "rgba(255, 202, 40, 0.2)",
        pointBackgroundColor: "rgba(255, 202, 40, 1)",
        pointBorderColor: "rgba(255, 255, 255, 0.8)",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, labels: { color: "#FAFAFA" } }, // platinum.100
      tooltip: { backgroundColor: "rgba(29, 32, 44, 0.9)" }, // gray.800
    },
    scales: {
      x: {
        type: "time" as const,
        time: { unit: "day" },
        title: { display: true, text: "Date", color: "#FAFAFA" },
        grid: { color: "rgba(156, 39, 176, 0.2)" }, // mystic.500
      },
      y: {
        title: { display: true, text: "APY (%)", color: "#FAFAFA" },
        grid: { color: "rgba(156, 39, 176, 0.2)" },
      },
    },
  };

  return (
    <Box p={8} bgGradient="linear(to-br, gray.900, mystic.900, indigo.900)">
      <Heading as="h2" size="xl" variant="glowing" mb={6}>
        Eulixir Dashboard
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <CardBody>
            <Text variant="azure" mb={2}>
              USDC/WETH Pool APY
            </Text>
            <Box height="300px">
              <Line data={chartData} options={chartOptions} />
            </Box>
            <Text variant="dataLabel" mt={4}>
              Real-time yield analytics powered by quantum algorithms
            </Text>
          </CardBody>
        </MotionCard>
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <CardBody>
            <Text variant="mystic" mb={2}>
              Portfolio Overview
            </Text>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th color="platinum.100">Token</Th>
                  <Th color="platinum.100">Amount</Th>
                  <Th color="platinum.100">Value (USD)</Th>
                </Tr>
              </Thead>
              <Tbody>
                {portfolio.map((asset, index) => (
                  <Tr key={index}>
                    <Td color="gray.200">{asset.token}</Td>
                    <Td color="gray.200">{asset.amount.toFixed(2)}</Td>
                    <Td color="gray.200">${asset.valueUSD.toFixed(2)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <Text variant="dataLabel" mt={4}>
              Deposited Assets
            </Text>
          </CardBody>
        </MotionCard>
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <CardBody>
            <Text variant="violet" mb={2}>
              Impermanent Loss Risk
            </Text>
            <Text fontSize="4xl" color="mystic.400" fontWeight="bold">
              {ilRisk.toFixed(2)}%
            </Text>
            <Text variant="dataLabel" mt={4}>
              Quantum-calculated IL risk for USDC/WETH pool
            </Text>
          </CardBody>
        </MotionCard>
      </SimpleGrid>
    </Box>
  );
}
