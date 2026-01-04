'use client';

import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton,
  Drawer, List, ListItem, ListItemButton, ListItemText, MenuItem, Menu,
  Avatar, Tooltip, Container, Stack,
  Link
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { deleteCookie } from 'cookies-next';
import { useQuery, useApolloClient } from '@apollo/client';
import { GET_ME_QUERY, GET_PLATFORM_SETTINGS_QUERY } from '@/lib/graphql/queries';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const client = useApolloClient();
  const { data: session } = useSession();
  const { data: userData } = useQuery(GET_ME_QUERY, { skip: !session?.accessToken });
  const { data: platformData } = useQuery(GET_PLATFORM_SETTINGS_QUERY);
  const settings = platformData?.platformSettings || {};

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const isLoggedIn = !!session;

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = async () => {
    deleteCookie('token');
    await client.clearStore();
    handleCloseUserMenu();
    await signOut({ callbackUrl: '/' });
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'About Us', path: '/about' },
    { label: 'Our Fleet', path: '/cars' },
  ];

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={0} 
        sx={{ 
          backgroundColor: '#FFFFFF', 
          color: '#1E293B', 
          borderBottom: '1px solid #F1F5F9',
          height: 80,
          justifyContent: 'center'
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>

            {/* --- MOBILE: Hamburger Menu (Left) --- */}
            <IconButton 
              sx={{ display: { xs: 'flex', md: 'none' }, color: '#0F172A' }}
              onClick={() => setMobileOpen(true)}
            >
              <MenuIcon />
            </IconButton>

            {/* 1. BRAND / LOGO SECTION - Hidden on Mobile */}
            <Box 
              sx={{ 
                display: { xs: 'none', md: 'flex' }, // 🛑 இது மொபைலில் லோகோவை மறைக்கும்
                alignItems: 'center', 
                cursor: 'pointer', 
                gap: 1 
              }}
              onClick={() => router.push('/')}
            >
              {settings.logoUrl ? (
                <Box component="img" src={settings.logoUrl} alt="Logo" sx={{ height: 40 }} />
              ) : (
                <DriveEtaIcon sx={{ fontSize: 32, color: '#0F172A' }} />
              )}
              <Typography
                variant="h5"
                noWrap
                sx={{
                  fontFamily: 'inherit',
                  fontWeight: 700,
                  color: '#0F172A',
                  letterSpacing: '-0.5px'
                }}
              >
                {settings.companyName}
              </Typography>
            </Box>

            {/* 2. CENTER NAVIGATION (Desktop Only) - Pill Style */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
              <Box 
                sx={{ 
                  bgcolor: '#F8FAFC', 
                  borderRadius: '100px', 
                  p: 0.75, 
                  display: 'flex', 
                  gap: 0.5,
                  border: '1px solid #E2E8F0'
                }}
              >
                {navItems.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <Button
                      key={item.path}
                      component={Link}
                      href={item.path}
                      sx={{
                        borderRadius: '100px',
                        px: 3,
                        py: 1,
                        textTransform: 'none',
                        fontSize: '0.9rem',
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? 'white' : '#64748B',
                        bgcolor: isActive ? '#0F172A' : 'transparent',
                        '&:hover': {
                          bgcolor: isActive ? '#0F172A' : '#E2E8F0',
                          color: isActive ? 'white' : '#1E293B'
                        }
                      }}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </Box>
            </Box>

            {/* 3. RIGHT SECTION (Login/User) */}
            <Stack direction="row" spacing={1} alignItems="center">
              {!isLoggedIn ? (
                <Button
                  variant="contained"
                  onClick={() => router.push('/login')}
                  sx={{
                    bgcolor: '#0F172A',
                    color: 'white',
                    borderRadius: '100px',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: { xs: 3, md: 4 },
                    py: 1,
                    boxShadow: 'none',
                    fontSize: { xs: '0.85rem', md: '1rem' },
                    '&:hover': {
                      bgcolor: '#334155',
                      boxShadow: 'none'
                    }
                  }}
                >
                  Login
                </Button>
              ) : (
                <Tooltip title="Account Settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar
                      sx={{
                        bgcolor: '#0F172A',
                        color: 'white',
                        fontWeight: 'bold',
                        width: { xs: 35, md: 40 },
                        height: { xs: 35, md: 40 }
                      }}
                    >
                      {session?.user?.name ? session.user.name[0].toUpperCase() : (userData?.me?.fullName ? userData.me.fullName[0].toUpperCase() : 'U')}
                    </Avatar>
                  </IconButton>
                </Tooltip>
              )}
            </Stack>

          </Toolbar>
        </Container>
      </AppBar>

      {/* User Dropdown Menu */}
      <Menu
        sx={{ mt: '50px' }}
        anchorEl={anchorElUser}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={Boolean(anchorElUser)}
        onClose={handleCloseUserMenu}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            mt: 1.5,
            borderRadius: 3,
            minWidth: 200,
            border: '1px solid #F1F5F9'
          },
        }}
      >
        <Box sx={{ px: 2.5, py: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
            {userData?.me?.fullName}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
            {userData?.me?.email}
          </Typography>
        </Box>
        <Box sx={{ height: 1, bgcolor: '#F1F5F9', my: 1 }} />
        <MenuItem onClick={() => { router.push('/bookingRecords'); handleCloseUserMenu(); }} sx={{ py: 1.5 }}>
          <ListItemText primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}>My Bookings</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { router.push('/profile'); handleCloseUserMenu(); }} sx={{ py: 1.5 }}>
          <ListItemText primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}>Profile Settings</ListItemText>
        </MenuItem>
        <Box sx={{ height: 1, bgcolor: '#F1F5F9', my: 1 }} />
        <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
          <Typography color="error" fontSize="0.9rem" fontWeight={600}>Logout</Typography>
        </MenuItem>
      </Menu>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: '85vw', maxWidth: 320, bgcolor: 'white' } }}
      >
        <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DriveEtaIcon sx={{ color: '#0F172A' }} />
              <Typography variant="h6" fontWeight={700} color="#0F172A">
                {settings.companyName}
              </Typography>
            </Box>
            <IconButton onClick={() => setMobileOpen(false)} color="inherit">
              <CloseIcon />
            </IconButton>
          </Box>

          <List sx={{ flexGrow: 1 }}>
            {navItems.map((item) => (
              <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  component={Link}
                  href={item.path}
                  onClick={() => setMobileOpen(false)}
                  sx={{
                    borderRadius: 2,
                    bgcolor: pathname === item.path ? '#F8FAFC' : 'transparent',
                  }}
                >
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '1rem',
                      fontWeight: pathname === item.path ? 700 : 500,
                      color: pathname === item.path ? '#0F172A' : '#64748B'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          {!isLoggedIn && (
            <Button
              fullWidth
              variant="contained"
              onClick={() => { router.push('/login'); setMobileOpen(false); }}
              sx={{
                bgcolor: '#0F172A',
                color: 'white',
                borderRadius: '100px',
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 700,
                textTransform: 'none'
              }}
            >
              Login
            </Button>
          )}
        </Box>
      </Drawer>
      <Toolbar sx={{ height: 80 }} />
    </>
  );
}