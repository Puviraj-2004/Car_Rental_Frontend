'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getSession, signOut } from 'next-auth/react';
import {
  Box, AppBar, Toolbar, IconButton, useMediaQuery, useTheme,
  Typography, Avatar, Tooltip, Menu, MenuItem, Divider, Stack, Badge, Button
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard, DirectionsCar, People, Payment,
  EventNote, Settings, Logout, Language as LanguageIcon,
  NotificationsNone as NotificationsIcon,
  Category as InventoryIcon // 🚀 புதிய ஐகான்
} from '@mui/icons-material';

// --- Types ---
interface NavItem {
  label: string;
  path?: string;
  icon: React.ElementType;
}

// --- Menu Configuration ---
const navItemsConfig: NavItem[] = [
  { label: 'Dashboard', icon: Dashboard, path: '/admin/dashboard' },
  { label: 'Cars', icon: DirectionsCar, path: '/admin/cars' },
  { label: 'Inventory', icon: InventoryIcon, path: '/admin/inventory' }, // 🚀 இதுதான் புதிய மெனு
  { label: 'Bookings', icon: EventNote, path: '/admin/bookings' },
  { label: 'Users', icon: People, path: '/admin/users' },
  { label: 'Payments', icon: Payment, path: '/admin/payments' },
  { label: 'Settings', icon: Settings, path: '/admin/settings' },
];

const drawerWidth = 260;
const collapsedWidth = 80;

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [userName, setUserName] = useState<string>('Admin');
  
  // Language Menu State
  const [langAnchor, setLangAnchor] = useState<null | HTMLElement>(null);
  const [currentLang, setCurrentLang] = useState('EN');

  const currentSidebarWidth = isMobile ? 0 : (collapsed ? collapsedWidth : drawerWidth);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await getSession();
        if (!session) {
          router.push('/auth/login');
          return;
        }
        
        const userRole = (session.user as any)?.role;
        if (userRole !== 'ADMIN') {
          router.push('/');
          return;
        }
        
        setUserName(session.user?.name || 'Admin');
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/auth/login');
      }
    };
    
    checkAuth();
  }, [router, pathname]);

  const handleLogout = async () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    await signOut({ callbackUrl: '/auth/login' });
  };

  const handleLangChange = (lang: string) => {
    setCurrentLang(lang);
    setLangAnchor(null);
  };

  const SidebarContent = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#ffffff' }}>
      <Box sx={{ 
        p: 3, display: 'flex', alignItems: 'center', 
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderBottom: '1px solid #f1f5f9', mb: 2
      }}>
        <Avatar sx={{ bgcolor: '#293D91', width: 38, height: 38, fontWeight: 800 }}>R</Avatar>
        {!collapsed && (
          <Typography variant="h6" sx={{ ml: 2, fontWeight: 800, color: '#1E293B', letterSpacing: '-0.5px' }}>
            RentCar <span style={{ color: '#293D91', fontSize: '0.7rem' }}>ADMIN</span>
          </Typography>
        )}
      </Box>

      <Box sx={{ flex: 1, px: 2, display: 'flex', flexDirection: 'column', gap: 0.8 }}>
        {navItemsConfig.map((item) => {
          const Icon = item.icon;
          const isSelected = pathname === item.path || pathname?.startsWith(item.path + '/');
          return (
            <Tooltip key={item.label} title={collapsed ? item.label : ''} placement="right">
              <Box
                component="button"
                onClick={() => { router.push(item.path!); if (isMobile) setMobileOpen(false); }}
                sx={{
                  width: '100%', display: 'flex', alignItems: 'center', p: '12px', border: 'none',
                  borderRadius: '12px', cursor: 'pointer', transition: '0.3s',
                  bgcolor: isSelected ? '#293D91' : 'transparent',
                  color: isSelected ? '#fff' : '#64748B',
                  '&:hover': { bgcolor: isSelected ? '#293D91' : '#f8fafc', color: isSelected ? '#fff' : '#293D91' }
                }}
              >
                <Icon sx={{ fontSize: 22 }} />
                {!collapsed && (
                  <Typography sx={{ ml: 2, fontSize: '0.95rem', fontWeight: isSelected ? 600 : 500 }}>
                    {item.label}
                  </Typography>
                )}
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      <Box sx={{ p: 2, borderTop: '1px solid #f1f5f9' }}>
        <Box
          component="button" onClick={handleLogout}
          sx={{
            width: '100%', display: 'flex', alignItems: 'center', p: 1.5, border: 'none',
            borderRadius: '10px', bgcolor: '#FEF2F2', color: '#EF4444', cursor: 'pointer',
            justifyContent: collapsed ? 'center' : 'flex-start', transition: '0.3s',
            '&:hover': { bgcolor: '#FEE2E2' }
          }}
        >
          <Logout sx={{ fontSize: 20 }} />
          {!collapsed && <Typography sx={{ ml: 2, fontWeight: 700, fontSize: '0.9rem' }}>Logout</Typography>}
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      <Box
        component="nav"
        sx={{
          position: 'fixed', left: 0, top: 0, bottom: 0,
          width: isMobile ? (mobileOpen ? 280 : 0) : (collapsed ? collapsedWidth : drawerWidth),
          transition: '0.3s ease', zIndex: 1200, bgcolor: '#fff',
          boxShadow: '4px 0 24px rgba(0,0,0,0.02)', borderRight: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}
      >
        <SidebarContent />
      </Box>

      <Box sx={{ 
        flex: 1, display: 'flex', flexDirection: 'column',
        marginLeft: { md: `${currentSidebarWidth}px` }, transition: '0.3s ease'
      }}>
        
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#fff', borderBottom: '1px solid #e2e8f0', color: '#1E293B' }}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconButton onClick={isMobile ? () => setMobileOpen(true) : () => setCollapsed(!collapsed)} sx={{ color: '#64748B' }}>
                <MenuIcon />
              </IconButton>
              {!isMobile && <Typography variant="body2" sx={{ fontWeight: 500, color: '#64748B' }}>Welcome back, {userName} 👋</Typography>}
            </Stack>

            <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 2 }}>
              <Box>
                <Button 
                  onClick={(e: React.MouseEvent<HTMLElement>) => setLangAnchor(e.currentTarget)}
                  startIcon={<LanguageIcon />}
                  sx={{ 
                    color: '#64748B', 
                    fontWeight: 600, 
                    textTransform: 'none',
                    borderRadius: '8px',
                    '&:hover': { bgcolor: '#f1f5f9' }
                  }}
                >
                  {currentLang}
                </Button>
                <Menu anchorEl={langAnchor} open={Boolean(langAnchor)} onClose={() => setLangAnchor(null)}>
                  <MenuItem onClick={() => handleLangChange('EN')}>🇺🇸 English (EN)</MenuItem>
                  <MenuItem onClick={() => handleLangChange('FR')}>🇫🇷 Français (FR)</MenuItem>
                </Menu>
              </Box>

              <IconButton><Badge variant="dot" color="error"><NotificationsIcon sx={{ color: '#64748B' }} /></Badge></IconButton>
              
              <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 24, alignSelf: 'center' }} />
              
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#293D91', fontSize: '0.8rem' }}>{userName.charAt(0)}</Avatar>
                {!isMobile && <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{userName}</Typography>}
              </Stack>
            </Stack>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 4 } }}>
          {children}
        </Box>
      </Box>

      {mobileOpen && isMobile && (
        <Box onClick={() => setMobileOpen(false)} sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(15, 23, 42, 0.5)', zIndex: 1100, backdropFilter: 'blur(4px)' }} />
      )}
    </Box>
  );
}