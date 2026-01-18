'use client';

import React from 'react';
import { 
  Box, Drawer, List, ListItem, ListItemButton, 
  ListItemIcon, ListItemText, IconButton, Tooltip, Divider, alpha 
} from '@mui/material';
import { 
  Settings as SettingsIcon, Logout as LogoutIcon, 
  ChevronLeft as ChevronLeftIcon, Menu as MenuIcon,
  DirectionsCar as DefaultLogoIcon
} from '@mui/icons-material';

const drawerWidth = 260;
const collapsedWidth = 80;

interface AdminSidebarViewProps {
  open: boolean;
  pathname: string;
  settings: any;
  menuItems: any[];
  onToggle: () => void;
  onLogout: () => void;
  onNavigate: (path: string) => void;
}

export const AdminSidebarView = ({
  open,
  pathname,
  settings,
  menuItems,
  onToggle,
  onLogout,
  onNavigate
}: AdminSidebarViewProps) => {
  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? drawerWidth : collapsedWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : collapsedWidth,
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowX: 'hidden',
          bgcolor: '#FFFFFF',
          borderRight: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column'
        },
      }}
    >
      {/* Header Area */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: open ? 'space-between' : 'center', minHeight: 80 }}>
        {open && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" style={{ width: 32, height: 32, borderRadius: 4 }} />
            ) : (
              <DefaultLogoIcon sx={{ color: '#64748B' }} />
            )}
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.5 }}>
              <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                {settings?.companyName?.split(' ')[0] || 'DRIVE'}
              </Typography>
              <Typography sx={{ fontSize: '1.1rem', fontWeight: 500, color: '#64748B' }}>
                {settings?.companyName?.split(' ')[1] || 'RENTAL'}
              </Typography>
            </Box>
          </Box>
        )}
        <IconButton onClick={onToggle} sx={{ color: '#64748B' }}>
          {open ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Box>

      <Divider sx={{ opacity: 0.5 }} />

      {/* Main Menu */}
      <List sx={{ px: 1.5, mt: 2, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Tooltip title={!open ? item.text : ""} placement="right" key={item.text}>
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => onNavigate(item.path)}
                  sx={{
                    borderRadius: 2.5,
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    bgcolor: isActive ? alpha('#0F172A', 0.04) : 'transparent',
                    color: isActive ? '#0F172A' : '#64748B',
                    '&:hover': { bgcolor: '#F8FAFC' },
                  }}
                >
                  <ListItemIcon sx={{ 
                    minWidth: 0, mr: open ? 2 : 'auto', justifyContent: 'center',
                    color: isActive ? '#0F172A' : '#94A3B8'
                  }}>
                    <Icon />
                  </ListItemIcon>
                  {open && (
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: isActive ? 700 : 500 }} 
                    />
                  )}
                </ListItemButton>
              </ListItem>
            </Tooltip>
          );
        })}
      </List>

      {/* Footer Actions */}
      <Box sx={{ p: 1.5 }}>
        <Divider sx={{ mb: 1.5, opacity: 0.5 }} />
        <Tooltip title={!open ? "Settings" : ""} placement="right">
          <ListItemButton 
            onClick={() => onNavigate('/admin/settings')} 
            sx={{ borderRadius: 2.5, color: '#64748B', mb: 0.5, justifyContent: open ? 'initial' : 'center' }}
          >
            <ListItemIcon sx={{ minWidth: 0, mr: open ? 2 : 'auto', color: 'inherit' }}>
              <SettingsIcon />
            </ListItemIcon>
            {open && <ListItemText primary="Settings" />}
          </ListItemButton>
        </Tooltip>
        <Tooltip title={!open ? "Logout" : ""} placement="right">
          <ListItemButton 
            onClick={onLogout} 
            sx={{ 
              borderRadius: 2.5, color: '#EF4444', justifyContent: open ? 'initial' : 'center', 
              '&:hover': { bgcolor: alpha('#EF4444', 0.05) } 
            }}
          >
            <ListItemIcon sx={{ minWidth: 0, mr: open ? 2 : 'auto', color: 'inherit' }}>
              <LogoutIcon />
            </ListItemIcon>
            {open && <ListItemText primary="Logout" />}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Drawer>
  );
};

// Internal small Typography component to keep standard tags
const Typography = ({ children, sx }: { children: React.ReactNode, sx?: any }) => (
  <Box component="span" sx={{ ...sx }}>{children}</Box>
);