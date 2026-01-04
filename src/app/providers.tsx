'use client';

import React from 'react';
import { SessionProvider } from "next-auth/react";
import { ApolloProvider } from '@apollo/client';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import client from '@/lib/apolloClient';
import theme from '@/lib/theme';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // ⚡ PERFORMANCE FIX: Prevents auto-refetching session on window focus
    <SessionProvider 
      refetchOnWindowFocus={false}    
      refetchWhenOffline={false}  
      refetchInterval={0}    
    >
      <ApolloProvider client={client}>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            {/* CssBaseline kickstarts an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </ApolloProvider>
    </SessionProvider>
  );
}