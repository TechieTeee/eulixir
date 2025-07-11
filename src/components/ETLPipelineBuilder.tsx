"use client";

import React, { useState, useCallback, lazy, Suspense } from 'react';
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
  IconButton,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Textarea,
  Spinner,
} from '@chakra-ui/react';
import {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  NodeTypes,
  Handle,
  Position,
  MarkerType,
} from '@xyflow/react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import LoadingSpinner from './LoadingSpinner';

// Lazy load heavy React Flow components
const ReactFlow = lazy(() => import('@xyflow/react').then(module => ({ default: module.ReactFlow })));
const Controls = lazy(() => import('@xyflow/react').then(module => ({ default: module.Controls })));
const Background = lazy(() => import('@xyflow/react').then(module => ({ default: module.Background })));
const MiniMap = lazy(() => import('@xyflow/react').then(module => ({ default: module.MiniMap })));
import { 
  Database, 
  GitBranch, 
  Filter, 
  BarChart3, 
  Download, 
  Play, 
  Save, 
  Settings,
  ArrowRight,
  Zap,
  TrendingUp,
  PieChart,
  Target,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Edit,
  BookOpen
} from 'lucide-react';
import PipelineTemplates from './PipelineTemplates';

// Node types for the pipeline
interface PipelineNodeData extends Record<string, unknown> {
  label: string;
  type: 'source' | 'transform' | 'output';
  category: string;
  description?: string;
  config?: Record<string, unknown>;
  status?: 'idle' | 'running' | 'success' | 'error';
  icon?: React.ReactNode;
}


