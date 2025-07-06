"use client";

import { Box, Spinner, Text, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function LoadingSpinner({ 
  message = "Loading...", 
  size = "xl" 
}: LoadingSpinnerProps) {
  return (
    <MotionBox
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="rgba(15, 15, 35, 0.95)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={9999}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <VStack spacing={4}>
        <Spinner 
          size={size} 
          color="purple.400" 
          thickness="4px" 
          speed="0.8s"
        />
        <Text 
          color="gray.300" 
          fontSize="lg" 
          fontWeight="medium"
        >
          {message}
        </Text>
      </VStack>
    </MotionBox>
  );
}

// Page-specific loading component
export function PageLoadingSpinner({ pageName }: { pageName: string }) {
  return (
    <LoadingSpinner 
      message={`Preparing ${pageName}...`}
      size="lg"
    />
  );
}