'use client';

import React, { useState } from 'react';
import Image from 'next/image';
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
  IconButton,
  Card,
  CardContent,
  CardMedia,
  Grid,
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  Cancel,
  Schedule,
  Person,
  Badge,
  CreditCard,
  Home,
  Warning,
  Error as ErrorIcon,
  ZoomIn,
  Close,
  Verified,
  DocumentScanner,
} from '@mui/icons-material';
import { formatDateForDisplay } from '@/lib/dateUtils';

// ============================================================================
// TYPES
// ============================================================================
interface AdminDocumentsViewProps {
  booking: any;
  actions: {
    approve: () => Promise<boolean>;
    reject: (reason: string) => Promise<boolean>;
    refresh: () => void;
  };
  onBack: () => void;
}

// ============================================================================
// STATUS CONFIGURATIONS
// ============================================================================
const DOC_STATUS_CONFIG: Record<string, { color: 'success' | 'warning' | 'error'; icon: React.ReactElement; label: string; bgcolor: string }> = {
  APPROVED: { color: 'success', icon: <CheckCircle />, label: 'Approved', bgcolor: 'success.50' },
  PENDING: { color: 'warning', icon: <Schedule />, label: 'Pending Review', bgcolor: 'warning.50' },
  REJECTED: { color: 'error', icon: <ErrorIcon />, label: 'Rejected', bgcolor: 'error.50' },
  NOT_UPLOADED: { color: 'warning', icon: <Warning />, label: 'Not Uploaded', bgcolor: 'grey.100' },
};

// ============================================================================
// DOCUMENT IMAGE CARD COMPONENT
// ============================================================================
interface DocumentCardProps {
  title: string;
  icon: React.ReactNode;
  imageUrl: string | null;
  onView: () => void;
}

const DocumentCard = ({ title, icon, imageUrl, onView }: DocumentCardProps) => (
  <Card
    elevation={0}
    sx={{
      border: '1px solid',
      borderColor: imageUrl ? 'divider' : 'grey.300',
      borderRadius: 2,
      overflow: 'hidden',
      height: '100%',
      bgcolor: imageUrl ? 'background.paper' : 'grey.50',
    }}
  >
    <Box
      sx={{
        px: 2,
        py: 1.5,
        bgcolor: 'grey.50',
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Box sx={{ color: imageUrl ? 'primary.main' : 'grey.400', display: 'flex' }}>{icon}</Box>
      <Typography variant="subtitle2" fontWeight={700} color={imageUrl ? 'text.primary' : 'text.secondary'}>
        {title}
      </Typography>
    </Box>
    {imageUrl ? (
      <CardMedia
        sx={{
          position: 'relative',
          height: 200,
          cursor: 'pointer',
          '&:hover .zoom-overlay': { opacity: 1 },
        }}
        onClick={onView}
      >
        <Image
          src={imageUrl}
          alt={title}
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, 300px"
        />
        <Box
          className="zoom-overlay"
          sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.2s',
          }}
        >
          <ZoomIn sx={{ color: 'white', fontSize: 40 }} />
        </Box>
      </CardMedia>
    ) : (
      <Box
        sx={{
          height: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.100',
        }}
      >
        <Typography variant="body2" color="text.disabled">
          Not uploaded
        </Typography>
      </Box>
    )}
  </Card>
);

// ============================================================================
// DATA ROW COMPONENT
// ============================================================================
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
// INFO CARD COMPONENT
// ============================================================================
const InfoCard = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
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
        gap: 1.5,
      }}
    >
      <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
      <Typography variant="subtitle1" fontWeight={700}>
        {title}
      </Typography>
    </Box>
    <Box sx={{ p: 3 }}>{children}</Box>
  </Paper>
);

// ============================================================================
// IMAGE VIEWER MODAL
// ============================================================================
interface ImageViewerProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
}

