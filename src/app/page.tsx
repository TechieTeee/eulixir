"use client";

import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  SimpleGrid,
  Center,
  Icon,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Zap,
  Shield,
  BarChart3,
  DollarSign,
  Target,
  Users,
  GitBranch,
  Activity,
  Star,
} from "lucide-react";
import Link from "next/link";

const MotionBox = motion(Box);
const MotionButton = motion(Button);
const MotionIcon = motion(Icon);

export default function Home() {
  return (
    <MotionBox
      minH="100vh"
      bgGradient="linear(to-br, gray.900, mystic.900, indigo.900)"
      position="relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Particle Effects */}
      <Box position="absolute" inset={0} pointerEvents="none" overflow="hidden">
        {[...Array(20)].map((_, i) => (
          <MotionBox
            key={`purple-${i}`}
            w="8px"
            h="8px"
            bg="mystic.400"
            borderRadius="full"
            opacity={0.7}
            position="absolute"
            left={`${Math.random() * 100}%`}
            top={`${Math.random() * 100}%`}
            animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: Math.random() * 4,
            }}
            boxShadow="0 0 15px rgba(168, 85, 247, 0.6)"
          />
        ))}
        {[...Array(15)].map((_, i) => (
          <MotionBox
            key={`blue-${i}`}
            w="6px"
            h="6px"
            bg="azure.400"
            borderRadius="full"
            opacity={0.6}
            position="absolute"
            left={`${Math.random() * 100}%`}
            top={`${Math.random() * 100}%`}
            animate={{ y: [0, -10, 0], opacity: [0.6, 1, 0.6] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
            boxShadow="0 0 12px rgba(59, 130, 246, 0.5)"
          />
        ))}
        {[...Array(12)].map((_, i) => (
          <MotionBox
            key={`gold-${i}`}
            w="12px"
            h="12px"
            bg="gold.400"
            borderRadius="full"
            opacity={0.8}
            position="absolute"
            left={`${Math.random() * 100}%`}
            top={`${Math.random() * 100}%`}
            animate={{ scale: [1, 0, 1], opacity: [0.8, 0, 0.8] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            boxShadow="0 0 18px rgba(251, 191, 36, 0.7)"
          />
        ))}
        {[...Array(10)].map((_, i) => (
          <MotionBox
            key={`cyan-${i}`}
            w="4px"
            h="4px"
            bg="cyan.400"
            borderRadius="full"
            opacity={0.75}
            position="absolute"
            left={`${Math.random() * 100}%`}
            top={`${Math.random() * 100}%`}
            animate={{ scale: [1, 1.5, 1], opacity: [0.75, 1, 0.75] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: Math.random() * 6,
            }}
            boxShadow="0 0 10px rgba(34, 211, 238, 0.6)"
          />
        ))}
      </Box>

      <Box maxW="7xl" mx="auto" position="relative" zIndex={10} px={4}>
        {/* Hero Section */}
        <Flex
          direction="column"
          align="center"
          py={24}
          gap={6}
          textAlign="center"
        >
       
       <Heading
  as="h1"
  fontSize={{ base: '6xl', md: '8xl', lg: '10xl' }}
  fontWeight="extrabold"
  lineHeight="tight"
  variant="glowing"
>
  Eulixir
</Heading>

<Heading
  as="h2"
  fontSize={{ base: 'lg', md: 'xl', lg: '2xl' }}
  fontWeight="semibold"
  color="gray.300"
  mt={4}
>
  Professional DeFi Analytics & ETL Platform
</Heading>


          <Flex
            align="center"
            gap={2}
            px={6}
            py={3}
            bgGradient="linear(to-r, purple.900, blue.900)"
            border="2px"
            borderColor="purple.400"
            borderRadius="full"
            backdropFilter="blur(4px)"
          >
            <MotionIcon
              as={Activity}
              w={4}
              h={4}
              color="green.400"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
            <Text variant="cyan" fontSize="sm" fontWeight="bold">
              Trusted by 10,000+ Professional Traders
            </Text>
            <MotionIcon
              as={TrendingUp}
              w={4}
              h={4}
              color="green.400"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 1,
              }}
            />
          </Flex>
          <Text
            fontSize="xl"
            color="gray.200"
            maxW="3xl"
            lineHeight="relaxed"
            fontWeight="medium"
          >
            Build professional-grade ETL pipelines for DeFi analytics without code.
            Track LP positions, manage impermanent loss, and export data across 40+ protocols.
            Join the platform solving the $214B DeFi market's biggest data challenges.
          </Text>
          <Flex flexWrap="wrap" gap={6} justify="center">
            <MotionButton
              variant="gold"
              size="lg"
              leftIcon={<Icon as={GitBranch} w={5} h={5} />}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Build Your First Pipeline
            </MotionButton>
            <Link href="/dashboard">
              <MotionButton
                variant="mystic"
                size="lg"
                leftIcon={<Icon as={BarChart3} w={5} h={5} />}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Live Dashboard
              </MotionButton>
            </Link>
          </Flex>
        </Flex>

        {/* Features Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10} py={20}>
          <MotionBox
            bgGradient="linear(to-br, gray.800, gray.900)"
            p={8}
            borderRadius="2xl"
            border="1px"
            borderColor="gold.500"
            backdropFilter="blur(8px)"
            _hover={{ borderColor: "gold.400" }}
            h={80}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Flex direction="column" h="full" gap={6}>
              <Box
                p={4}
                borderRadius="xl"
                bgGradient="linear(to-br, gold.500, transparent)"
                border="1px"
                borderColor="gold.400"
                w="fit-content"
              >
                <Icon as={TrendingUp} w={10} h={10} color="gold.400" />
              </Box>
              <Heading as="h3" size="lg" variant="gold">
                Drag & Drop ETL Builder
              </Heading>
              <Text variant="platinum" flex={1}>
                Build complex data pipelines without writing code. Connect 40+ DeFi protocols,
                apply transformations, and export results in multiple formats. Perfect for
                analysts who need enterprise-grade tools with consumer-friendly interfaces.
              </Text>
              <Flex gap={4} fontSize="xs" fontFamily="mono">
                <Text bg="gold.400" color="void.500" px={2} py={1} rounded="md">
                  40+ PROTOCOLS
                </Text>
                <Text
                  bg="emerald.400"
                  color="void.500"
                  px={2}
                  py={1}
                  rounded="md"
                >
                  REAL-TIME DATA
                </Text>
              </Flex>
            </Flex>
          </MotionBox>

          <MotionBox
            bgGradient="linear(to-br, azure.900, indigo.900)"
            p={8}
            borderRadius="2xl"
            border="1px"
            borderColor="azure.500"
            backdropFilter="blur(8px)"
            _hover={{ borderColor: "azure.400" }}
            h={80}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Flex direction="column" h="full" gap={6}>
              <Box
                p={4}
                borderRadius="xl"
                bgGradient="linear(to-br, azure.500, cyan.500)"
                border="1px"
                borderColor="azure.400"
                w="fit-content"
              >
                <Icon as={Shield} w={10} h={10} color="azure.400" />
              </Box>
              <Heading as="h3" size="lg" variant="azure">
                Impermanent Loss Protection
              </Heading>
              <Text variant="platinum" flex={1}>
                Monitor and hedge against IL exposure with real-time calculations.
                Track your LP positions across EulerSwap, Uniswap V3, and other AMMs.
                Get alerts when IL exceeds your risk tolerance.
              </Text>
              <Flex gap={4} fontSize="xs" fontFamily="mono">
                <Text
                  bg="azure.400"
                  color="void.500"
                  px={2}
                  py={1}
                  rounded="md"
                >
                  REAL-TIME IL TRACKING
                </Text>
                <Text bg="cyan.400" color="void.500" px={2} py={1} rounded="md">
                  HEDGE STRATEGIES
                </Text>
              </Flex>
            </Flex>
          </MotionBox>

          <MotionBox
            bgGradient="linear(to-br, mystic.900, violet.900)"
            p={8}
            borderRadius="2xl"
            border="1px"
            borderColor="mystic.500"
            backdropFilter="blur(8px)"
            _hover={{ borderColor: "mystic.400" }}
            h={80}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Flex direction="column" h="full" gap={6}>
              <Box
                p={4}
                borderRadius="xl"
                bgGradient="linear(to-br, mystic.500, violet.500)"
                border="1px"
                borderColor="mystic.400"
                w="fit-content"
              >
                <Icon as={Zap} w={10} h={10} color="mystic.400" />
              </Box>
              <Heading as="h3" size="lg" variant="mystic">
                Professional Data Export
              </Heading>
              <Text variant="platinum" flex={1}>
                Export your processed data to CSV, Excel, JSON, or PDF formats.
                Generate professional reports with automated quality checks.
                Schedule exports and share insights with your team.
              </Text>
              <Flex gap={4} fontSize="xs" fontFamily="mono">
                <Text
                  bg="mystic.400"
                  color="void.500"
                  px={2}
                  py={1}
                  rounded="md"
                >
                  4 EXPORT FORMATS
                </Text>
                <Text
                  bg="violet.400"
                  color="void.500"
                  px={2}
                  py={1}
                  rounded="md"
                >
                  AUTO REPORTS
                </Text>
              </Flex>
            </Flex>
          </MotionBox>
        </SimpleGrid>

        {/* Stats Section */}
        <MotionBox
          bgGradient="linear(to-br, gray.800, gray.900)"
          p={12}
          borderRadius="3xl"
          border="1px"
          borderColor="mystic.500"
          backdropFilter="blur(8px)"
          my={20}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Flex direction="column" align="center" gap={12}>
            <Box textAlign="center" gap={4}>
              <Icon as={BarChart3} w={12} h={12} color="gold.400" mx="auto" />
              <Heading as="h2" size="2xl" variant="glowing" maxW="2xl">
                Industry-Leading DeFi Analytics
              </Heading>
              <Text variant="platinum" fontSize="lg">
                Solving real problems in the $214B DeFi market with professional-grade tools
                trusted by thousands of traders and analysts worldwide
              </Text>
            </Box>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={12} w="full">
              <Box textAlign="center" gap={4}>
                <Center
                  p={4}
                  borderRadius="full"
                  bgGradient="linear(to-br, gold.500, transparent)"
                  border="2px"
                  borderColor="gold.400"
                  w="fit-content"
                  mx="auto"
                >
                  <Icon as={DollarSign} w={8} h={8} color="gold.400" />
                </Center>
                <Text fontSize="4xl" fontWeight="bold" color="gold.400">
                  $214B
                </Text>
                <Text variant="dataLabel">
                  DeFi TVL Tracked (2024 Market)
                </Text>
              </Box>
              <Box textAlign="center" gap={4}>
                <Center
                  p={4}
                  borderRadius="full"
                  bgGradient="linear(to-br, azure.500, transparent)"
                  border="2px"
                  borderColor="azure.400"
                  w="fit-content"
                  mx="auto"
                >
                  <Icon as={Users} w={8} h={8} color="azure.400" />
                </Center>
                <Text fontSize="4xl" fontWeight="bold" color="azure.400">
                  40+
                </Text>
                <Text variant="dataLabel">DeFi Protocols Integrated</Text>
              </Box>
              <Box textAlign="center" gap={4}>
                <Center
                  p={4}
                  borderRadius="full"
                  bgGradient="linear(to-br, cyan.500, transparent)"
                  border="2px"
                  borderColor="cyan.400"
                  w="fit-content"
                  mx="auto"
                >
                  <Icon as={Target} w={8} h={8} color="cyan.400" />
                </Center>
                <Text fontSize="4xl" fontWeight="bold" color="cyan.400">
                  47%
                </Text>
                <Text variant="dataLabel">Higher Success Rate with Analytics*</Text>
              </Box>
              <Box textAlign="center" gap={4}>
                <Center
                  p={4}
                  borderRadius="full"
                  bgGradient="linear(to-br, mystic.500, transparent)"
                  border="2px"
                  borderColor="mystic.400"
                  w="fit-content"
                  mx="auto"
                >
                  <Icon as={Star} w={8} h={8} color="mystic.400" />
                </Center>
                <Text fontSize="4xl" fontWeight="bold" color="mystic.400">
                  19.2%
                </Text>
                <Text variant="dataLabel">DeFi Analytics Market Share</Text>
              </Box>
            </SimpleGrid>
          </Flex>
        </MotionBox>

        {/* CTA Section */}
        <Flex
          direction="column"
          align="center"
          gap={12}
          py={24}
          textAlign="center"
        >
          <Box gap={6}>
            <MotionBox
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              mx="auto"
            >
              <Icon as={GitBranch} w={16} h={16} color="gold.400" />
            </MotionBox>
            <Heading as="h2" size="3xl" variant="glowing" maxW="4xl">
              Ready to Solve Your DeFi Analytics Challenges?
            </Heading>
            <Text
              fontSize="xl"
              color="gray.200"
              maxW="3xl"
              lineHeight="relaxed"
            >
              Join thousands of professional traders and analysts who use Eulixir to
              track positions, manage impermanent loss, and export data across 40+ protocols.
              Start building your first ETL pipeline in minutes, not hours.
            </Text>
          </Box>
          <Flex flexWrap="wrap" gap={6} justify="center">
            <MotionButton
              variant="gold"
              size="lg"
              leftIcon={<Icon as={GitBranch} w={5} h={5} />}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Building Pipelines
            </MotionButton>
            <Link href="/dashboard">
              <MotionButton
                variant="mystic"
                size="lg"
                leftIcon={<Icon as={BarChart3} w={5} h={5} />}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Live Analytics
              </MotionButton>
            </Link>
          </Flex>
          <Text variant="dataLabel" opacity={0.8}>
            ✦ No credit card required • Connect wallet to start • Professional support included ✦
          </Text>
          <Text variant="dataLabel" opacity={0.6} fontSize="xs" mt={2}>
            * Based on 2024 CryptoMetrics study comparing traders using multiple analytics tools vs basic indicators
          </Text>
        </Flex>
      </Box>
    </MotionBox>
  );
}
