'use client';

import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import MenuIcon from '@mui/icons-material/Menu';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useRouter, usePathname } from 'next/navigation';
import { getTranslation } from '@/lib/i18n';

interface NavbarProps {
  language: string;
  onLanguageChange: (lang: string) => void;
}

export default function Navbar({ language, onLanguageChange }: NavbarProps) {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleNavClick = (path: string) => {
    router.push(path);
    handleCloseNavMenu();
  };

  const navItems = [
    { label: getTranslation(language, 'nav.home'), path: '/' },
    { label: getTranslation(language, 'nav.about'), path: '/about' },
    { label: getTranslation(language, 'nav.cars'), path: '/cars' },
    { label: getTranslation(language, 'nav.contact'), path: '/contact' },
  ];

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: '#0F172A',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        zIndex: 1100,
      }}
    >
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
              sx={{
                mr: 2,
                fontFamily: 'Poppins, Inter, sans-serif',
                fontWeight: 700,
                letterSpacing: '.1rem',
                color: 'white',
                textDecoration: 'none',
                fontSize: '1.25rem',
              }}
            >
              RentCar
            </Typography>
          </Box>

          {/* Mobile Menu Button */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="navigation menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {navItems.map((item) => (
                <MenuItem key={item.label} onClick={() => handleNavClick(item.path)}>
                  <Typography textAlign="center">{item.label}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Desktop Navigation */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
            {navItems.map((item) => (
              <Button
                key={item.label}
                onClick={() => handleNavClick(item.path)}
                sx={{
                  my: 2,
                  mx: 1,
                  color: 'white',
                  display: 'block',
                  fontFamily: 'Inter, Poppins, sans-serif',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  position: 'relative',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 8,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '24px',
                      height: '2px',
                      backgroundColor: '#293D91',
                      borderRadius: '1px',
                    },
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 8,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: pathname === item.path ? '24px' : '0px',
                    height: '2px',
                    backgroundColor: '#293D91',
                    borderRadius: '1px',
                    transition: 'width 0.3s ease',
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* Right Side Actions */}
          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', gap: 2 }}>

            {/* Language Switcher */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
              <Button
                variant={language === 'en' ? 'outlined' : 'text'}
                size="small"
                onClick={() => onLanguageChange('en')}
                sx={{
                  color: 'white',
                  borderColor: language === 'en' ? '#293D91' : 'rgba(255, 255, 255, 0.3)',
                  minWidth: '40px',
                  fontSize: '0.8rem',
                  '&:hover': {
                    borderColor: '#293D91',
                    backgroundColor: 'rgba(41, 61, 145, 0.1)',
                  },
                }}
              >
                EN
              </Button>
              <Button
                variant={language === 'fr' ? 'outlined' : 'text'}
                size="small"
                onClick={() => onLanguageChange('fr')}
                sx={{
                  color: 'white',
                  borderColor: language === 'fr' ? '#293D91' : 'rgba(255, 255, 255, 0.3)',
                  minWidth: '40px',
                  fontSize: '0.8rem',
                  '&:hover': {
                    borderColor: '#293D91',
                    backgroundColor: 'rgba(41, 61, 145, 0.1)',
                  },
                }}
              >
                FR
              </Button>
            </Box>

            {/* Login Button */}
            <Button
                variant="outlined"
                onClick={() => router.push('/auth/login')}
                sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.4)',
                fontFamily: 'Inter, Poppins, sans-serif',
                fontWeight: 500,
                textTransform: 'none',
                borderRadius: '8px',
                px: 3,
                '&:hover': {
                    borderColor: '#293D91',
                    backgroundColor: 'rgba(41,61,145,0.1)',
                },
                }}
            >
                {getTranslation(language, 'login')}
            </Button>

            {/* Sign Up Button */}
            <Button
                variant="contained"
                onClick={() => router.push('/signup')}
                sx={{
                backgroundColor: '#293D91',
                color: 'white',
                fontFamily: 'Inter, Poppins, sans-serif',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '8px',
                px: 3,
                '&:hover': {
                    backgroundColor: '#1E293B',
                    boxShadow: '0 4px 12px rgba(41, 61, 145, 0.4)',
                },
                }}
            >
                {getTranslation(language, 'signup')}
            </Button>
          </Box>
        </Toolbar>
      </Box>
    </AppBar>
  );
}