'use client';

import { Box, Image } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface AlchemyElement {
  id: string;
  src: string;
  size: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
  opacity: number;
  rotation: number;
  zIndex: number;
}

// Move arrays outside component to prevent re-creation on every render
const alchemyImages = [
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

const owlImages = [
  '/Owl_1.png',
  '/Owl_Looking_Down.png',
  '/Owl_arms_at_side_looking_forward.png'
];

const MotionBox = motion(Box);

export default function AlchemyHeroBackground() {
  const [elements, setElements] = useState<AlchemyElement[]>([]);
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });

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

  // Generate floating alchemy elements
  useEffect(() => {
    console.log('Starting element generation, windowSize:', windowSize);
    const newElements: AlchemyElement[] = [];
    
    // Placement zones avoiding the center hero text area
    const placementZones = [
      { x: 50, y: 50, width: 200, height: 200 }, // Top-left
      { x: windowSize.width - 250, y: 50, width: 200, height: 200 }, // Top-right
      { x: 50, y: windowSize.height - 250, width: 200, height: 200 }, // Bottom-left
      { x: windowSize.width - 250, y: windowSize.height - 250, width: 200, height: 200 }, // Bottom-right
      { x: windowSize.width - 300, y: windowSize.height * 0.4, width: 180, height: 150 }, // Right-middle (moved away from center)
    ];

    // Generate 5 elements for testing
    const elementCount = 5;
    
    for (let i = 0; i < elementCount; i++) {
      const zone = placementZones[i % placementZones.length];
      
      // Force all to be beakers for testing
      const randomImage = alchemyImages[i % alchemyImages.length];
      console.log(`Creating element ${i}: image=${randomImage}, zone:`, zone);
      
      const elementSize = 80; // Fixed size for testing
      
      newElements.push({
        id: `alchemy-${i}`,
        src: randomImage,
        size: elementSize,
        x: zone.x + 50, // Fixed position within zone
        y: zone.y + 50,
        duration: 15,
        delay: i * 0.5, // Staggered delays
        opacity: 0.8, // High opacity for testing
        rotation: 0, // No rotation for testing
        zIndex: 2,
      });
    }

    console.log('Generated elements:', newElements);
    setElements(newElements);
  }, [windowSize]);

  // Enhanced animation variants
  const alchemyVariants = {
    animate: (element: AlchemyElement) => ({
      y: [element.y, element.y - 25, element.y + 15, element.y],
      x: [element.x, element.x + 12, element.x - 8, element.x],
      rotate: [
        element.rotation, 
        element.rotation + 8, 
        element.rotation - 5, 
        element.rotation
      ],
      scale: [1, 1.08, 0.95, 1],
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
      zIndex={5}
    >
      {elements.map((element) => (
        <MotionBox
          key={element.id}
          position="absolute"
          variants={alchemyVariants}
          custom={element}
          animate="animate"
          initial={{
            x: element.x,
            y: element.y,
            opacity: element.opacity,
            scale: 1,
            rotate: element.rotation
          }}
          style={{
            zIndex: element.zIndex,
          }}
        >
          <Image
            id={element.id}
            src={element.src}
            alt=""
            width={`${element.size}px`}
            height={`${element.size}px`}
            style={{
              opacity: element.opacity, // Make immediately visible for testing
              filter: 'drop-shadow(0 6px 12px rgba(147, 51, 234, 0.25)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
            draggable={false}
          />
        </MotionBox>
      ))}
      
      {/* Magical particle effects to enhance alchemy theme */}
      {[...Array(8)].map((_, i) => (
        <MotionBox
          key={`sparkle-${i}`}
          position="absolute"
          width="3px"
          height="3px"
          bg="purple.300"
          borderRadius="full"
          left={`${10 + Math.random() * 80}%`}
          top={`${10 + Math.random() * 80}%`}
          animate={{
            scale: [0, 1.5, 0],
            opacity: [0, 0.8, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 8 + Math.random() * 4, // Slower: 8-12 seconds
            repeat: Infinity,
            delay: Math.random() * 8, // Longer delays
          }}
          style={{
            boxShadow: '0 0 8px rgba(147, 51, 234, 0.6)',
            zIndex: 5,
          }}
        />
      ))}
    </Box>
  );
}