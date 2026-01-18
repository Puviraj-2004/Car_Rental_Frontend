'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { DashboardView } from './DashboardView';
import { Box, Typography, LinearProgress, Container } from '@mui/material';

export const DashboardContainer = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { stats, loading, error } = useAdminDashboard();

  // Role-based Access Logic (Preserved from original)
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace('/login');
      return;
    }
    if (status === "authenticated" && (session?.user as any)?.role !== 'ADMIN') {
      router.replace('/');
    }
  }, [status, session, router]);

  if (status === "loading" || (session?.user as any)?.role !== 'ADMIN') {
    return (
      <Box sx={{ width: '100%', mt: 10, textAlign: 'center' }}>
        <Typography variant="h6" color="textSecondary" gutterBottom>Verifying Administration Access...</Typography>
        <Container maxWidth="xs"><LinearProgress /></Container>
      </Box>
    );
  }

  if (error) return <Typography color="error">Error loading metrics: {error.message}</Typography>;

  return (
    <DashboardView 
      stats={stats} 
      loading={loading} 
      adminName={session?.user?.name || 'Administrator'} 
    />
  );
};