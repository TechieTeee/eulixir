'use client';

import { Box, VStack, HStack, Text, Button, useColorModeValue } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import VaultManager from '@/components/VaultManager';

export default function VaultsPage() {
  const router = useRouter();
  const bgGradient = useColorModeValue(
    'linear(to-br, gray.50, blue.50)',
    'linear(to-br, #0F0F23, #1A0B33, #0F0F23)'
  );

  const handleVaultAction = (action: string, vaultAddress: string, amount: string) => {
    console.log(`Vault action: ${action} ${amount} from ${vaultAddress}`);
  };

  return (
    <Box
      minHeight="100vh"
      bgGradient={bgGradient}
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
      
      <Box position="relative" zIndex={1} p={8}>
        {/* Header */}
        <VStack spacing={6} align="stretch">
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={2}>
              <Text
                fontSize="3xl"
                fontWeight="bold"
                bgGradient="linear(to-r, #9333EA, #3B82F6)"
                bgClip="text"
              >
                EulerSwap Vault Manager
              </Text>
              <Text color="gray.400" fontSize="lg">
                Manage your vault positions and strategies
              </Text>
            </VStack>
            
            <HStack spacing={4}>
              <Button
                onClick={() => router.push('/dashboard')}
                colorScheme="blue"
                variant="outline"
                size="sm"
              >
                Back to Dashboard
              </Button>
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
                colorScheme="purple"
                variant="outline"
                size="sm"
              >
                ETL Pipeline
              </Button>
            </HStack>
          </HStack>
          
          {/* Vault Manager Component */}
          <VaultManager onVaultAction={handleVaultAction} />
        </VStack>
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