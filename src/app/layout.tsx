'use client';

import React, { useState, useEffect } from 'react';
import { ApolloProvider } from '@apollo/client/react';
import client from '@/lib/apolloClient';
import { ThemeProvider } from '@mui/material/styles';
import theme from '@/lib/theme';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import GDPRConsent from '@/components/GDPRConsent';
import { getUserLanguage, setUserLanguage } from '@/lib/i18n';
import Navbar from '@/components/navbar';

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
            <Navbar language={language} onLanguageChange={handleLanguageChange} />
            {/* Spacer for fixed navbar */}
            <Box sx={{ height: 80 }} />
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