// Available node templates
const nodeTemplates = {
  sources: [
    {
      id: 'uniswap-v3',
      label: 'Uniswap V3 Pools',
      category: 'DeFi',
      description: 'Fetch liquidity pool data from Uniswap V3',
      icon: <Database className="w-4 h-4" />,
      config: { protocols: ['uniswap-v3'], dataTypes: ['pools', 'positions', 'fees'] }
    },
    {
      id: 'compound-v3',
      label: 'Compound V3',
      category: 'DeFi',
      description: 'Get lending rates and positions from Compound',
      icon: <TrendingUp className="w-4 h-4" />,
      config: { protocols: ['compound-v3'], dataTypes: ['markets', 'accounts', 'rates'] }
    },
    {
      id: 'aave-v3',
      label: 'Aave V3',
      category: 'DeFi',
      description: 'Fetch lending and borrowing data from Aave',
      icon: <BarChart3 className="w-4 h-4" />,
      config: { protocols: ['aave-v3'], dataTypes: ['reserves', 'users', 'liquidations'] }
    },
    {
      id: 'ethereum-blocks',
      label: 'Ethereum Blocks',
      category: 'Blockchain',
      description: 'Real-time Ethereum block data',
      icon: <Database className="w-4 h-4" />,
      config: { network: 'ethereum', dataTypes: ['blocks', 'transactions', 'logs'] }
    },
    {
      id: 'wallet-transactions',
      label: 'Wallet Transactions',
      category: 'Blockchain',
      description: 'Track specific wallet transactions',
      icon: <Target className="w-4 h-4" />,
      config: { dataTypes: ['transactions', 'transfers', 'balances'] }
    },
    {
      id: 'coingecko-prices',
      label: 'CoinGecko Prices',
      category: 'Market Data',
      description: 'Token prices and market data',
      icon: <DollarSign className="w-4 h-4" />,
      config: { dataTypes: ['prices', 'market_caps', 'volumes'] }
    },
    {
      id: 'weth-data',
      label: 'WETH Data Source',
      category: 'Token Specific',
      description: 'Wrapped Ethereum data across all protocols',
      icon: <Target className="w-4 h-4" />,
      config: { 
        token: 'WETH',
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        dataTypes: ['price', 'volume', 'liquidity', 'lending_rates', 'dex_pairs']
      }
    },
    {
      id: 'usdc-data',
      label: 'USDC Data Source',
      category: 'Token Specific',
      description: 'USD Coin data across DeFi protocols',
      icon: <DollarSign className="w-4 h-4" />,
      config: { 
        token: 'USDC',
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        dataTypes: ['price', 'volume', 'supply', 'lending_rates', 'yield_opportunities']
      }
    },
    {
      id: 'wbtc-data',
      label: 'WBTC Data Source',
      category: 'Token Specific',
      description: 'Wrapped Bitcoin data and metrics',
      icon: <TrendingUp className="w-4 h-4" />,
      config: { 
        token: 'WBTC',
        address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        dataTypes: ['price', 'volume', 'backing_ratio', 'lending_rates', 'bridge_data']
      }
    },
    {
      id: 'eulerswap-positions',
      label: 'EulerSwap LP Positions',
      category: 'DeFi',
      description: 'Track EulerSwap liquidity provider positions',
      icon: <PieChart className="w-4 h-4" />,
      config: { 
        dataTypes: ['positions', 'liquidity', 'fees', 'performance'],
        protocols: ['eulerswap'],
        positionTypes: ['active', 'closed', 'all']
      }
    },
    {
      id: 'lp-yield-tracker',
      label: 'LP Yield Tracker',
      category: 'DeFi',
      description: 'Monitor yield and performance of LP positions',
      icon: <TrendingUp className="w-4 h-4" />,
      config: { 
        dataTypes: ['apy', 'fees', 'rewards', 'volume'],
        timeframes: ['1h', '24h', '7d', '30d'],
        protocols: ['uniswap', 'sushiswap', 'eulerswap']
      }
    },
    {
      id: 'il-monitor',
      label: 'Impermanent Loss Monitor',
      category: 'Risk Management',
      description: 'Real-time impermanent loss tracking',
      icon: <AlertTriangle className="w-4 h-4" />,
      config: { 
        dataTypes: ['current_il', 'max_il', 'il_history'],
        alertThresholds: [2, 5, 10],
        notifications: ['email', 'webhook', 'dashboard']
      }
    }
  ],
  transforms: [
    {
      id: 'filter-data',
      label: 'Filter Data',
      category: 'Data Processing',
      description: 'Filter data based on conditions',
      icon: <Filter className="w-4 h-4" />,
      config: { filterType: 'condition', operators: ['>', '<', '=', '!=', 'contains'] }
    },
    {
      id: 'aggregate-data',
      label: 'Aggregate Data',
      category: 'Data Processing',
      description: 'Group and aggregate data',
      icon: <GitBranch className="w-4 h-4" />,
      config: { aggregations: ['sum', 'avg', 'count', 'min', 'max'], groupBy: [] }
    },
    {
      id: 'calculate-pnl',
      label: 'Calculate P&L',
      category: 'Finance',
      description: 'Calculate profit and loss metrics',
      icon: <TrendingUp className="w-4 h-4" />,
      config: { calculations: ['realized_pnl', 'unrealized_pnl', 'total_pnl'] }
    },
    {
      id: 'risk-metrics',
      label: 'Risk Metrics',
      category: 'Finance',
      description: 'Calculate risk metrics like VaR, volatility',
      icon: <AlertTriangle className="w-4 h-4" />,
      config: { metrics: ['var', 'volatility', 'sharpe_ratio', 'max_drawdown'] }
    },
    {
      id: 'time-series',
      label: 'Time Series',
      category: 'Analysis',
      description: 'Time-based data analysis',
      icon: <Calendar className="w-4 h-4" />,
      config: { intervals: ['1m', '5m', '1h', '1d', '1w'], operations: ['resample', 'rolling'] }
    },
    {
      id: 'portfolio-allocation',
      label: 'Portfolio Allocation',
      category: 'Finance',
      description: 'Calculate asset allocation percentages',
      icon: <PieChart className="w-4 h-4" />,
      config: { allocationType: 'percentage', rebalanceFreq: 'daily' }
    },
    {
      id: 'weth-analytics',
      label: 'WETH Analytics',
      category: 'Token Analysis',
      description: 'WETH-specific calculations and metrics',
      icon: <BarChart3 className="w-4 h-4" />,
      config: { 
        metrics: ['eth_premium', 'unwrap_volume', 'gas_efficiency', 'dex_arbitrage'],
        timeframes: ['1h', '24h', '7d']
      }
    },
    {
      id: 'usdc-analytics',
      label: 'USDC Analytics',
      category: 'Token Analysis',
      description: 'USDC supply, demand, and yield analysis',
      icon: <DollarSign className="w-4 h-4" />,
      config: { 
        metrics: ['supply_growth', 'yield_comparison', 'depeg_risk', 'circulation'],
        protocols: ['compound', 'aave', 'maker']
      }
    },
    {
      id: 'wbtc-analytics',
      label: 'WBTC Analytics',
      category: 'Token Analysis',
      description: 'WBTC backing ratio and bridge analysis',
      icon: <TrendingUp className="w-4 h-4" />,
      config: { 
        metrics: ['backing_ratio', 'mint_burn_activity', 'custodian_health', 'btc_premium'],
        alerts: ['backing_threshold', 'large_mints', 'custodian_changes']
      }
    },
    {
      id: 'token-correlation',
      label: 'Token Correlation',
      category: 'Cross-Asset',
      description: 'Analyze correlations between WETH, USDC, WBTC',
      icon: <GitBranch className="w-4 h-4" />,
      config: { 
        tokens: ['WETH', 'USDC', 'WBTC'],
        metrics: ['price_correlation', 'volume_correlation', 'volatility_correlation'],
        timeframes: ['1h', '1d', '7d', '30d']
      }
    },
    {
      id: 'lp-performance-calculator',
      label: 'LP Performance Calculator',
      category: 'DeFi Analysis',
      description: 'Calculate comprehensive LP position performance',
      icon: <BarChart3 className="w-4 h-4" />,
      config: { 
        metrics: ['total_return', 'apy', 'fees_earned', 'hodl_comparison'],
        timeframes: ['1d', '7d', '30d', 'inception'],
        comparison: ['hodl', 'lending', 'staking']
      }
    },
    {
      id: 'il-calculator',
      label: 'Impermanent Loss Calculator',
      category: 'Risk Analysis',
      description: 'Calculate and predict impermanent loss',
      icon: <AlertTriangle className="w-4 h-4" />,
      config: { 
        calculations: ['current_il', 'projected_il', 'max_tolerable_il'],
        scenarios: ['price_increase', 'price_decrease', 'volatility_spike'],
        hedging: ['options', 'perps', 'rebalancing']
      }
    },
    {
      id: 'yield-optimizer',
      label: 'Yield Optimizer',
      category: 'Strategy',
      description: 'Optimize LP positions for maximum yield',
      icon: <Target className="w-4 h-4" />,
      config: { 
        strategies: ['concentration', 'range_management', 'fee_tier_selection'],
        protocols: ['uniswap_v3', 'eulerswap', 'curve'],
        optimization: ['apy', 'risk_adjusted', 'sharpe_ratio']
      }
    },
    {
      id: 'hedging-strategy',
      label: 'Hedging Strategy Engine',
      category: 'Risk Management',
      description: 'Generate and execute hedging strategies',
      icon: <CheckCircle className="w-4 h-4" />,
      config: { 
        strategies: ['options_collar', 'perp_hedge', 'delta_neutral'],
        riskLevels: ['conservative', 'moderate', 'aggressive'],
        instruments: ['options', 'futures', 'spot']
      }
    },
    {
      id: 'position-rebalancer',
      label: 'Position Rebalancer',
      category: 'Automation',
      description: 'Automated LP position rebalancing',
      icon: <GitBranch className="w-4 h-4" />,
      config: { 
        triggers: ['price_range', 'time_based', 'profit_target'],
        frequency: ['hourly', 'daily', 'weekly'],
        conditions: ['gas_price', 'slippage', 'volume']
      }
    },
    {
      id: 'data-validator',
      label: 'Data Validator',
      category: 'Quality Control',
      description: 'Validate data integrity and consistency',
      icon: <CheckCircle className="w-4 h-4" />,
      config: { 
        validations: ['schema_check', 'range_validation', 'format_check', 'consistency_check'],
        actions: ['reject', 'flag', 'correct', 'alert'],
        severity: ['warning', 'error', 'critical'],
        reporting: true
      }
    },
    {
      id: 'anomaly-detector',
      label: 'Anomaly Detector',
      category: 'Quality Control',
      description: 'Detect data anomalies and outliers',
      icon: <AlertTriangle className="w-4 h-4" />,
      config: { 
        methods: ['statistical', 'ml_based', 'threshold', 'pattern_based'],
        sensitivity: ['low', 'medium', 'high'],
        actions: ['flag', 'isolate', 'alert', 'investigate'],
        learning: true
      }
    },
    {
      id: 'data-formatter',
      label: 'Data Formatter',
      category: 'Preparation',
      description: 'Format data for specific export requirements',
      icon: <Settings className="w-4 h-4" />,
      config: { 
        formats: ['financial', 'scientific', 'percentage', 'currency'],
        precision: [2, 4, 6, 8],
        localization: ['US', 'EU', 'UK', 'custom'],
        standards: ['ISO', 'GAAP', 'IFRS']
      }
    }
  ],
  outputs: [
    {
      id: 'line-chart',
      label: 'Line Chart',
      category: 'Visualization',
      description: 'Create time-series line charts',
      icon: <BarChart3 className="w-4 h-4" />,
      config: { chartType: 'line', xAxis: 'time', yAxis: 'value' }
    },
    {
      id: 'pie-chart',
      label: 'Pie Chart',
      category: 'Visualization',
      description: 'Create pie charts for distributions',
      icon: <PieChart className="w-4 h-4" />,
      config: { chartType: 'pie', valueField: 'value', labelField: 'label' }
    },
    {
      id: 'data-table',
      label: 'Data Table',
      category: 'Visualization',
      description: 'Display data in tabular format',
      icon: <Database className="w-4 h-4" />,
      config: { pagination: true, sortable: true, filterable: true }
    },
    {
      id: 'csv-export',
      label: 'CSV Export',
      category: 'Export',
      description: 'Export data to CSV file',
      icon: <Download className="w-4 h-4" />,
      config: { filename: 'data.csv', includeHeaders: true }
    },
    {
      id: 'webhook',
      label: 'Webhook',
      category: 'Integration',
      description: 'Send data to external webhook',
      icon: <Zap className="w-4 h-4" />,
      config: { method: 'POST', headers: {}, frequency: 'realtime' }
    },
    {
      id: 'email-alert',
      label: 'Email Alert',
      category: 'Notification',
      description: 'Send email notifications',
      icon: <AlertTriangle className="w-4 h-4" />,
      config: { recipients: [], subject: '', threshold: 0 }
    },
    {
      id: 'token-dashboard',
      label: 'Token Dashboard',
      category: 'Visualization',
      description: 'Comprehensive dashboard for WETH/USDC/WBTC',
      icon: <BarChart3 className="w-4 h-4" />,
      config: { 
        tokens: ['WETH', 'USDC', 'WBTC'],
        widgets: ['price_chart', 'volume_chart', 'metrics_table', 'correlation_matrix'],
        refreshRate: '30s'
      }
    },
    {
      id: 'yield-comparison',
      label: 'Yield Comparison Chart',
      category: 'Visualization',
      description: 'Compare yields across protocols for these tokens',
      icon: <TrendingUp className="w-4 h-4" />,
      config: { 
        tokens: ['WETH', 'USDC', 'WBTC'],
        protocols: ['aave', 'compound', 'euler'],
        chartType: 'comparison_bar'
      }
    },
    {
      id: 'risk-alert',
      label: 'Risk Alert System',
      category: 'Notification',
      description: 'Automated alerts for token-specific risks',
      icon: <AlertTriangle className="w-4 h-4" />,
      config: { 
        alerts: ['depeg_risk', 'high_volatility', 'low_liquidity', 'backing_issues'],
        thresholds: { depeg: 0.02, volatility: 0.1, liquidity: 1000000 },
        channels: ['email', 'webhook', 'dashboard']
      }
    },
    {
      id: 'lp-dashboard',
      label: 'LP Position Dashboard',
      category: 'Visualization',
      description: 'Comprehensive LP position monitoring dashboard',
      icon: <BarChart3 className="w-4 h-4" />,
      config: { 
        widgets: ['position_overview', 'performance_chart', 'il_tracker', 'yield_metrics'],
        refreshRate: '10s',
        protocols: ['eulerswap', 'uniswap', 'sushiswap'],
        layout: 'grid'
      }
    },
    {
      id: 'il-alert-system',
      label: 'IL Alert System',
      category: 'Notification',
      description: 'Smart alerts for impermanent loss thresholds',
      icon: <AlertTriangle className="w-4 h-4" />,
      config: { 
        thresholds: [2, 5, 10, 15],
        alertTypes: ['threshold_breach', 'trend_warning', 'hedge_recommendation'],
        channels: ['email', 'sms', 'webhook', 'push'],
        urgency: ['low', 'medium', 'high', 'critical']
      }
    },
    {
      id: 'hedging-recommendations',
      label: 'Hedging Recommendations',
      category: 'Strategy',
      description: 'AI-powered hedging strategy recommendations',
      icon: <Target className="w-4 h-4" />,
      config: { 
        strategies: ['options', 'futures', 'rebalancing', 'correlation'],
        riskProfiles: ['conservative', 'moderate', 'aggressive'],
        effectiveness: ['high', 'medium', 'low'],
        complexity: ['simple', 'intermediate', 'advanced']
      }
    },
    {
      id: 'performance-report',
      label: 'Performance Report',
      category: 'Reporting',
      description: 'Detailed LP position performance reports',
      icon: <Download className="w-4 h-4" />,
      config: { 
        formats: ['pdf', 'excel', 'csv', 'json'],
        frequency: ['daily', 'weekly', 'monthly', 'on_demand'],
        sections: ['summary', 'detailed_analysis', 'recommendations', 'charts'],
        delivery: ['email', 'download', 'webhook']
      }
    },
    {
      id: 'yield-comparison-table',
      label: 'Yield Comparison Table',
      category: 'Visualization',
      description: 'Compare yields across different LP strategies',
      icon: <PieChart className="w-4 h-4" />,
      config: { 
        protocols: ['eulerswap', 'uniswap_v3', 'curve', 'balancer'],
        metrics: ['apy', 'fees', 'rewards', 'risk_adjusted_return'],
        timeframes: ['24h', '7d', '30d', '90d'],
        sorting: ['apy_desc', 'risk_asc', 'volume_desc']
      }
    },
    {
      id: 'data-quality-check',
      label: 'Data Quality Check',
      category: 'Quality Assurance',
      description: 'Automated data quality validation and alerts',
      icon: <CheckCircle className="w-4 h-4" />,
      config: { 
        checks: ['completeness', 'accuracy', 'consistency', 'timeliness', 'validity'],
        severity: ['low', 'medium', 'high', 'critical'],
        alertChannels: ['email', 'webhook', 'dashboard'],
        thresholds: { completeness: 95, accuracy: 98, timeliness: 90 }
      }
    },
    {
      id: 'csv-export',
      label: 'CSV Export',
      category: 'Export',
      description: 'Export data to CSV format',
      icon: <Download className="w-4 h-4" />,
      config: { 
        format: 'csv',
        includeHeaders: true,
        delimiter: ',',
        encoding: 'utf-8',
        includeMetadata: true
      }
    },
    {
      id: 'excel-export',
      label: 'Excel Export',
      category: 'Export',
      description: 'Export data to Excel spreadsheet',
      icon: <Download className="w-4 h-4" />,
      config: { 
        format: 'xlsx',
        includeCharts: true,
        multipleSheets: true,
        includeMetadata: true,
        formatting: true
      }
    },
    {
      id: 'pdf-export',
      label: 'PDF Report',
      category: 'Export',
      description: 'Generate professional PDF reports',
      icon: <Download className="w-4 h-4" />,
      config: { 
        format: 'pdf',
        includeCharts: true,
        template: 'professional',
        sections: ['summary', 'details', 'charts', 'appendix'],
        branding: true
      }
    },
    {
      id: 'json-export',
      label: 'JSON Export',
      category: 'Export',
      description: 'Export data in JSON format for APIs',
      icon: <Download className="w-4 h-4" />,
      config: { 
        format: 'json',
        prettyPrint: true,
        includeSchema: true,
        validation: true,
        compression: false
      }
    }
  ]
};

