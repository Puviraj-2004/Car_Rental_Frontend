'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Stack,
  Divider,
  Button,
  Chip,
  Alert,
  Snackbar,
  Paper,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  ArrowBack,
  PlayArrow,
  Cancel,
  VerifiedUser,
  Schedule,
  DirectionsCar,
  Person,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Info,
} from '@mui/icons-material';
import { formatDateForDisplay } from '@/lib/dateUtils';
import { PreTripModal } from './PreTripModal';

// ============================================================================
// TYPES
// ============================================================================
interface AdminBookingDetailsViewProps {
  booking: any;
  actions: any;
  onBack: () => void;
}

// ============================================================================
// STATUS CONFIGURATIONS
// ============================================================================
const STATUS_CONFIG: Record<string, { color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'; label: string }> = {
  DRAFT: { color: 'default', label: 'Draft' },
  PENDING: { color: 'warning', label: 'Pending' },
  VERIFIED: { color: 'info', label: 'Verified' },
  CONFIRMED: { color: 'primary', label: 'Confirmed' },
  ONGOING: { color: 'secondary', label: 'Ongoing' },
  COMPLETED: { color: 'success', label: 'Completed' },
  CANCELLED: { color: 'error', label: 'Cancelled' },
  REJECTED: { color: 'error', label: 'Rejected' },
  EXPIRED: { color: 'default', label: 'Expired' },
};

const PAYMENT_STATUS_CONFIG: Record<string, { color: 'default' | 'success' | 'error' | 'warning'; icon: React.ReactElement }> = {
  PENDING: { color: 'warning', icon: <Schedule fontSize="small" /> },
  SUCCEEDED: { color: 'success', icon: <CheckCircle fontSize="small" /> },
  FAILED: { color: 'error', icon: <ErrorIcon fontSize="small" /> },
  REFUNDED: { color: 'default', icon: <Info fontSize="small" /> },
};

const DOC_STATUS_CONFIG: Record<string, { color: 'success' | 'warning' | 'error'; icon: React.ReactElement; label: string }> = {
  APPROVED: { color: 'success', icon: <CheckCircle fontSize="small" />, label: 'Verified' },
  PENDING: { color: 'warning', icon: <Warning fontSize="small" />, label: 'Pending Review' },
  REJECTED: { color: 'error', icon: <ErrorIcon fontSize="small" />, label: 'Rejected' },
  NOT_UPLOADED: { color: 'warning', icon: <Warning fontSize="small" />, label: 'Not Uploaded' },
};

// ============================================================================
// REUSABLE COMPONENTS
// ============================================================================

