'use client';

import React, { useState } from 'react';
import Image from 'next/image';
// ✅ CORRECT IMPORTS: Layout components from @mui/material
import {
  Box, Typography, Grid, Stack, Divider, IconButton, Paper, Avatar,
  Dialog as MuiDialog, 
  DialogContent as MuiDialogContent, 
  DialogTitle as MuiDialogTitle, 
  DialogActions as MuiDialogActions,
  TextField as MuiTextField, 
  Button as MuiButton, 
  Chip as MuiChip,
  Alert as MuiAlert,
  Snackbar
} from '@mui/material';
import { formatDateForDisplay } from '@/lib/dateUtils';

// ✅ CORRECT IMPORTS: Icons from @mui/icons-material
import { 
  Close, DirectionsCar, Person, 
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  PlayArrow as StartTripIcon
} from '@mui/icons-material';

// Pre-Trip Modal Component
import { PreTripModal } from './PreTripModal';
import { ImageViewerModal } from './ImageViewerModal';

export const AdminBookingDetailsModal = ({ open, onClose, booking, actions }: any) => {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'error' | 'success' | 'warning'>('error');
  
  // Pre-Trip Modal State
  const [preTripModalOpen, setPreTripModalOpen] = useState(false);
  
  // Image Viewer State
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState({ url: '', title: '' });

  if (!booking) return null;

  const isCourtesy = booking.bookingType === 'REPLACEMENT';
    const isWalkIn = booking.isWalkIn;
    const displayName = booking.guestName || booking.user?.fullName || 'Guest';
    const displayPhone = booking.guestPhone || booking.user?.phoneNumber;
    const displayEmail = booking.guestEmail || booking.user?.email;
  const userDocs = booking.documentVerification || booking.user?.verification || null; 

  const handleConfirmCancel = async () => {
    if (!cancelReason) return;
    setIsSubmitting(true);
    const success = await actions.cancelBooking(booking.id, cancelReason);
    setIsSubmitting(false);
    if (success) {
      setCancelDialogOpen(false);
      onClose(); 
    }
  };

  const handleOpenImage = (url: string, title: string) => {
    setSelectedImage({ url, title });
    setImageViewerOpen(true);
  };

  const handleVerifyDocuments = async () => {
    setIsSubmitting(true);
    try {
      if (!booking.user?.id) {
        throw new Error('User ID not found');
      }
      const success = await actions.verifyDocument?.(booking.user.id, 'APPROVED');
      if (success) {
        setAlertMessage('✅ Documents approved successfully!');
        setAlertSeverity('success');
        setTimeout(() => {
          actions.refreshBooking?.();
        }, 500);
      } else {
        setAlertMessage('⚠️ Failed to approve documents.');
        setAlertSeverity('error');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      setAlertMessage(error.message || 'Failed to approve documents. Please try again.');
      setAlertSeverity('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartTrip = async (data?: { startOdometer: number; pickupNotes?: string }) => {
    // If called directly without data, open pre-trip modal instead
    if (!data) {
      setPreTripModalOpen(true);
      return;
    }

    // Called from pre-trip modal with odometer data
    setIsSubmitting(true);
    try {
      await actions.startTrip(booking.id, data.startOdometer, data.pickupNotes);
      setAlertMessage('Trip started successfully!');
      setAlertSeverity('success');
      setPreTripModalOpen(false);
      actions.refreshBooking?.();
    } catch (error: any) {
      setAlertMessage(error.message || 'Cannot start trip: Documents not verified. Please verify documents first.');
      setAlertSeverity('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* MAIN DETAILS MODAL */}
      <MuiDialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <MuiDialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
          <Stack>
            <Typography variant="h6" component="span" fontWeight={800}>
              Control Center: #{booking.id.slice(-6).toUpperCase()}
            </Typography>
            {isCourtesy && <MuiChip label="COURTESY CAR (NO FEE)" color="secondary" size="small" sx={{ fontWeight: 700, mt: 0.5, width: 'fit-content' }} />}
          </Stack>
          <IconButton onClick={onClose}><Close /></IconButton>
        </MuiDialogTitle>
        <Divider />
        <MuiDialogContent sx={{ p: 4, bgcolor: '#F8FAFC' }}>
          <Grid container spacing={4}>
            {/* LEFT COLUMN: DETAILS */}
            <Grid item xs={12} md={7}>
              <Stack spacing={3}>
                {/* 1. Customer & Car */}
                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0' }}>
                   <Typography variant="subtitle2" color="primary" fontWeight={800} mb={2}>DETAILS</Typography>
                   <Stack direction="row" justifyContent="space-between">
                     <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: '#F1F5F9', color: '#475569' }}><Person /></Avatar>
                        <Box>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography fontWeight={700}>{displayName}</Typography>
                            {isWalkIn && <MuiChip label="WALK-IN" size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />}
                          </Stack>
                          <Typography variant="body2" color="text.secondary">{displayPhone || 'N/A'}</Typography>
                          <Typography variant="caption" color="text.secondary" display="block">{displayEmail || ''}</Typography>
                        </Box>
                     </Stack>
                     <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: '#F1F5F9', color: '#475569' }}><DirectionsCar /></Avatar>
                        <Box>
                          <Typography fontWeight={700}>{booking.car?.brand?.name} {booking.car?.model?.name}</Typography>
                          <Typography variant="body2" color="text.secondary">{booking.car?.plateNumber}</Typography>
                        </Box>
                     </Stack>
                   </Stack>
                </Paper>

                {/* 2. Documents Viewer */}
                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0' }}>
                  <Typography variant="subtitle2" color="primary" fontWeight={800} mb={2}>VERIFICATION DOCUMENTS</Typography>
                  {userDocs ? (
                    <>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="caption" fontWeight={700}>LICENSE FRONT</Typography>
                          <Box sx={{ height: 120, bgcolor: '#F1F5F9', borderRadius: 2, mt: 1, overflow: 'hidden', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                            {userDocs.licenseFrontUrl ? (
                              <Box
                                sx={{ 
                                  position: 'relative',
                                  width: '100%',
                                  height: '100%',
                                  cursor: 'pointer',
                                  '&:hover': { opacity: 0.8 }
                                }}
                                onClick={() => handleOpenImage(userDocs.licenseFrontUrl, 'License Front')}
                              >
                                <Image 
                                  src={userDocs.licenseFrontUrl} 
                                  alt="License Front" 
                                  fill
                                  style={{ objectFit: 'cover' }}
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                  loading="lazy"
                                />
                              </Box>
                            ) : <Typography variant="caption">N/A</Typography>}
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                           <Typography variant="caption" fontWeight={700}>LICENSE BACK</Typography>
                           <Box sx={{ height: 120, bgcolor: '#F1F5F9', borderRadius: 2, mt: 1, overflow: 'hidden', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                            {userDocs.licenseBackUrl ? (
                              <Box
                                sx={{ 
                                  position: 'relative',
                                  width: '100%',
                                  height: '100%',
                                  cursor: 'pointer',
                                  '&:hover': { opacity: 0.8 }
                                }}
                                onClick={() => handleOpenImage(userDocs.licenseBackUrl, 'License Back')}
                              >
                                <Image 
                                  src={userDocs.licenseBackUrl} 
                                  alt="License Back" 
                                  fill
                                  style={{ objectFit: 'cover' }}
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                  loading="lazy"
                                />
                              </Box>
                            ) : <Typography variant="caption">N/A</Typography>}
                           </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" fontWeight={700}>ID CARD FRONT</Typography>
                          <Box sx={{ height: 120, bgcolor: '#F1F5F9', borderRadius: 2, mt: 1, overflow: 'hidden', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                            {userDocs.idCardUrl ? (
                              <Box
                                sx={{ 
                                  position: 'relative',
                                  width: '100%',
                                  height: '100%',
                                  cursor: 'pointer',
                                  '&:hover': { opacity: 0.8 }
                                }}
                                onClick={() => handleOpenImage(userDocs.idCardUrl, 'ID Card Front')}
                              >
                                <Image 
                                  src={userDocs.idCardUrl} 
                                  alt="ID Card Front" 
                                  fill
                                  style={{ objectFit: 'cover' }}
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                  loading="lazy"
                                />
                              </Box>
                            ) : <Typography variant="caption">N/A</Typography>}
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" fontWeight={700}>ID CARD BACK</Typography>
                          <Box sx={{ height: 120, bgcolor: '#F1F5F9', borderRadius: 2, mt: 1, overflow: 'hidden', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                            {userDocs.idCardBackUrl ? (
                              <Box
                                sx={{ 
                                  position: 'relative',
                                  width: '100%',
                                  height: '100%',
                                  cursor: 'pointer',
                                  '&:hover': { opacity: 0.8 }
                                }}
                                onClick={() => handleOpenImage(userDocs.idCardBackUrl, 'ID Card Back')}
                              >
                                <Image 
                                  src={userDocs.idCardBackUrl} 
                                  alt="ID Card Back" 
                                  fill
                                  style={{ objectFit: 'cover' }}
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                  loading="lazy"
                                />
                              </Box>
                            ) : <Typography variant="caption">N/A</Typography>}
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="caption" fontWeight={700}>ADDRESS PROOF</Typography>
                          <Box sx={{ height: 120, bgcolor: '#F1F5F9', borderRadius: 2, mt: 1, overflow: 'hidden', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                            {userDocs.addressProofUrl ? (
                              <Box
                                sx={{ 
                                  position: 'relative',
                                  width: '100%',
                                  height: '100%',
                                  cursor: 'pointer',
                                  '&:hover': { opacity: 0.8 }
                                }}
                                onClick={() => handleOpenImage(userDocs.addressProofUrl, 'Address Proof')}
                              >
                                <Image 
                                  src={userDocs.addressProofUrl} 
                                  alt="Address Proof" 
                                  fill
                                  style={{ objectFit: 'cover' }}
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                  loading="lazy"
                                />
                              </Box>
                            ) : <Typography variant="caption">N/A</Typography>}
                          </Box>
                        </Grid>
                      </Grid>
                      
                      {/* Driver Details Section */}
                      <Box sx={{ mt: 3, p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                        <Typography variant="subtitle2" fontWeight={800} mb={2} color="primary">DRIVER DETAILS</Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">Date of Birth</Typography>
                            <Typography variant="body2">{userDocs.driverDob ? formatDateForDisplay(userDocs.driverDob) : 'N/A'}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">License Issue Date</Typography>
                            <Typography variant="body2">{userDocs.licenseIssueDate ? formatDateForDisplay(userDocs.licenseIssueDate) : 'N/A'}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">License Expiry</Typography>
                            <Typography variant="body2">{userDocs.licenseExpiry ? formatDateForDisplay(userDocs.licenseExpiry) : 'N/A'}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">License Number</Typography>
                            <Typography variant="body2">{userDocs.licenseNumber || 'N/A'}</Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">License Categories</Typography>
                            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {userDocs.licenseCategories && userDocs.licenseCategories.length > 0 ? (
                                userDocs.licenseCategories.map((cat: string) => (
                                  <MuiChip key={cat} label={cat} size="small" variant="outlined" sx={{ fontSize: '0.7rem', fontWeight: 700 }} />
                                ))
                              ) : (
                                <Typography variant="body2" color="text.secondary">N/A</Typography>
                              )}
                            </Box>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">Verified Address</Typography>
                            <Typography variant="body2">{userDocs.verifiedAddress || 'N/A'}</Typography>
                          </Grid>
                        </Grid>
                      </Box>
                      
                      {/* Verification Status and Actions */}
                      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="caption" fontWeight={700} color="text.secondary">VERIFICATION STATUS</Typography>
                          <Box sx={{ mt: 1 }}>
                            <MuiChip 
                              label={userDocs.status} 
                              size="small" 
                              color={userDocs.status === 'APPROVED' ? 'success' : userDocs.status === 'PENDING' ? 'warning' : 'error'}
                              icon={userDocs.status === 'APPROVED' ? <CheckCircleIcon /> : <VisibilityIcon />}
                            />
                          </Box>
                        </Box>
                        {userDocs.status === 'PENDING' && (
                          <MuiButton 
                            variant="contained" 
                            color="success"
                            size="small"
                            startIcon={<CheckCircleIcon />}
                            onClick={handleVerifyDocuments}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? 'Approving...' : 'Approve Documents'}
                          </MuiButton>
                        )}
                      </Box>
                    </>
                  ) : (
                    <MuiAlert severity="warning">{isWalkIn ? 'Walk-in booking: no account-linked verification' : 'No verification documents linked to this user.'}</MuiAlert>
                  )}
                </Paper>
              </Stack>
            </Grid>

            {/* RIGHT COLUMN: ACTIONS & FINANCIALS */}
            <Grid item xs={12} md={5}>
              <Stack spacing={3}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0' }}>
                   <Typography variant="subtitle2" color="primary" fontWeight={800} mb={2}>FINANCIAL SUMMARY</Typography>
                   <Stack spacing={1}>
                      <Box display="flex" justifyContent="space-between">
                         <Typography color="text.secondary">Rental Type</Typography>
                         <Typography fontWeight={700}>{booking.bookingType}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                         <Typography color="text.secondary">Total Price</Typography>
                         <Typography fontWeight={700} color={isCourtesy ? 'success.main' : 'inherit'}>
                           {isCourtesy ? '€0.00' : `€${booking.totalPrice?.toFixed(2)}`}
                         </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                         <Typography color="text.secondary">Payment Status</Typography>
                         <MuiChip label={booking.payment?.status || 'PENDING'} size="small" color={booking.payment?.status === 'SUCCEEDED' ? 'success' : 'default'} />
                      </Box>
                   </Stack>
                </Paper>

                {/* Start Trip Action */}
                {booking.status === 'CONFIRMED' && (
                  <MuiButton 
                    variant="contained" 
                    color="success" 
                    fullWidth 
                    size="large" 
                    startIcon={<StartTripIcon />}
                    onClick={() => handleStartTrip()}
                    disabled={isSubmitting}
                    sx={{ borderRadius: 3, bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' } }}
                  >
                    {isSubmitting ? 'Starting...' : 'Start Trip'}
                  </MuiButton>
                )}

                {/* Cancel Action */}
                {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                  <MuiButton 
                    variant="outlined" 
                    color="error" 
                    fullWidth 
                    size="large" 
                    startIcon={<BlockIcon />}
                    onClick={() => setCancelDialogOpen(true)}
                    sx={{ borderRadius: 3, border: '2px solid' }}
                  >
                    Cancel Booking & Refund
                  </MuiButton>
                )}
              </Stack>
            </Grid>
          </Grid>
        </MuiDialogContent>
      </MuiDialog>

      {/* CANCELLATION REASON DIALOG */}
      <MuiDialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
        <MuiDialogTitle>Cancel Booking #{booking.id.slice(-6).toUpperCase()}</MuiDialogTitle>
        <MuiDialogContent>
           <MuiAlert severity="warning" sx={{ mb: 2 }}>
             {booking.payment?.status === 'SUCCEEDED' 
               ? "User has paid. This action will trigger a mock refund process."
               : "User has not paid yet. This will simply cancel the reservation."}
           </MuiAlert>
           <MuiTextField
             autoFocus
             margin="dense"
             label="Reason for Cancellation"
             fullWidth
             multiline
             rows={3}
             value={cancelReason}
             onChange={(e) => setCancelReason(e.target.value)}
             placeholder="E.g., Customer request, Car unavailable, Force Majeure..."
           />
        </MuiDialogContent>
        <MuiDialogActions sx={{ p: 3 }}>
          <MuiButton onClick={() => setCancelDialogOpen(false)} disabled={isSubmitting}>Back</MuiButton>
          <MuiButton 
            onClick={handleConfirmCancel} 
            variant="contained" 
            color="error" 
            disabled={!cancelReason || isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Confirm Cancellation"}
          </MuiButton>
        </MuiDialogActions>
      </MuiDialog>

      {/* Alert Snackbar */}
      <Snackbar 
        open={!!alertMessage} 
        autoHideDuration={6000} 
        onClose={() => setAlertMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert onClose={() => setAlertMessage('')} severity={alertSeverity} sx={{ width: '100%' }}>
          {alertMessage}
        </MuiAlert>
      </Snackbar>

      {/* Pre-Trip Modal */}
      <PreTripModal 
        open={preTripModalOpen}
        onClose={() => setPreTripModalOpen(false)}
        booking={booking}
        onConfirm={handleStartTrip}
      />

      {/* Image Viewer Modal */}
      <ImageViewerModal 
        open={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
        imageUrl={selectedImage.url}
        title={selectedImage.title}
      />
    </>
  );
};