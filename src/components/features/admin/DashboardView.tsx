'use client';

import React from 'react';
import {
  Box, Grid, Typography, Card, CardContent, Stack, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Divider, LinearProgress, Avatar,
  Button
} from '@mui/material';
import {
  DirectionsCar as CarsIcon,
  Person as UsersIcon,
  EventNote as BookingsIcon,
  AttachMoney as RevenueIcon,
  RadioButtonChecked as StatusIcon
} from '@mui/icons-material';

interface DashboardViewProps {
  stats: any;
  loading: boolean;
  adminName: string;
}

export const DashboardView = ({ stats, loading, adminName }: DashboardViewProps) => {
  const statCards = [
    { title: 'Fleet Size', value: stats.totalCars, sub: `${stats.availableCars} Active`, icon: <CarsIcon />, color: '#6366F1' },
    { title: 'Total Customers', value: stats.totalUsers, sub: 'Registered Users', icon: <UsersIcon />, color: '#10B981' },
    { title: 'Active Bookings', value: stats.totalBookings, sub: 'Total Orders', icon: <BookingsIcon />, color: '#F59E0B' },
    { title: 'Gross Revenue', value: `€${stats.totalRevenue.toLocaleString()}`, sub: 'Lifetime Earnings', icon: <RevenueIcon />, color: '#8B5CF6' },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header Section */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" fontWeight={900} color="#0F172A">Business Overview</Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, <b>{adminName}</b>. Here is what is happening today.
        </Typography>
      </Box>

      {loading && <LinearProgress sx={{ mb: 4, borderRadius: 2 }} />}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {statCards.map((stat, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #E2E8F0', transition: '0.3s', '&:hover': { boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' } }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>{stat.title}</Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ mt: 1, color: '#0F172A' }}>{loading ? '...' : stat.value}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>{stat.sub}</Typography>
                  </Box>
                  <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: `${stat.color}15`, color: stat.color, display: 'flex' }}>{stat.icon}</Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={4}>
        {/* Recent Bookings Table */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={800}>Recent Transactions</Typography>
              <Button size="small" sx={{ fontWeight: 700 }}>View All</Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>CUSTOMER</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>VEHICLE</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>STATUS</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>AMOUNT</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.recentBookings.map((booking: any) => (
                    <TableRow key={booking.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>{booking.user.fullName}</Typography>
                        <Typography variant="caption" color="text.secondary">{booking.user.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{booking.car.brand.name} {booking.car.model.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={booking.status} 
                          size="small" 
                          sx={{ 
                            fontWeight: 800, fontSize: '0.65rem',
                            bgcolor: booking.status === 'CONFIRMED' ? '#DCFCE7' : '#F1F5F9',
                            color: booking.status === 'CONFIRMED' ? '#166534' : '#475569'
                          }} 
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={800}>€{booking.totalPrice?.toFixed(2)}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* System Health */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #E2E8F0', height: '100%' }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 3 }}>Infrastructure Status</Typography>
            <Stack spacing={3}>
              <Box>
                <Stack direction="row" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" fontWeight={600}>Database Load</Typography>
                  <Typography variant="caption" fontWeight={700} color="success.main">Healthy</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={12} sx={{ height: 6, borderRadius: 3, bgcolor: '#F1F5F9' }} />
              </Box>
              <Box>
                <Stack direction="row" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" fontWeight={600}>API Response Time</Typography>
                  <Typography variant="caption" fontWeight={700} color="success.main">98ms</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={5} sx={{ height: 6, borderRadius: 3, bgcolor: '#F1F5F9' }} />
              </Box>
              <Divider />
              <Stack direction="row" alignItems="center" spacing={1} sx={{ color: '#10B981' }}>
                <StatusIcon sx={{ fontSize: 14, animation: 'pulse 2s infinite' }} />
                <Typography variant="caption" fontWeight={700}>System is running smoothly</Typography>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};