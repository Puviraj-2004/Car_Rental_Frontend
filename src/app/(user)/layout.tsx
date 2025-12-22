// src/app/(user)/layout.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { ApolloProvider } from '@apollo/client/react'; // 🚀 இதைச் சேர்க்கவும்
import client from '@/lib/apolloClient';               // 🚀 உங்கள் அப்பல்லோ கிளையண்ட்
import { ThemeProvider } from '@mui/material/styles';
import theme from '@/lib/theme';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from "./_components/navbar";
import { getUserLanguage, setUserLanguage } from '@/lib/i18n';
import Box from '@mui/material/Box';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const userLang = getUserLanguage();
    setLanguage(userLang);
  }, []);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setUserLanguage(lang);
  };

  return (
    // 🛡️ ApolloProvider கண்டிப்பாக இங்கே இருக்க வேண்டும்
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box>
          <Navbar language={language} onLanguageChange={handleLanguageChange} />
          <Box component="main" sx={{ mt: 8 }}> 
            {children}
          </Box>
        </Box>
      </ThemeProvider>
    </ApolloProvider>
  );
}