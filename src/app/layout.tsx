'use client';

import React from 'react';
import { ApolloProvider } from '@apollo/client/react';
import client from '@/lib/apolloClient';
import { ThemeProvider } from '@mui/material/styles';
import theme from '@/lib/theme';
import CssBaseline from '@mui/material/CssBaseline';
import { SessionProvider } from "next-auth/react";




export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <ApolloProvider client={client}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              {children}
            </ThemeProvider>
          </ApolloProvider>
        </SessionProvider>
      </body>
    </html>
  );
}