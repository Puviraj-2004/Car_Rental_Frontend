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
import { usePathname } from 'next/navigation'; // 1. இதை இறக்குமதி செய்யவும்

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguage] = useState('en');
  const pathname = usePathname(); // 2. தற்போதைய URL-ஐ எடுக்கவும்

  useEffect(() => {
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
    console.log('GDPR consent given');
  };

  // 3. இது அட்மின் பக்கமா என்று கண்டறியவும்
  const isAdminPage = pathname?.startsWith('/admin');

  return (
    <html lang={language}>
      <body>
        <ApolloProvider client={client}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            
            {/* 4. அட்மின் பக்கமாக இல்லையென்றால் மட்டும் Navbar மற்றும் Spacer காட்டப்படும் */}
            {!isAdminPage && (
              <>
                <Navbar language={language} onLanguageChange={handleLanguageChange} />
                <Box sx={{ height: 80 }} />
              </>
            )}

            {/* அட்மின் பக்கத்தில் Container இல்லாமல் முழு அகலத்தையும் பயன்படுத்துவது சிறந்தது */}
            {isAdminPage ? (
              <Box component="main">
                {children}
              </Box>
            ) : (
              <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                {children}
              </Container>
            )}

            <GDPRConsent onConsentGiven={handleConsentGiven} />
          </ThemeProvider>
        </ApolloProvider>
      </body>
    </html>
  );
}