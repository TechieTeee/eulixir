"use client";

import React, { useState } from 'react';
import {
  Box,
  Flex,
  HStack,
  Button,
  Text,
  Container,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Home, 
  BarChart3, 
  GitBranch, 
  TrendingUp,
} from 'lucide-react';

const MotionBox = motion(Box);

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  prefetch?: boolean;
}

const navigation: NavItem[] = [
  { name: 'Home', href: '/', icon: Home, prefetch: true },
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3, prefetch: true },
  { name: 'Pipeline Builder', href: '/pipeline', icon: GitBranch, prefetch: true },
  { name: 'LP Manager', href: '/positions', icon: TrendingUp, prefetch: true },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNavigation = async (href: string) => {
    if (href === pathname) return;
    
    setIsNavigating(true);
    
    // Small delay to show loading state
    setTimeout(() => {
      router.push(href);
      setIsNavigating(false);
    }, 100);
  };

  return (
    <Box 
      bg="rgba(26, 32, 44, 0.95)" 
      backdropFilter="blur(10px)"
      borderBottom="1px solid"
      borderColor="rgba(255, 255, 255, 0.1)"
      position="sticky"
      top={0}
      zIndex={1000}
    >
      <Container maxW="7xl">
        <Flex h={16} alignItems="center" justifyContent="space-between">
          {/* Logo */}
          <Link href="/">
            <Text
              fontSize="2xl"
              fontWeight="bold"
              bgGradient="linear(to-r, purple.400, blue.400)"
              bgClip="text"
              cursor="pointer"
            >
              Eulixir
            </Text>
          </Link>

          {/* Navigation Items */}
          <HStack spacing={1}>
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <MotionBox
                  key={item.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href={item.href} prefetch={item.prefetch}>
                    <Button
                      variant={isActive ? "solid" : "ghost"}
                      colorScheme={isActive ? "purple" : "gray"}
                      size="sm"
                      leftIcon={<Icon size={16} />}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavigation(item.href);
                      }}
                      isLoading={isNavigating && pathname !== item.href}
                      _hover={{
                        bg: isActive ? "purple.600" : "rgba(255, 255, 255, 0.1)",
                        transform: "translateY(-1px)",
                      }}
                      transition="all 0.2s"
                    >
                      {item.name}
                    </Button>
                  </Link>
                </MotionBox>
              );
            })}
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}