"use client";

import { Box } from '@chakra-ui/react';
import ETLPipelineBuilder from '@/components/ETLPipelineBuilder';
import { PipelineBackground } from '@/components/AlchemyBackground';
import { CornerOwl } from '@/components/OwlMascot';

export default function PipelinePage() {
  return (
    <Box position="relative" minHeight="100vh">
      {/* Alchemy Floating Background */}
      <PipelineBackground />
      
      {/* Corner Owl Mascot */}
      <CornerOwl placement="bottom-right" />
      
      <Box position="relative" zIndex={1}>
        <ETLPipelineBuilder />
      </Box>
    </Box>
  );
}