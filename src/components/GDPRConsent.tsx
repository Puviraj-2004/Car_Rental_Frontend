'use client';

import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Cookies from 'js-cookie';

interface GDPRConsentProps {
  onConsentGiven: () => void;
}

export default function GDPRConsent({ onConsentGiven }: GDPRConsentProps) {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const consent = Cookies.get('gdpr-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    // Set cookie for 1 year
    Cookies.set('gdpr-consent', 'true', { expires: 365 });
    setShowBanner(false);
    onConsentGiven();
  };

  const handleReject = () => {
    // Set cookie for 1 year
    Cookies.set('gdpr-consent', 'false', { expires: 365 });
    setShowBanner(false);
    // In a real application, you would disable non-essential cookies here
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
        p: 2,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="body2" gutterBottom>
        We use cookies to improve your experience on our site. By using our site, you consent to our{' '}
        <Link href="/privacy-policy" target="_blank">
          Privacy Policy
        </Link>{' '}
        and{' '}
        <Link href="/cookie-policy" target="_blank">
          Cookie Policy
        </Link>
        .
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <Button variant="contained" size="small" onClick={handleAccept}>
          Accept All
        </Button>
        <Button variant="outlined" size="small" onClick={handleReject}>
          Reject Non-Essential
        </Button>
        <Button variant="text" size="small" href="/privacy-settings">
          Manage Preferences
        </Button>
      </Box>
    </Box>
  );
}