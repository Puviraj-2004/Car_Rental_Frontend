'use client';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useMutation, useQuery } from '@apollo/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box, Button, Typography, Paper, Grid, TextField, Alert,
  Stepper, Step, StepLabel, Snackbar, CircularProgress,
  Card, CardContent, Divider, Fade
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon
} from '@mui/icons-material';
import { CREATE_OR_UPDATE_DRIVER_PROFILE_MUTATION, PROCESS_DOCUMENT_OCR_MUTATION } from '@/lib/graphql/mutations';
import { GET_BOOKING_ID_BY_TOKEN_QUERY } from '@/lib/graphql/queries';

interface DriverVerificationPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default function DriverVerificationPage({ params }: DriverVerificationPageProps) {
  const router = useRouter();
  const { data: session } = useSession();

  // Unwrap params with React.use() (Next.js 15 requirement)
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  // Get booking ID from verification token
  const { data: tokenData } = useQuery(GET_BOOKING_ID_BY_TOKEN_QUERY, {
    variables: { token },
    skip: !token
  });

  const bookingId = tokenData?.verifyBookingToken?.bookingId;

  const [currentStep, setCurrentStep] = useState(0); // Material-UI Stepper uses 0-based index
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // Form data
  const [licenseData, setLicenseData] = useState({
    frontFile: null as File | null,
    backFile: null as File | null,
    name: '',
    licenseNumber: '',
    expiryDate: ''
  });

  const [cniData, setCniData] = useState({
    file: null as File | null,
    idNumber: '',
    dateOfBirth: ''
  });

  const [addressData, setAddressData] = useState({
    file: null as File | null
  });

  const [createOrUpdateDriverProfile] = useMutation(CREATE_OR_UPDATE_DRIVER_PROFILE_MUTATION);
  const [processDocumentOCR] = useMutation(PROCESS_DOCUMENT_OCR_MUTATION);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleFileUpload = async (file: File, type: 'license' | 'cni' | 'address', side?: 'front' | 'back') => {
    setIsLoading(true);

    try {
      // Call Mindee OCR API through backend
      const { data } = await processDocumentOCR({
        variables: {
          file,
          documentType: type,
          side: side
        }
      });

      if (data?.processDocumentOCR) {
        const extractedData = data.processDocumentOCR;

        if (type === 'license') {
          setLicenseData(prev => ({
            ...prev,
            name: extractedData.fullName || prev.name,
            licenseNumber: extractedData.documentId || prev.licenseNumber,
            expiryDate: extractedData.expiryDate || prev.expiryDate
          }));

          showToast('License scanned successfully! Please verify the extracted information.', 'success');
        } else if (type === 'cni') {
          setCniData(prev => ({
            ...prev,
            idNumber: extractedData.documentId || prev.idNumber,
            dateOfBirth: extractedData.birthDate || prev.dateOfBirth
          }));

          showToast('ID card scanned successfully! Please verify the extracted information.', 'success');
        } else if (type === 'address') {
          // For address proof, we mainly validate that OCR worked
          const hasAddressData = extractedData.address || extractedData.fullName;

          if (!hasAddressData) {
            showToast('Could not extract clear information from this document. Please ensure it contains address details.', 'warning');
          } else {
            showToast('Address proof validated successfully!', 'success');
          }
        }
      } else {
        showToast('Failed to process document. Please try again.', 'error');
      }
    } catch (error: any) {
      console.error('OCR processing error:', error);
      showToast(error.message || 'Failed to process document. Please try again.', 'error');
    }

    setIsLoading(false);
  };

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const driverData = {
        licenseNumber: licenseData.licenseNumber,
        licenseExpiry: licenseData.expiryDate,
        idNumber: cniData.idNumber,
        dateOfBirth: cniData.dateOfBirth,
        address: 'Verified via document upload'
      };

      const { data } = await createOrUpdateDriverProfile({
        variables: { input: driverData }
      });

