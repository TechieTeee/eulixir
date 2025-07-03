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
  Sparkles,
  DollarSign,
  Target,
  Users,
  Star,
  Gem,
  Atom,
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
  fontSize={{ base: 'lg', md: 'xl', lg: '2xl' }} // Slight size bump
  fontWeight="semibold" // Bolder than 'medium'
  color="gray.300"
  mt={4}
>
  The Formula for the Future of Finance
</Heading>


          <Flex
            align="center"
            gap={2}
            px={6}
            py={3}
            bgGradient="linear(to-r, mystic.900, azure.900)"
            border="2px"
            borderColor="mystic.400"
            borderRadius="full"
            backdropFilter="blur(4px)"
          >
            <MotionIcon
              as={Sparkles}
              w={4}
              h={4}
              color="gold.400"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.8, 1, 0.8],
                rotate: [0, 90, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
            <Text variant="cyan" fontSize="sm" fontWeight="bold">
              Transmuting Finance Through Digital Alchemy
            </Text>
            <MotionIcon
              as={Sparkles}
              w={4}
              h={4}
              color="gold.400"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.8, 1, 0.8],
                rotate: [0, -90, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: Math.random() * 2,
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
            Where ancient alchemical wisdom converges with quantum computing.
            Transform your financial data into liquid gold using our
            revolutionary transmutation algorithms that turn market chaos into
            crystalline clarity.
          </Text>
          <Flex flexWrap="wrap" gap={6} justify="center">
            <MotionButton
              variant="gold"
              size="lg"
              leftIcon={<Icon as={Atom} w={5} h={5} />}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Initiate Transformation
            </MotionButton>
            <Link href="/dashboard">
              <MotionButton
                variant="mystic"
                size="lg"
                leftIcon={<Icon as={BarChart3} w={5} h={5} />}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Explore Quantum Analytics
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
                Quantum Analytics Engine
              </Heading>
              <Text variant="platinum" flex={1}>
                Harness the power of quantum algorithms to transmute chaotic
                market data into pure predictive insights. Our neural networks
                learn from patterns invisible to traditional analysis.
              </Text>
              <Flex gap={4} fontSize="xs" fontFamily="mono">
                <Text bg="gold.400" color="void.500" px={2} py={1} rounded="md">
                  ACCURACY: 99.7%
                </Text>
                <Text
                  bg="emerald.400"
                  color="void.500"
                  px={2}
                  py={1}
                  rounded="md"
                >
                  QUANTUM_CORE: ACTIVE
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
                Ethereal Fortress Security
              </Heading>
              <Text variant="platinum" flex={1}>
                Your financial essence is protected by quantum-encrypted
                mystical barriers. Multi-dimensional security protocols that
                exist beyond conventional space.
              </Text>
              <Flex gap={4} fontSize="xs" fontFamily="mono">
                <Text
                  bg="azure.400"
                  color="void.500"
                  px={2}
                  py={1}
                  rounded="md"
                >
                  ENCRYPTION: QUANTUM_256
                </Text>
                <Text bg="cyan.400" color="void.500" px={2} py={1} rounded="md">
                  STATUS: TRANSCENDENT
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
                Lightning Transmutation
              </Heading>
              <Text variant="platinum" flex={1}>
                Execute trades at the speed of thought using our plasma-enhanced
                processing cores. Quantum entanglement ensures instantaneous
                market synchronization.
              </Text>
              <Flex gap={4} fontSize="xs" fontFamily="mono">
                <Text
                  bg="mystic.400"
                  color="void.500"
                  px={2}
                  py={1}
                  rounded="md"
                >
                  LATENCY: 0.001ms
                </Text>
                <Text
                  bg="violet.400"
                  color="void.500"
                  px={2}
                  py={1}
                  rounded="md"
                >
                  PLASMA_CORE: ONLINE
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
              <Icon as={Gem} w={12} h={12} color="gold.400" mx="auto" />
              <Heading as="h2" size="2xl" variant="glowing" maxW="2xl">
                The Philosopher's Quantum Metrics
              </Heading>
              <Text variant="platinum" fontSize="lg">
                Witness the alchemical transformation of financial reality
                through our mystical analytics
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
                  $7.2B
                </Text>
                <Text variant="dataLabel">
                  Assets Transmuted Into Digital Gold
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
                  125K+
                </Text>
                <Text variant="dataLabel">Digital Alchemists Worldwide</Text>
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
                  99.97%
                </Text>
                <Text variant="dataLabel">Quantum Prediction Accuracy</Text>
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
                  ∞/7
                </Text>
                <Text variant="dataLabel">Transcendental Support</Text>
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
              <Icon as={Atom} w={16} h={16} color="gold.400" />
            </MotionBox>
            <Heading as="h2" size="3xl" variant="glowing" maxW="4xl">
              Ready to Transcend Traditional Finance?
            </Heading>
            <Text
              fontSize="xl"
              color="gray.200"
              maxW="3xl"
              lineHeight="relaxed"
            >
              Join the enlightened collective of quantum alchemists who have
              unlocked the secrets to transforming market volatility into
              consistent streams of digital gold. The future of finance awaits
              your transformation.
            </Text>
          </Box>
          <Flex flexWrap="wrap" gap={6} justify="center">
            <MotionButton
              variant="gold"
              size="lg"
              leftIcon={<Icon as={Sparkles} w={5} h={5} />}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Begin Quantum Transformation
            </MotionButton>
            <Link href="/dashboard">
              <MotionButton
                variant="mystic"
                size="lg"
                leftIcon={<Icon as={BarChart3} w={5} h={5} />}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Experience Live Alchemy
              </MotionButton>
            </Link>
          </Flex>
          <Text variant="dataLabel" opacity={0.8}>
            ✦ No commitment required • Instant alchemical preview • Quantum
            encryption guaranteed ✦
          </Text>
        </Flex>
      </Box>
    </MotionBox>
  );
}
