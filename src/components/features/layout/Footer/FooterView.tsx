'use client';

import React from 'react';
import { 
  Box, Container, Grid, Typography, Link as MuiLink, 
  IconButton, Divider, Stack, Skeleton 
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Link from 'next/link';

interface FooterViewProps {
  settings: any;
  loading: boolean;
}

export const FooterView = ({ settings, loading }: FooterViewProps) => {
  if (loading) {
    return (
      <Box sx={{ bgcolor: '#0F172A', py: 8 }}>
        <Container maxWidth="xl">
          <Grid container spacing={4}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Skeleton variant="text" width="60%" height={40} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                <Skeleton variant="text" width="90%" sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                <Skeleton variant="text" width="80%" sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  return (
    <Box component="footer" sx={{ bgcolor: '#0F172A', color: 'white', pt: { xs: 6, md: 10 }, pb: 4, mt: 'auto' }}>
      <Container maxWidth="xl">
        <Grid container spacing={5}>
          
          {/* 1. BRAND & SOCIALS */}
          <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Stack 
              direction="row" 
              spacing={1} 
              alignItems="center" 
              justifyContent={{ xs: 'center', md: 'flex-start' }}
              sx={{ mb: 3 }}
            >
              {settings.logoUrl ? (
                <Box 
                  component="img" 
                  src={settings.logoUrl} 
                  alt="Logo" 
                  sx={{ height: 40, filter: 'brightness(0) invert(1)' }} 
                />
              ) : (
                <DriveEtaIcon sx={{ fontSize: 32, color: '#60A5FA' }} />
              )}
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
                {settings.companyName || 'Dream Drive'}
              </Typography>
            </Stack>
            
            <Typography variant="body2" sx={{ opacity: 0.7, lineHeight: 1.8, mb: 4, maxWidth: { md: '300px' }, mx: { xs: 'auto', md: 0 } }}>
              {settings.description || 'Premium car rental service designed for your comfort and safety. Experience the best fleet in France.'}
            </Typography>
            
            <Stack direction="row" spacing={1} justifyContent={{ xs: 'center', md: 'flex-start' }}>
              {[
                { icon: <FacebookIcon />, link: settings.facebookUrl },
                { icon: <TwitterIcon />, link: settings.twitterUrl },
                { icon: <InstagramIcon />, link: settings.instagramUrl },
                { icon: <LinkedInIcon />, link: settings.linkedinUrl },
              ].map((social, idx) => social.link && (
                <IconButton 
                  key={idx} 
                  size="small" 
                  href={social.link} 
                  target="_blank" 
                  sx={{ 
                    color: 'white', 
                    bgcolor: 'rgba(255,255,255,0.05)',
                    '&:hover': { bgcolor: '#60A5FA', color: '#0F172A' },
                    transition: '0.3s'
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Stack>
          </Grid>

          {/* 2. QUICK LINKS */}
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>Company</Typography>
            <Stack spacing={1.5}>
              <MuiLink component={Link} href="/about" underline="none" color="inherit" sx={{ opacity: 0.7, '&:hover': { opacity: 1, color: '#60A5FA' } }}>About Us</MuiLink>
              <MuiLink component={Link} href="/cars" underline="none" color="inherit" sx={{ opacity: 0.7, '&:hover': { opacity: 1, color: '#60A5FA' } }}>Our Fleet</MuiLink>
              <MuiLink component={Link} href="/contact" underline="none" color="inherit" sx={{ opacity: 0.7, '&:hover': { opacity: 1, color: '#60A5FA' } }}>Contact</MuiLink>
            </Stack>
          </Grid>

          {/* 3. SUPPORT */}
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>Support</Typography>
            <Stack spacing={1.5}>
              <MuiLink href="#" underline="none" color="inherit" sx={{ opacity: 0.7, '&:hover': { opacity: 1, color: '#60A5FA' } }}>Help Center</MuiLink>
              <MuiLink component={Link} href="/privacy-policy" underline="none" color="inherit" sx={{ opacity: 0.7, '&:hover': { opacity: 1, color: '#60A5FA' } }}>Privacy Policy</MuiLink>
              <MuiLink component={Link} href="/terms" underline="none" color="inherit" sx={{ opacity: 0.7, '&:hover': { opacity: 1, color: '#60A5FA' } }}>Terms of Service</MuiLink>
            </Stack>
          </Grid>

          {/* 4. CONTACT INFO */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, textAlign: { xs: 'center', md: 'left' } }}>Contact Us</Typography>
            <Stack spacing={2.5}>
              {settings.supportPhone && (
                <Stack direction="row" spacing={2} alignItems="center" justifyContent={{ xs: 'center', md: 'flex-start' }}>
                  <PhoneIcon sx={{ fontSize: 20, color: '#60A5FA' }} />
                  <Typography variant="body2">{settings.supportPhone}</Typography>
                </Stack>
              )}
              {settings.supportEmail && (
                <Stack direction="row" spacing={2} alignItems="center" justifyContent={{ xs: 'center', md: 'flex-start' }}>
                  <EmailIcon sx={{ fontSize: 20, color: '#60A5FA' }} />
                  <Typography variant="body2">{settings.supportEmail}</Typography>
                </Stack>
              )}
              {settings.address && (
                <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent={{ xs: 'center', md: 'flex-start' }}>
                  <LocationOnIcon sx={{ fontSize: 20, color: '#60A5FA' }} />
                  <Typography variant="body2" sx={{ maxWidth: '250px' }}>{settings.address}</Typography>
                </Stack>
              )}
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ mt: 8, mb: 4, borderColor: 'rgba(255,255,255,0.05)' }} />

        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between" 
          alignItems="center" 
          spacing={2}
        >
          <Typography variant="caption" sx={{ opacity: 0.5 }}>
            © {new Date().getFullYear()} {settings.companyName}. All rights reserved.
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.3 }}>
            Designed for Excellence
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};