'use client';

import React from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton,
  Drawer, List, ListItem, ListItemButton, ListItemText, MenuItem, Menu,
  Avatar, Tooltip, Container, Stack,Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import Link from 'next/link';

interface NavbarViewProps {
  settings: any;
  navItems: Array<{ label: string; path: string }>;
  isLoggedIn: boolean;
  userData: any;
  pathname: string;
  mobileOpen: boolean;
  anchorElUser: null | HTMLElement;
  onOpenMobile: () => void;
  onCloseMobile: () => void;
  onOpenUserMenu: (event: React.MouseEvent<HTMLElement>) => void;
  onCloseUserMenu: () => void;
  onLogout: () => void;
  onNavigate: (path: string) => void;
}

export const NavbarView = ({
  settings,
  navItems,
  isLoggedIn,
  userData,
  pathname,
  mobileOpen,
  anchorElUser,
  onOpenMobile,
  onCloseMobile,
  onOpenUserMenu,
  onCloseUserMenu,
  onLogout,
  onNavigate
}: NavbarViewProps) => {
  return (
    <>
      <AppBar position="fixed" elevation={0} sx={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #F1F5F9', height: 80, justifyContent: 'center' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            
            {/* Mobile Hamburger */}
            <IconButton sx={{ display: { xs: 'flex', md: 'none' }, color: '#0F172A' }} onClick={onOpenMobile}>
              <MenuIcon />
            </IconButton>

            {/* Logo Section - Hidden on Mobile as per your request */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', cursor: 'pointer', gap: 1 }} onClick={() => onNavigate('/')}>
              {settings.logoUrl ? (
                <Box component="img" src={settings.logoUrl} alt="Logo" sx={{ height: 40 }} />
              ) : (
                <DriveEtaIcon sx={{ fontSize: 32, color: '#0F172A' }} />
              )}
              <Typography variant="h5" fontWeight={700} color="#0F172A">{settings.companyName || 'Dream Drive'}</Typography>
            </Box>

            {/* Desktop Nav */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
              <Box sx={{ bgcolor: '#F8FAFC', borderRadius: '100px', p: 0.75, display: 'flex', gap: 0.5, border: '1px solid #E2E8F0' }}>
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    component={Link}
                    href={item.path}
                    sx={{
                      borderRadius: '100px', px: 3, py: 1, textTransform: 'none', fontSize: '0.9rem',
                      fontWeight: pathname === item.path ? 600 : 500,
                      color: pathname === item.path ? 'white' : '#64748B',
                      bgcolor: pathname === item.path ? '#0F172A' : 'transparent',
                      '&:hover': { bgcolor: pathname === item.path ? '#0F172A' : '#E2E8F0' }
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            </Box>

            {/* User Section */}
            <Stack direction="row" spacing={1} alignItems="center">
              {!isLoggedIn ? (
                <Button variant="contained" onClick={() => onNavigate('/login')} sx={{ bgcolor: '#0F172A', color: 'white', borderRadius: '100px', textTransform: 'none', fontWeight: 600, px: 4, py: 1.2 }}>
                  Login
                </Button>
              ) : (
                <Tooltip title="Settings">
                  <IconButton onClick={onOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar sx={{ bgcolor: '#0F172A', fontWeight: 'bold' }}>
                      {(userData?.fullName || 'U')[0].toUpperCase()}
                    </Avatar>
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* User Menu */}
      <Menu sx={{ mt: '45px' }} anchorEl={anchorElUser} open={Boolean(anchorElUser)} onClose={onCloseUserMenu} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Box sx={{ px: 2, py: 1 }}><Typography variant="subtitle2" fontWeight={700}>{userData?.fullName}</Typography></Box>
        <Divider />
        <MenuItem onClick={() => onNavigate('/bookingRecords')}>My Bookings</MenuItem>
        <MenuItem onClick={() => onNavigate('/profile')}>Profile Settings</MenuItem>
        <MenuItem onClick={onLogout}><Typography color="error">Logout</Typography></MenuItem>
      </Menu>

      {/* Mobile Drawer */}
      <Drawer anchor="left" open={mobileOpen} onClose={onCloseMobile} sx={{ '& .MuiDrawer-paper': { width: 280 } }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>{settings.companyName}</Typography>
          <Divider />
          <List>
            {navItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton onClick={() => onNavigate(item.path)}>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Toolbar sx={{ height: 80 }} />
    </>
  );
};