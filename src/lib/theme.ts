'use client';

import { createTheme } from '@mui/material/styles';
import { Inter, Poppins } from 'next/font/google';

// Font Setup
const inter = Inter({ subsets: ['latin'], display: 'swap' });
const poppins = Poppins({ weight: ['400', '500', '600', '700'], subsets: ['latin'], display: 'swap' });

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0F172A', // Premium Dark Navy (Header, Footer, Primary Text)
      light: '#334155',
      dark: '#020617',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#2563EB', // Electric Blue (Buttons, Links, Highlights)
      light: '#60A5FA',
      dark: '#1D4ED8',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F8FAFC', // Very light greyish blue (Modern Background)
      paper: '#ffffff',
    },
    text: {
      primary: '#1E293B', // Soft Black
      secondary: '#64748B', // Muted Grey
    },
    success: {
      main: '#10B981',
    },
    error: {
      main: '#EF4444',
    },
  },
  typography: {
    fontFamily: inter.style.fontFamily,
    h1: { fontFamily: poppins.style.fontFamily, fontWeight: 700, fontSize: '2.5rem' },
    h2: { fontFamily: poppins.style.fontFamily, fontWeight: 600, fontSize: '2rem' },
    h3: { fontFamily: poppins.style.fontFamily, fontWeight: 600, fontSize: '1.75rem' },
    h4: { fontFamily: poppins.style.fontFamily, fontWeight: 500, fontSize: '1.5rem' },
    h5: { fontFamily: poppins.style.fontFamily, fontWeight: 500, fontSize: '1.25rem' },
    h6: { fontFamily: poppins.style.fontFamily, fontWeight: 500, fontSize: '1rem' },
    button: { textTransform: 'none', fontWeight: 600, fontFamily: poppins.style.fontFamily },
  },
  shape: {
    borderRadius: 12, // Modern rounded corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)', // Soft blue glow on hover
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', // Gradient for primary buttons
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)', // Super soft shadow
          border: '1px solid rgba(226, 232, 240, 0.8)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0F172A',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

export default theme;