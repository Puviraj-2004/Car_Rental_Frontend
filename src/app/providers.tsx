// src/app/providers.tsx
'use client';

import React from 'react';
import { ApolloProvider } from '@apollo/client';
import client from '@/lib/apolloClient';
import { ThemeProvider } from '@mui/material/styles';
import theme from '@/lib/theme';
import CssBaseline from '@mui/material/CssBaseline';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { SessionProvider } from "next-auth/react"; // ✅ Import this

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider> {/* ✅ Wrap everything with SessionProvider */}
      <ApolloProvider client={client}>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </ApolloProvider>
    </SessionProvider>
  );
}