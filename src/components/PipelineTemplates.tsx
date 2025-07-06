"use client";

import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Badge,
  SimpleGrid,
  Icon,
  useToast,
} from '@chakra-ui/react';
import { 
  TrendingUp, 
  PieChart, 
  AlertTriangle, 
  BarChart3, 
  DollarSign, 
  Target,
  Calendar,
  Activity
} from 'lucide-react';

const pipelineTemplates = [
  {
    id: 'yield-tracker',
    name: 'Yield Farming Tracker',
    description: 'Track yield farming positions across multiple protocols',
    icon: TrendingUp,
    category: 'DeFi Analytics',
    difficulty: 'Beginner',
    estimatedTime: '5 min',
    useCase: 'Monitor APY changes, track farming rewards, and optimize positions',
    nodes: [
      { type: 'source', name: 'Uniswap V3 Pools' },
      { type: 'source', name: 'Compound V3' },
      { type: 'transform', name: 'Calculate APY' },
      { type: 'transform', name: 'Risk Assessment' },
      { type: 'output', name: 'Line Chart' },
      { type: 'output', name: 'Email Alert' }
    ]
  },
  {
    id: 'portfolio-analyzer',
    name: 'Portfolio Risk Analyzer',
    description: 'Comprehensive portfolio risk analysis with VaR calculations',
    icon: PieChart,
    category: 'Risk Management',
    difficulty: 'Intermediate',
    estimatedTime: '10 min',
    useCase: 'Calculate portfolio risk metrics, correlation analysis, and stress testing',
    nodes: [
      { type: 'source', name: 'Wallet Transactions' },
      { type: 'source', name: 'CoinGecko Prices' },
      { type: 'transform', name: 'Portfolio Allocation' },
      { type: 'transform', name: 'Risk Metrics' },
      { type: 'output', name: 'Risk Dashboard' },
      { type: 'output', name: 'CSV Export' }
    ]
  },
  {
    id: 'liquidation-monitor',
    name: 'Liquidation Risk Monitor',
    description: 'Real-time monitoring of liquidation risks across lending protocols',
    icon: AlertTriangle,
    category: 'Risk Management',
    difficulty: 'Advanced',
    estimatedTime: '15 min',
    useCase: 'Monitor collateral ratios, predict liquidation risks, and send alerts',
    nodes: [
      { type: 'source', name: 'Aave V3' },
      { type: 'source', name: 'Compound V3' },
      { type: 'transform', name: 'Liquidation Risk' },
      { type: 'transform', name: 'Threshold Filter' },
      { type: 'output', name: 'Alert System' },
      { type: 'output', name: 'Webhook' }
    ]
  },
  {
    id: 'pnl-tracker',
    name: 'P&L Tracker',
    description: 'Track profit and loss across all DeFi activities',
    icon: DollarSign,
    category: 'Performance',
    difficulty: 'Beginner',
    estimatedTime: '7 min',
    useCase: 'Calculate realized/unrealized P&L, track trading performance',
    nodes: [
      { type: 'source', name: 'Wallet Transactions' },
      { type: 'source', name: 'DEX Trades' },
      { type: 'transform', name: 'Calculate P&L' },
      { type: 'transform', name: 'Time Series' },
      { type: 'output', name: 'P&L Chart' },
      { type: 'output', name: 'Monthly Report' }
    ]
  },
  {
    id: 'arbitrage-scanner',
    name: 'Arbitrage Scanner',
    description: 'Scan for arbitrage opportunities across DEXs',
    icon: Target,
    category: 'Trading',
    difficulty: 'Advanced',
    estimatedTime: '20 min',
    useCase: 'Find price differences, calculate profit margins, and execute trades',
    nodes: [
      { type: 'source', name: 'Uniswap V3' },
      { type: 'source', name: 'Sushiswap' },
      { type: 'transform', name: 'Price Comparison' },
      { type: 'transform', name: 'Profit Calculator' },
      { type: 'output', name: 'Opportunity Alert' },
      { type: 'output', name: 'Trading Signal' }
    ]
  },
  {
    id: 'defi-dashboard',
    name: 'Custom DeFi Dashboard',
    description: 'Build a personalized DeFi analytics dashboard',
    icon: BarChart3,
    category: 'Analytics',
    difficulty: 'Intermediate',
    estimatedTime: '12 min',
    useCase: 'Create custom visualizations and KPIs for your DeFi portfolio',
    nodes: [
      { type: 'source', name: 'Multi-Protocol Data' },
      { type: 'transform', name: 'Custom Metrics' },
      { type: 'transform', name: 'Aggregation' },
      { type: 'output', name: 'Dashboard' },
      { type: 'output', name: 'PDF Report' }
    ]
  },
  {
    id: 'weth-monitor',
    name: 'WETH Yield Monitor',
    description: 'Track WETH lending rates and yield opportunities',
    icon: TrendingUp,
    category: 'Token Focus',
    difficulty: 'Beginner',
    estimatedTime: '6 min',
    useCase: 'Monitor WETH yields across Aave, Compound, Euler and find best rates',
    nodes: [
      { type: 'source', name: 'WETH Data Source' },
      { type: 'source', name: 'Aave V3' },
      { type: 'source', name: 'Compound V3' },
      { type: 'transform', name: 'WETH Analytics' },
      { type: 'transform', name: 'Yield Comparison' },
      { type: 'output', name: 'Yield Comparison Chart' },
      { type: 'output', name: 'Risk Alert System' }
    ]
  },
  {
    id: 'usdc-yield-tracker',
    name: 'USDC Yield Optimizer',
    description: 'Find the best USDC yields and track supply metrics',
    icon: DollarSign,
    category: 'Token Focus',
    difficulty: 'Beginner',
    estimatedTime: '5 min',
    useCase: 'Optimize USDC yields, monitor supply growth and depeg risks',
    nodes: [
      { type: 'source', name: 'USDC Data Source' },
      { type: 'source', name: 'CoinGecko Prices' },
      { type: 'transform', name: 'USDC Analytics' },
      { type: 'transform', name: 'Risk Metrics' },
      { type: 'output', name: 'Token Dashboard' },
      { type: 'output', name: 'Email Alert' }
    ]
  },
  {
    id: 'wbtc-backing-monitor',
    name: 'WBTC Backing Monitor',
    description: 'Monitor WBTC backing ratio and custodian health',
    icon: AlertTriangle,
    category: 'Token Focus',
    difficulty: 'Intermediate',
    estimatedTime: '8 min',
    useCase: 'Track WBTC backing ratio, mint/burn activity, and custodian risks',
    nodes: [
      { type: 'source', name: 'WBTC Data Source' },
      { type: 'source', name: 'Bitcoin Network Data' },
      { type: 'transform', name: 'WBTC Analytics' },
      { type: 'transform', name: 'Backing Verification' },
      { type: 'output', name: 'Risk Dashboard' },
      { type: 'output', name: 'Risk Alert System' }
    ]
  },
  {
    id: 'three-token-correlation',
    name: 'WETH/USDC/WBTC Correlation',
    description: 'Analyze correlations and relationships between the three major tokens',
    icon: Target,
    category: 'Cross-Asset',
    difficulty: 'Advanced',
    estimatedTime: '15 min',
    useCase: 'Understand how WETH, USDC, and WBTC move together for portfolio optimization',
    nodes: [
      { type: 'source', name: 'WETH Data Source' },
      { type: 'source', name: 'USDC Data Source' },
      { type: 'source', name: 'WBTC Data Source' },
      { type: 'transform', name: 'Token Correlation' },
      { type: 'transform', name: 'Statistical Analysis' },
      { type: 'output', name: 'Correlation Matrix' },
      { type: 'output', name: 'Portfolio Optimization' }
    ]
  },
  {
    id: 'token-arbitrage',
    name: 'Cross-Token Arbitrage Scanner',
    description: 'Find arbitrage opportunities between WETH, USDC, WBTC pairs',
    icon: Activity,
    category: 'Trading',
    difficulty: 'Advanced',
    estimatedTime: '18 min',
    useCase: 'Scan for arbitrage opportunities across DEXs for major token pairs',
    nodes: [
      { type: 'source', name: 'Uniswap V3 Pools' },
      { type: 'source', name: 'Sushiswap Pools' },
      { type: 'source', name: 'Curve Pools' },
      { type: 'transform', name: 'Price Comparison' },
      { type: 'transform', name: 'Profit Calculator' },
      { type: 'output', name: 'Arbitrage Alerts' },
      { type: 'output', name: 'Trading Dashboard' }
    ]
  },
  {
    id: 'eulerswap-position-tracker',
    name: 'EulerSwap Position Tracker',
    description: 'Comprehensive tracking of EulerSwap LP positions',
    icon: PieChart,
    category: 'EulerSwap',
    difficulty: 'Beginner',
    estimatedTime: '8 min',
    useCase: 'Monitor all EulerSwap LP positions, yields, and performance metrics',
    nodes: [
      { type: 'source', name: 'EulerSwap LP Positions' },
      { type: 'source', name: 'LP Yield Tracker' },
      { type: 'transform', name: 'LP Performance Calculator' },
      { type: 'transform', name: 'Yield Optimizer' },
      { type: 'output', name: 'LP Position Dashboard' },
      { type: 'output', name: 'Performance Report' }
    ]
  },
  {
    id: 'il-protection-system',
    name: 'Impermanent Loss Protection',
    description: 'Advanced IL monitoring and hedging system',
    icon: AlertTriangle,
    category: 'Risk Management',
    difficulty: 'Advanced',
    estimatedTime: '20 min',
    useCase: 'Monitor IL exposure and implement automated hedging strategies',
    nodes: [
      { type: 'source', name: 'EulerSwap LP Positions' },
      { type: 'source', name: 'IL Monitor' },
      { type: 'transform', name: 'IL Calculator' },
      { type: 'transform', name: 'Hedging Strategy Engine' },
      { type: 'output', name: 'IL Alert System' },
      { type: 'output', name: 'Hedging Recommendations' }
    ]
  },
  {
    id: 'yield-maximizer',
    name: 'LP Yield Maximizer',
    description: 'Optimize LP strategies for maximum yield',
    icon: TrendingUp,
    category: 'Strategy',
    difficulty: 'Intermediate',
    estimatedTime: '15 min',
    useCase: 'Compare yields across protocols and optimize LP position strategies',
    nodes: [
      { type: 'source', name: 'EulerSwap LP Positions' },
      { type: 'source', name: 'Uniswap V3 Pools' },
      { type: 'source', name: 'LP Yield Tracker' },
      { type: 'transform', name: 'Yield Optimizer' },
      { type: 'transform', name: 'Position Rebalancer' },
      { type: 'output', name: 'Yield Comparison Table' },
      { type: 'output', name: 'Rebalancing Alerts' }
    ]
  },
  {
    id: 'lp-risk-analyzer',
    name: 'LP Risk Analyzer',
    description: 'Comprehensive risk analysis for LP positions',
    icon: Activity,
    category: 'Risk Management',
    difficulty: 'Intermediate',
    estimatedTime: '12 min',
    useCase: 'Analyze all risks associated with LP positions including IL, smart contract, and market risks',
    nodes: [
      { type: 'source', name: 'EulerSwap LP Positions' },
      { type: 'source', name: 'IL Monitor' },
      { type: 'transform', name: 'Risk Metrics' },
      { type: 'transform', name: 'IL Calculator' },
      { type: 'output', name: 'Risk Dashboard' },
      { type: 'output', name: 'Risk Alert System' }
    ]
  },
  {
    id: 'automated-lp-manager',
    name: 'Automated LP Manager',
    description: 'Fully automated LP position management system',
    icon: BarChart3,
    category: 'Automation',
    difficulty: 'Advanced',
    estimatedTime: '25 min',
    useCase: 'Automate LP position management with rebalancing, yield optimization, and risk management',
    nodes: [
      { type: 'source', name: 'EulerSwap LP Positions' },
      { type: 'source', name: 'LP Yield Tracker' },
      { type: 'source', name: 'IL Monitor' },
      { type: 'transform', name: 'Yield Optimizer' },
      { type: 'transform', name: 'Position Rebalancer' },
      { type: 'transform', name: 'Hedging Strategy Engine' },
      { type: 'output', name: 'LP Dashboard' },
      { type: 'output', name: 'Automation Alerts' },
      { type: 'output', name: 'Performance Report' }
    ]
  }
];

