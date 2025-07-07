'use client';

import { 
  Box, 
  Button, 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalCloseButton,
  Text,
  VStack,
  HStack,
  Icon,
  useDisclosure,
  Image
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { HelpCircle, Lightbulb, Star, ArrowRight } from 'lucide-react';
import { useState } from 'react';

const MotionBox = motion(Box);

interface EulyHelperProps {
  position?: 'fixed' | 'absolute' | 'relative';
  placement?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

const helpfulMessages = [
  {
    title: "Welcome to Eulixir!",
    content: "I'm Euly, your wise owl guide! Click on me anytime you need help navigating our mystical DeFi laboratory.",
    icon: Star
  },
  {
    title: "Building Your First Pipeline",
    content: "Start by visiting the Pipeline Builder to create your first ETL workflow. Drag and drop components to transform raw DeFi data into golden insights!",
    icon: Lightbulb
  },
  {
    title: "Understanding Vault Strategies",
    content: "Visit the Vault Manager to explore yield optimization strategies. I'll help you find the best opportunities across 40+ DeFi protocols.",
    icon: HelpCircle
  },
  {
    title: "Real-time Analytics",
    content: "Check the Dashboard for live data feeds and performance metrics. All your alchemical experiments are tracked in real-time!",
    icon: ArrowRight
  },
  {
    title: "Impermanent Loss Protection",
    content: "Our crystal ball shows real-time IL calculations. Set up alerts and let me notify you when your positions need rebalancing magic!",
    icon: Star
  }
];

export default function EulyHelper({ 
  position = 'fixed', 
  placement = 'bottom-right' 
}: EulyHelperProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentMessage, setCurrentMessage] = useState(0);

  const getPositionStyles = () => {
    const baseStyles = {
      position,
      zIndex: 1000,
    };

    switch (placement) {
      case 'bottom-right':
        return { ...baseStyles, bottom: '20px', right: '20px' };
      case 'bottom-left':
        return { ...baseStyles, bottom: '20px', left: '20px' };
      case 'top-right':
        return { ...baseStyles, top: '20px', right: '20px' };
      case 'top-left':
        return { ...baseStyles, top: '20px', left: '20px' };
      default:
        return { ...baseStyles, bottom: '20px', right: '20px' };
    }
  };

  const nextMessage = () => {
    setCurrentMessage((prev) => (prev + 1) % helpfulMessages.length);
  };

  const currentHelp = helpfulMessages[currentMessage];

  return (
    <>
      {/* Clickable Euly */}
      <MotionBox
        {...getPositionStyles()}
        cursor="pointer"
        onClick={onOpen}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Box
          position="relative"
          bg="rgba(147, 51, 234, 0.1)"
          borderRadius="full"
          p={2}
          border="2px solid"
          borderColor="purple.400"
          backdropFilter="blur(8px)"
          _hover={{
            borderColor: "purple.300",
            bg: "rgba(147, 51, 234, 0.2)",
          }}
        >
          <Image
            src="/Owl_Waiving.png"
            alt="Euly - Your helpful owl guide"
            width="60px"
            height="60px"
            draggable={false}
          />
          
          {/* Help indicator */}
          <Box
            position="absolute"
            top="-5px"
            right="-5px"
            bg="purple.500"
            color="white"
            borderRadius="full"
            w="20px"
            h="20px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="12px"
            fontWeight="bold"
            border="2px solid"
            borderColor="purple.300"
          >
            ?
          </Box>
        </Box>
      </MotionBox>

      {/* Help Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent
          bg="gray.900"
          border="2px solid"
          borderColor="purple.400"
          borderRadius="xl"
        >
          <ModalHeader
            bg="purple.500"
            color="white"
            borderTopRadius="lg"
            display="flex"
            alignItems="center"
            gap={3}
          >
            <Image
              src="/Owl_1.png"
              alt="Euly"
              width="40px"
              height="40px"
            />
            <Text>Euly&apos;s Guidance</Text>
          </ModalHeader>
          <ModalCloseButton color="white" />
          
          <ModalBody p={6}>
            <VStack spacing={6} align="stretch">
              <Box
                bg="purple.900"
                p={4}
                borderRadius="lg"
                border="1px solid"
                borderColor="purple.400"
              >
                <HStack spacing={3} mb={3}>
                  <Icon as={currentHelp.icon} color="purple.400" w={6} h={6} />
                  <Text fontSize="lg" fontWeight="bold" color="purple.200">
                    {currentHelp.title}
                  </Text>
                </HStack>
                <Text color="gray.300" lineHeight="tall">
                  {currentHelp.content}
                </Text>
              </Box>

              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.400">
                  Tip {currentMessage + 1} of {helpfulMessages.length}
                </Text>
                <Button
                  size="sm"
                  variant="outline"
                  borderColor="purple.400"
                  color="purple.400"
                  _hover={{ bg: "purple.500", color: "white" }}
                  onClick={nextMessage}
                >
                  Next Tip
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

// Preset configurations for different pages
export const DashboardEuly = () => (
  <EulyHelper placement="bottom-right" />
);

export const VaultEuly = () => (
  <EulyHelper placement="bottom-left" />
);

export const PipelineEuly = () => (
  <EulyHelper placement="top-right" />
);