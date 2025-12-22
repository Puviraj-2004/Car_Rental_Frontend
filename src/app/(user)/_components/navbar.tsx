'use client';

import React, { useState } from 'react';
import { 
  AppBar, Toolbar, Typography, Button, Box, IconButton, 
  Menu, MenuItem, Avatar, Divider, Tooltip 
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import { useRouter, usePathname } from 'next/navigation';
import { getTranslation } from '@/lib/i18n';
import { useSession, signOut } from 'next-auth/react'; // 🚀 Next-Auth session இம்போர்ட்

interface NavbarProps {
  language: string;
  onLanguageChange: (lang: string) => void;
}

export default function Navbar({ language, onLanguageChange }: NavbarProps) {
  const { data: session, status } = useSession(); // 🚀 செஷன் தகவல்கள்
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorElNav(event.currentTarget);
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorElUser(event.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleNavClick = (path: string) => {
    router.push(path);
    handleCloseNavMenu();
  };

  const navItems = [
    { label: getTranslation(language, 'nav.home'), path: '/' },
    { label: getTranslation(language, 'nav.cars'), path: '/cars' },
    { label: getTranslation(language, 'nav.about'), path: '/about' },
    { label: getTranslation(language, 'nav.contact'), path: '/contact' },
  ];

  return (
    <AppBar position="fixed" sx={{ backgroundColor: '#0F172A', zIndex: 1100 }}>
      <Box sx={{ width: '100%', maxWidth: 'xl', mx: 'auto', px: { xs: 2, sm: 3, md: 4 } }}>
        <Toolbar disableGutters>
          {/* Logo Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
            <DriveEtaIcon sx={{ color: 'white', mr: 1, fontSize: 32 }} />
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/"
              sx={{ fontFamily: 'Poppins', fontWeight: 700, color: 'white', textDecoration: 'none' }}
            >
              RentCar
            </Typography>
          </Box>

          {/* --- MOBILE VIEW TOGGLE --- */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton size="large" onClick={handleOpenNavMenu} color="inherit">
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorElNav}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {navItems.map((item) => (
                <MenuItem key={item.label} onClick={() => handleNavClick(item.path)}>
                  <Typography textAlign="center">{item.label}</Typography>
                </MenuItem>
              ))}
              <Divider />
              {/* மொபைல் மெனுவில் லாகின்/பயனர் ஆப்ஷன்கள் */}
              {status !== 'authenticated' ? (
                <MenuItem onClick={() => handleNavClick('/auth/login')}>
                   <Typography color="primary">{getTranslation(language, 'login')}</Typography>
                </MenuItem>
              ) : (
                <Box>
                  <MenuItem onClick={() => handleNavClick('/profile')}>Profile</MenuItem>
                  <MenuItem onClick={() => signOut()}>Logout</MenuItem>
                </Box>
              )}
            </Menu>
          </Box>

          {/* --- DESKTOP NAVIGATION --- */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
            {navItems.map((item) => (
              <Button
                key={item.label}
                onClick={() => handleNavClick(item.path)}
                sx={{
                  my: 2, mx: 1, color: 'white', textTransform: 'none',
                  borderBottom: pathname === item.path ? '2px solid #293D91' : 'none'
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* --- RIGHT SIDE ACTIONS --- */}
          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
            
            {/* Language Switcher (Desktop Only) */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
              <Button size="small" sx={{ color: 'white' }} onClick={() => onLanguageChange('en')}>EN</Button>
              <Button size="small" sx={{ color: 'white' }} onClick={() => onLanguageChange('fr')}>FR</Button>
            </Box>

            {/* 🚀 லாகின் செக் லாஜிக் */}
            {status !== 'authenticated' ? (
              // லாகின் செய்யாத போது மட்டும் லாகின் பட்டன்
              <Button
                variant="contained"
                onClick={() => router.push('/auth/login')}
                sx={{ backgroundColor: '#293D91', color: 'white', borderRadius: '8px' }}
              >
                {getTranslation(language, 'login')}
              </Button>
            ) : (
              // லாகின் செய்த பிறகு ப்ரொபைல் ஐகான் மட்டும்
              <Box>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt={session?.user?.name || 'User'} src={session?.user?.image || ''} sx={{ bgcolor: '#293D91' }} />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  anchorEl={anchorElUser}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem onClick={() => handleNavClick('/profile')}>Profile</MenuItem>
                  <MenuItem onClick={() => handleNavClick('/bookings')}>My Bookings</MenuItem>
                  <Divider />
                  <MenuItem onClick={() => signOut()}>Logout</MenuItem>
                </Menu>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Box>
    </AppBar>
  );
}