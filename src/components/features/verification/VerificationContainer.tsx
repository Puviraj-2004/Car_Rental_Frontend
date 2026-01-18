'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useVerification } from '@/hooks/graphql/useVerification';
import { VerificationView } from './VerificationView';

export const VerificationContainer = ({ token }: { token: string }) => {
  const { processOCR, updateProfile, bookingData } = useVerification(token);

  // States
  const [currentStep, setCurrentStep] = useState(0);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' as 'info' | 'warning' | 'error' | 'success' });
  const [activeScanning, setActiveScanning] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [device, setDevice] = useState<'App' | 'Web'>('Web');

  // Previews & Files
  // Added 'cniBack' for ID Card Back Side
  const [previews, setPreviews] = useState({ licenseFront: '', licenseBack: '', cni: '', cniBack: '', address: '' });
  const [files, setFiles] = useState<{ [key: string]: File }>({});

  // Form Data
  // Added 'dob' and 'issueDate' to licenseData
  const [licenseData, setLicenseData] = useState({ 
    name: '', number: '', expiry: '', 
    categories: [] as string[], restrictsToAutomatic: false, 
    dob: '', issueDate: '' 
  });
  
  const [cniData, setCniData] = useState({ name: '', number: '', dob: '', idExpiry: '' });
  const [addressData, setAddressData] = useState({ address: '' });

  useEffect(() => {
    const isMobile = /android|iphone|kindle|ipad/i.test(navigator.userAgent);
    setDevice(isMobile ? 'App' : 'Web');
  }, []);

  // STEP LOCKING LOGIC
  const isLicenseComplete = useMemo(() => 
    !!(previews.licenseFront && previews.licenseBack && licenseData.name && licenseData.number && licenseData.expiry && licenseData.dob && licenseData.issueDate), 
  [licenseData, previews]);

  const isCniComplete = useMemo(() => 
    !!(previews.cni && previews.cniBack && cniData.name && cniData.number && cniData.dob && cniData.idExpiry), 
  [cniData, previews]);

  const isAddressComplete = useMemo(() => 
    !!(previews.address && addressData.address), 
  [addressData, previews]);

  const handleFileUpload = async (file: File, type: string, side?: string) => {
    // Unique Key for Loading State
    const scanKey = side ? `${type}_${side}` : type;
    setActiveScanning(scanKey);

    // 1. Generate Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (type === 'LICENSE') {
        if (side === 'FRONT') setPreviews(p => ({ ...p, licenseFront: result }));
        if (side === 'BACK') setPreviews(p => ({ ...p, licenseBack: result }));
      } else if (type === 'ID_CARD') {
        if (!side || side === 'FRONT') setPreviews(p => ({ ...p, cni: result }));
        if (side === 'BACK') setPreviews(p => ({ ...p, cniBack: result }));
      } else if (type === 'ADDRESS_PROOF') {
        setPreviews(p => ({ ...p, address: result }));
      }
    };
    reader.readAsDataURL(file);

    // 2. Save File for Submission
    // Naming convention: licensefront, licenseback, id_card, id_card_back, address_proof
    let fileKey = type.toLowerCase();
    if (side) fileKey += side === 'FRONT' && type === 'LICENSE' ? 'front' : (side === 'BACK' && type === 'LICENSE' ? 'back' : (side === 'BACK' ? '_back' : ''));
    
    // Correction for specific keys used in handleSubmit
    if (type === 'LICENSE' && side === 'FRONT') fileKey = 'licensefront';
    if (type === 'LICENSE' && side === 'BACK') fileKey = 'licenseback';
    if (type === 'ID_CARD' && !side) fileKey = 'id_card';
    if (type === 'ID_CARD' && side === 'BACK') fileKey = 'id_card_back';
    if (type === 'ADDRESS_PROOF') fileKey = 'address_proof';

    setFiles(prev => ({ ...prev, [fileKey]: file }));

    // 3. Process OCR
    try {
      const { data } = await processOCR({ 
        variables: { 
          file, 
          documentType: type, 
          side: side || 'FRONT'  // Add default side
        } 
      });
      const res = data?.processDocumentOCR;
      console.log('FRONTEND RECEIVED OCR DATA:', res);

      // Handle specific OCR errors
      if (res?.isQuotaExceeded) {
        setAlert({ 
          open: true, 
          message: 'AI Limit reached. Please fill the details manually below.', 
          severity: 'warning' 
        });
        return;
      }

      if (res?.fallbackUsed) {
        setAlert({ 
          open: true, 
          message: 'Photo might be blurry. Please check the pre-filled fields and correct any mistakes manually.', 
          severity: 'info' 
        });
      }

      if (type === 'LICENSE') {
        const ocrName = (res?.fullName || `${res?.firstName || ''} ${res?.lastName || ''}`).trim();
        const ocrCats = res?.licenseCategories || (res?.licenseCategory ? [res.licenseCategory] : []);
        
        setLicenseData(prev => {
          const updatedData = {
            ...prev,
            name: ocrName || prev.name,
            number: res?.licenseNumber || prev.number,
            expiry: res?.expiryDate || prev.expiry,
            dob: res?.birthDate || prev.dob,
            issueDate: res?.issueDate || prev.issueDate,
            categories: ocrCats.length ? Array.from(new Set([...prev.categories, ...ocrCats])) : prev.categories,
            restrictsToAutomatic: res?.restrictsToAutomatic ?? prev.restrictsToAutomatic
          };
          console.log('Merged License Data:', updatedData);
          return updatedData;
        });
      } else if (type === 'ID_CARD') {
        setCniData(prev => ({
          ...prev,
          name: res?.fullName || prev.name,
          number: res?.documentId || prev.number,
          dob: res?.birthDate || prev.dob,
          idExpiry: res?.expiryDate || prev.idExpiry
        }));
      } else if (type === 'ADDRESS_PROOF') {
        setAddressData(prev => ({ ...prev, address: res?.address || prev.address }));
      }
    } catch (e: any) { 
      console.error("OCR Error:", e);
      setAlert({ 
        open: true, 
        message: 'OCR processing failed. Please fill the details manually.', 
        severity: 'error' 
      });
    } finally { setActiveScanning(null); }
  };

  const handleNext = () => {
    const returnDate = bookingData?.bookingByToken?.endDate;
    const today = new Date();

    if (currentStep === 0) {
      // --- STEP 1: LICENSE VALIDATION ---
      
      // 1. Check Empty Fields
      if (!licenseData.expiry || !licenseData.issueDate || !licenseData.dob) {
        setAlert({ 
          open: true, 
          message: 'Please ensure Expiry Date, Issue Date, and Date of Birth are filled.', 
          severity: 'error' 
        });
        return;
      }

      // 2. Check Expiry
      const expiry = new Date(licenseData.expiry);
      if (returnDate && expiry <= new Date(returnDate)) {
        setAlert({ 
          open: true, 
          message: 'License expires before the return date. Insurance cannot be covered.', 
          severity: 'error' 
        });
        return;
      }

      // 3. Check Age (Minimum 21 Years)
      const dob = new Date(licenseData.dob);
      const age = today.getFullYear() - dob.getFullYear();
      if (age < 21) {
        setAlert({ 
          open: true, 
          message: 'You must be at least 21 years old to rent a vehicle.', 
          severity: 'error' 
        });
        return;
      }

      // 4. Check Experience (Minimum 2 Years)
      const issue = new Date(licenseData.issueDate);
      const experienceYears = (today.getTime() - issue.getTime()) / (1000 * 60 * 60 * 24 * 365);
      if (experienceYears < 2) {
        setAlert({ 
          open: true, 
          message: 'You need at least 2 years of driving experience.', 
          severity: 'error' 
        });
        return;
      }

      // 5. Check Category
      const requiredCategory = bookingData?.bookingByToken?.car?.requiredLicense || 'B';
      const userCategories = licenseData.categories || [];
      const hasValidCategory = userCategories.some((cat: string) =>
        cat.trim().toUpperCase() === requiredCategory.trim().toUpperCase()
      );
      if (!hasValidCategory) {
        setAlert({ 
          open: true, 
          message: `This car requires a '${requiredCategory}' license. Your uploaded license does not match.`, 
          severity: 'error' 
        });
        return;
      }
    } else if (currentStep === 1) {
      // --- STEP 2: ID VALIDATION ---
      // 0. Check Empty Fields
      if (!cniData.name || !cniData.number || !cniData.dob || !cniData.idExpiry) {
        setAlert({ 
          open: true, 
          message: 'Please fill all ID Card fields: Name, Number, Date of Birth, and ID Expiry Date.', 
          severity: 'error' 
        });
        return;
      }

      // 1. Name Match
      const licenseNameNorm = licenseData.name.toLowerCase().replace(/\s/g, '');
      const cniNameNorm = cniData.name.toLowerCase().replace(/\s/g, '');
      if (!cniNameNorm.includes(licenseNameNorm) && !licenseNameNorm.includes(cniNameNorm)) {
        if(!confirm("The name on your ID Card looks different from your License. Are you sure they belong to the same person?")) {
            return;
        }
      }

      // 2. DOB Match
      if (cniData.dob !== licenseData.dob) {
         if(!confirm(`Date of Birth mismatch!\nLicense: ${licenseData.dob}\nID: ${cniData.dob}\nProceed anyway?`)) {
            return;
         }
      }
    } else if (currentStep === 2) {
       if (!addressData.address) {
        setAlert({ 
          open: true, 
          message: 'Address is required.', 
          severity: 'error' 
        });
        return;
      }
    }

    setCurrentStep((prev: number) => prev + 1);
  };

  const handleSubmit = async () => {
  try {
    await updateProfile({
      variables: {
        input: {
          bookingToken: token,
          bookingId: bookingData?.bookingByToken?.id,  // ✅ ADD THIS
          // License
          licenseNumber: licenseData.number,
          licenseExpiry: licenseData.expiry,
          licenseIssueDate: licenseData.issueDate,
          driverDob: licenseData.dob,
          licenseCategories: licenseData.categories, // Send Array
          
          // ID Card
          idNumber: cniData.number,
          idExpiry: cniData.idExpiry,
          
          // Files
          licenseFrontFile: files.licensefront,
          licenseBackFile: files.licenseback,
          idCardFile: files.id_card,
          idCardBackFile: files.id_card_back,
          addressProofFile: files.address_proof,

          // Address
          verifiedAddress: addressData.address
        }
      }
    });
    setIsSuccess(true);
  } catch (e: any) { 
    console.error(e);
    setAlert({ 
      open: true, 
      message: "Verification submission failed: " + e.message, 
      severity: 'error' 
    });
  }
};

  return (
    <VerificationView
      currentStep={currentStep} setCurrentStep={setCurrentStep}
      activeScanning={activeScanning} isSuccess={isSuccess} device={device}
      onNext={handleNext}
      previews={previews} licenseData={licenseData} setLicenseData={setLicenseData}
      cniData={cniData} setCniData={setCniData} addressData={addressData}
      setAddressData={setAddressData} handleFileUpload={handleFileUpload}
      handleSubmit={handleSubmit} isLicenseComplete={isLicenseComplete}
      isCniComplete={isCniComplete} isAddressComplete={isAddressComplete}
      alert={alert} setAlert={setAlert}
    />
  );
};