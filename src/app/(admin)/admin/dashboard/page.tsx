'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Container,
} from '@mui/material';
import {
  DirectionsCar as CarsIcon,
  Person as UsersIcon,
  EventNote as BookingsIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';

interface DashboardData {
  totalCars: number;
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalCars: 0,
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });
  

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace('/auth/login');
      return;
    }

    if (status === "authenticated" && (session?.user as any)?.role !== 'ADMIN') {
      router.replace('/');
      return;
    }

    if (status === "authenticated" && (session?.user as any)?.role === 'ADMIN') {
      const timer = setTimeout(() => {
        setIsLoadingData(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [status, session, router]);

  if (status === "loading" || (session?.user as any)?.role !== 'ADMIN') {
    return (
      <Box sx={{ width: '100%', mt: 10, textAlign: 'center' }}>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Checking Admin Permissions...
        </Typography>
        <Container maxWidth="xs">
          <LinearProgress />
        </Container>
      </Box>
    );
  }

  const stats = [
    { title: 'Total Cars', value: dashboardData.totalCars, icon: CarsIcon, color: '#293D91' },
    { title: 'Total Users', value: dashboardData.totalUsers, icon: UsersIcon, color: '#059669' },
    { title: 'Total Bookings', value: dashboardData.totalBookings, icon: BookingsIcon, color: '#F59E0B' },
    { title: 'Total Revenue', value: `€${dashboardData.totalRevenue?.toFixed(2)}`, icon: PaymentIcon, color: '#EC4899' },
  ];

  return (
    <Box sx={{ p: 4, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E293B' }}>
          Dashboard Overview
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748B' }}>
          Welcome back, <b>{session?.user?.name}</b>. Here is your business summary.
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              transition: '0.3s',
              '&:hover': { transform: 'translateY(-5px)' }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary" fontWeight="500">
                      {stat.title}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
                      {isLoadingData ? '...' : stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    bgcolor: `${stat.color}15`, 
                    color: stat.color 
                  }}>
                    <stat.icon />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity Mockup */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>Recent Bookings</Typography>
            <Box sx={{ py: 4, textAlign: 'center', color: '#94A3B8' }}>
              <BookingsIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
              <Typography>Data will appear here after backend integration</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>System Status</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', color: '#059669', mb: 1 }}>
              <Box sx={{ width: 8, height: 8, bgcolor: 'currentColor', borderRadius: '50%', mr: 1 }} />
              <Typography variant="body2">Backend Server Connected</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', color: '#059669' }}>
              <Box sx={{ width: 8, height: 8, bgcolor: 'currentColor', borderRadius: '50%', mr: 1 }} />
              <Typography variant="body2">Database Operational</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}