// Draggable node component
const DraggableNode = ({ node, isOverlay = false }: { node: { id: string; label: string; type?: string; category: string; description?: string; icon?: React.ReactNode; config?: Record<string, unknown> } | undefined, isOverlay?: boolean }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: node?.id || '',
    data: node,
  });

  if (!node) return null;

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      size="sm"
      cursor="grab"
      _hover={{ bg: "rgba(147, 51, 234, 0.1)", borderColor: "purple.400" }}
      bg={isOverlay ? "rgba(26, 32, 44, 0.9)" : "rgba(26, 32, 44, 0.8)"}
      border="1px solid"
      borderColor="rgba(255, 255, 255, 0.1)"
      p={3}
      minW="200px"
    >
      <HStack spacing={3}>
        <Box color="purple.400">{node.icon}</Box>
        <VStack align="start" spacing={1} flex={1}>
          <Text fontSize="sm" fontWeight="medium" color="white">
            {node.label}
          </Text>
          <Text fontSize="xs" color="gray.400" noOfLines={2}>
            {node.description}
          </Text>
        </VStack>
        <Badge size="sm" colorScheme="purple" variant="subtle">
          {node.category}
        </Badge>
      </HStack>
    </Card>
  );
};

// Custom node component for React Flow
const CustomNode = ({ data }: { data: PipelineNodeData }) => {
  // Determine which handles to show based on node type
  const showInputHandle = data.type !== 'source';
  const showOutputHandle = data.type !== 'output';

  return (
    <Box position="relative">
      {/* Input Handle - Left side */}
      {showInputHandle && (
        <Handle
          type="target"
          position={Position.Left}
          id="input"
          style={{
            background: '#9333EA',
            border: '2px solid #ffffff',
            width: '14px',
            height: '14px',
            left: '-7px',
            borderRadius: '50%',
            boxShadow: '0 0 8px rgba(147, 51, 234, 0.6)',
            transition: 'all 0.2s ease',
          }}
          className="custom-handle"
        />
      )}
      
      {/* Output Handle - Right side */}
      {showOutputHandle && (
        <Handle
          type="source"
          position={Position.Right}
          id="output"
          style={{
            background: '#10B981',
            border: '2px solid #ffffff',
            width: '14px',
            height: '14px',
            right: '-7px',
            borderRadius: '50%',
            boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)',
            transition: 'all 0.2s ease',
          }}
          className="custom-handle"
        />
      )}
      
      <Card
        bg="rgba(26, 32, 44, 0.9)"
        border="2px solid"
        borderColor="rgba(147, 51, 234, 0.3)"
        borderRadius="lg"
        minW="200px"
        _hover={{ borderColor: "purple.400" }}
      >
        <CardHeader pb={2}>
          <HStack justify="space-between">
            <HStack>
              <Box color="purple.400">{data.icon}</Box>
              <Text fontSize="sm" fontWeight="bold" color="white">
                {data.label}
              </Text>
            </HStack>
            <Badge size="sm" colorScheme={data.status === 'success' ? 'green' : data.status === 'error' ? 'red' : 'gray'}>
              {data.status || 'idle'}
            </Badge>
          </HStack>
        </CardHeader>
        <CardBody pt={0}>
          <Text fontSize="xs" color="gray.400" mb={2}>
            {data.description}
          </Text>
          <HStack justify="space-between">
            <Badge size="xs" variant="outline" colorScheme="purple">
              {data.category}
            </Badge>
            <HStack spacing={1}>
              <IconButton
                size="xs"
                variant="ghost"
                aria-label="Edit"
                icon={<Edit className="w-3 h-3" />}
                color="gray.400"
              />
              <IconButton
                size="xs"
                variant="ghost"
                aria-label="Delete"
                icon={<Trash2 className="w-3 h-3" />}
                color="red.400"
              />
            </HStack>
          </HStack>
        </CardBody>
      </Card>
    </Box>
  );
};

