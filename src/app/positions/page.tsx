"use client";

import { Box } from '@chakra-ui/react';
import LPPositionManager from '@/components/LPPositionManager';
import { PositionsBackground } from '@/components/AlchemyBackground';
import { CornerOwl } from '@/components/OwlMascot';

export default function PositionsPage() {
  return (
    <Box position="relative" minHeight="100vh">
      {/* Alchemy Floating Background */}
      <PositionsBackground />
      
      {/* Corner Owl Mascot */}
      <CornerOwl placement="top-right" />
      
      <Box position="relative" zIndex={1}>
        <LPPositionManager />
      </Box>
    </Box>
  );
}