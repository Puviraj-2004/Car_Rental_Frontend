'use client';

import React, { useState } from 'react';
import { 
  Box, Drawer, List, ListItem, ListItemButton, 
  ListItemIcon, ListItemText, IconButton, Tooltip, Divider, alpha
} from '@mui/material';
import { 
  Dashboard, DirectionsCar, People, BookOnline, 
  BrandingWatermark, Settings, Logout, ChevronLeft, Menu as MenuIcon 
} from '@mui/icons-material';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery, useApolloClient } from '@apollo/client';
import { deleteCookie } from 'cookies-next';
import { signOut } from 'next-auth/react';
import { GET_PLATFORM_SETTINGS_QUERY } from '@/lib/graphql/queries'; // உன்னுடைய குவெரி
import { signOut } from 'next-auth/react';

const drawerWidth = 260;
const collapsedWidth = 80;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
  { text: 'Cars Management', icon: <DirectionsCar />, path: '/admin/cars' },
  { text: 'Bookings', icon: <BookOnline />, path: '/admin/bookings' },
  { text: 'Inventory', icon: <BrandingWatermark />, path: '/admin/inventory' },
  { text: 'Users', icon: <People />, path: '/admin/users' },
];

export default function AdminSidebar() {
  const [open, setOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  // 🌍 லோகோ மற்றும் கம்பெனி பெயரை டைனமிக் ஆக எடுக்கிறோம்
  const { data } = useQuery(GET_PLATFORM_SETTINGS_QUERY);
  const settings = data?.platformSettings;
  const client = useApolloClient();

  const handleToggle = () => setOpen(!open);

  const handleLogout = async () => {
    try {
      // Remove cookie fallback token (if any), clear local storage and Apollo cache, then sign out NextAuth
      deleteCookie('token');
      localStorage.clear();
      await client.clearStore();
      await signOut({ callbackUrl: '/' });
    } catch (err) {
      console.error('Logout failed:', err);
      // Ensure navigation happens even if signOut fails
      router.push('/');
    }
  };

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? drawerWidth : collapsedWidth,
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : collapsedWidth,
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxSizing: 'border-box',
          overflowX: 'hidden',
          bgcolor: '#FFFFFF',
          borderRight: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column'
        },
      }}
    >
      {/* 🚀 Dynamic Logo Section */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: open ? 'space-between' : 'center', minHeight: 80 }}>
        {open && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" style={{ width: 32, height: 32, borderRadius: 4 }} />
            ) : (
              <DirectionsCar sx={{ color: '#64748B' }} />
            )}
            <Box>
              <Box component="span" sx={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B' }}>
                {settings?.companyName?.split(' ')[0] || 'DRIVE'}
              </Box>
              <Box component="span" sx={{ fontSize: '1.1rem', fontWeight: 500, color: '#64748B' }}>
                {settings?.companyName?.split(' ')[1] || 'RENTAL'}
              </Box>
            </Box>
          </Box>
        )}
        <IconButton onClick={handleToggle} sx={{ color: '#64748B' }}>
          {open ? <ChevronLeft /> : <MenuIcon />}
        </IconButton>
      </Box>

      <Divider sx={{ opacity: 0.5 }} />

      {/* 📋 Navigation Menu */}
      <List sx={{ px: 1.5, mt: 2, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Tooltip title={!open ? item.text : ""} placement="right" key={item.text}>
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => router.push(item.path)}
                  sx={{
                    borderRadius: 2.5,
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    bgcolor: isActive ? alpha('#F1F5F9', 1) : 'transparent',
                    color: isActive ? '#0F172A' : '#64748B',
                    '&:hover': { bgcolor: '#F8FAFC' },
                  }}
                >
                  <ListItemIcon sx={{ 
                    minWidth: 0, mr: open ? 2 : 'auto', justifyContent: 'center',
                    color: isActive ? '#334155' : '#94A3B8'
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  {open && <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: isActive ? 700 : 500 }} />}
                </ListItemButton>
              </ListItem>
            </Tooltip>
          );
        })}
      </List>

      {/* ⚙️ Footer Actions */}
      <Box sx={{ p: 1.5 }}>
        <Divider sx={{ mb: 1.5, opacity: 0.5 }} />
        <Tooltip title={!open ? "Settings" : ""} placement="right">
          <ListItemButton onClick={() => router.push('/admin/settings')} sx={{ borderRadius: 2.5, color: '#64748B', mb: 0.5, justifyContent: open ? 'initial' : 'center' }}>
            <ListItemIcon sx={{ minWidth: 0, mr: open ? 2 : 'auto', color: 'inherit' }}><Settings /></ListItemIcon>
            {open && <ListItemText primary="Settings" />}
          </ListItemButton>
        </Tooltip>
        <Tooltip title={!open ? "Logout" : ""} placement="right">
          <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2.5, color: '#EF4444', justifyContent: open ? 'initial' : 'center', '&:hover': { bgcolor: alpha('#EF4444', 0.05) } }}>
            <ListItemIcon sx={{ minWidth: 0, mr: open ? 2 : 'auto', color: 'inherit' }}><Logout /></ListItemIcon>
            {open && <ListItemText primary="Logout" />}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Drawer>
  );
}