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
  
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [register, { loading }] = useMutation(REGISTER_USER);

  const validatePassword = (password: string) => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (password.length > 128) {
      errors.push('Password must not exceed 128 characters');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    // Check for common passwords
    const commonPasswords = [
      'password', '12345678', 'qwerty123', 'password123', 
      'admin123', 'letmein', 'welcome', 'monkey', '1234567890'
    ];
    
    const lowerPassword = password.toLowerCase();
    if (commonPasswords.some(common => lowerPassword.includes(common))) {
      errors.push('Password contains common password patterns');
    }
    
    // Check for repeated characters (more than 3 in a row)
    if (/(.)\1{3,}/.test(password)) {
      errors.push('Password must not contain more than 3 identical characters in a row');
    }
    
    // Calculate password strength (0-100)
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 25;
    
    if (strength < 40) {
      strength = 40; // minimum strength value
    }
    
    setPasswordErrors(errors);
    setPasswordStrength(strength);
    
    return {
      isValid: errors.length === 0,
      errors,
      strength
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.gdprConsent) {
      setError("Please agree to the Terms and Conditions.");
      return;
    }
    
    // Validate password before submission
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setError("Please fix the password issues before submitting.");
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
                  onChange={(e) => {
                    const newPassword = e.target.value;
                    setFormData({...formData, password: newPassword});
                    validatePassword(newPassword);
                  }}
                  error={passwordErrors.length > 0}
                  helperText={passwordErrors.length > 0 ? passwordErrors[0] : 'Use 8 or more characters with a mix of letters, numbers & symbols'}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Lock fontSize="small" /></InputAdornment> }}
                />
                {formData.password && (
                  <Box sx={{ mt: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{
                        height: '8px',
                        flex: 1,
                        backgroundColor: passwordStrength < 40 ? '#ff4d4d' : passwordStrength < 70 ? '#ffa500' : '#4CAF50',
                        borderRadius: '4px',
                        marginRight: '10px'
                      }}>
                        <div 
                          style={{
                            height: '100%',
                            width: `${passwordStrength}%`,
                            backgroundColor: passwordStrength < 40 ? '#ff4d4d' : passwordStrength < 70 ? '#ffa500' : '#4CAF50',
                            borderRadius: '4px',
                            transition: 'width 0.3s ease'
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '12px', color: passwordStrength < 40 ? '#ff4d4d' : passwordStrength < 70 ? '#ffa500' : '#4CAF50' }}>
                        {passwordStrength < 40 ? 'Weak' : passwordStrength < 70 ? 'Medium' : 'Strong'}
                      </span>
                    </div>
                    {passwordErrors.length > 0 && (
                      <div style={{ marginTop: '8px' }}>
                        {passwordErrors.map((error, index) => (
                          <Typography key={index} variant="caption" color="error" display="block">
                            • {error}
                          </Typography>
                        ))}
                      </div>
                    )}
                  </Box>
                )}
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