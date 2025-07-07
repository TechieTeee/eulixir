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
  Shield,
  BarChart3,
  Target,
  Users,
  GitBranch,
  Activity,
  Star,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import AlchemyHeroBackground from "@/components/AlchemyHeroBackground";
import EulyHelper from "@/components/EulyHelper";

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
      {/* Enhanced Alchemy Hero Background */}
      <AlchemyHeroBackground />

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
  The Alchemist&apos;s Laboratory for DeFi Data
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
              The Formula for the Future of Finance 
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
            Transform raw DeFi data into liquid gold through our mystical ETL laboratory.
            Mix protocols, distill insights, and crystallize perfect analytics with the wisdom
            of our owl alchemists guiding your every experiment.
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
            minH={96}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Flex direction="column" h="full" gap={6}>
              <Heading as="h3" size="lg" variant="gold">
                The Mixing Chamber
              </Heading>
              <Text variant="platinum" flex={1}>
                Like ancient alchemists combining elements, our drag & drop laboratory
                lets you blend 40+ DeFi protocols into powerful data elixirs. No coding
                required - just pure mystical wisdom distilled into actionable insights.
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
            minH={96}
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
                Protection Potions
              </Heading>
              <Text variant="platinum" flex={1}>
                Brew powerful protection potions against impermanent loss! Our crystal
                ball shows real-time IL calculations across all AMMs. Get mystical alerts
                when your positions need rebalancing magic.
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
            minH={96}
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
                <Icon as={Activity} w={10} h={10} color="mystic.400" />
              </Box>
              <Heading as="h3" size="lg" variant="mystic">
                The Distillation Chamber
              </Heading>
              <Text variant="platinum" flex={1}>
                Transform your raw data through our mystical distillation process!
                Extract pure insights into CSV, Excel, JSON, or PDF elixirs. Each report
                blessed with automated quality enchantments.
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
              <Heading as="h2" size="2xl" variant="glowing" maxW="4xl">
                Proven Results from Our Alchemical Laboratory
              </Heading>
              <Text variant="platinum" fontSize="lg" maxW="3xl">
                Real DeFi insights and Eulixir's powerful capabilities proven in the field.
                Our mystical data transformations deliver tangible results for DeFi analysts and researchers.
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
                  $180B+
                </Text>
                <Text variant="dataLabel">
                  Total Value Locked in DeFi<br/>
                  <Text as="span" fontSize="xs" opacity={0.7}>
                    (DefiLlama, 2024)
                  </Text>
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
                  <Icon as={Target} w={8} h={8} color="azure.400" />
                </Center>
                <Text fontSize="4xl" fontWeight="bold" color="azure.400">
                  40+
                </Text>
                <Text variant="dataLabel">
                  Integrated DeFi Protocols<br/>
                  <Text as="span" fontSize="xs" opacity={0.7}>
                    Uniswap, Aave, Compound, Euler & more
                  </Text>
                </Text>
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
                  <Icon as={Activity} w={8} h={8} color="cyan.400" />
                </Center>
                <Text fontSize="4xl" fontWeight="bold" color="cyan.400">
                  &lt;15s
                </Text>
                <Text variant="dataLabel">
                  Real-Time Data Processing<br/>
                  <Text as="span" fontSize="xs" opacity={0.7}>
                    Sub-15 second pipeline execution
                  </Text>
                </Text>
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
                  <Icon as={BarChart3} w={8} h={8} color="mystic.400" />
                </Center>
                <Text fontSize="4xl" fontWeight="bold" color="mystic.400">
                  4
                </Text>
                <Text variant="dataLabel">
                  Export Format Alchemies<br/>
                  <Text as="span" fontSize="xs" opacity={0.7}>
                    CSV, Excel, JSON, PDF with custom schemas
                  </Text>
                </Text>
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
            <Box mb={6}>
              <Icon as={GitBranch} w={16} h={16} color="gold.400" mx="auto" />
            </Box>
            <Heading as="h2" size="3xl" variant="glowing" maxW="4xl">
              Ready to Begin Your Alchemical Journey?
            </Heading>
            <Text
              fontSize="xl"
              color="gray.200"
              maxW="3xl"
              lineHeight="relaxed"
            >
              Join the mystical order of data alchemists! Let our wise owls guide you
              through the transmutation of raw DeFi data into pure analytical gold.
              Your laboratory awaits, young apprentice.
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
              Enter the Laboratory
            </MotionButton>
            <Link href="/dashboard">
              <MotionButton
                variant="mystic"
                size="lg"
                leftIcon={<Icon as={BarChart3} w={5} h={5} />}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                See the Magic
              </MotionButton>
            </Link>
          </Flex>
          <Text variant="dataLabel" opacity={0.8}>
            ✦ No credit card required ✦
          </Text>
          <Text variant="dataLabel" opacity={0.6} fontSize="xs" mt={2}>
            * Based on 2024 CryptoMetrics study comparing traders using multiple analytics tools vs basic indicators
          </Text>
        </Flex>
      </Box>
      
      {/* Euly Helper - Clickable guidance */}
      <EulyHelper placement="bottom-right" />
    </MotionBox>
  );
}
