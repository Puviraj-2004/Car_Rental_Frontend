'use client';

import React, { useState, useEffect } from 'react';
import { 
  AppBar, Toolbar, Typography, Button, Box, IconButton, 
  Drawer, List, ListItem, ListItemButton, ListItemText, 
  Avatar, Tooltip, Menu, MenuItem, Divider, Container 
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import { useRouter, usePathname } from 'next/navigation';
import { deleteCookie } from 'cookies-next';
import Link from 'next/link';
import { useQuery, useApolloClient } from '@apollo/client';
import { GET_PLATFORM_SETTINGS_QUERY, GET_ME_QUERY } from '@/lib/graphql/queries';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const client = useApolloClient();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated';

  // 1. பிளாட்பார்ம் விவரங்கள் (Logo & Name) - அட்மின் மாற்றினால் இங்கும் மாறும்
  const { data: platformData } = useQuery(GET_PLATFORM_SETTINGS_QUERY);
  const settings = platformData?.platformSettings || {};

  // 2. பயனர் விவரங்கள் (லாகின் செய்திருந்தால் மட்டும் ரன் ஆகும்)
  const { data: userData } = useQuery(GET_ME_QUERY, {
    skip: !isLoggedIn,
  });

  // லாகின் நிலையை உறுதி செய்ய (Token செக் செய்தல்)
  // useEffect(() => {
  //   const token = getCookie('token');
  //   setIsLoggedIn(!!token);
  // }, [pathname]); // ஒவ்வொரு முறை பக்கம் மாறும்போது செக் செய்யும்
  // Note: We no longer need useEffect for checking login status as we use NextAuth's useSession hook

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = async () => {
    deleteCookie('token'); // Fallback: delete old cookie if exists
    await client.clearStore(); // பழைய டேட்டாவை கேச்சிலிருந்து அழிக்க
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
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            
            {/* --- 1. LOGO & NAME --- */}
            <Box 
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} 
              onClick={() => router.push('/')}
            >
               {settings.logoUrl ? (
                 <Box 
                   component="img" 
                   src={settings.logoUrl} 
                   alt="Logo" 
                   sx={{ height: 40, mr: 1, display: { xs: 'none', md: 'block' } }} 
                 />
               ) : (
                 <DriveEtaIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, fontSize: 30, color: '#60A5FA' }} />
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

            {/* --- 2. MOBILE MENU ICON (Hamburger) --- */}
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton color="inherit" onClick={() => setMobileOpen(true)}>
                <MenuIcon />
              </IconButton>
            </Box>

            {/* --- 3. DESKTOP LINKS --- */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center', gap: 2 }}>
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

            {/* --- 4. USER SECTION (LOGIN vs PROFILE) --- */}
            <Box sx={{ flexGrow: 0 }}>
              {!isLoggedIn ? (
                // 🛑 லாகின் செய்யாத போது 'Login' பட்டன்
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
                // ✅ லாகின் செய்த பிறகு 'Profile Avatar'
                <>
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
                  <Menu
                    sx={{ mt: '45px' }}
                    anchorEl={anchorElUser}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    keepMounted
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    {/* User Info Header in Menu */}
                    <Box sx={{ px: 2, py: 1.5, minWidth: '180px' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {userData?.me?.firstName} {userData?.me?.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {userData?.me?.email}
                      </Typography>
                    </Box>
                    
                    <Divider />
                    
                    <MenuItem onClick={() => { router.push('/bookings'); handleCloseUserMenu(); }}>
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
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* --- 5. MOBILE DRAWER (Sidebar) --- */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: 260, bgcolor: '#0F172A', color: 'white' } }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton onClick={() => setMobileOpen(false)} color="inherit"><CloseIcon /></IconButton>
          </Box>
          <Typography variant="h6" sx={{ textAlign: 'center', my: 2, fontWeight: 'bold' }}>
            {settings.companyName || 'RENTCAR'}
          </Typography>
          <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 2 }} />
          <List>
            {navItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton 
                  component={Link} 
                  href={item.path} 
                  onClick={() => setMobileOpen(false)}
                  sx={{ bgcolor: pathname === item.path ? 'rgba(59, 130, 246, 0.2)' : 'transparent' }}
                >
                  <ListItemText primary={item.label} />
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