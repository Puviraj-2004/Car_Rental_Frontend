'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  useMediaQuery,
  useTheme,
  Typography,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  DirectionsCar,
  People,
  Payment,
  EventNote,
  Settings,
  Logout,
  ExpandMore,
  ExpandLess,
  ChevronRight,
  Close,
} from '@mui/icons-material';

interface AdminLayoutProps {
  children: React.ReactNode;
}

// --- Types ---
interface NavItem {
  label: string;
  path?: string;
  icon: React.ElementType;
  submenu?: { label: string; path: string }[];
}

// --- Menu Configuration ---
const navItemsConfig: NavItem[] = [
  { label: 'Dashboard', icon: Dashboard, path: '/admin' },
  { label: 'Cars', icon: DirectionsCar, path: '/admin/cars' },
  { label: 'Users', icon: People, path: '/admin/users' },
  { label: 'Bookings', icon: EventNote, path: '/admin/bookings' },
  { label: 'Payments', icon: Payment, path: '/admin/payments' },
  { label: 'Settings', icon: Settings, path: '/admin/settings' },
];

const drawerWidth = 260;
const collapsedWidth = 80;

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<{ [key: string]: boolean }>({});
  const [userRole, setUserRole] = useState<string>('ADMIN');
  const [userName, setUserName] = useState<string>('Admin');

  const sidebarWidth = 260;
  const collapsedSidebarWidth = 80;
  const currentSidebarWidth = collapsed ? collapsedSidebarWidth : sidebarWidth;

  useEffect(() => {
    // Get user info from localStorage or auth context
    const token = localStorage.getItem('authToken');
    const userInfo = localStorage.getItem('userInfo');

    if (!token) {
      router.push('/login');
      return;
    }

    if (userInfo) {
      const user = JSON.parse(userInfo);
      setUserName(`${user.firstName} ${user.lastName}`);
      setUserRole(user.role);

      // Check if user is admin
      if (user.role !== 'ADMIN') {
        router.push('/');
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    router.push('/login');
  };

  const handleMobileMenuToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleCollapseToggle = () => {
    setCollapsed(!collapsed);
  };

  // Active Route Logic
  const isActive = (path?: string) => {
    if (!path) return false;
    if (path === '/admin') return pathname === '/admin';
    return pathname?.startsWith(path);
  };

  const handleNavClick = (item: NavItem) => {
    if (item.path) {
      router.push(item.path);
      if (isMobile) setMobileOpen(false);
    }
  };

  // --- Sidebar Content Component ---
  const SidebarContent = () => (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        color: '#1E293B',
      }}
    >
      {/* Header / Logo Area */}
      <Box
        sx={{
          h: 70,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          px: 2,
          py: 3,
          mb: 1,
        }}
      >
        {!collapsed ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: '#293D91', width: 35, height: 35, fontSize: '1rem' }}>
              {userName.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1 }}>
                RentCar
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Admin Panel
              </Typography>
            </Box>
          </Box>
        ) : (
          <Avatar sx={{ bgcolor: '#293D91', width: 40, height: 40 }}>R</Avatar>
        )}

        {!isMobile && !collapsed && (
          <IconButton onClick={handleCollapseToggle} size="small" sx={{ color: 'text.secondary' }}>
            <MenuIcon fontSize="small" />
          </IconButton>
        )}

        {!isMobile && collapsed && (
          <IconButton onClick={handleCollapseToggle} size="small" sx={{ color: 'text.secondary' }}>
            <ChevronRight fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Navigation List */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {navItemsConfig.map((item) => {
          const Icon = item.icon;
          const isSelected = isActive(item.path);

          return (
            <Box key={item.label}>
              <Tooltip title={collapsed ? item.label : ''} placement="right" arrow>
                <Box
                  component="button"
                  onClick={() => handleNavClick(item)}
                  sx={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    p: '10px 12px',
                    border: 'none',
                    bgcolor: isSelected ? 'rgba(41, 61, 145, 0.1)' : 'transparent',
                    color: isSelected ? '#293D91' : 'text.primary',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'rgba(41, 61, 145, 0.05)',
                      color: '#293D91',
                      '& .icon': { color: '#293D91' },
                    },
                  }}
                >
                  <Icon
                    className="icon"
                    sx={{
                      fontSize: 22,
                      color: isSelected ? '#293D91' : 'text.secondary',
                      minWidth: 22,
                    }}
                  />

                  {!collapsed && (
                    <Typography sx={{ ml: 2, fontSize: '0.9rem', fontWeight: isSelected ? 600 : 500, flex: 1, textAlign: 'left' }}>
                      {item.label}
                    </Typography>
                  )}
                </Box>
              </Tooltip>
            </Box>
          );
        })}
      </Box>

      {/* Footer / Logout */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <Tooltip title={collapsed ? 'Logout' : ''} placement="right">
          <Box
            component="button"
            onClick={handleLogout}
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              p: 1.5,
              border: 'none',
              bgcolor: 'rgba(239, 68, 68, 0.05)',
              color: '#EF4444',
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: 'rgba(239, 68, 68, 0.1)',
              },
            }}
          >
            <Logout sx={{ fontSize: 20 }} />
            {!collapsed && (
              <Typography sx={{ ml: 2, fontSize: '0.9rem', fontWeight: 600 }}>
                Logout
              </Typography>
            )}
          </Box>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      <Box
        component="nav"
        sx={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          width: collapsed ? collapsedWidth : drawerWidth,
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          transition: 'width 0.3s ease',
          zIndex: 1200,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <SidebarContent />
      </Box>

      {/* Mobile Drawer (Overlay) */}
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 1300,
          display: { xs: mobileOpen ? 'block' : 'none', md: 'none' },
        }}
      >
        {/* Backdrop - Closes on click */}
        <Box onClick={() => setMobileOpen(false)} sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.4)' }} />

        {/* Drawer Content */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: 280,
            bgcolor: 'white',
            boxShadow: 6,
            p: 1,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
            <IconButton onClick={() => setMobileOpen(false)}>
              <Close />
            </IconButton>
          </Box>
          <SidebarContent />
        </Box>
      </Box>

      {/* Main Content - Adjusted for sidebar width */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          marginLeft: { xs: 0, md: `${currentSidebarWidth}px` },
          transition: 'margin-left 0.3s ease',
        }}
      >
        {/* Mobile Header */}
        {isMobile && (
          <AppBar
            position="fixed"
            sx={{
              backgroundColor: '#0F172A',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              zIndex: 1100,
              width: '100%',
            }}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleMobileMenuToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Box sx={{ fontWeight: 700, fontSize: '1.25rem' }}>Admin Panel</Box>
            </Toolbar>
          </AppBar>
        )}

        {/* Content */}
        <Box
          sx={{
            flex: 1,
            p: { xs: isMobile ? '80px 16px 16px 16px' : '16px', sm: 3 },
            backgroundColor: '#F8FAFC',
            overflowY: 'auto',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
