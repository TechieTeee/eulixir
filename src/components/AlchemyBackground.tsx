'use client';

import { Box, Image } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface FloatingElement {
  id: string;
  src: string;
  size: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
  opacity: number;
  zIndex: number;
}

interface AlchemyBackgroundProps {
  density?: 'light' | 'medium' | 'heavy';
  theme?: 'owl' | 'beaker' | 'mixed';
  className?: string;
}

const MotionBox = motion(Box);

export default function AlchemyBackground({ 
  density = 'light', 
  theme = 'mixed',
  className = ''
}: AlchemyBackgroundProps) {
  const [elements, setElements] = useState<FloatingElement[]>([]);
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });

  // Available images
  const owlImages = [
    '/Owl_1.png',
    '/Owl_Looking_Down.png',
    '/Owl_Waiving.png',
    '/Owl_arms_at_side_looking_forward.png',
    '/Owl_Both_Hands_Up.png'
  ];

  const beakerImages = [
    '/Beaker_1.png',
    '/Beaker_2.png',
    '/Beaker_4.png',
    '/Beaker_5.png',
    '/Beaker_6.png',
    '/Beaker_7.png',
    '/Beaker_8.png',
    '/Beaker_9.png',
    '/Beaker_10.png',
    '/Test_Tube.png'
  ];

  // Get images based on theme
  const getImagePool = () => {
    switch (theme) {
      case 'owl':
        return owlImages;
      case 'beaker':
        return beakerImages;
      case 'mixed':
      default:
        return [...owlImages, ...beakerImages];
    }
  };

  // Get number of elements based on density
  const getElementCount = () => {
    switch (density) {
      case 'light':
        return 3;
      case 'medium':
        return 5;
      case 'heavy':
        return 8;
      default:
        return 3;
    }
  };

  // Update window size
  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateWindowSize();
    window.addEventListener('resize', updateWindowSize);
    return () => window.removeEventListener('resize', updateWindowSize);
  }, []);

  // Generate floating elements
  useEffect(() => {
    const imagePool = getImagePool();
    const count = getElementCount();
    const newElements: FloatingElement[] = [];

    // Define safe zones (corners and edges where content won't be)
    const safeZones = [
      { x: 0, y: 0, width: 200, height: 200 }, // Top-left
      { x: windowSize.width - 200, y: 0, width: 200, height: 200 }, // Top-right
      { x: 0, y: windowSize.height - 200, width: 200, height: 200 }, // Bottom-left
      { x: windowSize.width - 200, y: windowSize.height - 200, width: 200, height: 200 }, // Bottom-right
      // Edge positions
      { x: windowSize.width * 0.1, y: windowSize.height * 0.15, width: 100, height: 100 },
      { x: windowSize.width * 0.85, y: windowSize.height * 0.25, width: 100, height: 100 },
      { x: windowSize.width * 0.05, y: windowSize.height * 0.6, width: 100, height: 100 },
      { x: windowSize.width * 0.9, y: windowSize.height * 0.7, width: 100, height: 100 },
    ];

    for (let i = 0; i < count; i++) {
      const zone = safeZones[i % safeZones.length];
      const randomImage = imagePool[Math.floor(Math.random() * imagePool.length)];
      
      // Vary size based on image type
      const isOwl = owlImages.includes(randomImage);
      const baseSize = isOwl ? 60 : 40; // Owls slightly larger than beakers
      const sizeVariation = Math.random() * 20 + baseSize;

      newElements.push({
        id: `floating-${i}`,
        src: randomImage,
        size: sizeVariation,
        x: zone.x + Math.random() * (zone.width - sizeVariation),
        y: zone.y + Math.random() * (zone.height - sizeVariation),
        duration: 15 + Math.random() * 10, // 15-25 seconds
        delay: Math.random() * 5, // 0-5 second delay
        opacity: 0.15 + Math.random() * 0.15, // 0.15-0.3 opacity for subtle effect
        zIndex: isOwl ? 2 : 1, // Owls slightly higher than beakers
      });
    }

    setElements(newElements);
  }, [density, theme, windowSize]);

  // Animation variants
  const floatingVariants = {
    animate: (element: FloatingElement) => ({
      y: [element.y, element.y - 30, element.y + 20, element.y],
      x: [element.x, element.x + 15, element.x - 10, element.x],
      rotate: [0, 5, -3, 0],
      scale: [1, 1.05, 0.98, 1],
      transition: {
        duration: element.duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay: element.delay,
      }
    })
  };

  return (
    <Box
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      pointerEvents="none"
      overflow="hidden"
      zIndex={0}
      className={className}
    >
      {elements.map((element) => (
        <MotionBox
          key={element.id}
          position="absolute"
          variants={floatingVariants}
          custom={element}
          animate="animate"
          initial={{
            x: element.x,
            y: element.y,
            opacity: 0
          }}
          style={{
            zIndex: element.zIndex,
          }}
          onAnimationStart={() => {
            // Fade in animation
            setTimeout(() => {
              const el = document.getElementById(element.id);
              if (el) {
                el.style.opacity = element.opacity.toString();
                el.style.transition = 'opacity 2s ease-in-out';
              }
            }, element.delay * 1000);
          }}
        >
          <Image
            id={element.id}
            src={element.src}
            alt=""
            width={`${element.size}px`}
            height={`${element.size}px`}
            style={{
              opacity: 0,
              filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
            draggable={false}
          />
        </MotionBox>
      ))}
    </Box>
  );
}

// Preset configurations for different pages
export const DashboardBackground = () => (
  <AlchemyBackground density="light" theme="mixed" />
);

export const VaultBackground = () => (
  <AlchemyBackground density="medium" theme="beaker" />
);

export const SwapBackground = () => (
  <AlchemyBackground density="light" theme="owl" />
);

export const PositionsBackground = () => (
  <AlchemyBackground density="medium" theme="mixed" />
);

export const PipelineBackground = () => (
  <AlchemyBackground density="heavy" theme="beaker" />
);