'use client';

import React from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton,
  Drawer, List, ListItem, ListItemButton, ListItemText, MenuItem, Menu,
  Avatar, Tooltip, Container, Stack, Divider, alpha
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import HomeIcon from '@mui/icons-material/Home';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
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

  const activeBlue = '#3B82F6'; // Vibrant Blue
  const deepBlack = '#0F172A'; // Premium Dark

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={0} 
        sx={{ 
          backgroundColor: deepBlack, 
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)', 
          height: { xs: 56, md: 90 }, 
          justifyContent: 'center',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            
            {/* Logo Section - Desktop Only */}
            <Box 
              sx={{ 
                display: { xs: 'none', md: 'flex' }, 
                alignItems: 'center', 
                cursor: 'pointer', 
                gap: 1.5 
              }} 
              onClick={() => onNavigate('/')}
            >
              <Box 
                sx={{ 
                  width: 42, 
                  height: 42, 
                  bgcolor: activeBlue, 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: `0 0 20px ${alpha(activeBlue, 0.4)}`
                }}
              >
                <DriveEtaIcon sx={{ fontSize: 24, color: 'white' }} />
              </Box>
              <Typography 
                variant="h5" 
                fontWeight={800} 
                sx={{ 
                  color: 'white', 
                  letterSpacing: '-0.5px'
                }}
              >
                {settings.companyName || 'Dream'}
              </Typography>
            </Box>

            {/* Mobile - Company Name on Left */}
            <Typography 
              variant="h6" 
              fontWeight={800} 
              sx={{ 
                display: { xs: 'block', md: 'none' },
                color: 'white', 
                letterSpacing: '-0.5px'
              }}
            >
              {settings.companyName || 'Dream'}
            </Typography>
            
            {/* Mobile - Notification Icon on Right */}
            <IconButton 
              sx={{ 
                display: { xs: 'flex', md: 'none' },
                color: 'white',
                '&:hover': { bgcolor: alpha(activeBlue, 0.1) }
              }}
            >
              <NotificationsOutlinedIcon />
            </IconButton>

            {/* Desktop Nav - Modern Pill Shape */}
            <Box 
              sx={{ 
                display: { xs: 'none', md: 'flex' }, 
                alignItems: 'center',
                bgcolor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '100px',
                p: 0.8,
                border: '1px solid rgba(255, 255, 255, 0.05)'
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
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: isActive ? 'white' : 'rgba(255, 255, 255, 0.6)',
                      bgcolor: isActive ? activeBlue : 'transparent',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': { 
                        bgcolor: isActive ? activeBlue : alpha(activeBlue, 0.1),
                        color: 'white'
                      }
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Box>

            {/* User Section - Desktop Only */}
            <Stack direction="row" spacing={2} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
              {!isLoggedIn ? (
                <Button 
                  variant="contained" 
                  onClick={() => onNavigate('/login')} 
                  sx={{ 
                    bgcolor: activeBlue, 
                    color: 'white', 
                    borderRadius: '100px', 
                    textTransform: 'none', 
                    fontWeight: 700, 
                    px: 4, 
                    py: 1.2,
                    boxShadow: `0 4px 14px ${alpha(activeBlue, 0.4)}`,
                    '&:hover': { bgcolor: '#2563EB' }
                  }}
                >
                  Sign In
                </Button>
              ) : (
                <Tooltip title="Account">
                  <IconButton 
                    onClick={onOpenUserMenu} 
                    sx={{ 
                      p: 0.5, 
                      border: `2px solid ${alpha(activeBlue, 0.3)}`,
                      transition: '0.3s',
                      '&:hover': { borderColor: activeBlue }
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        bgcolor: activeBlue, 
                        width: 40, 
                        height: 40,
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: 'white'
                      }}
                    >
                      {(userData?.fullName || 'U')[0].toUpperCase()}
                    </Avatar>
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* User Dropdown Menu - Dark Mode Style */}
      <Menu 
        sx={{ 
          mt: '55px',
          '& .MuiPaper-root': {
            bgcolor: deepBlack,
            color: 'white',
            borderRadius: '16px',
            minWidth: 220,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
          }
        }} 
        anchorEl={anchorElUser} 
        open={Boolean(anchorElUser)} 
        onClose={onCloseUserMenu} 
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }} 
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ px: 2.5, py: 2 }}>
          <Typography variant="subtitle1" fontWeight={800} noWrap>
            {userData?.fullName}
          </Typography>
          <Typography variant="body2" color="rgba(255, 255, 255, 0.5)" noWrap>
            {userData?.email || 'Premium Member'}
          </Typography>
        </Box>
        <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)' }} />
        
        <MenuItem onClick={() => onNavigate('/bookingRecords')} sx={{ py: 1.5, gap: 2, '&:hover': { bgcolor: alpha(activeBlue, 0.1) } }}>
          <DashboardOutlinedIcon fontSize="small" sx={{ color: activeBlue }} />
          <Typography variant="body2" fontWeight={600}>My Bookings</Typography>
        </MenuItem>
        
        <MenuItem onClick={() => onNavigate('/profile')} sx={{ py: 1.5, gap: 2, '&:hover': { bgcolor: alpha(activeBlue, 0.1) } }}>
          <AccountCircleOutlinedIcon fontSize="small" sx={{ color: activeBlue }} />
          <Typography variant="body2" fontWeight={600}>Profile Settings</Typography>
        </MenuItem>
        
        <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)' }} />
        
        <MenuItem onClick={onLogout} sx={{ py: 1.5, gap: 2, '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}>
          <LogoutOutlinedIcon fontSize="small" sx={{ color: '#EF4444' }} />
          <Typography variant="body2" fontWeight={600} color="#EF4444">Logout</Typography>
        </MenuItem>
      </Menu>

      {/* Mobile Sidebar - Modern Dark Theme */}
      <Drawer 
        anchor="left" 
        open={mobileOpen} 
        onClose={onCloseMobile} 
        sx={{ '& .MuiDrawer-paper': { width: 300, bgcolor: deepBlack, color: 'white' } }}
      >
        <Box sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={900} mb={4} color={activeBlue}>
            {settings.companyName || 'Dream Drive'}
          </Typography>
          <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', mb: 2 }} />
          <List sx={{ gap: 1, display: 'flex', flexDirection: 'column' }}>
            {navItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton 
                  onClick={() => { onNavigate(item.path); onCloseMobile(); }}
                  sx={{ 
                    borderRadius: '12px',
                    bgcolor: pathname === item.path ? alpha(activeBlue, 0.1) : 'transparent',
                    color: pathname === item.path ? activeBlue : 'white'
                  }}
                >
                  <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 700 }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Mobile Bottom Navigation Bar */}
      <Box 
        sx={{ 
          display: { xs: 'flex', md: 'none' },
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 60,
          backgroundColor: deepBlack,
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          zIndex: 1200,
          justifyContent: 'space-around',
          alignItems: 'center',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.2)'
        }}
      >
        <IconButton 
          onClick={() => onNavigate('/')}
          sx={{ 
            color: pathname === '/' ? activeBlue : 'rgba(255, 255, 255, 0.6)',
            flexDirection: 'column',
            gap: 0.5,
            transition: 'all 0.3s ease',
            '&:hover': { color: activeBlue }
          }}
        >
          <HomeIcon sx={{ fontSize: 26 }} />
          <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.7rem' }}>
            Home
          </Typography>
        </IconButton>

        <IconButton 
          onClick={() => onNavigate('/cars')}
          sx={{ 
            color: pathname === '/cars' ? activeBlue : 'rgba(255, 255, 255, 0.6)',
            flexDirection: 'column',
            gap: 0.5,
            transition: 'all 0.3s ease',
            '&:hover': { color: activeBlue }
          }}
        >
          <DirectionsCarIcon sx={{ fontSize: 26 }} />
          <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.7rem' }}>
            Cars
          </Typography>
        </IconButton>

        <IconButton 
          onClick={() => onNavigate(isLoggedIn ? '/profile' : '/login')}
          sx={{ 
            color: pathname === '/profile' ? activeBlue : 'rgba(255, 255, 255, 0.6)',
            flexDirection: 'column',
            gap: 0.5,
            transition: 'all 0.3s ease',
            '&:hover': { color: activeBlue }
          }}
        >
          <AccountCircleOutlinedIcon sx={{ fontSize: 26 }} />
          <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.7rem' }}>
            Profile
          </Typography>
        </IconButton>
      </Box>

      {/* Spacer to prevent content from going under Navbar */}
      <Toolbar sx={{ height: { xs: 56, md: 90 } }} />
      
    </>
  );
};