// Node types for React Flow
const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

export default function ETLPipelineBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pipelineName, setPipelineName] = useState('');
  const [pipelineDescription, setPipelineDescription] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && over.id === 'canvas-drop-zone') {
      // Find the template node
      const allNodes = [...nodeTemplates.sources, ...nodeTemplates.transforms, ...nodeTemplates.outputs];
      const template = allNodes.find(n => n.id === active.id);
      
      if (template) {
        const newNode: Node = {
          id: `${template.id}-${Date.now()}`,
          type: 'custom',
          position: { x: Math.random() * 300, y: Math.random() * 300 },
          data: {
            label: template.label,
            type: template.category.toLowerCase().includes('defi') || template.category.toLowerCase().includes('blockchain') || template.category.toLowerCase().includes('market') ? 'source' : 
                  template.category.toLowerCase().includes('visualization') || template.category.toLowerCase().includes('export') || template.category.toLowerCase().includes('integration') || template.category.toLowerCase().includes('notification') ? 'output' : 'transform',
            category: template.category,
            description: template.description,
            config: template.config,
            status: 'idle',
            icon: template.icon
          }
        };
        
        setNodes((nds: Node[]) => [...nds, newNode]);
        
        toast({
          title: "Node Added",
          description: `${template.label} has been added to your pipeline`,
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      }
    }
    
    setActiveId(null);
  };

  const CanvasDropZone = () => {
    const { setNodeRef, isOver } = useDroppable({
      id: 'canvas-drop-zone',
    });

    return (
      <Box
        ref={setNodeRef}
        height="100%"
        bg={isOver ? "rgba(147, 51, 234, 0.1)" : "transparent"}
        border={isOver ? "2px dashed" : "1px solid"}
        borderColor={isOver ? "purple.400" : "rgba(255, 255, 255, 0.1)"}
        borderRadius="xl"
        position="relative"
      >
        <Suspense fallback={<LoadingSpinner message="Loading pipeline builder..." size="lg" />}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            defaultEdgeOptions={{
              style: { 
                stroke: '#9333EA', 
                strokeWidth: 2,
              },
              type: 'smoothstep',
              animated: true,
              markerEnd: {
                type: MarkerType.Arrow,
                color: '#9333EA',
              },
            }}
            style={{
              backgroundColor: 'transparent',
            }}
          >
            <Suspense fallback={<Spinner size="sm" />}>
              <Controls />
            </Suspense>
            <Suspense fallback={null}>
              <MiniMap 
                style={{
                  backgroundColor: 'rgba(26, 32, 44, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              />
            </Suspense>
            <Suspense fallback={null}>
              <Background 
                variant={BackgroundVariant.Dots} 
                gap={20} 
                size={1}
                color="rgba(255, 255, 255, 0.1)"
              />
            </Suspense>
          </ReactFlow>
        </Suspense>
        
        {nodes.length === 0 && (
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            textAlign="center"
            pointerEvents="none"
            zIndex={1}
          >
            <VStack spacing={6}>
              <GitBranch size={48} color="rgba(147, 51, 234, 0.6)" />
              <VStack spacing={3}>
                <Text color="white" fontSize="xl" fontWeight="bold">
                  Welcome to the Alchemy Laboratory!
                </Text>
                <Text color="gray.400" fontSize="md">
                  Wise owl alchemists await to guide your data transmutation
                </Text>
                <Text color="gray.500" fontSize="sm">
                  Gather Essences → Mix Elements → Distill Pure Gold
                </Text>
              </VStack>
              <HStack spacing={8}>
                <VStack>
                  <Box p={2} bg="rgba(59, 130, 246, 0.2)" borderRadius="md">
                    <Database size={20} color="rgb(59, 130, 246)" />
                  </Box>
                  <Text fontSize="xs" color="gray.400">Essences</Text>
                </VStack>
                <ArrowRight size={20} color="rgba(255, 255, 255, 0.3)" />
                <VStack>
                  <Box p={2} bg="rgba(245, 158, 11, 0.2)" borderRadius="md">
                    <Filter size={20} color="rgb(245, 158, 11)" />
                  </Box>
                  <Text fontSize="xs" color="gray.400">Transmute</Text>
                </VStack>
                <ArrowRight size={20} color="rgba(255, 255, 255, 0.3)" />
                <VStack>
                  <Box p={2} bg="rgba(16, 185, 129, 0.2)" borderRadius="md">
                    <BarChart3 size={20} color="rgb(16, 185, 129)" />
                  </Box>
                  <Text fontSize="xs" color="gray.400">Elixirs</Text>
                </VStack>
              </HStack>
            </VStack>
          </Box>
        )}
      </Box>
    );
  };

  const runPipeline = async () => {
    if (nodes.length === 0) {
      toast({
        title: "No Pipeline",
        description: "Please add some nodes to your pipeline first",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsRunning(true);
    
    // Simulate pipeline execution
    const updatedNodes = nodes.map((node: Node) => ({
      ...node,
      data: { ...node.data, status: 'running' }
    }));
    setNodes(updatedNodes);

    // Simulate processing each node
    for (let i = 0; i < nodes.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setNodes((prevNodes: Node[]) => 
        prevNodes.map((node: Node, idx: number) => 
          idx === i 
            ? { ...node, data: { ...node.data, status: 'success' } }
            : node
        )
      );
    }

    setIsRunning(false);
    toast({
      title: "Pipeline Executed",
      description: "Your ETL pipeline has been executed successfully",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const savePipeline = () => {
    if (!pipelineName.trim()) {
      toast({
        title: "Missing Name",
        description: "Please enter a name for your pipeline",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Here you would save to backend
    const pipelineData = {
      name: pipelineName,
      description: pipelineDescription,
      nodes,
      edges,
      createdAt: new Date().toISOString()
    };

    // Simulate save
    localStorage.setItem(`pipeline-${Date.now()}`, JSON.stringify(pipelineData));
    
    toast({
      title: "Pipeline Saved",
      description: `${pipelineName} has been saved successfully`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    
    onClose();
  };

  const handleSelectTemplate = (template: Record<string, unknown>) => {
    // This would convert the template to actual nodes and edges
    // For now, we'll just show a success message
    setShowTemplates(false);
    toast({
      title: "Template Applied",
      description: `${String(template.name)} template has been loaded to your canvas`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  if (showTemplates) {
    return (
      <Box bg="rgba(15, 15, 35, 0.95)" minHeight="100vh">
        <Flex justify="space-between" align="center" p={6} borderBottom="1px solid" borderColor="rgba(255, 255, 255, 0.1)">
          <Text fontSize="2xl" fontWeight="bold" color="white">
            Choose a Pipeline Template
          </Text>
          <Button
            onClick={() => setShowTemplates(false)}
            variant="outline"
            colorScheme="gray"
            size="sm"
          >
            Back to Builder
          </Button>
        </Flex>
        <PipelineTemplates onSelectTemplate={handleSelectTemplate} />
      </Box>
    );
  }

  return (
    <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <Box
        p={6}
        bg="rgba(15, 15, 35, 0.95)"
        minHeight="100vh"
        position="relative"
      >
        {/* Header */}
        <Flex justify="space-between" align="center" mb={6}>
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl" fontWeight="bold" color="white">
              ETL Pipeline Builder
            </Text>
            <Text color="gray.400">
              Drag and drop to create your data pipeline
            </Text>
          </VStack>
          
          <HStack spacing={3}>
            <Button
              onClick={() => setShowTemplates(true)}
              leftIcon={<BookOpen className="w-4 h-4" />}
              colorScheme="blue"
              variant="outline"
              size="sm"
            >
              Templates
            </Button>
            <Button
              onClick={onOpen}
              leftIcon={<Save className="w-4 h-4" />}
              colorScheme="purple"
              variant="outline"
              size="sm"
            >
              Save Pipeline
            </Button>
            <Button
              onClick={runPipeline}
              leftIcon={<Play className="w-4 h-4" />}
              colorScheme="green"
              size="sm"
              isLoading={isRunning}
              loadingText="Running..."
            >
              Run Pipeline
            </Button>
          </HStack>
        </Flex>

        <HStack spacing={6} align="start" height="calc(100vh - 200px)">
          {/* Node Palette */}
          <Box width="300px" height="100%">
            <Card bg="rgba(26, 32, 44, 0.8)" border="1px solid" borderColor="rgba(255, 255, 255, 0.1)">
              <CardHeader>
                <Text fontSize="lg" fontWeight="bold" color="white">
                  Node Palette
                </Text>
              </CardHeader>
              <CardBody>
                <Tabs variant="enclosed" colorScheme="purple">
                  <TabList>
                    <Tab fontSize="sm">Sources</Tab>
                    <Tab fontSize="sm">Transform</Tab>
                    <Tab fontSize="sm">Outputs</Tab>
                  </TabList>
                  
                  <TabPanels>
                    <TabPanel px={0}>
                      <VStack spacing={3}>
                        {nodeTemplates.sources.map((node) => (
                          <DraggableNode key={node.id} node={node} />
                        ))}
                      </VStack>
                    </TabPanel>
                    
                    <TabPanel px={0}>
                      <VStack spacing={3}>
                        {nodeTemplates.transforms.map((node) => (
                          <DraggableNode key={node.id} node={node} />
                        ))}
                      </VStack>
                    </TabPanel>
                    
                    <TabPanel px={0}>
                      <VStack spacing={3}>
                        {nodeTemplates.outputs.map((node) => (
                          <DraggableNode key={node.id} node={node} />
                        ))}
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </CardBody>
            </Card>
          </Box>

          {/* Canvas */}
          <Box flex={1} height="100%">
            <CanvasDropZone />
          </Box>
        </HStack>

        {/* Pipeline Status */}
        {nodes.length > 0 && (
          <Box position="fixed" bottom={6} right={6} zIndex={1000}>
            <Card bg="rgba(26, 32, 44, 0.9)" border="1px solid" borderColor="rgba(255, 255, 255, 0.1)">
              <CardBody>
                <HStack>
                  <CheckCircle className="w-4 h-4" color="green" />
                  <Text fontSize="sm" color="white">
                    {nodes.length} nodes, {edges.length} connections
                  </Text>
                </HStack>
              </CardBody>
            </Card>
          </Box>
        )}
      </Box>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeId ? (
          <DraggableNode 
            node={[...nodeTemplates.sources, ...nodeTemplates.transforms, ...nodeTemplates.outputs]
              .find(n => n.id === activeId)} 
            isOverlay 
          />
        ) : null}
      </DragOverlay>

      {/* Save Pipeline Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="rgba(26, 32, 44, 0.95)" border="1px solid" borderColor="rgba(255, 255, 255, 0.1)">
          <ModalHeader color="white">Save Pipeline</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <Input
                placeholder="Pipeline Name"
                value={pipelineName}
                onChange={(e) => setPipelineName(e.target.value)}
                bg="rgba(255, 255, 255, 0.1)"
                border="1px solid"
                borderColor="rgba(255, 255, 255, 0.2)"
                color="white"
                _placeholder={{ color: 'gray.400' }}
              />
              <Textarea
                placeholder="Pipeline Description (optional)"
                value={pipelineDescription}
                onChange={(e) => setPipelineDescription(e.target.value)}
                bg="rgba(255, 255, 255, 0.1)"
                border="1px solid"
                borderColor="rgba(255, 255, 255, 0.2)"
                color="white"
                _placeholder={{ color: 'gray.400' }}
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="purple" onClick={savePipeline}>
              Save Pipeline
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </DndContext>
  );
}

// Add custom CSS for handle hover effects
const handleStyles = `
  .custom-handle:hover {
    transform: scale(1.2) !important;
    box-shadow: 0 0 12px rgba(147, 51, 234, 0.8) !important;
  }
  
  .react-flow__handle.custom-handle {
    transition: all 0.2s ease !important;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = handleStyles;
  document.head.appendChild(styleElement);
}