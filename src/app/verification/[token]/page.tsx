'use client';

import React, { useState, useMemo, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box, Button, Typography, Paper, Grid, TextField, 
  Stepper, Step, StepLabel, CircularProgress, Card, Stack, Container, Chip, Alert, IconButton
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Lock as LockIcon,
  VerifiedUser as VerifiedUserIcon,
  Smartphone as PhoneIcon,
  Laptop as WebIcon,
  Replay as ChangeIcon,
  AutoAwesome as AIScanIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { CREATE_OR_UPDATE_DRIVER_PROFILE_MUTATION, PROCESS_DOCUMENT_OCR_MUTATION } from '@/lib/graphql/mutations';
import { GET_BOOKING_BY_TOKEN_QUERY } from '@/lib/graphql/queries';

export default function DriverVerificationPage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter();
  const { token } = use(params);
  
  // Queries & Mutations
  const { data: bookingData } = useQuery(GET_BOOKING_BY_TOKEN_QUERY, { variables: { token }, skip: !token });
  const [processOCR] = useMutation(PROCESS_DOCUMENT_OCR_MUTATION);
  const [updateProfile] = useMutation(CREATE_OR_UPDATE_DRIVER_PROFILE_MUTATION);

  // UI States
  const [currentStep, setCurrentStep] = useState(0);
  const [activeScanning, setActiveScanning] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [device, setDevice] = useState<'App' | 'Web'>('Web');

  // Previews & Form Data
  const [previews, setPreviews] = useState({ licenseFront: '', licenseBack: '', cni: '', address: '' });
  const [licenseData, setLicenseData] = useState({ name: '', number: '', expiry: '', category: '' });
  const [cniData, setCniData] = useState({ name: '', number: '', dob: '' });
  const [addressData, setAddressData] = useState({ address: '' });

  // 📱 Device Detection & Navigation Lock
  useEffect(() => {
    const isMobile = /android|iphone|kindle|ipad/i.test(navigator.userAgent);
    setDevice(isMobile ? 'App' : 'Web');

    if (isSuccess) {
      window.history.pushState(null, "", window.location.href);
      window.onpopstate = () => window.history.pushState(null, "", window.location.href);
    }
  }, [isSuccess]);

  // 🛡️ STEP COMPLETION LOGIC
  const isLicenseComplete = useMemo(() => !!(previews.licenseFront && previews.licenseBack && licenseData.name && licenseData.number), [licenseData, previews]);
  const isCniComplete = useMemo(() => !!(previews.cni && cniData.name && cniData.number), [cniData, previews]);
  const isAddressComplete = useMemo(() => !!(previews.address && addressData.address), [addressData, previews]);

  const handleFileUpload = async (file: File, type: string, side?: string) => {
    const scanKey = side ? `${type}_${side}` : type;
    setActiveScanning(scanKey);

    // Image Preview Logic
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (side === 'FRONT') setPreviews(p => ({ ...p, licenseFront: result }));
      else if (side === 'BACK') setPreviews(p => ({ ...p, licenseBack: result }));
      else if (type === 'ID_CARD') setPreviews(p => ({ ...p, cni: result }));
      else if (type === 'ADDRESS_PROOF') setPreviews(p => ({ ...p, address: result }));
    };
    reader.readAsDataURL(file);

    try {
      const { data } = await processOCR({ variables: { file, documentType: type, side } });
      const res = data?.processDocumentOCR;

      if (type === 'LICENSE') {
        setLicenseData(p => ({ 
          ...p, 
          name: res.fullName || p.name, 
          number: res.licenseNumber || p.number, 
          expiry: res.expiryDate || p.expiry,
          category: res.licenseCategory || p.category // Might be undefined from front scan
        }));
      } else if (type === 'ID_CARD') {
        setCniData(p => ({ ...p, name: res.fullName || p.name, number: res.documentId || p.number, dob: res.birthDate || p.dob }));
      } else if (type === 'ADDRESS_PROOF') {
        setAddressData(p => ({ ...p, address: res.address || p.address }));
      }
    } catch (e) {
      console.error("AI Error:", e);
    } finally {
      setActiveScanning(null);
    }
  };

  const handleSubmit = async () => {
    try {
      await updateProfile({
        variables: {
          input: {
            licenseNumber: licenseData.number,
            licenseExpiry: licenseData.expiry,
            licenseCategory: licenseData.category || 'B', // Fallback to B
            idNumber: cniData.number,
            birthDate: cniData.dob,
            address: addressData.address,
          }
        }
      });
      setIsSuccess(true);
    } catch (e) {
      console.error(e);
    }
  };

  // --- UI Components ---

  const ImageUploadBox = ({ label, preview, onUpload, isScanning, icon }: any) => (
    <Box sx={{ 
      position: 'relative', height: 160, borderRadius: 4, overflow: 'hidden', 
      border: '2px dashed #E2E8F0', bgcolor: '#F8FAFC', display: 'flex', 
      alignItems: 'center', justifyContent: 'center', transition: '0.3s',
      '&:hover': { borderColor: '#7C3AED', bgcolor: '#F5F3FF' } 
    }}>
      {preview ? (
        <>
          <img src={preview} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Preview" />
          <Box sx={{ 
            position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.5)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            opacity: 0, '&:hover': { opacity: 1 }, transition: '0.2s' 
          }}>
            <Button component="label" variant="contained" size="small" startIcon={<ChangeIcon />} sx={{ bgcolor: 'white', color: 'black' }}>
              Change <input type="file" hidden onChange={e => onUpload(e.target.files![0])} />
            </Button>
          </Box>
        </>
      ) : (
        <Button component="label" sx={{ width: '100%', height: '100%', flexDirection: 'column', color: '#64748B', textTransform: 'none' }}>
          {icon}
          <Typography variant="body2" sx={{ mt: 1, fontWeight: 700 }}>{label}</Typography>
          <input type="file" hidden onChange={e => onUpload(e.target.files![0])} />
        </Button>
      )}
      {isScanning && (
        <Box sx={{ 
          position: 'absolute', inset: 0, bgcolor: 'rgba(124, 58, 237, 0.85)', 
          zIndex: 10, display: 'flex', flexDirection: 'column', 
          alignItems: 'center', justifyContent: 'center', color: 'white' 
        }}>
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <AIScanIcon sx={{ fontSize: 50 }} />
          </motion.div>
          <Typography variant="caption" fontWeight={900} sx={{ mt: 1, letterSpacing: 1 }}>AI SCANNING...</Typography>
        </Box>
      )}
    </Box>
  );

  if (isSuccess) {
    return (
      <Box sx={{ 
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
        bgcolor: '#FFFFFF', textAlign: 'center', p: 3, position: 'fixed', inset: 0, zIndex: 9999 
      }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <CheckCircleIcon sx={{ fontSize: 120, color: '#10B981', mb: 4 }} />
          <Typography variant="h3" fontWeight={900} color="#0F172A" gutterBottom>Verification Successful</Typography>
          <Paper elevation={0} sx={{ p: 4, bgcolor: '#F0FDF4', borderRadius: 6, border: '2px solid #BBF7D0', maxWidth: 500, mx: 'auto' }}>
            <Typography variant="h5" color="#15803D" fontWeight={800}>Please return to your primary device to complete payment.</Typography>
          </Paper>
        </motion.div>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', py: 6, bgcolor: '#F8FAFC', background: 'linear-gradient(180deg, #F0F9FF 0%, #F8FAFC 100%)' }}>
      <Container maxWidth="md">
        
        <Paper sx={{ p: 4, mb: 4, borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #E2E8F0' }}>
          <Box>
            <Typography variant="h5" fontWeight={900}>Identity Check</Typography>
            <Stack direction="row" spacing={1} alignItems="center" color="text.secondary" mt={0.5}>
              {device === 'App' ? <PhoneIcon fontSize="small"/> : <WebIcon fontSize="small"/>}
              <Typography variant="caption" fontWeight={600}>{device} Environment Detected</Typography>
            </Stack>
          </Box>
          <Stepper activeStep={currentStep} sx={{ width: '50%', display: { xs: 'none', md: 'flex' } }}>
            {['License', 'ID', 'Address'].map(l => <Step key={l}><StepLabel>{l}</StepLabel></Step>)}
          </Stepper>
        </Paper>

        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card sx={{ p: 5, borderRadius: 6, border: '1px solid #E2E8F0' }}>
                <Typography variant="h6" fontWeight={800} mb={3}>Step 1: Driving License</Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <ImageUploadBox 
                      label="Upload Front" preview={previews.licenseFront} 
                      isScanning={activeScanning === 'LICENSE_FRONT'}
                      onUpload={(f: any) => handleFileUpload(f, 'LICENSE', 'FRONT')}
                      icon={<CloudUploadIcon sx={{ fontSize: 40 }} />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <ImageUploadBox 
                      label="Upload Back" preview={previews.licenseBack} 
                      isScanning={activeScanning === 'LICENSE_BACK'}
                      onUpload={(f: any) => handleFileUpload(f, 'LICENSE', 'BACK')}
                      icon={<CloudUploadIcon sx={{ fontSize: 40 }} />}
                    />
                  </Grid>
                </Grid>

                <Stack spacing={3} mt={4}>
                  <TextField label="Full Name" fullWidth value={licenseData.name} onChange={e => setLicenseData({...licenseData, name: e.target.value})}/>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}><TextField label="License Number" fullWidth value={licenseData.number} onChange={e => setLicenseData({...licenseData, number: e.target.value})}/></Grid>
                    <Grid item xs={12} sm={4}><TextField label="Expiry Date" fullWidth placeholder="YYYY-MM-DD" value={licenseData.expiry} onChange={e => setLicenseData({...licenseData, expiry: e.target.value})}/></Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField 
                        select label="Category" fullWidth value={licenseData.category} 
                        onChange={e => setLicenseData({...licenseData, category: e.target.value})}
                        SelectProps={{ native: true }}
                      >
                        <option value="AM">AM</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </TextField>
                    </Grid>
                  </Grid>
                </Stack>

                <Box mt={5} textAlign="right">
                  <Button variant="contained" size="large" onClick={() => setCurrentStep(1)} disabled={!isLicenseComplete || !!activeScanning} sx={{ px: 6, py: 1.5, borderRadius: 3, bgcolor: '#0F172A' }}>Next Step</Button>
                </Box>
              </Card>
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card sx={{ p: 5, borderRadius: 6, border: '1px solid #E2E8F0' }}>
                <Typography variant="h6" fontWeight={800} mb={3}>Step 2: National ID Card</Typography>
                
                <ImageUploadBox 
                  label="Upload ID Card" preview={previews.cni} 
                  isScanning={activeScanning === 'ID_CARD'}
                  onUpload={(f: any) => handleFileUpload(f, 'ID_CARD')}
                  icon={<CloudUploadIcon sx={{ fontSize: 40 }} />}
                />

                <Stack spacing={3} mt={4}>
                  <TextField label="ID Card Name" fullWidth value={cniData.name} onChange={e => setCniData({...cniData, name: e.target.value})}/>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}><TextField label="ID Card Number" fullWidth value={cniData.number} onChange={e => setCniData({...cniData, number: e.target.value})}/></Grid>
                    <Grid item xs={12} sm={6}><TextField label="Birth Date" fullWidth placeholder="YYYY-MM-DD" value={cniData.dob} onChange={e => setCniData({...cniData, dob: e.target.value})}/></Grid>
                  </Grid>
                </Stack>

                <Box mt={5} display="flex" justifyContent="space-between">
                  <Button onClick={() => setCurrentStep(0)} variant="outlined">Previous</Button>
                  <Button variant="contained" size="large" onClick={() => setCurrentStep(2)} disabled={!isCniComplete || !!activeScanning} sx={{ px: 6, py: 1.5, borderRadius: 3, bgcolor: '#0F172A' }}>Next Step</Button>
                </Box>
              </Card>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card sx={{ p: 5, borderRadius: 6, border: '1px solid #E2E8F0' }}>
                <Typography variant="h6" fontWeight={800} mb={3}>Step 3: Proof of Address</Typography>
                
                <ImageUploadBox 
                  label="Upload Document" preview={previews.address} 
                  isScanning={activeScanning === 'ADDRESS_PROOF'}
                  onUpload={(f: any) => handleFileUpload(f, 'ADDRESS_PROOF')}
                  icon={<CloudUploadIcon sx={{ fontSize: 40 }} />}
                />

                <TextField label="Enter Full Residential Address" multiline rows={3} fullWidth sx={{ mt: 4 }} value={addressData.address} onChange={e => setAddressData({...addressData, address: e.target.value})}/>

                <Box mt={5} display="flex" justifyContent="space-between">
                  <Button onClick={() => setCurrentStep(1)} variant="outlined">Previous</Button>
                  <Button variant="contained" color="success" size="large" onClick={handleSubmit} disabled={!isAddressComplete || !!activeScanning} sx={{ px: 6, py: 1.5, borderRadius: 3, fontWeight: 900 }}>
                    {activeScanning ? "AI Working..." : "Submit for Verification"}
                  </Button>
                </Box>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <Stack direction="row" spacing={2} justifyContent="center" mt={6} sx={{ opacity: 0.5 }}>
          <Chip icon={<LockIcon />} label="Encrypted" variant="outlined" size="small" />
          <Chip icon={<VerifiedUserIcon />} label="GDPR Compliant" variant="outlined" size="small" />
        </Stack>
      </Container>
    </Box>
  );
}