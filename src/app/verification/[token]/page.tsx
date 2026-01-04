'use client';

import React, { useEffect, useMemo, useRef, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useMutation, useQuery } from '@apollo/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box, Button, Typography, Paper, Grid, TextField, Alert,
  Stepper, Step, StepLabel, Snackbar, CircularProgress,
  Card, CardContent, Divider, Fade, Chip, InputAdornment
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  CalendarMonth as CalendarMonthIcon,
  Lock as LockIcon,
  VerifiedUser as VerifiedUserIcon,
  CloudDone as CloudDoneIcon
} from '@mui/icons-material';
import { CREATE_OR_UPDATE_DRIVER_PROFILE_MUTATION, PROCESS_DOCUMENT_OCR_MUTATION } from '@/lib/graphql/mutations';
import { GET_BOOKING_ID_BY_TOKEN_QUERY, GET_BOOKING_QUERY, GET_PLATFORM_SETTINGS_QUERY } from '@/lib/graphql/queries';

interface DriverVerificationPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default function DriverVerificationPage({ params }: DriverVerificationPageProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const premiumFontFamily = 'Inter, Lexend, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif';

  // Unwrap params with React.use() (Next.js 15 requirement)
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  // Get booking ID from verification token
  const { data: tokenData } = useQuery(GET_BOOKING_ID_BY_TOKEN_QUERY, {
    variables: { token },
    skip: !token
  });

  const bookingId = tokenData?.verifyBookingToken?.bookingId;

  const { data: bookingData } = useQuery(GET_BOOKING_QUERY, {
    variables: bookingId ? { id: bookingId } : undefined,
    skip: !bookingId,
    fetchPolicy: 'cache-and-network'
  });

  const { data: platformSettingsData } = useQuery(GET_PLATFORM_SETTINGS_QUERY);

  const requiredLicenseCategory = bookingData?.booking?.car?.requiredLicenseCategory as string | undefined;

  const [currentStep, setCurrentStep] = useState(0); // Material-UI Stepper uses 0-based index
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const [manualMode, setManualMode] = useState({ license: false, cni: false, address: false });

  const didSmartResumeRef = useRef(false);

  const [licenseFrontPreviewUrl, setLicenseFrontPreviewUrl] = useState<string | null>(null);
  const [licenseBackPreviewUrl, setLicenseBackPreviewUrl] = useState<string | null>(null);

  const [ocrContext, setOcrContext] = useState<{
    type: 'license' | 'cni' | 'address' | null;
    side?: 'front' | 'back';
  }>({ type: null });

  const [autoFilled, setAutoFilled] = useState({
    license: { name: false, licenseNumber: false, licenseCategory: false, expiryDate: false },
    cni: { name: false, idNumber: false },
    address: { address: false, documentDate: false }
  });

  const LICENSE_CATEGORY_RANK: Record<string, number> = { AM: 0, A: 1, B: 2, C: 3, D: 4 };

  const pickHigherLicenseCategory = (a?: string | null, b?: string | null) => {
    const aa = (a || '').trim().toUpperCase();
    const bb = (b || '').trim().toUpperCase();
    const ra = LICENSE_CATEGORY_RANK[aa];
    const rb = LICENSE_CATEGORY_RANK[bb];

    if (ra === undefined && rb === undefined) return '';
    if (ra === undefined) return bb;
    if (rb === undefined) return aa;
    return ra >= rb ? aa : bb;
  };

  const formatIsoToUs = (iso?: string | null) => {
    const s = (iso || '').trim();
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return s;
    return `${m[2]}/${m[3]}/${m[1]}`;
  };

  const parseDateInputToIso = (raw: string, fallbackIso: string) => {
    const s = String(raw || '').trim();
    if (!s) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

    const us = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (us) {
      const mm = us[1].padStart(2, '0');
      const dd = us[2].padStart(2, '0');
      const yyyy = us[3];
      return `${yyyy}-${mm}-${dd}`;
    }

    return fallbackIso;
  };

  const formatDateToYmd = (value?: string | null) => {
    if (!value) return '';
    const s = String(value).trim();
    if (!s) return '';

    // Already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

    // Common variants like DD/MM/YYYY or DD-MM-YYYY
    const m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
    if (m) {
      const dd = m[1].padStart(2, '0');
      const mm = m[2].padStart(2, '0');
      const yyyy = m[3];
      return `${yyyy}-${mm}-${dd}`;
    }

    // Fallback: try Date parse
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Form data
  const [licenseData, setLicenseData] = useState({
    frontFile: null as File | null,
    backFile: null as File | null,
    name: '',
    licenseNumber: '',
    licenseCategory: '',
    expiryDate: '',
    transmissionRestricted: false,
    ocrAttempted: false,
    ocrSuccess: false
  });

  const mergeExtractedData = (
    side: 'front' | 'back' | undefined,
    extracted: {
      fullName?: string | null;
      licenseNumber?: string | null;
      documentId?: string | null;
      expiryDate?: string | null;
      licenseCategory?: string | null;
      restrictsToAutomatic?: boolean | null;
    }
  ) => {
    const expiryYmd = formatDateToYmd(extracted.expiryDate || undefined);
    const extractedFullName = (extracted.fullName || '').trim();
    const extractedLicenseNumber = (extracted.licenseNumber || extracted.documentId || '').trim();
    const extractedCategory = (extracted.licenseCategory || '').trim();
    const extractedRestrictsToAutomatic =
      typeof extracted.restrictsToAutomatic === 'boolean' ? extracted.restrictsToAutomatic : undefined;

    if (side === 'front') {
      return {
        name: extractedFullName,
        licenseNumber: extractedLicenseNumber,
        expiryDate: expiryYmd,
      };
    }

    if (side === 'back') {
      return {
        licenseCategory: extractedCategory,
        transmissionRestricted: extractedRestrictsToAutomatic,
      };
    }

    return {
      name: extractedFullName,
      licenseNumber: extractedLicenseNumber,
      expiryDate: expiryYmd,
      licenseCategory: extractedCategory,
      transmissionRestricted: extractedRestrictsToAutomatic,
    };
  };

  useEffect(() => {
    if (didSmartResumeRef.current) return;

    const profile = bookingData?.booking?.user?.driverProfile;
    if (!profile) return;

    // Resume logic
    // Step 0: License
    // Step 1: CNI
    // Step 2: Address proof
    const hasLicense = !!(profile.licenseFrontUrl && profile.licenseBackUrl);
    const hasCni = !!profile.idCardUrl;
    const hasAddress = !!profile.addressProofUrl;

    if (!hasLicense) {
      setCurrentStep(0);
      didSmartResumeRef.current = true;
      return;
    }

    if (!hasCni) {
      setCurrentStep(1);
      didSmartResumeRef.current = true;
      return;
    }

    if (!hasAddress) {
      setCurrentStep(2);
      didSmartResumeRef.current = true;
      return;
    }

    // All documents exist; keep the user on the last step
    setCurrentStep(2);
    didSmartResumeRef.current = true;
  }, [bookingData?.booking?.user?.driverProfile]);

  const [cniData, setCniData] = useState({
    file: null as File | null,
    name: '',
    idNumber: '',
    // dateOfBirth comes from user object, not profile
    ocrAttempted: false,
    ocrSuccess: false
  });

  const [addressData, setAddressData] = useState({
    file: null as File | null,
    address: '',
    documentDate: '',
    ocrAttempted: false,
    ocrSuccess: false,
  });

  const [createOrUpdateDriverProfile] = useMutation(CREATE_OR_UPDATE_DRIVER_PROFILE_MUTATION);
  const [processDocumentOCR] = useMutation(PROCESS_DOCUMENT_OCR_MUTATION);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const manualFieldSx = (enabled: boolean) =>
    enabled
      ? {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(59, 130, 246, 0.55)'
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(59, 130, 246, 0.8)'
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(59, 130, 246, 0.9)'
          },
          boxShadow: '0 0 10px rgba(59, 130, 246, 0.2)'
        }
      : undefined;

  const glassCardSx = {
    borderRadius: '24px',
    bgcolor: 'rgba(255, 255, 255, 0.7)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 18px 60px rgba(15, 23, 42, 0.08)',
  } as const;

  const scanLine = {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    background: 'linear-gradient(90deg, rgba(59,130,246,0) 0%, rgba(59,130,246,0.95) 50%, rgba(59,130,246,0) 100%)',
    boxShadow: '0 0 18px rgba(59, 130, 246, 0.75)',
  } as const;

  const fieldRevealParent = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.07, delayChildren: 0.05 }
    }
  };

  const fieldRevealItem = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  useEffect(() => {
    if (licenseData.frontFile) {
      const url = URL.createObjectURL(licenseData.frontFile);
      setLicenseFrontPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setLicenseFrontPreviewUrl(null);
  }, [licenseData.frontFile]);

  useEffect(() => {
    if (licenseData.backFile) {
      const url = URL.createObjectURL(licenseData.backFile);
      setLicenseBackPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setLicenseBackPreviewUrl(null);
  }, [licenseData.backFile]);

  const isLicenseStepComplete = useMemo(() => {
    const hasRequired = !!(licenseData.name?.trim() && licenseData.licenseNumber?.trim() && licenseData.expiryDate);
    return licenseData.ocrAttempted && hasRequired;
  }, [licenseData.ocrAttempted, licenseData.name, licenseData.licenseNumber, licenseData.expiryDate]);

  const isCniStepComplete = useMemo(() => {
    const hasRequired = !!(cniData.name?.trim() && cniData.idNumber?.trim() && cniData.dateOfBirth);
    return cniData.ocrAttempted && hasRequired;
  }, [cniData.ocrAttempted, cniData.name, cniData.idNumber, cniData.dateOfBirth]);

  const validateBusinessRules = ():
    | { ok: true; isYoungDriver: boolean }
    | { ok: false; message: string } => {
    const today = new Date();
    const todayYmd = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

    const bookingEnd = bookingData?.booking?.endDate ? new Date(bookingData.booking.endDate) : null;
    const carTransmission = bookingData?.booking?.car?.transmission as string | undefined;

    if (carTransmission === 'MANUAL' && licenseData.transmissionRestricted) {
      return {
        ok: false,
        message: 'Votre permis (Code 78) ne permet pas de conduire ce véhicule manuel.'
      };
    }

    if (!licenseData.expiryDate) {
      return { ok: false, message: 'Please provide the license expiry date.' };
    }

    const expiry = new Date(`${licenseData.expiryDate}T00:00:00Z`);
    if (Number.isNaN(expiry.getTime())) {
      return { ok: false, message: 'Invalid expiry date format. Please use YYYY-MM-DD.' };
    }
    if (expiry < todayYmd) {
      return { ok: false, message: 'Your driving license is expired. Please upload a valid license.' };
    }

    if (bookingEnd) {
      const bookingEndUtc = new Date(Date.UTC(bookingEnd.getUTCFullYear(), bookingEnd.getUTCMonth(), bookingEnd.getUTCDate()));
      if (expiry < bookingEndUtc) {
        return { ok: false, message: 'Your driving license expires before the end of this booking.' };
      }
    }

    if (!cniData.dateOfBirth) {
      return { ok: false, message: 'Please provide your birth date.' };
    }

    const dob = new Date(`${cniData.dateOfBirth}T00:00:00Z`);
    if (Number.isNaN(dob.getTime())) {
      return { ok: false, message: 'Invalid birth date format. Please use YYYY-MM-DD.' };
    }

    // Compute age in years
    let age = today.getFullYear() - dob.getUTCFullYear();
    const m = today.getMonth() - dob.getUTCMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getUTCDate())) {
      age--;
    }

    if (age < 18) {
      return { ok: false, message: 'You must be at least 18 years old to rent a car.' };
    }

    const minAge = platformSettingsData?.platformSettings?.youngDriverMinAge ?? 25;
    const isYoungDriver = age >= 18 && age < minAge;
    return { ok: true, isYoungDriver };
  };

  const validateLicenseCategory = ():
    | { ok: true }
    | { ok: false; message: string } => {
    if (!requiredLicenseCategory) return { ok: true };

    const driverCategory = (licenseData.licenseCategory || '').trim().toUpperCase();
    if (!driverCategory) {
      return {
        ok: false,
        message: 'Please upload your driving license documents first so we can verify your license category.'
      };
    }

    const rank: Record<string, number> = { AM: 0, A: 1, B: 2, C: 3, D: 4 };
    const requiredRank = rank[String(requiredLicenseCategory).toUpperCase()];
    const driverRank = rank[driverCategory];
    if (requiredRank === undefined || driverRank === undefined) {
      return { ok: false, message: 'Invalid license category. Please correct it and try again.' };
    }
    if (driverRank < requiredRank) {
      return {
        ok: false,
        message: `License category mismatch. Required: ${requiredLicenseCategory}. Your license: ${driverCategory}.`
      };
    }

    return { ok: true };
  };

  const handleFileUpload = async (file: File, type: 'license' | 'cni' | 'address', side?: 'front' | 'back') => {
    setOcrContext({ type, side });
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

        if (extractedData?.isQuotaExceeded) {
          showToast('AI scanning is busy. Please enter details manually.', 'info' as any);

          if (type === 'license') {
            setManualMode(prev => ({ ...prev, license: true }));
            setLicenseData(prev => ({ ...prev, ocrAttempted: true, ocrSuccess: false }));
          }
          if (type === 'cni') {
            setManualMode(prev => ({ ...prev, cni: true }));
            setCniData(prev => ({ ...prev, ocrAttempted: true, ocrSuccess: false }));
          }
          if (type === 'address') {
            setManualMode(prev => ({ ...prev, address: true }));
            setAddressData(prev => ({ ...prev, ocrAttempted: true, ocrSuccess: false }));
          }

          setIsLoading(false);
          setOcrContext({ type: null });
          return;
        }

        if (extractedData?.fallbackUsed) {
          showToast('OCR fallback was used. Please check and verify details.', 'warning');
        }

        if (type === 'license') {
          const patch = mergeExtractedData(side, extractedData);

          setLicenseData(prev => {
            const mergedCategory = pickHigherLicenseCategory(prev.licenseCategory, patch.licenseCategory);
            const next = {
              ...prev,
              name: patch.name || prev.name,
              licenseNumber: patch.licenseNumber || prev.licenseNumber,
              expiryDate: patch.expiryDate || prev.expiryDate,
              licenseCategory: mergedCategory || prev.licenseCategory,
              transmissionRestricted: patch.transmissionRestricted ?? prev.transmissionRestricted,
            };

            setAutoFilled(prevAuto => ({
              ...prevAuto,
              license: {
                name: prevAuto.license.name || !!patch.name,
                licenseNumber: prevAuto.license.licenseNumber || !!patch.licenseNumber,
                expiryDate: prevAuto.license.expiryDate || !!patch.expiryDate,
                licenseCategory: prevAuto.license.licenseCategory || !!patch.licenseCategory,
              }
            }));

            // Duplicate check when back side also yields a license number
            if (side === 'back') {
              const backLicenseNumber = (extractedData.licenseNumber || extractedData.documentId || '').trim();
              const frontLicenseNumber = (prev.licenseNumber || '').trim();
              if (backLicenseNumber && frontLicenseNumber && backLicenseNumber !== frontLicenseNumber) {
                showToast('License number mismatch between front and back scans. Please re-upload clearer images.', 'error');
              }
            }

            return {
              ...next,
              ocrAttempted: true,
              ocrSuccess: !!(next.name || next.licenseNumber || next.expiryDate || next.licenseCategory)
            };
          });

          if (side === 'back' && extractedData.restrictsToAutomatic === true) {
            showToast('Detected Code 78 (transmission restriction). Only automatic vehicles may be allowed.', 'warning');
          } else {
            showToast('License scanned successfully! Please verify the extracted information.', 'success');
          }
        } else if (type === 'cni') {
          const hasExtractedData = extractedData.fullName || extractedData.documentId || extractedData.birthDate;

          setAutoFilled(prevAuto => ({
            ...prevAuto,
            cni: {
              name: prevAuto.cni.name || !!extractedData.fullName,
              idNumber: prevAuto.cni.idNumber || !!extractedData.documentId,
              dateOfBirth: prevAuto.cni.dateOfBirth || !!extractedData.birthDate,
            }
          }));

          setCniData(prev => ({
            ...prev,
            name: extractedData.fullName || prev.name,
            idNumber: extractedData.documentId || prev.idNumber,
            dateOfBirth: formatDateToYmd(extractedData.birthDate) || prev.dateOfBirth,
            ocrAttempted: true,
            ocrSuccess: !!hasExtractedData
          }));

          if (hasExtractedData) {
            showToast('ID card scanned successfully! Please verify the extracted information.', 'success');
          } else {
            showToast('ID card uploaded. OCR could not extract information. Please fill details manually.', 'warning');
          }
        } else if (type === 'address') {
          // For address proof, we mainly validate that OCR worked
          const extractedDocDate = formatDateToYmd(
            extractedData.documentDate || extractedData.issueDate || extractedData.expiryDate
          );
          const hasAddressData = extractedData.address || extractedData.fullName;

          // Address proof 90-day warning
          if (extractedDocDate) {
            const docDate = new Date(`${extractedDocDate}T00:00:00Z`);
            if (!Number.isNaN(docDate.getTime())) {
              const ninetyDaysAgo = new Date();
              ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
              const ninetyDaysAgoUtc = new Date(Date.UTC(ninetyDaysAgo.getFullYear(), ninetyDaysAgo.getMonth(), ninetyDaysAgo.getDate()));
              if (docDate < ninetyDaysAgoUtc) {
                showToast('Ce justificatif a plus de 3 mois. Veuillez en télécharger un plus récent.', 'warning');
              }
            }
          }

          setAddressData(prev => ({
            ...prev,
            address: extractedData.address || prev.address,
            documentDate: extractedDocDate || prev.documentDate,
            ocrAttempted: true,
            ocrSuccess: !!hasAddressData
          }));

          setAutoFilled(prevAuto => ({
            ...prevAuto,
            address: {
              address: prevAuto.address.address || !!extractedData.address,
              documentDate: prevAuto.address.documentDate || !!extractedDocDate,
            }
          }));

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
      showToast('OCR failed. Please enter details manually.', 'info');

      // Allow user to proceed with manual entry even if OCR fails at the network layer.
      if (type === 'license') {
        setManualMode(prev => ({ ...prev, license: true }));
        setLicenseData(prev => ({ ...prev, ocrAttempted: true, ocrSuccess: false }));
      }
      if (type === 'cni') {
        setManualMode(prev => ({ ...prev, cni: true }));
        setCniData(prev => ({ ...prev, ocrAttempted: true, ocrSuccess: false }));
      }
      if (type === 'address') {
        setAddressData(prev => ({ ...prev, ocrAttempted: true, ocrSuccess: false }));
      }

      showToast('OCR failed. Please check and verify details manually.', 'warning');
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
    const ruleCheck = validateBusinessRules();
    if (!ruleCheck.ok) {
      showToast(ruleCheck.message, 'error');
      return;
    }

    const categoryCheck = validateLicenseCategory();
    if (!categoryCheck.ok) {
      showToast(categoryCheck.message, 'error');
      return;
    }

    setIsLoading(true);

    try {
      const driverData = {
        licenseNumber: licenseData.licenseNumber,
        licenseCategory: licenseData.licenseCategory,
        licenseExpiry: licenseData.expiryDate,
        restrictsToAutomatic: licenseData.transmissionRestricted,
        idProofNumber: cniData.idNumber,
        birthDate: cniData.dateOfBirth,
        address: addressData.address,
        isYoungDriver: ruleCheck.isYoungDriver,
      };

      const { data } = await createOrUpdateDriverProfile({
        variables: { input: driverData }
      });

      if (data?.createOrUpdateDriverProfile) {
        showToast('Verification submitted. Waiting for admin approval...', 'success');

        // Redirect to waiting page (admin-gated flow)
        setTimeout(() => {
          router.push(`/waiting-for-approval?bookingId=${data.createOrUpdateDriverProfile.bookingId}`);
        }, 2000);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to submit verification. Please try again.', 'error');
    }

    setIsLoading(false);
  };

  const steps = ['License', 'ID Card', 'Address Proof'];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        fontFamily: premiumFontFamily,
        background:
          'radial-gradient(900px circle at 15% 10%, rgba(59,130,246,0.12), rgba(59,130,246,0) 45%), radial-gradient(700px circle at 85% 0%, rgba(99,102,241,0.10), rgba(99,102,241,0) 40%), radial-gradient(800px circle at 50% 90%, rgba(16,185,129,0.10), rgba(16,185,129,0) 45%), linear-gradient(180deg, #f8fafc 0%, #eff6ff 55%, #f8fafc 100%)',
      }}
    >
      {/* Header */}
      <Paper sx={{
        p: 3,
        borderRadius: 0,
        borderBottom: '1px solid',
        borderColor: 'rgba(226, 232, 240, 0.9)',
        bgcolor: 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(12px)'
      }}>
        <Stepper activeStep={currentStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
            Driver Verification
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Complete your verification to proceed with your booking
          </Typography>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ maxWidth: 960, mx: 'auto', px: { xs: 2, md: 3 }, pb: 8 }}>
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card sx={{ ...glassCardSx, mb: 4 }}>
                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                  <DescriptionIcon sx={{ fontSize: 78, color: 'primary.main', mb: 2.5 }} />
                  <Typography variant="h5" fontWeight={800} gutterBottom sx={{ letterSpacing: '-0.015em' }}>
                    Driver's License
                  </Typography>
                  <Typography variant="body1" color="text.secondary" mb={2.5}>
                    Upload both sides of your driver's license for AI-assisted verification.
                  </Typography>
                  {(manualMode.license || manualMode.cni || manualMode.address) && (
                    <Chip
                      label="Manual Entry Mode"
                      color="warning"
                      variant="outlined"
                      sx={{
                        borderRadius: 999,
                        fontWeight: 700,
                        bgcolor: 'rgba(255, 255, 255, 0.55)',
                      }}
                    />
                  )}
                </CardContent>
              </Card>

              <Grid container spacing={4} sx={{ mb: 4 }}>
                {/* License Front */}
                <Grid item xs={12} md={6}>
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      borderRadius: 4,
                      border: '1px solid rgba(226, 232, 240, 0.9)',
                      bgcolor: 'rgba(255,255,255,0.6)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 12px 40px rgba(15, 23, 42, 0.08)',
                      overflow: 'hidden',
                      transition: 'transform 180ms ease, box-shadow 180ms ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 18px 60px rgba(15, 23, 42, 0.10)',
                      }
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
                    <label htmlFor="license-front" style={{ cursor: 'pointer', display: 'block' }}>
                      {licenseData.frontFile ? (
                        <Box sx={{ position: 'relative' }}>
                          <Box
                            component="img"
                            src={URL.createObjectURL(licenseData.frontFile)}
                            alt="License front preview"
                            sx={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 2 }}
                          />
                          {isLoading && ocrContext.type === 'license' && ocrContext.side === 'front' && (
                            <Box sx={{ position: 'absolute', inset: 0, borderRadius: 2, overflow: 'hidden' }}>
                              <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(15, 23, 42, 0.22)' }} />
                              <motion.div
                                style={{ top: '10%', left: 0, width: '100%', height: 4, background: '#3b82f6', borderRadius: 2 }}
                                initial={{ top: '10%' }}
                                animate={{ top: ['10%', '85%', '10%'] }}
                                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                              />
                            </Box>
                          )}
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 12,
                              right: 12,
                              bgcolor: 'rgba(15, 23, 42, 0.75)',
                              color: 'white',
                              px: 1.5,
                              py: 0.75,
                              borderRadius: 999,
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            Change
                          </Box>
                        </Box>
                      ) : (
                        <>
                          <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                            py: 4,
                          }}>
                            <CloudUploadIcon sx={{ fontSize: 46, color: 'primary.main' }} />
                            <Typography variant="subtitle2" fontWeight={800} sx={{ letterSpacing: '-0.01em' }}>
                              Upload Front Side
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              High-res photo recommended
                            </Typography>
                          </Box>
                        </>
                      )}
                    </label>
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
                    <label htmlFor="license-back" style={{ cursor: 'pointer', display: 'block' }}>
                      {licenseData.backFile ? (
                        <Box sx={{ position: 'relative' }}>
                          <Box
                            component="img"
                            src={URL.createObjectURL(licenseData.backFile)}
                            alt="License back preview"
                            sx={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 2 }}
                          />
                          {isLoading && ocrContext.type === 'license' && ocrContext.side === 'back' && (
                            <Box sx={{ position: 'absolute', inset: 0, borderRadius: 2, overflow: 'hidden' }}>
                              <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(15, 23, 42, 0.22)' }} />
                              <motion.div
                                style={{ top: '10%', left: 0, width: '100%', height: 4, background: '#3b82f6', borderRadius: 2 }}
                                initial={{ top: '10%' }}
                                animate={{ top: ['10%', '85%', '10%'] }}
                                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                              />
                            </Box>
                          )}
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 12,
                              right: 12,
                              bgcolor: 'rgba(15, 23, 42, 0.75)',
                              color: 'white',
                              px: 1.5,
                              py: 0.75,
                              borderRadius: 999,
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            Change
                          </Box>
                        </Box>
                      ) : (
                        <>
                          <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                            py: 4,
                          }}>
                            <CloudUploadIcon sx={{ fontSize: 46, color: 'primary.main' }} />
                            <Typography variant="subtitle2" fontWeight={800} sx={{ letterSpacing: '-0.01em' }}>
                              Upload Back Side
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Make sure restrictions are visible
                            </Typography>
                          </Box>
                        </>
                      )}
                    </label>
                  </Paper>
                </Grid>
              </Grid>

              {/* Manual Input Form - Show after OCR attempt */}
              {licenseData.ocrAttempted && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {licenseData.ocrSuccess && (
                    <Alert severity="success" sx={{ mb: 4 }}>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        ✓ Information Extracted from License
                      </Typography>
                      <Typography variant="body2">
                        Please verify and edit the extracted information if needed.
                      </Typography>
                    </Alert>
                  )}

                  {!licenseData.ocrSuccess && (
                    <Alert severity="info" sx={{ mb: 4 }}>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        Manual Entry Required
                      </Typography>
                      <Typography variant="body2">
                        OCR could not extract information. Please fill in your license details manually.
                      </Typography>
                    </Alert>
                  )}

                  <Typography variant="h6" fontWeight={800} gutterBottom sx={{ letterSpacing: '-0.01em' }}>
                    License Information
                  </Typography>

                  <Card sx={{ ...glassCardSx, p: 0, mb: 3 }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                        Summary
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">Name</Typography>
                          <Typography fontWeight={700}>{licenseData.name || '—'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">License #</Typography>
                          <Typography fontWeight={700}>{licenseData.licenseNumber || '—'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">Category</Typography>
                          <Typography fontWeight={700}>{licenseData.licenseCategory || '—'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">Expiry</Typography>
                          <Typography fontWeight={700}>{formatIsoToUs(licenseData.expiryDate) || '—'}</Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                  <motion.div variants={fieldRevealParent} initial="hidden" animate="show">
                    <Grid container spacing={3} sx={{ mt: 0.5 }}>
                      <Grid item xs={12} md={4}>
                        <motion.div variants={fieldRevealItem}>
                          <TextField
                            fullWidth
                            label="Full Name"
                            value={licenseData.name}
                            onChange={(e) => setLicenseData(prev => ({ ...prev, name: e.target.value }))}
                            variant="outlined"
                            sx={manualFieldSx(manualMode.license)}
                            InputProps={{
                              endAdornment: autoFilled.license.name ? (
                                <InputAdornment position="end">
                                  <motion.div
                                    initial={{ scale: 0.9, opacity: 0.7 }}
                                    animate={{ scale: [0.9, 1.05, 0.95], opacity: [0.7, 1, 0.85] }}
                                    transition={{ duration: 1.4, repeat: Infinity }}
                                  >
                                    <CheckCircleIcon sx={{ color: 'success.main' }} fontSize="small" />
                                  </motion.div>
                                </InputAdornment>
                              ) : undefined
                            }}
                          />
                        </motion.div>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <motion.div variants={fieldRevealItem}>
                          <TextField
                            fullWidth
                            label="License Number"
                            value={licenseData.licenseNumber}
                            onChange={(e) => setLicenseData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                            variant="outlined"
                            sx={manualFieldSx(manualMode.license)}
                            InputProps={{
                              endAdornment: autoFilled.license.licenseNumber ? (
                                <InputAdornment position="end">
                                  <motion.div
                                    initial={{ scale: 0.9, opacity: 0.7 }}
                                    animate={{ scale: [0.9, 1.05, 0.95], opacity: [0.7, 1, 0.85] }}
                                    transition={{ duration: 1.4, repeat: Infinity }}
                                  >
                                    <CheckCircleIcon sx={{ color: 'success.main' }} fontSize="small" />
                                  </motion.div>
                                </InputAdornment>
                              ) : undefined
                            }}
                          />
                        </motion.div>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <motion.div variants={fieldRevealItem}>
                          <TextField
                            fullWidth
                            label="License Category"
                            value={licenseData.licenseCategory}
                            onChange={(e) => setLicenseData(prev => ({ ...prev, licenseCategory: e.target.value }))}
                            variant="outlined"
                            sx={manualFieldSx(manualMode.license)}
                            InputProps={{
                              endAdornment: autoFilled.license.licenseCategory ? (
                                <InputAdornment position="end">
                                  <motion.div
                                    initial={{ scale: 0.9, opacity: 0.7 }}
                                    animate={{ scale: [0.9, 1.05, 0.95], opacity: [0.7, 1, 0.85] }}
                                    transition={{ duration: 1.4, repeat: Infinity }}
                                  >
                                    <CheckCircleIcon sx={{ color: 'success.main' }} fontSize="small" />
                                  </motion.div>
                                </InputAdornment>
                              ) : undefined
                            }}
                          />
                        </motion.div>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <motion.div variants={fieldRevealItem}>
                          <TextField
                            fullWidth
                            label="Expiry Date"
                            value={formatIsoToUs(licenseData.expiryDate)}
                            onChange={(e) =>
                              setLicenseData(prev => ({
                                ...prev,
                                expiryDate: parseDateInputToIso(e.target.value, prev.expiryDate),
                              }))
                            }
                            variant="outlined"
                            placeholder="MM/DD/YYYY"
                            InputLabelProps={{ shrink: true }}
                            sx={manualFieldSx(manualMode.license)}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <CalendarMonthIcon sx={{ color: 'text.secondary' }} fontSize="small" />
                                </InputAdornment>
                              ),
                              endAdornment: autoFilled.license.expiryDate ? (
                                <InputAdornment position="end">
                                  <motion.div
                                    initial={{ scale: 0.9, opacity: 0.7 }}
                                    animate={{ scale: [0.9, 1.05, 0.95], opacity: [0.7, 1, 0.85] }}
                                    transition={{ duration: 1.4, repeat: Infinity }}
                                  >
                                    <CheckCircleIcon sx={{ color: 'success.main' }} fontSize="small" />
                                  </motion.div>
                                </InputAdornment>
                              ) : undefined
                            }}
                          />
                        </motion.div>
                      </Grid>
                    </Grid>
                  </motion.div>
                </motion.div>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!isLicenseStepComplete || isLoading}
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
              <Card sx={{ ...glassCardSx, mb: 4 }}>
                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                  <DescriptionIcon sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />
                  <Typography variant="h5" fontWeight={800} gutterBottom sx={{ letterSpacing: '-0.015em' }}>
                    National ID Card (CNI)
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Upload your national ID card for identity verification
                  </Typography>
                  {manualMode.cni && (
                    <Chip
                      label="Manual Entry Mode"
                      color="warning"
                      variant="outlined"
                      sx={{ mt: 2.5, borderRadius: 999, fontWeight: 700, bgcolor: 'rgba(255,255,255,0.55)' }}
                    />
                  )}
                </CardContent>
              </Card>

              <Box sx={{ maxWidth: 520, mx: 'auto', mb: 4 }}>
                <Paper
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    borderRadius: 4,
                    border: '1px solid rgba(226, 232, 240, 0.9)',
                    bgcolor: 'rgba(255,255,255,0.6)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 12px 40px rgba(15, 23, 42, 0.08)',
                    overflow: 'hidden'
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
                    <Box sx={{ display: 'grid', placeItems: 'center', py: 4, gap: 1 }}>
                      <CloudUploadIcon sx={{ fontSize: 46, color: 'primary.main' }} />
                      <Typography variant="subtitle2" fontWeight={800} sx={{ letterSpacing: '-0.01em' }}>
                        Upload ID Card
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Clear photo, no glare
                      </Typography>
                    </Box>
                  </label>
                  {cniData.file && (
                    <Typography variant="body2" color="success.main" sx={{ mt: 2 }}>
                      ✓ Uploaded: {cniData.file.name}
                    </Typography>
                  )}
                </Paper>
              </Box>

              {/* AI Extracted Data */}
              {cniData.ocrAttempted && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {cniData.ocrSuccess && (
                    <Alert severity="success" sx={{ mb: 4 }}>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        ✓ Information Extracted from ID Card
                      </Typography>
                      <Typography variant="body2">
                        Please verify and edit the extracted information if needed.
                      </Typography>
                    </Alert>
                  )}

                  {!cniData.ocrSuccess && (
                    <Alert severity="info" sx={{ mb: 4 }}>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        Manual Entry Required
                      </Typography>
                      <Typography variant="body2">
                        OCR could not extract information. Please fill in your ID card details manually.
                      </Typography>
                    </Alert>
                  )}

                  <Typography variant="h6" fontWeight={800} gutterBottom sx={{ letterSpacing: '-0.01em' }}>
                    ID Card Information
                  </Typography>

                  <Card sx={{ ...glassCardSx, mt: 2, mb: 3 }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                        Summary
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">Name</Typography>
                          <Typography fontWeight={700}>{cniData.name || '—'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">ID Number</Typography>
                          <Typography fontWeight={700}>{cniData.idNumber || '—'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">Date of Birth</Typography>
                          <Typography fontWeight={700}>{formatIsoToUs(cniData.dateOfBirth) || '—'}</Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                  <motion.div variants={fieldRevealParent} initial="hidden" animate="show">
                    <Box sx={{ mt: 2 }}>
                      <motion.div variants={fieldRevealItem}>
                        <TextField
                          fullWidth
                          label="Full Name"
                          value={cniData.name}
                          onChange={(e) => setCniData(prev => ({ ...prev, name: e.target.value }))}
                          variant="outlined"
                          sx={{ mb: 3, ...manualFieldSx(manualMode.cni) }}
                          InputProps={{
                            endAdornment: autoFilled.cni.name ? (
                              <InputAdornment position="end">
                                <motion.div
                                  initial={{ scale: 0.9, opacity: 0.7 }}
                                  animate={{ scale: [0.9, 1.05, 0.95], opacity: [0.7, 1, 0.85] }}
                                  transition={{ duration: 1.4, repeat: Infinity }}
                                >
                                  <CheckCircleIcon sx={{ color: 'success.main' }} fontSize="small" />
                                </motion.div>
                              </InputAdornment>
                            ) : undefined
                          }}
                        />
                      </motion.div>
                      <motion.div variants={fieldRevealItem}>
                        <TextField
                          fullWidth
                          label="ID Number"
                          value={cniData.idNumber}
                          onChange={(e) => setCniData(prev => ({ ...prev, idNumber: e.target.value }))}
                          variant="outlined"
                          sx={{ mb: 3, ...manualFieldSx(manualMode.cni) }}
                          InputProps={{
                            endAdornment: autoFilled.cni.idNumber ? (
                              <InputAdornment position="end">
                                <motion.div
                                  initial={{ scale: 0.9, opacity: 0.7 }}
                                  animate={{ scale: [0.9, 1.05, 0.95], opacity: [0.7, 1, 0.85] }}
                                  transition={{ duration: 1.4, repeat: Infinity }}
                                >
                                  <CheckCircleIcon sx={{ color: 'success.main' }} fontSize="small" />
                                </motion.div>
                              </InputAdornment>
                            ) : undefined
                          }}
                        />
                      </motion.div>
                      <motion.div variants={fieldRevealItem}>
                        <TextField
                          fullWidth
                          label="Date of Birth"
                          value={formatIsoToUs(cniData.dateOfBirth)}
                          onChange={(e) =>
                            setCniData(prev => ({
                              ...prev,
                              dateOfBirth: parseDateInputToIso(e.target.value, prev.dateOfBirth),
                            }))
                          }
                          variant="outlined"
                          InputLabelProps={{ shrink: true }}
                          placeholder="MM/DD/YYYY"
                          sx={manualFieldSx(manualMode.cni)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <CalendarMonthIcon sx={{ color: 'text.secondary' }} fontSize="small" />
                              </InputAdornment>
                            ),
                            endAdornment: autoFilled.cni.dateOfBirth ? (
                              <InputAdornment position="end">
                                <motion.div
                                  initial={{ scale: 0.9, opacity: 0.7 }}
                                  animate={{ scale: [0.9, 1.05, 0.95], opacity: [0.7, 1, 0.85] }}
                                  transition={{ duration: 1.4, repeat: Infinity }}
                                >
                                  <CheckCircleIcon sx={{ color: 'success.main' }} fontSize="small" />
                                </motion.div>
                              </InputAdornment>
                            ) : undefined
                          }}
                        />
                      </motion.div>
                    </Box>
                  </motion.div>
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
                  disabled={!isCniStepComplete || isLoading}
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
              <Card sx={{ ...glassCardSx, mb: 4 }}>
                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                  <DescriptionIcon sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />
                  <Typography variant="h5" fontWeight={800} gutterBottom sx={{ letterSpacing: '-0.015em' }}>
                    Proof of Address
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Upload a recent utility bill or bank statement
                  </Typography>
                  {manualMode.address && (
                    <Chip
                      label="Manual Entry Mode"
                      color="warning"
                      variant="outlined"
                      sx={{ mt: 2.5, borderRadius: 999, fontWeight: 700, bgcolor: 'rgba(255,255,255,0.55)' }}
                    />
                  )}
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
                        setAddressData(prev => ({ ...prev, file }));
                        handleFileUpload(file, 'address');
                      }
                    }}
                    style={{ display: 'none' }}
                    id="address-upload"
                  />
                  <label htmlFor="address-upload" style={{ cursor: 'pointer' }}>
                    <Box sx={{ display: 'grid', placeItems: 'center', py: 4, gap: 1 }}>
                      <CloudUploadIcon sx={{ fontSize: 46, color: 'primary.main' }} />
                      <Typography variant="subtitle2" fontWeight={800} sx={{ letterSpacing: '-0.01em' }}>
                        Upload Address Proof
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Must be dated within the last 3 months
                      </Typography>
                    </Box>
                  </label>
                  <Typography variant="caption" color="text.secondary">
                    PDF or image files accepted
                  </Typography>
                  {addressData.file && (
                    <Typography variant="body2" color="success.main" sx={{ mt: 2 }}>
                      ✓ Uploaded: {addressData.file.name}
                    </Typography>
                  )}
                </Paper>
              </Box>

              {addressData.ocrAttempted && (
                <Box sx={{ maxWidth: 800, mx: 'auto', mt: 2 }}>
                  <Card sx={{ ...glassCardSx, mb: 3 }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                        Summary
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">Address</Typography>
                          <Typography fontWeight={700}>{addressData.address || '—'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">Document date</Typography>
                          <Typography fontWeight={700}>{formatIsoToUs(addressData.documentDate) || '—'}</Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                  <motion.div variants={fieldRevealParent} initial="hidden" animate="show">
                    <motion.div variants={fieldRevealItem}>
                      <TextField
                        fullWidth
                        label="Address"
                        value={addressData.address}
                        onChange={(e) => setAddressData(prev => ({ ...prev, address: e.target.value }))}
                        variant="outlined"
                        multiline
                        minRows={2}
                        sx={manualFieldSx(manualMode.address)}
                        InputProps={{
                          endAdornment: autoFilled.address.address ? (
                            <InputAdornment position="end">
                              <motion.div
                                initial={{ scale: 0.9, opacity: 0.7 }}
                                animate={{ scale: [0.9, 1.05, 0.95], opacity: [0.7, 1, 0.85] }}
                                transition={{ duration: 1.4, repeat: Infinity }}
                              >
                                <CheckCircleIcon sx={{ color: 'success.main' }} fontSize="small" />
                              </motion.div>
                            </InputAdornment>
                          ) : undefined
                        }}
                      />
                    </motion.div>
                  </motion.div>
                </Box>
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
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {toast ? (
          <Alert onClose={() => setToast(null)} severity={toast.type} sx={{ width: '100%' }}>
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>

      <Box sx={{
        maxWidth: 960,
        mx: 'auto',
        px: { xs: 2, md: 3 },
        pb: 5,
        opacity: 0.95
      }}>
        <Paper sx={{
          ...glassCardSx,
          px: 3,
          py: 2.5,
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap'
        }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Chip icon={<LockIcon />} label="End-to-End Encrypted" variant="outlined" sx={{ borderRadius: 999, fontWeight: 700 }} />
            <Chip icon={<VerifiedUserIcon />} label="GDPR Compliant" variant="outlined" sx={{ borderRadius: 999, fontWeight: 700 }} />
            <Chip icon={<CloudDoneIcon />} label="Secure Document Storage" variant="outlined" sx={{ borderRadius: 999, fontWeight: 700 }} />
          </Box>
          <Typography variant="caption" color="text.secondary">
            We never sell your documents. Verification is handled securely.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}