const ImageViewer = ({ open, onClose, imageUrl, title }: ImageViewerProps) => {
  const [scale, setScale] = useState(1);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button size="small" onClick={handleZoomOut} disabled={scale <= 0.5}>
            −
          </Button>
          <Typography variant="body2" sx={{ minWidth: 50, textAlign: 'center' }}>
            {Math.round(scale * 100)}%
          </Typography>
          <Button size="small" onClick={handleZoomIn} disabled={scale >= 3}>
            +
          </Button>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'grey.100', p: 2 }}>
        <Box
          sx={{
            transform: `scale(${scale})`,
            transition: 'transform 0.2s',
            transformOrigin: 'center',
          }}
        >
          <Image src={imageUrl} alt={title} width={800} height={600} style={{ maxWidth: '100%', height: 'auto', borderRadius: 8 }} />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export const AdminDocumentsView = ({ booking, actions, onBack }: AdminDocumentsViewProps) => {
  // State
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' | 'info' }>({
    open: false,
    message: '',
    severity: 'info',
  });
  const [imageViewer, setImageViewer] = useState<{ open: boolean; url: string; title: string }>({
    open: false,
    url: '',
    title: '',
  });

  // Derived data
  const bookingRef = booking.id?.slice(-6).toUpperCase() || 'N/A';
  const doc = booking.documentVerification;
  const docStatus = doc?.status || 'NOT_UPLOADED';
  const statusConfig = DOC_STATUS_CONFIG[docStatus] || DOC_STATUS_CONFIG.NOT_UPLOADED;
  const customerName = booking.guestName || booking.user?.fullName || 'Guest Customer';

  // Only allow verification when booking is CONFIRMED and document status is PENDING
  const isBookingConfirmed = booking.status === 'CONFIRMED';
  const canApprove = docStatus === 'PENDING' && isBookingConfirmed;
  const canReject = docStatus === 'PENDING' && isBookingConfirmed;

  // Format dates
  const formatDocDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '—';
      return formatDateForDisplay(dateStr);
    } catch {
      return '—';
    }
  };

  // Document list
  const documents = [
    { title: 'License Front', icon: <Badge />, url: doc?.licenseFrontUrl },
    { title: 'License Back', icon: <Badge />, url: doc?.licenseBackUrl },
    { title: 'ID Card Front', icon: <CreditCard />, url: doc?.idCardUrl },
    { title: 'ID Card Back', icon: <CreditCard />, url: doc?.idCardBackUrl },
    { title: 'Address Proof', icon: <Home />, url: doc?.addressProofUrl },
  ];

  const uploadedCount = documents.filter((d) => d.url).length;

  // Handlers
  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await actions.approve();
      setSnackbar({ open: true, message: 'Documents approved successfully!', severity: 'success' });
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'Failed to approve', severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setIsSubmitting(true);
    try {
      await actions.reject(rejectReason);
      setSnackbar({ open: true, message: 'Documents rejected', severity: 'success' });
      setRejectDialogOpen(false);
      setRejectReason('');
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'Failed to reject', severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openImageViewer = (url: string, title: string) => {
    setImageViewer({ open: true, url, title });
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
              <Stack>
                <Typography variant="h5" fontWeight={700}>
                  Document Verification
                </Typography>
                <Typography variant="body2" color="grey.400">
                  Booking #{bookingRef} • {customerName}
                </Typography>
              </Stack>
            </Stack>
            <Chip
              icon={statusConfig.icon}
              label={statusConfig.label}
              color={statusConfig.color}
              sx={{ fontWeight: 700, fontSize: '0.875rem' }}
            />
          </Stack>
        </Container>
      </Box>

      {/* Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={3}>
          {/* Status Alert */}
          {docStatus === 'REJECTED' && doc?.rejectionReason && (
            <Alert severity="error" icon={<ErrorIcon />}>
              <Typography variant="subtitle2" fontWeight={700}>
                Rejection Reason
              </Typography>
              <Typography variant="body2">{doc.rejectionReason}</Typography>
            </Alert>
          )}

          {docStatus === 'APPROVED' && (
            <Alert severity="success" icon={<Verified />}>
              <Typography variant="subtitle2" fontWeight={700}>
                Documents Verified
              </Typography>
              <Typography variant="body2">Verified on {formatDocDate(doc?.verifiedAt)}</Typography>
            </Alert>
          )}

          {docStatus === 'NOT_UPLOADED' && (
            <Alert severity="warning" icon={<Warning />}>
              <Typography variant="subtitle2" fontWeight={700}>
                No Documents Uploaded
              </Typography>
              <Typography variant="body2">Customer has not uploaded any verification documents yet.</Typography>
            </Alert>
          )}

          {/* Show message when booking is not CONFIRMED but has pending documents */}
          {docStatus === 'PENDING' && !isBookingConfirmed && (
            <Alert severity="info" icon={<Schedule />}>
              <Typography variant="subtitle2" fontWeight={700}>
                Verification Not Available
              </Typography>
              <Typography variant="body2">
                Document verification is only available for CONFIRMED bookings. Current status: {booking.status}
              </Typography>
            </Alert>
          )}

          {/* Action Bar - Desktop */}
          {canApprove && (
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', display: { xs: 'none', md: 'block' } }}>
              <Stack direction="row" spacing={2} justifyContent="flex-end" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  {uploadedCount} of {documents.length} documents uploaded
                </Typography>
                <Button variant="outlined" color="error" startIcon={<Cancel />} onClick={() => setRejectDialogOpen(true)} disabled={isSubmitting}>
                  Reject Documents
                </Button>
                <Button variant="contained" color="success" startIcon={<CheckCircle />} onClick={handleApprove} disabled={isSubmitting} sx={{ minWidth: 140 }}>
                  {isSubmitting ? 'Approving...' : 'Approve Documents'}
                </Button>
              </Stack>
            </Paper>
          )}

          {/* Document Images Grid */}
          <InfoCard title="Uploaded Documents" icon={<DocumentScanner />}>
            <Grid container spacing={2}>
              {documents.map((docItem) => (
                <Grid item xs={12} sm={6} md={4} key={docItem.title}>
                  <DocumentCard
                    title={docItem.title}
                    icon={docItem.icon}
                    imageUrl={docItem.url}
                    onView={() => docItem.url && openImageViewer(docItem.url, docItem.title)}
                  />
                </Grid>
              ))}
            </Grid>
          </InfoCard>

          {/* Extracted Data */}
          {doc && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              {/* License Information */}
              <InfoCard title="Driver's License" icon={<Badge />}>
                <Stack spacing={0} divider={<Divider />}>
                  <DataRow label="License Number" value={doc.licenseNumber} />
                  <DataRow label="Issue Date" value={formatDocDate(doc.licenseIssueDate)} />
                  <DataRow label="Expiry Date" value={formatDocDate(doc.licenseExpiry)} />
                  <DataRow label="Date of Birth" value={formatDocDate(doc.driverDob)} />
                  <DataRow
                    label="Categories"
                    value={
                      doc.licenseCategories?.length > 0 ? (
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" justifyContent="flex-end">
                          {doc.licenseCategories.map((cat: string) => (
                            <Chip key={cat} label={cat} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                          ))}
                        </Stack>
                      ) : (
                        '—'
                      )
                    }
                  />
                </Stack>
              </InfoCard>

              {/* ID Card Information */}
              <InfoCard title="ID Card Details" icon={<CreditCard />}>
                <Stack spacing={0} divider={<Divider />}>
                  <DataRow label="ID Number" value={doc.idNumber} />
                  <DataRow label="Expiry Date" value={formatDocDate(doc.idExpiry)} />
                  <DataRow label="Verified Address" value={doc.verifiedAddress} />
                </Stack>
              </InfoCard>
            </Box>
          )}

          {/* AI Metadata (if available) */}
          {doc?.aiMetadata && (
            <InfoCard title="OCR Analysis" icon={<DocumentScanner />}>
              <Typography variant="body2" color="text.secondary" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}>
                {typeof doc.aiMetadata === 'string' ? doc.aiMetadata : JSON.stringify(doc.aiMetadata, null, 2)}
              </Typography>
            </InfoCard>
          )}

          {/* Mobile Action Buttons */}
          {canApprove && (
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
                <Button variant="contained" color="success" fullWidth size="large" startIcon={<CheckCircle />} onClick={handleApprove} disabled={isSubmitting}>
                  {isSubmitting ? 'Approving...' : 'Approve Documents'}
                </Button>
                <Button variant="outlined" color="error" fullWidth startIcon={<Cancel />} onClick={() => setRejectDialogOpen(true)} disabled={isSubmitting}>
                  Reject Documents
                </Button>
              </Stack>
            </Paper>
          )}

          {/* Spacer for mobile fixed buttons */}
          <Box sx={{ height: { xs: canApprove ? 140 : 0, md: 0 } }} />
        </Stack>
      </Container>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Reject Documents</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Please provide a reason for rejection. The customer will be notified and asked to re-upload their documents.
          </Alert>
          <TextField
            autoFocus
            label="Rejection Reason"
            placeholder="E.g., Document is blurry, License expired, Wrong document type..."
            fullWidth
            multiline
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setRejectDialogOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleReject} disabled={!rejectReason.trim() || isSubmitting}>
            {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Viewer Modal */}
      {imageViewer.open && (
        <ImageViewer
          open={imageViewer.open}
          onClose={() => setImageViewer({ open: false, url: '', title: '' })}
          imageUrl={imageViewer.url}
          title={imageViewer.title}
        />
      )}

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

export default AdminDocumentsView;
