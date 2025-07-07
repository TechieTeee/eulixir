'use client';

import { Box, Image } from '@chakra-ui/react';
import { motion } from 'framer-motion';

interface OwlMascotProps {
  variant?: 'default' | 'waving' | 'looking-down' | 'hands-up' | 'side';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  position?: 'fixed' | 'absolute' | 'relative';
  placement?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  animation?: 'float' | 'bounce' | 'pulse' | 'none';
  opacity?: number;
  className?: string;
}

const MotionBox = motion(Box);

export default function OwlMascot({
  variant = 'default',
  size = 'md',
  position = 'relative',
  placement = 'center',
  animation = 'float',
  opacity = 1,
  className = ''
}: OwlMascotProps) {
  
  // Get owl image based on variant
  const getOwlImage = () => {
    switch (variant) {
      case 'waving':
        return '/Owl_Waiving.png';
      case 'looking-down':
        return '/Owl_Looking_Down.png';
      case 'hands-up':
        return '/Owl_Both_Hands_Up.png';
      case 'side':
        return '/Owl_arms_at_side_looking_forward.png';
      case 'default':
      default:
        return '/Owl_1.png';
    }
  };

  // Get size dimensions
  const getSizeDimensions = () => {
    switch (size) {
      case 'sm':
        return { width: 40, height: 40 };
      case 'md':
        return { width: 60, height: 60 };
      case 'lg':
        return { width: 80, height: 80 };
      case 'xl':
        return { width: 120, height: 120 };
      default:
        return { width: 60, height: 60 };
    }
  };

  // Get position styles
  const getPositionStyles = () => {
    if (position !== 'fixed' && position !== 'absolute') {
      return {};
    }

    const baseStyles = {
      position,
      zIndex: 10,
    };

    switch (placement) {
      case 'top-left':
        return { ...baseStyles, top: '20px', left: '20px' };
      case 'top-right':
        return { ...baseStyles, top: '20px', right: '20px' };
      case 'bottom-left':
        return { ...baseStyles, bottom: '20px', left: '20px' };
      case 'bottom-right':
        return { ...baseStyles, bottom: '20px', right: '20px' };
      default:
        return baseStyles;
    }
  };

  // Animation variants
  const animationVariants = {
    float: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    bounce: {
      y: [0, -15, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeOut"
      }
    },
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    none: {}
  };

  const dimensions = getSizeDimensions();
  const positionStyles = getPositionStyles();

  return (
    <MotionBox
      style={positionStyles}
      className={className}
      animate={animation !== 'none' ? animationVariants[animation] : undefined}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ 
        opacity: opacity, 
        scale: 1,
        transition: { duration: 0.6, ease: "easeOut" }
      }}
      viewport={{ once: true }}
      whileHover={{
        scale: 1.1,
        transition: { duration: 0.2 }
      }}
    >
      <Image
        src={getOwlImage()}
        alt="Eulixir Owl Mascot"
        width={`${dimensions.width}px`}
        height={`${dimensions.height}px`}
        style={{
          filter: 'drop-shadow(0 4px 12px rgba(147, 51, 234, 0.2))',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
        draggable={false}
      />
    </MotionBox>
  );
}

// Preset owl configurations for different contexts
export const WelcomeOwl = () => (
  <OwlMascot 
    variant="waving" 
    size="lg" 
    animation="float"
    position="fixed"
    placement="bottom-right"
    opacity={0.8}
  />
);

export const LoadingOwl = () => (
  <OwlMascot 
    variant="looking-down" 
    size="md" 
    animation="pulse"
    opacity={0.7}
  />
);

export const SuccessOwl = () => (
  <OwlMascot 
    variant="hands-up" 
    size="lg" 
    animation="bounce"
    opacity={0.9}
  />
);

export const HeaderOwl = () => (
  <OwlMascot 
    variant="side" 
    size="sm" 
    animation="float"
    opacity={0.6}
  />
);

export const CornerOwl = ({ placement = 'top-right' }: { placement?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) => (
  <OwlMascot 
    variant="default" 
    size="md" 
    animation="float"
    position="fixed"
    placement={placement}
    opacity={0.3}
  />
);