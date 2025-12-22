'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import {
  DirectionsCar as CarsIcon,
  Person as UsersIcon,
  EventNote as BookingsIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';


interface DashboardCard {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalCars: 0,
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    // Verify user is authenticated
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
    }

    // TODO: Fetch dashboard data from backend
    // For now, using mock data
    setTimeout(() => {
      setDashboardData({
        totalCars: 24,
        totalUsers: 156,
        totalBookings: 89,
        totalRevenue: 12500,
      });
      setIsLoading(false);
    }, 1000);
  }, [router]);

  const dashboardCards: DashboardCard[] = [
    {
      title: 'Total Cars',
      value: dashboardData.totalCars,
      icon: CarsIcon,
      color: '#293D91',
      bgColor: 'rgba(41, 61, 145, 0.1)',
    },
    {
      title: 'Total Users',
      value: dashboardData.totalUsers,
      icon: UsersIcon,
      color: '#059669',
      bgColor: 'rgba(5, 150, 105, 0.1)',
    },
    {
      title: 'Total Bookings',
      value: dashboardData.totalBookings,
      icon: BookingsIcon,
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.1)',
    },
    {
      title: 'Total Revenue',
      value: dashboardData.totalRevenue,
      icon: PaymentIcon,
      color: '#EC4899',
      bgColor: 'rgba(236, 72, 153, 0.1)',
    },
  ];

  return (
    <Box>
        {/* Header */}
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: '#0F172A' }}>
          Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
          Welcome to your admin panel. Here's an overview of your car rental business.
        </Typography>

        {isLoading && <LinearProgress sx={{ mb: 3 }} />}

        {/* Dashboard Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {dashboardCards.map((card) => {
            const Icon = card.icon;
            return (
              <Grid item xs={12} sm={6} md={3} key={card.title}>
                <Card
                  sx={{
                    height: '100%',
                    backgroundColor: card.bgColor,
                    borderRadius: 2,
                    border: `1px solid ${card.color}20`,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 1.5,
                          backgroundColor: card.color,
                          color: 'white',
                        }}
                      >
                        <Icon sx={{ fontSize: 28 }} />
                      </Box>
                    </Box>
                    <Typography color="textSecondary" sx={{ fontSize: '0.875rem', mb: 1 }}>
                      {card.title}
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 700, color: card.color }}
                    >
                      {card.title === 'Total Revenue' ? `€${card.value}` : card.value}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Recent Activity Section */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #E2E8F0' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Recent Bookings
              </Typography>
              <Box sx={{ textAlign: 'center', py: 4, color: '#94A3B8' }}>
                <Typography>No bookings yet</Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #E2E8F0' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Recent Users
              </Typography>
              <Box sx={{ textAlign: 'center', py: 4, color: '#94A3B8' }}>
                <Typography>No new users yet</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
  );
}