interface PipelineTemplateProps {
  onSelectTemplate: (template: any) => void;
}

export default function PipelineTemplates({ onSelectTemplate }: PipelineTemplateProps) {
  const toast = useToast();

  const handleUseTemplate = (template: any) => {
    onSelectTemplate(template);
    toast({
      title: "Template Selected",
      description: `${template.name} template has been loaded`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'green';
      case 'Intermediate': return 'yellow';
      case 'Advanced': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color="white" mb={2}>
            Pipeline Templates
          </Text>
          <Text color="gray.400" fontSize="lg">
            Get started quickly with pre-built templates for common DeFi use cases
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {pipelineTemplates.map((template) => (
            <Card
              key={template.id}
              bg="rgba(26, 32, 44, 0.8)"
              border="1px solid"
              borderColor="rgba(255, 255, 255, 0.1)"
              _hover={{
                borderColor: "purple.400",
                transform: "translateY(-2px)",
                boxShadow: "0 10px 30px rgba(147, 51, 234, 0.2)"
              }}
              transition="all 0.3s ease"
            >
              <CardHeader>
                <VStack align="start" spacing={3}>
                  <HStack justify="space-between" w="full">
                    <Icon as={template.icon} color="purple.400" boxSize={6} />
                    <Badge 
                      colorScheme={getDifficultyColor(template.difficulty)}
                      variant="subtle"
                      size="sm"
                    >
                      {template.difficulty}
                    </Badge>
                  </HStack>
                  
                  <Box>
                    <Text fontSize="lg" fontWeight="bold" color="white" mb={1}>
                      {template.name}
                    </Text>
                    <Text fontSize="sm" color="gray.400">
                      {template.description}
                    </Text>
                  </Box>
                </VStack>
              </CardHeader>

              <CardBody pt={0}>
                <VStack align="start" spacing={4}>
                  <HStack justify="space-between" w="full">
                    <Badge colorScheme="purple" variant="outline" size="sm">
                      {template.category}
                    </Badge>
                    <HStack spacing={2}>
                      <Icon as={Calendar} size="12px" color="gray.400" />
                      <Text fontSize="xs" color="gray.400">
                        {template.estimatedTime}
                      </Text>
                    </HStack>
                  </HStack>

                  <Box>
                    <Text fontSize="sm" color="gray.300" mb={2}>
                      <strong>Use Case:</strong> {template.useCase}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="sm" color="gray.300" mb={2}>
                      <strong>Pipeline Components:</strong>
                    </Text>
                    <HStack spacing={2} flexWrap="wrap">
                      {template.nodes.map((node, idx) => (
                        <Badge 
                          key={idx}
                          size="xs"
                          colorScheme={
                            node.type === 'source' ? 'blue' : 
                            node.type === 'transform' ? 'orange' : 'green'
                          }
                          variant="subtle"
                        >
                          {node.name}
                        </Badge>
                      ))}
                    </HStack>
                  </Box>

                  <Button
                    colorScheme="purple"
                    size="sm"
                    w="full"
                    onClick={() => handleUseTemplate(template)}
                  >
                    Use This Template
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        <Card
          bg="rgba(26, 32, 44, 0.8)"
          border="1px solid"
          borderColor="rgba(255, 255, 255, 0.1)"
        >
          <CardBody>
            <HStack spacing={4}>
              <Icon as={Activity} color="blue.400" boxSize={6} />
              <VStack align="start" spacing={1}>
                <Text fontSize="lg" fontWeight="bold" color="white">
                  Need a Custom Pipeline?
                </Text>
                <Text fontSize="sm" color="gray.400">
                  Start from scratch with our drag-and-drop builder or request a custom template
                </Text>
              </VStack>
              <Button colorScheme="blue" variant="outline" size="sm">
                Build Custom Pipeline
              </Button>
            </HStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}