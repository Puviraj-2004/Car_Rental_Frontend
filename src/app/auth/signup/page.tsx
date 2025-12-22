'use client';

import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { 
  Box, Container, Paper, Typography, TextField, 
  Button, Grid, Alert, InputAdornment, Checkbox, FormControlLabel, Link 
} from '@mui/material';
import { Email, Lock, Person, Phone, ArrowForward } from '@mui/icons-material';

const REGISTER_USER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      message
      user {
        id
        email
      }
    }
  }
`;

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    gdprConsent: false
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [register, { loading }] = useMutation(REGISTER_USER);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.gdprConsent) {
      setError("Please agree to the Terms and Conditions.");
      return;
    }

    try {
      const { data } = await register({ 
        variables: { 
          input: {
            ...formData,
            language: "en"
          } 
        } 
      });
      
    if (data.register) {
      router.push(`/auth/verify-otp?email=${formData.email}`);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', py: 5 }}>
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4 }}>
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight="800" color="#293D91" gutterBottom>
              Drive Your Dream
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create an account to start your journey
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
          {success && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              Registration successful! A verification email has been sent to your inbox.
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  fullWidth
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Person fontSize="small" /></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  fullWidth
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email Address"
                  type="email"
                  fullWidth
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Email fontSize="small" /></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Phone Number"
                  fullWidth
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Phone fontSize="small" /></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Password"
                  type="password"
                  fullWidth
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Lock fontSize="small" /></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={formData.gdprConsent} 
                      onChange={(e) => setFormData({...formData, gdprConsent: e.target.checked})}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I agree to the <Link href="#" underline="hover">Terms of Service</Link> and <Link href="#" underline="hover">Privacy Policy</Link>
                    </Typography>
                  }
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              endIcon={!loading && <ArrowForward />}
              sx={{ 
                mt: 4, 
                py: 1.5, 
                fontWeight: 'bold', 
                fontSize: '1.1rem',
                bgcolor: '#293D91',
                borderRadius: 2,
                '&:hover': { bgcolor: '#1a2a6b' }
              }}
            >
              {loading ? 'Processing...' : 'Create Account'}
            </Button>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account? <Link href="/auth/login" fontWeight="bold" color="#293D91" underline="hover">Login here</Link>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}