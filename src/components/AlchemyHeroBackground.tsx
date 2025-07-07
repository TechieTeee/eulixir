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

const MotionBox = motion(Box);

export default function AlchemyHeroBackground() {
  const [elements, setElements] = useState<AlchemyElement[]>([]);
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });

  // All available alchemy images
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
  
  console.log('AlchemyImages array:', alchemyImages);

  // A few owl images for accent
  const owlImages = [
    '/Owl_1.png',
    '/Owl_Looking_Down.png',
    '/Owl_arms_at_side_looking_forward.png'
  ];

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
    const newElements: AlchemyElement[] = [];
    
    // Define placement zones across the entire screen
    const placementZones = [
      // Left side zones
      { x: 0, y: 0, width: 150, height: 200 },
      { x: 0, y: windowSize.height * 0.2, width: 120, height: 150 },
      { x: 0, y: windowSize.height * 0.5, width: 140, height: 180 },
      { x: 0, y: windowSize.height * 0.75, width: 130, height: 160 },
      
      // Right side zones
      { x: windowSize.width - 150, y: 0, width: 150, height: 200 },
      { x: windowSize.width - 120, y: windowSize.height * 0.2, width: 120, height: 150 },
      { x: windowSize.width - 140, y: windowSize.height * 0.5, width: 140, height: 180 },
      { x: windowSize.width - 130, y: windowSize.height * 0.75, width: 130, height: 160 },
      
      // Top zones (between left and right)
      { x: windowSize.width * 0.2, y: 0, width: 100, height: 120 },
      { x: windowSize.width * 0.4, y: 0, width: 80, height: 100 },
      { x: windowSize.width * 0.6, y: 0, width: 90, height: 110 },
      { x: windowSize.width * 0.8, y: 0, width: 85, height: 105 },
      
      // Bottom zones
      { x: windowSize.width * 0.15, y: windowSize.height - 120, width: 100, height: 120 },
      { x: windowSize.width * 0.35, y: windowSize.height - 100, width: 80, height: 100 },
      { x: windowSize.width * 0.55, y: windowSize.height - 110, width: 90, height: 110 },
      { x: windowSize.width * 0.75, y: windowSize.height - 105, width: 85, height: 105 },
      
      // Mid-level floating zones (sparse placement)
      { x: windowSize.width * 0.1, y: windowSize.height * 0.3, width: 80, height: 80 },
      { x: windowSize.width * 0.9, y: windowSize.height * 0.35, width: 80, height: 80 },
      { x: windowSize.width * 0.05, y: windowSize.height * 0.65, width: 70, height: 70 },
      { x: windowSize.width * 0.95, y: windowSize.height * 0.6, width: 70, height: 70 },
    ];

    // Generate 20-25 elements for rich atmosphere
    const elementCount = 23;
    
    for (let i = 0; i < elementCount; i++) {
      const zone = placementZones[i % placementZones.length];
      
      // Force first 5 elements to be beakers for testing, rest random
      const useOwl = i < 5 ? false : Math.random() < 0.15;
      const imagePool = useOwl ? owlImages : alchemyImages;
      const randomImage = imagePool[Math.floor(Math.random() * imagePool.length)];
      console.log(`Element ${i}: useOwl=${useOwl}, selectedImage=${randomImage}, imagePool:`, imagePool);
      
      // Size variation based on image type and position
      const isTestTube = randomImage.includes('Test_Tube');
      const isOwl = owlImages.includes(randomImage);
      
      let baseSize = 45;
      if (isTestTube) baseSize = 35; // Test tubes smaller
      if (isOwl) baseSize = 55; // Owls slightly larger
      
      // Larger elements for corner zones, smaller for mid-screen
      const isCornerZone = i < 8; // First 8 zones are corners
      const sizeMultiplier = isCornerZone ? 1.2 : 0.8;
      const finalSize = baseSize * sizeMultiplier + Math.random() * 25; // Increased size for testing

      // Ensure element fits in zone
      const elementSize = Math.min(finalSize, zone.width - 10, zone.height - 10);
      
      newElements.push({
        id: `alchemy-${i}`,
        src: randomImage,
        size: elementSize,
        x: zone.x + Math.random() * (zone.width - elementSize),
        y: zone.y + Math.random() * (zone.height - elementSize),
        duration: 12 + Math.random() * 8, // 12-20 seconds
        delay: Math.random() * 8, // 0-8 second delay
        opacity: 0.4 + Math.random() * 0.3, // 0.4-0.7 opacity for testing
        rotation: Math.random() * 30 - 15, // -15 to +15 degrees
        zIndex: isOwl ? 3 : Math.random() < 0.3 ? 2 : 1, // Some elements higher
      });
    }

    console.log('Generated elements:', newElements.length, newElements.slice(0, 3));
    setElements(newElements);
  }, [windowSize]); // eslint-disable-line react-hooks/exhaustive-deps

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
            opacity: 0,
            scale: 0.8,
            rotate: element.rotation
          }}
          style={{
            zIndex: element.zIndex,
          }}
          onAnimationStart={() => {
            // Staggered fade-in animation
            setTimeout(() => {
              const el = document.getElementById(element.id);
              if (el) {
                el.style.opacity = element.opacity.toString();
                el.style.transition = 'opacity 3s ease-in-out';
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
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 5,
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