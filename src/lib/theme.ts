import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    gold: {
      50: '#FFFEF7',
      100: '#FFF9E6',
      200: '#FFECB3',
      300: '#FFE082',
      400: '#FFD54F', // Matches Tailwind yellow-400
      500: '#FFCA28',
      600: '#FFB300',
      700: '#FF8F00',
      800: '#FF6F00',
      900: '#E65100',
    },
    platinum: {
      50: '#FFFFFF',
      100: '#FAFAFA',
      200: '#F5F5F5',
      300: '#EEEEEE',
      400: '#E0E0E0',
      500: '#BDBDBD',
      600: '#9E9E9E',
      700: '#757575',
      800: '#424242',
      900: '#212121',
    },
    void: {
      50: '#0A0A0A',
      100: '#050505',
      200: '#030303',
      300: '#020202',
      400: '#010101',
      500: '#000000', // Matches Tailwind gray-900
      600: '#000000',
      700: '#000000',
      800: '#000000',
      900: '#000000',
    },
    azure: {
      50: '#E3F2FD',
      100: '#BBDEFB',
      200: '#90CAF9',
      300: '#64B5F6',
      400: '#42A5F5', // Matches Tailwind blue-400
      500: '#2196F3',
      600: '#1E88E5',
      700: '#1976D2',
      800: '#1565C0',
      900: '#0D47A1',
    },
    cyan: {
      50: '#E0F7FA',
      100: '#B2EBF2',
      200: '#80DEEA',
      300: '#4DD0E1',
      400: '#26C6DA', // Matches Tailwind cyan-400
      500: '#00BCD4',
      600: '#00ACC1',
      700: '#0097A7',
      800: '#00838F',
      900: '#006064',
    },
    mystic: {
      50: '#F3E5F5',
      100: '#E1BEE7',
      200: '#CE93D8',
      300: '#BA68C8',
      400: '#AB47BC', // Matches Tailwind purple-400
      500: '#9C27B0',
      600: '#8E24AA',
      700: '#7B1FA2',
      800: '#6A1B9A',
      900: '#4A148C',
    },
    violet: {
      50: '#EDE7F6',
      100: '#D1C4E9',
      200: '#B39DDB',
      300: '#9575CD',
      400: '#7E57C2', // Matches Tailwind violet-400
      500: '#673AB7',
      600: '#5E35B1',
      700: '#512DA8',
      800: '#4527A0',
      900: '#311B92',
    },
    indigo: {
      50: '#E8EAF6',
      100: '#C5CAE9',
      200: '#9FA8DA',
      300: '#7986CB',
      400: '#5C6BC0',
      500: '#3F51B5', // Matches Tailwind indigo-900
      600: '#3949AB',
      700: '#303F9F',
      800: '#283593',
      900: '#1A237E',
    },
    emerald: {
      50: '#E8F5E8',
      100: '#C8E6C9',
      200: '#A5D6A7',
      300: '#81C784',
      400: '#66BB6A',
      500: '#4CAF50',
      600: '#43A047',
      700: '#388E3C',
      800: '#2E7D32',
      900: '#1B5E20',
    },
    ruby: {
      50: '#FFEBEE',
      100: '#FFCDD2',
      200: '#EF9A9A',
      300: '#E57373',
      400: '#EF5350',
      500: '#F44336',
      600: '#E53935',
      700: '#D32F2F',
      800: '#C62828',
      900: '#B71C1C',
    },
    gray: {
      100: '#F7FAFC',
      200: '#EDF2F7',
      300: '#E2E8F0',
      400: '#CBD5E0',
      500: '#A0AEC0',
      600: '#718096',
      700: '#4A5568',
      800: '#2D3748',
      900: '#1A202C', // Matches Tailwind gray-900
    },
  },
  fonts: {
    heading: 'Futura, sans-serif',
    body: 'Montserrat, sans-serif',
    mono: 'Fira Code, monospace',
  },
  components: {
    Button: {
      variants: {
        gold: {
          bg: 'gold.500',
          color: 'void.500',
          _hover: { bg: 'gold.400' },
          fontWeight: 'semibold',
          borderRadius: 'lg',
          boxShadow: '0 0 15px rgba(255, 202, 40, 0.3)',
          _hover: { boxShadow: '0 0 20px rgba(255, 202, 40, 0.5)' },
        },
        mystic: {
          bgGradient: 'linear(to-r, mystic.600, violet.600)',
          color: 'platinum.100',
          _hover: { bgGradient: 'linear(to-r, mystic.500, violet.500)' },
          fontWeight: 'semibold',
          borderRadius: 'lg',
          boxShadow: '0 0 15px rgba(156, 39, 176, 0.3)',
          _hover: { boxShadow: '0 0 20px rgba(156, 39, 176, 0.5)' },
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          bgGradient: 'linear(to-br, gray.800, gray.900)',
          color: 'platinum.100',
          borderRadius: '2xl',
          border: '1px solid',
          borderColor: 'mystic.500',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
          _hover: { borderColor: 'mystic.400' },
        },
      },
    },
    Heading: {
      variants: {
        glowing: {
          textShadow: '0 0 30px rgba(255, 202, 40, 0.8)',
          color: 'gold.400',
          fontWeight: 'bold',
          bgGradient: 'linear(to-r, gold.400, mystic.400, azure.400)',
          bgClip: 'text',
        },
        platinum: {
          color: 'platinum.100',
          textShadow: '0 0 25px rgba(255, 255, 255, 0.6)',
          fontWeight: 'medium',
        },
        azure: {
          color: 'azure.400',
          textShadow: '0 0 20px rgba(33, 150, 243, 0.7)',
          fontWeight: 'medium',
        },
        cyan: {
          color: 'cyan.400',
          textShadow: '0 0 20px rgba(0, 188, 212, 0.7)',
          fontWeight: 'medium',
        },
        mystic: {
          color: 'mystic.400',
          textShadow: '0 0 25px rgba(156, 39, 176, 0.7)',
          fontWeight: 'medium',
        },
        violet: {
          color: 'violet.400',
          textShadow: '0 0 20px rgba(103, 58, 183, 0.7)',
          fontWeight: 'medium',
        },
      },
    },
    Text: {
      variants: {
        glowing: {
          textShadow: '0 0 30px rgba(255, 202, 40, 0.8)',
          color: 'gold.400',
          fontWeight: 'semibold',
        },
        platinum: {
          color: 'platinum.100',
          textShadow: '0 0 25px rgba(255, 255, 255, 0.6)',
          fontWeight: 'medium',
        },
        azure: {
          color: 'azure.400',
          textShadow: '0 0 20px rgba(33, 150, 243, 0.7)',
          fontWeight: 'medium',
        },
        cyan: {
          color: 'cyan.400',
          textShadow: '0 0 20px rgba(0, 188, 212, 0.7)',
          fontWeight: 'medium',
        },
        mystic: {
          color: 'mystic.400',
          textShadow: '0 0 25px rgba(156, 39, 176, 0.7)',
          fontWeight: 'medium',
        },
        violet: {
          color: 'violet.400',
          textShadow: '0 0 20px rgba(103, 58, 183, 0.7)',
          fontWeight: 'medium',
        },
        dataLabel: {
          fontFamily: 'mono',
          fontSize: 'xs',
          color: 'azure.400',
          textShadow: '0 0 15px rgba(33, 150, 243, 0.7)',
          fontWeight: 'normal',
        },
      },
    },
  },
  fonts: {
    heading: 'Futura, sans-serif',
    body: 'Montserrat, sans-serif',
    mono: 'Fira Code, monospace',
  },
  styles: {
    global: {
      body: {
        bgGradient: 'linear(to-br, gray.900, mystic.900, indigo.900)',
        color: 'platinum.100',
        fontFamily: 'body',
      },
    },
  },
});

export default theme;