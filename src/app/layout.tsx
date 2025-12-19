'use client';

import React, { useState, useEffect } from 'react';
import { ApolloProvider } from '@apollo/client/react';
import client from '@/lib/apolloClient';
import { ThemeProvider } from '@mui/material/styles';
import theme from '@/lib/theme';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import GDPRConsent from '@/components/GDPRConsent';
import { getUserLanguage, setUserLanguage } from '@/lib/i18n';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    // Set initial language
    const userLang = getUserLanguage();
    setLanguage(userLang);
    document.documentElement.lang = userLang;
  }, []);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setUserLanguage(lang);
    document.documentElement.lang = lang;
  };

  const handleConsentGiven = () => {
    // Enable analytics or other non-essential services
    console.log('GDPR consent given');
  };

  return (
    <html lang={language}>
      <body>
        <ApolloProvider client={client}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AppBar position="static">
              <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  Car Rental Service
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    variant={language === 'en' ? 'contained' : 'outlined'} 
                    size="small" 
                    onClick={() => handleLanguageChange('en')}
                  >
                    EN
                  </Button>
                  <Button 
                    variant={language === 'fr' ? 'contained' : 'outlined'} 
                    size="small" 
                    onClick={() => handleLanguageChange('fr')}
                  >
                    FR
                  </Button>
                </Box>
              </Toolbar>
            </AppBar>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
              {children}
            </Container>
            <GDPRConsent onConsentGiven={handleConsentGiven} />
          </ThemeProvider>
        </ApolloProvider>
      </body>
    </html>
  );
}