const InfoCard = ({ title, icon, children, action }: { title: string; icon: React.ReactNode; children: React.ReactNode; action?: React.ReactNode }) => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'divider',
      overflow: 'hidden',
    }}
  >
    <Box
      sx={{
        px: 3,
        py: 2,
        bgcolor: 'grey.50',
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
        <Typography variant="subtitle1" fontWeight={700}>
          {title}
        </Typography>
      </Stack>
      {action}
    </Box>
    <Box sx={{ p: 3 }}>{children}</Box>
  </Paper>
);

const DataRow = ({ label, value, valueColor }: { label: string; value: React.ReactNode; valueColor?: string }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={600} color={valueColor || 'text.primary'} sx={{ textAlign: 'right' }}>
      {value || '—'}
    </Typography>
  </Box>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export const AdminBookingDetailsView = ({ booking, actions, onBack }: AdminBookingDetailsViewProps) => {
  const router = useRouter();

  // State
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' | 'info' }>({
    open: false,
    message: '',
    severity: 'info',
  });
  const [preTripModalOpen, setPreTripModalOpen] = useState(false);

  // Derived data
  const bookingRef = booking.id?.slice(-6).toUpperCase() || 'N/A';
  const isCourtesy = booking.bookingType === 'REPLACEMENT';
  const isWalkIn = booking.isWalkIn;
  const customerName = booking.guestName || booking.user?.fullName || 'Guest Customer';
  const customerPhone = booking.guestPhone || booking.user?.phoneNumber || '—';
  const customerEmail = booking.guestEmail || booking.user?.email || '—';
  const customerId = booking.user?.id?.slice(-8).toUpperCase() || (isWalkIn ? 'WALK-IN' : '—');

  const docStatus = booking.documentVerification?.status || 'NOT_UPLOADED';
  const isDocVerified = docStatus === 'APPROVED';
  const canStartTrip = booking.status === 'CONFIRMED' && (isDocVerified || isWalkIn || isCourtesy);
  const canCancel = !['CANCELLED', 'REJECTED', 'EXPIRED', 'COMPLETED', 'ONGOING'].includes(booking.status);

  const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.DRAFT;
  const paymentConfig = PAYMENT_STATUS_CONFIG[booking.payment?.status] || PAYMENT_STATUS_CONFIG.PENDING;
  const docConfig = DOC_STATUS_CONFIG[docStatus] || DOC_STATUS_CONFIG.NOT_UPLOADED;

  // Format created date with time
  const formatCreatedDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'N/A';
      const day = date.getUTCDate();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[date.getUTCMonth()];
      const year = date.getUTCFullYear();
      const hours = date.getUTCHours().toString().padStart(2, '0');
      const mins = date.getUTCMinutes().toString().padStart(2, '0');
      return `${day} ${month} ${year}, ${hours}:${mins}`;
    } catch {
      return 'N/A';
    }
  };

  // Handlers
  const handleStartTrip = async (data?: { startOdometer: number; pickupNotes?: string }) => {
    if (!data) {
      setPreTripModalOpen(true);
      return;
    }
    setIsSubmitting(true);
    try {
      await actions.startTrip(booking.id, data.startOdometer, data.pickupNotes);
      setSnackbar({ open: true, message: 'Trip started successfully!', severity: 'success' });
      setPreTripModalOpen(false);
      actions.refreshBooking?.();
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'Failed to start trip', severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDocuments = () => {
    router.push(`/admin/bookings/${booking.id}/documents`);
  };

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) return;
    setIsSubmitting(true);
    try {
      const success = await actions.cancelBooking(booking.id, cancelReason);
      if (success) {
        setSnackbar({ open: true, message: 'Booking cancelled successfully', severity: 'success' });
        setCancelDialogOpen(false);
        setTimeout(() => {
          actions.refreshBooking?.();
        }, 1000);
      }
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'Failed to cancel booking', severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 3 }}>
        <Container maxWidth="lg">
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="text"
                startIcon={<ArrowBack />}
                onClick={onBack}
                sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                Back
              </Button>
              <Divider orientation="vertical" flexItem sx={{ bgcolor: 'grey.700' }} />
              <Typography variant="h5" fontWeight={700}>
                Booking #{bookingRef}
              </Typography>
              <Chip label={statusConfig.label} color={statusConfig.color} size="small" sx={{ fontWeight: 600 }} />
              {isCourtesy && <Chip label="Courtesy" size="small" sx={{ bgcolor: 'secondary.main', color: 'white' }} />}
              {isWalkIn && <Chip label="Walk-in" size="small" sx={{ bgcolor: 'info.main', color: 'white' }} />}
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={3}>
          {/* Action Bar - Desktop */}
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', display: { xs: 'none', md: 'block' } }}>
            <Stack direction="row" spacing={2} justifyContent="flex-end" alignItems="center">
              {!isWalkIn && (
                <Button variant="outlined" startIcon={<VerifiedUser />} onClick={handleViewDocuments}>
                  View / Verify Documents
                </Button>
              )}
              {canCancel && (
                <Button variant="outlined" color="error" startIcon={<Cancel />} onClick={() => setCancelDialogOpen(true)}>
                  Cancel Booking
                </Button>
              )}
              {booking.status === 'CONFIRMED' && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<PlayArrow />}
                  onClick={() => handleStartTrip()}
                  disabled={!canStartTrip || isSubmitting}
                  sx={{ minWidth: 140 }}
                >
                  {isSubmitting ? 'Starting...' : 'Start Trip'}
                </Button>
              )}
            </Stack>
            {booking.status === 'CONFIRMED' && !canStartTrip && (
              <Typography variant="caption" color="warning.main" sx={{ display: 'block', textAlign: 'right', mt: 1 }}>
                Documents must be verified before starting trip
              </Typography>
            )}
          </Paper>

          {/* Main Content Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            {/* Booking Details */}
            <InfoCard title="Booking Details" icon={<Schedule />}>
              <Stack spacing={0} divider={<Divider />}>
                <DataRow label="Booking Reference" value={bookingRef} />
                <DataRow label="Booking Type" value={isCourtesy ? 'Courtesy / Replacement' : 'Standard Rental'} />
                <DataRow label="Created" value={formatCreatedDate(booking.createdAt)} />
                <Box sx={{ py: 2 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Box sx={{ flex: 1, p: 2, bgcolor: 'success.50', borderRadius: 1.5, border: '1px solid', borderColor: 'success.200' }}>
                      <Typography variant="caption" color="success.dark" fontWeight={700}>PICK-UP</Typography>
                      <Typography variant="body1" fontWeight={700}>{formatDateForDisplay(booking.startDate)}</Typography>
                      <Typography variant="body2" color="text.secondary">{booking.pickupTime || '—'}</Typography>
                    </Box>
                    <Box sx={{ flex: 1, p: 2, bgcolor: 'error.50', borderRadius: 1.5, border: '1px solid', borderColor: 'error.200' }}>
                      <Typography variant="caption" color="error.dark" fontWeight={700}>DROP-OFF</Typography>
                      <Typography variant="body1" fontWeight={700}>{formatDateForDisplay(booking.endDate)}</Typography>
                      <Typography variant="body2" color="text.secondary">{booking.returnTime || '—'}</Typography>
                    </Box>
                  </Stack>
                </Box>
                <DataRow
                  label="Payment Status"
                  value={
                    <Chip icon={paymentConfig.icon} label={booking.payment?.status || 'PENDING'} color={paymentConfig.color} size="small" sx={{ fontWeight: 600 }} />
                  }
                />
                <DataRow
                  label="Total Amount"
                  value={isCourtesy ? '€0.00 (Courtesy)' : `€${booking.totalPrice?.toFixed(2) || '0.00'}`}
                  valueColor={isCourtesy ? 'success.main' : 'primary.main'}
                />
              </Stack>
            </InfoCard>

            {/* Customer Information */}
            <InfoCard title="Customer Information" icon={<Person />}>
              <Stack spacing={0} divider={<Divider />}>
                <DataRow label="Name" value={customerName} />
                <DataRow label="Phone" value={customerPhone} />
                <DataRow label="Email" value={customerEmail} />
                <DataRow label="Customer ID" value={customerId} />
                <DataRow
                  label="Documents"
                  value={
                    <Chip icon={docConfig.icon} label={docConfig.label} color={docConfig.color} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                  }
                />
              </Stack>
            </InfoCard>

            {/* Vehicle Information */}
            <InfoCard title="Vehicle Information" icon={<DirectionsCar />}>
              <Stack spacing={0} divider={<Divider />}>
                <DataRow label="Vehicle" value={`${booking.car?.brand?.name || ''} ${booking.car?.model?.name || ''}`.trim() || '—'} />
                <DataRow label="Plate Number" value={booking.car?.plateNumber} />
                <DataRow label="Transmission" value={booking.car?.transmission} />
                <DataRow label="Fuel Type" value={booking.car?.fuelType} />
                <DataRow label="Seats" value={booking.car?.seats ? `${booking.car.seats} seats` : '—'} />
                <DataRow
                  label="Vehicle Status"
                  value={
                    <Chip
                      label={booking.car?.status || 'AVAILABLE'}
                      size="small"
                      color={booking.car?.status === 'AVAILABLE' ? 'success' : 'warning'}
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  }
                />
                {booking.startOdometer && <DataRow label="Start Odometer" value={`${booking.startOdometer.toLocaleString()} km`} />}
                {booking.endOdometer && <DataRow label="End Odometer" value={`${booking.endOdometer.toLocaleString()} km`} />}
              </Stack>
            </InfoCard>

            {/* Financial Summary - Only show if not courtesy */}
            {!isCourtesy && (
              <InfoCard title="Financial Summary" icon={<Schedule />}>
                <Stack spacing={0} divider={<Divider />}>
                  <DataRow label="Base Price" value={`€${booking.basePrice?.toFixed(2) || '0.00'}`} />
                  <DataRow label="Tax" value={`€${booking.taxAmount?.toFixed(2) || '0.00'}`} />
                  <DataRow label="Deposit" value={`€${booking.depositAmount?.toFixed(2) || '0.00'}`} />
                  {booking.extraKmFee > 0 && <DataRow label="Extra KM Fee" value={`€${booking.extraKmFee?.toFixed(2)}`} valueColor="error.main" />}
                  <Box sx={{ py: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1" fontWeight={700}>Total</Typography>
                      <Typography variant="h5" fontWeight={800} color="primary.main">
                        €{booking.totalPrice?.toFixed(2) || '0.00'}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </InfoCard>
            )}
          </Box>

          {/* Mobile Action Buttons */}
          <Paper
            elevation={3}
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              p: 2,
              display: { xs: 'block', md: 'none' },
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              zIndex: 1000,
            }}
          >
            <Stack spacing={1.5}>
              {booking.status === 'CONFIRMED' && (
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  size="large"
                  startIcon={<PlayArrow />}
                  onClick={() => handleStartTrip()}
                  disabled={!canStartTrip || isSubmitting}
                >
                  {isSubmitting ? 'Starting...' : 'Start Trip'}
                </Button>
              )}
              {!isWalkIn && (
                <Button variant="outlined" fullWidth startIcon={<VerifiedUser />} onClick={handleViewDocuments}>
                  View Documents
                </Button>
              )}
              {canCancel && (
                <Button variant="outlined" color="error" fullWidth startIcon={<Cancel />} onClick={() => setCancelDialogOpen(true)}>
                  Cancel Booking
                </Button>
              )}
            </Stack>
          </Paper>

          {/* Spacer for mobile fixed buttons */}
          <Box sx={{ height: { xs: 180, md: 0 } }} />
        </Stack>
      </Container>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Cancel Booking #{bookingRef}</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {booking.payment?.status === 'SUCCEEDED'
              ? 'Customer has paid. Cancellation will trigger a refund process.'
              : 'This will cancel the reservation. Customer will be notified.'}
          </Alert>
          <TextField
            autoFocus
            label="Reason for Cancellation"
            placeholder="E.g., Customer request, vehicle unavailable..."
            fullWidth
            multiline
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setCancelDialogOpen(false)} disabled={isSubmitting}>
            Back
          </Button>
          <Button variant="contained" color="error" onClick={handleCancelBooking} disabled={!cancelReason.trim() || isSubmitting}>
            {isSubmitting ? 'Cancelling...' : 'Confirm Cancellation'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pre-Trip Modal */}
      <PreTripModal open={preTripModalOpen} onClose={() => setPreTripModalOpen(false)} booking={booking} onConfirm={handleStartTrip} />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminBookingDetailsView;
