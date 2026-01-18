'use client';

import React from 'react';
import Image from 'next/image';
import {
  Box, Container, Typography, Paper, Grid, Button, TextField,
  Card, Stack, Divider, Alert, CircularProgress, Chip, Dialog, 
  DialogContent, MenuItem, IconButton, CardActionArea, Snackbar
} from '@mui/material';
import {
  Settings, LocalGasStation, ArrowBack, Edit, 
  EventSeat, ContentCopy, CalendarMonth, LocationOn, Shield, 
  Close, CheckCircle
} from '@mui/icons-material';
import QRCode from 'react-qr-code';

export const BookingView = ({
  router, car, startDate, setStartDate, startTime, setStartTime, 
  endDate, setEndDate, endTime, setEndTime, generateTimeOptions, getMinPickupDate,
  checkingAvailability, isCarAvailable, hasDates, priceDetails, 
  platformData, createBookingLoading, confirmReservationLoading, updateBookingLoading,
  changeCarDialog, setChangeCarDialog, availableCarsLoading, availableCarsData, startDateTime, endDateTime,
  validationError, emailVerificationPopup, confirmedBookingData, verificationTimer, copySuccess, handleCopyLink, onConfirmAction,
  isEditMode, isAdmin, bookingType, setBookingType, isWalkIn, setIsWalkIn, guestName, setGuestName, guestPhone, setGuestPhone, guestEmail, setGuestEmail // Received from container
 }: any) => {

  // Logic based on isEditMode prop
  const backButtonRoute = isEditMode ? '/bookingRecords' : '/cars';
  const backButtonText = isEditMode ? 'Back to Records' : 'Back to Fleet';
  const mainActionButtonText = isEditMode ? 'Update Booking' : (isAdmin && isWalkIn ? 'Save Walk-In' : 'Confirm Reservation');

  const walkInMissing = isAdmin && isWalkIn && (!guestName?.trim() || !guestPhone?.trim());

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 12 }}>
      <Container maxWidth="xl" sx={{ }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Stack 
            direction="row" 
            alignItems="center" 
            spacing={1} 
            onClick={() => router.push(backButtonRoute)} 
            sx={{ cursor: 'pointer', color: '#64748B' }}
          >
            <ArrowBack fontSize="small" /> <Typography fontWeight={600}>{backButtonText}</Typography>
          </Stack>
          <Typography variant="h5" fontWeight={800} color="#0F172A">
            {isEditMode ? 'Modify Reservation' : 'Secure Checkout'}
          </Typography>
          <Box width={50} />
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={7} lg={8}>
            <Stack spacing={4}>
              {/* 1. DATE SELECTOR */}
              <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'white', border: '1px solid #E2E8F0' }}>
                <Box display="flex" justifyContent="space-between" mb={3}>
                   <Typography variant="h6" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                     <CalendarMonth sx={{ color: '#7C3AED' }} /> Trip Dates
                   </Typography>
                   {checkingAvailability && <Chip size="small" label="Checking availability..." />}
                </Box>
                <Grid container spacing={4}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" fontWeight={700} color="#64748B" mb={1} display="block">PICK-UP</Typography>
                    <Stack direction="row" spacing={1}>
                      <TextField type="date" fullWidth value={startDate} onChange={(e) => setStartDate(e.target.value)} size="small" inputProps={{ min: getMinPickupDate() }} />
                      <TextField select value={startTime} onChange={(e) => setStartTime(e.target.value)} size="small" sx={{ minWidth: 100 }}>
                        {generateTimeOptions().map((t: string) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                      </TextField>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" fontWeight={700} color="#64748B" mb={1} display="block">DROP-OFF</Typography>
                    <Stack direction="row" spacing={1}>
                      <TextField type="date" fullWidth value={endDate} onChange={(e) => setEndDate(e.target.value)} size="small" inputProps={{ min: startDate }} />
                      <TextField select value={endTime} onChange={(e) => setEndTime(e.target.value)} size="small" sx={{ minWidth: 100 }}>
                         {generateTimeOptions().map((t: string) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                      </TextField>
                    </Stack>
                  </Grid>
                </Grid>
                {validationError && (
                  <Alert severity="warning" sx={{ mt: 3 }}>
                    {validationError}
                  </Alert>
                )}
                {!isCarAvailable && hasDates && (
                  <Alert severity="error" sx={{ mt: 3 }} action={<Button color="error" size="small" onClick={() => setChangeCarDialog(true)}>Change Car</Button>}>
                    Car Unavailable for selected dates.
                  </Alert>
                )}
              </Paper>

              {/* 2. VEHICLE INFO */}
              <Paper elevation={0} sx={{ borderRadius: 4, bgcolor: 'white', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <Typography variant="h6" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                     <LocationOn sx={{ color: '#7C3AED' }} /> Selected Vehicle
                   </Typography>
                   <Button startIcon={<Edit />} size="small" onClick={() => setChangeCarDialog(true)} sx={{ color: '#7C3AED', fontWeight: 700 }}>Change</Button>
                </Box>
                <Grid container alignItems="center">
                   <Grid item xs={12} md={5} sx={{ bgcolor: '#F8FAFC', p: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 220, position: 'relative' }}>
                      <Image 
                        src={car?.images?.[0]?.url} 
                        alt="car" 
                        fill
                        style={{ objectFit: 'contain' }}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={true}
                      />
                   </Grid>
                   <Grid item xs={12} md={7} sx={{ p: 4 }}>
                      <Typography variant="overline" color="primary" fontWeight={800}>{car?.brand?.name}</Typography>
                      <Typography variant="h4" fontWeight={900} color="#0F172A" sx={{ mb: 2 }}>{car?.model?.name}</Typography>
                      <Stack direction="row" spacing={1} mb={3}>
                         <Chip label={car?.transmission} size="small" icon={<Settings sx={{fontSize:14}}/>} />
                         <Chip label={car?.fuelType} size="small" icon={<LocalGasStation sx={{fontSize:14}}/>} />
                         <Chip label={`${car?.seats} Seats`} size="small" icon={<EventSeat sx={{fontSize:14}}/>} />
                      </Stack>
                      <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
                      <Box display="flex" gap={4}>
                        <Box><Typography variant="caption" color="text.secondary">Daily Limit</Typography><Typography fontWeight={700}>{car?.dailyKmLimit || 'Unlimited'} KM</Typography></Box>
                        <Box><Typography variant="caption" color="text.secondary">Deposit</Typography><Typography fontWeight={700}>€{car?.depositAmount}</Typography></Box>
                      </Box>
                   </Grid>
                </Grid>
              </Paper>
            </Stack>
          </Grid>

          {/* RIGHT COLUMN */}
          <Grid item xs={12} md={5} lg={4}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'white', border: '1px solid #E2E8F0', position: 'sticky', top: 100 }}>
               <Typography variant="h6" fontWeight={800} mb={3}>Payment Summary</Typography>

               {isAdmin && (
                 <Box sx={{ mb: 3, p: 2, border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#F8FAFC' }}>
                   <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                     <Chip label="Admin" size="small" color="primary" />
                    <Typography fontWeight={700}>Admin Booking Options</Typography>
                   </Stack>
                   <Stack spacing={1.5}>
                    <TextField
                      size="small"
                      select
                      label="Booking Type"
                      value={bookingType}
                      onChange={(e) => setBookingType(e.target.value)}
                      fullWidth
                    >
                      <MenuItem value="RENTAL">Rental</MenuItem>
                      <MenuItem value="REPLACEMENT">Courtesy</MenuItem>
                    </TextField>

                     <Stack direction="row" alignItems="center" spacing={1}>
                       <input type="checkbox" checked={isWalkIn} onChange={(e) => setIsWalkIn(e.target.checked)} aria-label="Walk-in toggle" />
                       <Typography variant="body2">Mark as walk-in (no customer account)</Typography>
                     </Stack>
                     {isWalkIn && (
                       <Stack spacing={1}>
                         <TextField size="small" label="Guest Name" value={guestName} onChange={(e) => setGuestName(e.target.value)} fullWidth />
                         <TextField size="small" label="Guest Phone" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} fullWidth />
                         <TextField size="small" label="Guest Email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} fullWidth />
                         {walkInMissing && <Alert severity="warning" sx={{ mt: 1 }}>Guest name and phone are required.</Alert>}
                       </Stack>
                     )}
                   </Stack>
                 </Box>
               )}

               {priceDetails ? (
                 <Stack spacing={2.5}>
                    <Box display="flex" justifyContent="space-between"><Typography color="text.secondary">Rental ({priceDetails.durationLabel})</Typography><Typography fontWeight={700}>€{priceDetails.basePrice.toFixed(2)}</Typography></Box>
                    <Box display="flex" justifyContent="space-between"><Typography color="text.secondary">VAT ({platformData?.platformSettings?.taxPercentage || 20}%)</Typography><Typography fontWeight={700}>€{priceDetails.taxAmount.toFixed(2)}</Typography></Box>
                    <Divider sx={{ borderStyle: 'dashed' }} />
                    <Box display="flex" justifyContent="space-between" alignItems="flex-end"><Typography variant="h6" fontWeight={800}>Total</Typography><Typography variant="h4" fontWeight={800} color="#7C3AED">€{priceDetails.totalPrice.toFixed(2)}</Typography></Box>
                    <Box sx={{ p: 2, bgcolor: '#F0FDF4', borderRadius: 2, border: '1px solid #BBF7D0', display: 'flex', gap: 1 }}>
                       <Shield sx={{ color: '#16A34A', fontSize: 20 }} />
                       <Typography variant="caption" color="#15803D" fontWeight={500} lineHeight={1.4}>
                         No charge now. Payment collected after verification.
                       </Typography>
                    </Box>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      size="large" 
                      onClick={onConfirmAction} 
                      disabled={!isCarAvailable || !!validationError || createBookingLoading || confirmReservationLoading || updateBookingLoading || walkInMissing} 
                      sx={{ mt: 1, bgcolor: '#0F172A', py: 1.5, fontWeight: 800 }}
                    >
                      {mainActionButtonText}
                    </Button>
                 </Stack>
               ) : (
                 <Box textAlign="center" py={4} color="text.secondary">Select dates to view price breakdown.</Box>
               )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* CHANGE CAR MODAL */}
      <Dialog open={changeCarDialog} onClose={() => setChangeCarDialog(false)} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9' }}>
           <Typography variant="h6" fontWeight={800} color="#0F172A">Available Cars for These Dates</Typography>
           <IconButton onClick={() => setChangeCarDialog(false)}><Close /></IconButton>
        </Box>
        <DialogContent sx={{ p: 4 }}>
           {availableCarsLoading ? <CircularProgress /> : (
             <Grid container spacing={3}>
                {availableCarsData?.availableCars?.map((c: any) => (
                  <Grid item xs={12} sm={6} md={4} key={c.id}>
                     <Card variant="outlined" sx={{ borderRadius: 4 }} onClick={() => router.push(`/booking?carId=${c.id}&start=${startDateTime}&end=${endDateTime}`)}>
                        <CardActionArea sx={{ p: 2 }}>
                          <Box sx={{ height: 140, display: 'flex', justifyContent: 'center', position: 'relative' }}>
                            <Image 
                              src={c.images?.[0]?.url} 
                              alt="car" 
                              fill
                              style={{ objectFit: 'contain' }}
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              loading="lazy"
                            />
                          </Box>
                          <Typography fontWeight={900} mt={2}>{c.model.name}</Typography>
                          <Typography variant="h6" color="primary" fontWeight={800}>€{c.pricePerDay}/day</Typography>
                        </CardActionArea>
                     </Card>
                  </Grid>
                ))}
             </Grid>
           )}
        </DialogContent>
      </Dialog>

      {/* VERIFICATION MODAL */}
      <Dialog open={emailVerificationPopup} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }} onClose={()=>{}}>
        <Grid container>
          <Grid item xs={12} md={5} sx={{ bgcolor: '#7C3AED', p: 5, color: 'white' }}>
             <CheckCircle sx={{ fontSize: 60, mb: 3 }} />
             <Typography variant="h4" fontWeight={900} gutterBottom>Booking Saved!</Typography>
             <Typography sx={{ opacity: 0.9 }}>Complete verification to secure your car.</Typography>
             <Box sx={{ mt: 5, p: 3, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 4, textAlign: 'center' }}>
                <Typography variant="caption">TIME REMAINING</Typography>
                <Typography variant="h2" fontWeight={900} sx={{ fontFamily: 'monospace' }}>{verificationTimer}</Typography>
             </Box>
          </Grid>
          <Grid item xs={12} md={7} sx={{ p: 6, textAlign: 'center' }}>
             {confirmedBookingData?.verification?.token && <Box sx={{ p: 2, border: '2px solid #F1F5F9', borderRadius: 4, display: 'inline-block' }}><QRCode value={`${window.location.origin}/verification/${confirmedBookingData.verification.token}`} size={180} /></Box>}
             <Stack spacing={2} sx={{ mt: 4, maxWidth: 320, mx: 'auto' }}>
                <Button fullWidth variant="contained" size="large" onClick={handleCopyLink} startIcon={<ContentCopy />} sx={{ py: 2, borderRadius: 10, bgcolor: '#0F172A' }}>{copySuccess ? 'Copied!' : 'Copy Verification Link'}</Button>
                <Button fullWidth variant="outlined" size="large" onClick={() => router.push('/bookingRecords')} sx={{ py: 2, borderRadius: 10 }}>Go to Booking Records</Button>
             </Stack>
          </Grid>
        </Grid>
      </Dialog>
      <Snackbar open={copySuccess} autoHideDuration={2000} onClose={() => {}} message="Link copied!" />
    </Box>
  );
};