      if (data?.createOrUpdateDriverProfile) {
        showToast('Driver verification completed successfully! Redirecting to payment...', 'success');

        // Redirect to payment page with booking ID
        setTimeout(() => {
          if (bookingId) {
            router.push(`/payment/${bookingId}`);
          } else {
            // Fallback if booking ID not available
            router.push('/booking-records');
          }
        }, 2000);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to submit verification. Please try again.', 'error');
    }

    setIsLoading(false);
  };

  const steps = ['License', 'ID Card', 'Address Proof'];

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)',
      py: 4
    }}>
      {/* Progress Bar */}
      <Paper elevation={1} sx={{ mb: 4, mx: 'auto', maxWidth: '800px' }}>
        <Box sx={{ p: 4 }}>
          <Stepper activeStep={currentStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="h4" fontWeight={800} color="primary" gutterBottom>
              Driver Verification
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Complete all steps to verify your identity and driving credentials
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ maxWidth: '800px', mx: 'auto', px: 3 }}>
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card sx={{ mb: 4 }}>
                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                  <DescriptionIcon sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    Driver's License
                  </Typography>
                  <Typography variant="body1" color="text.secondary" mb={4}>
                    Upload both sides of your driver's license for automatic verification
                  </Typography>
                </CardContent>
              </Card>

              <Grid container spacing={4} sx={{ mb: 4 }}>
                {/* License Front */}
                <Grid item xs={12} md={6}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      border: '2px dashed',
                      borderColor: 'grey.300',
                      '&:hover': { borderColor: 'primary.main' },
                      transition: 'border-color 0.3s'
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setLicenseData(prev => ({ ...prev, frontFile: file }));
                          handleFileUpload(file, 'license', 'front');
                        }
                      }}
                      style={{ display: 'none' }}
                      id="license-front"
                    />
                    <label htmlFor="license-front" style={{ cursor: 'pointer' }}>
                      <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        Click to upload front side
                      </Typography>
                    </label>
                    {licenseData.frontFile && (
                      <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                        ✓ Front uploaded: {licenseData.frontFile.name}
                      </Typography>
                    )}
                  </Paper>
                </Grid>

                {/* License Back */}
                <Grid item xs={12} md={6}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      border: '2px dashed',
                      borderColor: 'grey.300',
                      '&:hover': { borderColor: 'primary.main' },
                      transition: 'border-color 0.3s'
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setLicenseData(prev => ({ ...prev, backFile: file }));
                          handleFileUpload(file, 'license', 'back');
                        }
                      }}
                      style={{ display: 'none' }}
                      id="license-back"
                    />
                    <label htmlFor="license-back" style={{ cursor: 'pointer' }}>
                      <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        Click to upload back side
                      </Typography>
                    </label>
                    {licenseData.backFile && (
                      <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                        ✓ Back uploaded: {licenseData.backFile.name}
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>

              {/* AI Extracted Data */}
              {licenseData.name && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Alert severity="success" sx={{ mb: 4 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      Extracted Information
                    </Typography>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Full Name"
                          value={licenseData.name}
                          onChange={(e) => setLicenseData(prev => ({ ...prev, name: e.target.value }))}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="License Number"
                          value={licenseData.licenseNumber}
                          onChange={(e) => setLicenseData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Expiry Date"
                          type="date"
                          value={licenseData.expiryDate}
                          onChange={(e) => setLicenseData(prev => ({ ...prev, expiryDate: e.target.value }))}
                          variant="outlined"
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                    </Grid>
                  </Alert>
                </motion.div>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!licenseData.name || isLoading}
                  endIcon={<NavigateNextIcon />}
                  size="large"
                >
                  {isLoading ? <CircularProgress size={20} /> : 'Next: ID Card'}
                </Button>
              </Box>
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card sx={{ mb: 4 }}>
                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                  <DescriptionIcon sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    National ID Card (CNI)
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Upload your national ID card for identity verification
                  </Typography>
                </CardContent>
              </Card>

              <Box sx={{ maxWidth: 400, mx: 'auto', mb: 4 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    border: '2px dashed',
                    borderColor: 'grey.300',
                    '&:hover': { borderColor: 'primary.main' },
                    transition: 'border-color 0.3s'
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setCniData(prev => ({ ...prev, file }));
                        handleFileUpload(file, 'cni');
                      }
                    }}
                    style={{ display: 'none' }}
                    id="cni-upload"
                  />
                  <label htmlFor="cni-upload" style={{ cursor: 'pointer' }}>
                    <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      Click to upload ID card
                    </Typography>
                  </label>
                  {cniData.file && (
                    <Typography variant="body2" color="success.main" sx={{ mt: 2 }}>
                      ✓ Uploaded: {cniData.file.name}
                    </Typography>
                  )}
                </Paper>
              </Box>

              {/* AI Extracted Data */}
              {cniData.idNumber && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Alert severity="success" sx={{ mb: 4 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      Extracted Information
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <TextField
                        fullWidth
                        label="ID Number"
                        value={cniData.idNumber}
                        onChange={(e) => setCniData(prev => ({ ...prev, idNumber: e.target.value }))}
                        variant="outlined"
                        sx={{ mb: 3 }}
                      />
                      <TextField
                        fullWidth
                        label="Date of Birth"
                        type="date"
                        value={cniData.dateOfBirth}
                        onChange={(e) => setCniData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Box>
                  </Alert>
                </motion.div>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={handlePrev}
                  startIcon={<NavigateBeforeIcon />}
                  size="large"
                >
                  Previous
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!cniData.idNumber || isLoading}
                  endIcon={<NavigateNextIcon />}
                  size="large"
                >
                  {isLoading ? <CircularProgress size={20} /> : 'Next: Address Proof'}
                </Button>
              </Box>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card sx={{ mb: 4 }}>
                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                  <DescriptionIcon sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    Address Proof
                  </Typography>
                  <Typography variant="body1" color="text.secondary" mb={3}>
                    Upload a recent proof of address (utility bill, bank statement, etc.)
                  </Typography>
                  <Alert severity="warning" sx={{ maxWidth: 400, mx: 'auto' }}>
                    <Typography variant="body2">
                      <strong>Important:</strong> Document must be dated within the last 3 months
                    </Typography>
                  </Alert>
                </CardContent>
              </Card>

              <Box sx={{ maxWidth: 400, mx: 'auto', mb: 4 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    border: '2px dashed',
                    borderColor: 'grey.300',
                    '&:hover': { borderColor: 'primary.main' },
                    transition: 'border-color 0.3s'
                  }}
                >
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setAddressData({ file });
                        handleFileUpload(file, 'address');
                      }
                    }}
                    style={{ display: 'none' }}
                    id="address-upload"
                  />
                  <label htmlFor="address-upload" style={{ cursor: 'pointer' }}>
                    <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      Click to upload proof of address
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      PDF or image files accepted
                    </Typography>
                  </label>
                  {addressData.file && (
                    <Typography variant="body2" color="success.main" sx={{ mt: 2 }}>
                      ✓ Uploaded: {addressData.file.name}
                    </Typography>
                  )}
                </Paper>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={handlePrev}
                  startIcon={<NavigateBeforeIcon />}
                  size="large"
                >
                  Previous
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={!addressData.file || isLoading}
                  color="success"
                  size="large"
                >
                  {isLoading ? <CircularProgress size={20} /> : 'Submit for Approval'}
                </Button>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* Toast Notifications */}
      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={toast?.type === 'error' ? 'error' : toast?.type === 'warning' ? 'warning' : 'success'}
          variant="filled"
        >
          {toast?.message}
        </Alert>
      </Snackbar>

      {/* Loading Overlay */}
      {isLoading && (
        <Fade in={isLoading}>
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999
            }}
          >
            <Card sx={{ p: 4, textAlign: 'center', maxWidth: 300 }}>
              <CircularProgress size={48} sx={{ mb: 2 }} />
              <Typography variant="h6">
                Processing your documents...
              </Typography>
            </Card>
          </Box>
        </Fade>
      )}
    </Box>
  );
}