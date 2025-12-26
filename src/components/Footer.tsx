'use client';

import React from 'react';
import { Box, Container, Grid, Typography, Link as MuiLink, IconButton, Divider, Skeleton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Link from 'next/link';

// GraphQL Imports
import { useQuery } from '@apollo/client';
import { GET_PLATFORM_SETTINGS_QUERY } from '@/lib/graphql/queries'; // ✅ Centralized Import

export default function Footer() {
  const { data, loading } = useQuery(GET_PLATFORM_SETTINGS_QUERY);
  const settings = data?.platformSettings || {};

  if (loading) return null; // அல்லது Skeleton காட்டலாம்

  return (
    <Box sx={{ bgcolor: '#0F172A', color: 'white', pt: 8, pb: 4, mt: 'auto' }}>
      <Container maxWidth="xl">
        <Grid container spacing={5}>
          
          {/* 1. BRAND & DESCRIPTION */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {/* லோகோ இருந்தால் லோகோ, இல்லையென்றால் Icon */}
              {settings.logoUrl ? (
                <Box 
                  component="img" 
                  src={settings.logoUrl} 
                  alt="Logo" 
                  sx={{ height: 40, mr: 1, filter: 'brightness(0) invert(1)' }} // வெள்ளையாக மாற்ற
                />
              ) : (
                <DriveEtaIcon sx={{ fontSize: 30, mr: 1, color: '#60A5FA' }} />
              )}
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                {settings.companyName || 'RENTCAR'}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.7, lineHeight: 1.8, mb: 2 }}>
              {settings.description || 'Premium car rental service designed for your comfort and safety.'}
            </Typography>
            
            <Box>
              {settings.facebookUrl && (
                <IconButton size="small" sx={{ color: 'white', mr: 1 }} href={settings.facebookUrl} target="_blank">
                  <FacebookIcon />
                </IconButton>
              )}
              {settings.twitterUrl && (
                <IconButton size="small" sx={{ color: 'white', mr: 1 }} href={settings.twitterUrl} target="_blank">
                  <TwitterIcon />
                </IconButton>
              )}
              {settings.instagramUrl && (
                <IconButton size="small" sx={{ color: 'white', mr: 1 }} href={settings.instagramUrl} target="_blank">
                  <InstagramIcon />
                </IconButton>
              )}
              {settings.linkedinUrl && (
                <IconButton size="small" sx={{ color: 'white' }} href={settings.linkedinUrl} target="_blank">
                  <LinkedInIcon />
                </IconButton>
              )}
            </Box>
          </Grid>

          {/* 2. QUICK LINKS */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>Company</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <MuiLink component={Link} href="/about" underline="hover" color="inherit" sx={{ opacity: 0.7 }}>About Us</MuiLink>
              <MuiLink component={Link} href="/cars" underline="hover" color="inherit" sx={{ opacity: 0.7 }}>Our Fleet</MuiLink>
              <MuiLink component={Link} href="/contact" underline="hover" color="inherit" sx={{ opacity: 0.7 }}>Contact</MuiLink>
            </Box>
          </Grid>

          {/* 3. SUPPORT */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>Support</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <MuiLink href="#" underline="hover" color="inherit" sx={{ opacity: 0.7 }}>Help Center</MuiLink>
              <MuiLink href="/privacy-policy" underline="hover" color="inherit" sx={{ opacity: 0.7 }}>Privacy Policy</MuiLink>
            </Box>
          </Grid>

          {/* 4. CONTACT INFO */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>Contact Us</Typography>
            
            {settings.supportPhone && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PhoneIcon sx={{ mr: 2, color: '#60A5FA' }} />
                <Typography variant="body2">{settings.supportPhone}</Typography>
              </Box>
            )}
            
            {settings.supportEmail && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmailIcon sx={{ mr: 2, color: '#60A5FA' }} />
                <Typography variant="body2">{settings.supportEmail}</Typography>
              </Box>
            )}

            {settings.address && (
              <Box sx={{ display: 'flex', alignItems: 'start', mb: 2 }}>
                <LocationOnIcon sx={{ mr: 2, color: '#60A5FA', mt: -0.5 }} />
                <Typography variant="body2">{settings.address}</Typography>
              </Box>
            )}
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

        <Typography variant="body2" align="center" sx={{ opacity: 0.5 }}>
          © {new Date().getFullYear()} {settings.companyName}. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}