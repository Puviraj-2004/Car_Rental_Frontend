'use client';

import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton,
  Drawer, List, ListItem, ListItemButton, ListItemText, MenuItem, Menu,
  Avatar, Tooltip, Divider, Container
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { deleteCookie } from 'cookies-next';
import Link from 'next/link';
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
    { label: 'Fleet', path: '/cars' },
    { label: 'About', path: '/about' },
  ];

  return (
    <>
      <AppBar position="fixed" sx={{ backgroundColor: '#0F172A', color: 'white', boxShadow: 3 }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>

            {/* --- Mobile Layout: Menu (Left) + Brand (Center) + Login (Right) --- */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', width: '100%' }}>
              {/* Mobile Menu Icon - Left */}
              <Box sx={{ flexGrow: 0 }}>
                <IconButton color="inherit" onClick={() => setMobileOpen(true)}>
                  <MenuIcon />
                </IconButton>
              </Box>

              {/* Mobile Brand Name - Center */}
              <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Typography
                  variant="h6"
                  noWrap
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    letterSpacing: '.1rem',
                    color: 'inherit',
                    cursor: 'pointer'
                  }}
                  onClick={() => router.push('/')}
                >
                  {settings.companyName || 'RENTCAR'}
                </Typography>
              </Box>

              {/* Mobile User Section - Right */}
              <Box sx={{ flexGrow: 0 }}>
                {!isLoggedIn ? (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => router.push('/login')}
                    sx={{
                      borderRadius: '20px',
                      fontWeight: 'bold',
                      px: 2,
                      py: 1,
                      textTransform: 'none',
                      boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.39)',
                      fontSize: '0.875rem'
                    }}
                  >
                    Login
                  </Button>
                ) : (
                  <Tooltip title="Account Settings">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                      <Avatar
                        sx={{
                          bgcolor: '#2563EB',
                          border: '2px solid white',
                          fontWeight: 'bold'
                        }}
                      >
                        {session?.user?.name ? session.user.name[0].toUpperCase() : (userData?.me?.firstName ? userData.me.firstName[0].toUpperCase() : 'U')}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>

            {/* --- Desktop Layout --- */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
              {/* Desktop: LOGO & NAME */}
              <Box
                sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => router.push('/')}
              >
                {settings.logoUrl ? (
                  <Box
                    component="img"
                    src={settings.logoUrl}
                    alt="Logo"
                    sx={{ height: 40, mr: 1 }}
                  />
                ) : (
                  <DriveEtaIcon sx={{ mr: 1, fontSize: 30, color: '#60A5FA' }} />
                )}
                <Typography
                  variant="h6"
                  noWrap
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    letterSpacing: '.1rem',
                    color: 'inherit',
                    textDecoration: 'none',
                  }}
                >
                  {settings.companyName || 'RENTCAR'}
                </Typography>
              </Box>

              {/* Desktop Links */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexGrow: 1 }}>
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    component={Link}
                    href={item.path}
                    sx={{
                      my: 2,
                      color: 'white',
                      display: 'block',
                      textTransform: 'none',
                      fontSize: '1rem',
                      borderBottom: pathname === item.path ? '2px solid #3b82f6' : '2px solid transparent',
                      borderRadius: 0,
                      '&:hover': { borderBottom: '2px solid #60a5fa' }
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>

              {/* Desktop User Section */}
              <Box sx={{ flexGrow: 0 }}>
                {!isLoggedIn ? (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => router.push('/login')}
                    sx={{
                      borderRadius: '20px',
                      fontWeight: 'bold',
                      px: 3,
                      textTransform: 'none',
                      boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.39)'
                    }}
                  >
                    Login
                  </Button>
                ) : (
                  <Tooltip title="Account Settings">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                      <Avatar
                        sx={{
                          bgcolor: '#2563EB',
                          border: '2px solid white',
                          fontWeight: 'bold'
                        }}
                      >
                        {session?.user?.name ? session.user.name[0].toUpperCase() : (userData?.me?.firstName ? userData.me.firstName[0].toUpperCase() : 'U')}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* User Menu */}
      <Menu
        sx={{ mt: '45px' }}
        anchorEl={anchorElUser}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={Boolean(anchorElUser)}
        onClose={handleCloseUserMenu}
      >
        <Box sx={{ px: 2, py: 1.5, minWidth: '180px' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            {userData?.me?.firstName} {userData?.me?.lastName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {userData?.me?.email}
          </Typography>
        </Box>

        <Divider />

        <MenuItem onClick={() => { router.push('/bookingRecords'); handleCloseUserMenu(); }}>
          <ListItemText>My Bookings</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => { router.push('/profile'); handleCloseUserMenu(); }}>
          <ListItemText>Profile Settings</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleLogout}>
          <Typography color="error" fontWeight="medium">Logout</Typography>
        </MenuItem>
      </Menu>

      {/* --- Mobile Drawer --- */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: 280, bgcolor: '#0F172A', color: 'white' } }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            {/* Brand Logo and Name */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {settings.logoUrl ? (
                <Box
                  component="img"
                  src={settings.logoUrl}
                  alt="Logo"
                  sx={{ height: 40, width: 40, borderRadius: 1 }}
                />
              ) : (
                <DriveEtaIcon sx={{ fontSize: 40, color: '#60A5FA' }} />
              )}
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {settings.companyName || 'RENTCAR'}
              </Typography>
            </Box>
            <IconButton onClick={() => setMobileOpen(false)} color="inherit" size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 3 }} />

          <List sx={{ pt: 1 }}>
            {navItems.map((item) => (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={Link}
                  href={item.path}
                  onClick={() => setMobileOpen(false)}
                  sx={{
                    borderRadius: 2,
                    bgcolor: pathname === item.path ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                    '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.1)' }
                  }}
                >
                  <ListItemText
                    primary={item.label}
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontWeight: pathname === item.path ? 600 : 400,
                        color: pathname === item.path ? '#60A5FA' : 'white'
                      }
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Navbar Fixed என்பதால் கீழே வரும் கன்டென்ட் மறையாமல் இருக்க ஒரு ஸ்பேசர் */}
      <Toolbar />
    </>
  );
}