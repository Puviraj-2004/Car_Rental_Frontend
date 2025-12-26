'use client';

import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from 'next/link'; // Next.js Link சிறந்தது
import { setCookie, hasCookie } from 'cookies-next'; // ஒரே லைப்ரரி பயன்பாடு

interface GDPRConsentProps {
  onConsentGiven?: () => void;
}

export default function GDPRConsent({ onConsentGiven }: GDPRConsentProps) {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if cookie exists
    if (!hasCookie('gdpr-consent')) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    // Set cookie for 1 year (365 days)
    setCookie('gdpr-consent', 'true', { maxAge: 60 * 60 * 24 * 365 });
    setShowBanner(false);
    if (onConsentGiven) onConsentGiven();
  };

  const handleReject = () => {
    setCookie('gdpr-consent', 'false', { maxAge: 60 * 60 * 24 * 365 });
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        bgcolor: 'background.paper',
        boxShadow: 3,
        zIndex: 1300,
        p: 3,
        borderTop: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2
      }}
    >
      <Typography variant="body2" color="text.secondary">
        We use cookies to improve your experience on our site. By using our site, you consent to our{' '}
        <Link href="/privacy-policy" style={{ color: '#1976d2', textDecoration: 'none' }}>
          Privacy Policy
        </Link>{' '}
        and{' '}
        <Link href="/cookie-policy" style={{ color: '#1976d2', textDecoration: 'none' }}>
          Cookie Policy
        </Link>.
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
        <Button variant="outlined" size="small" onClick={handleReject}>
          Reject Non-Essential
        </Button>
        <Button variant="contained" size="small" onClick={handleAccept}>
          Accept All
        </Button>
      </Box>
    </Box>
  );
}