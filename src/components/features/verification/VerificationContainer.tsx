'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useVerification } from '@/hooks/graphql/useVerification';
import { VerificationView } from './VerificationView';

export const VerificationContainer = ({ token }: { token: string }) => {
  const { processOCR, updateProfile } = useVerification(token);

  // States
  const [currentStep, setCurrentStep] = useState(0);
  const [activeScanning, setActiveScanning] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [device, setDevice] = useState<'App' | 'Web'>('Web');

  // Previews & Files
  const [previews, setPreviews] = useState({ licenseFront: '', licenseBack: '', cni: '', address: '' });
  const [files, setFiles] = useState<{ [key: string]: File }>({});

  // Form Data
  const [licenseData, setLicenseData] = useState({ name: '', number: '', expiry: '', categories: [] as string[], restrictsToAutomatic: false });
  const [cniData, setCniData] = useState({ name: '', number: '', dob: '' });
  const [addressData, setAddressData] = useState({ address: '' });

  useEffect(() => {
    const isMobile = /android|iphone|kindle|ipad/i.test(navigator.userAgent);
    setDevice(isMobile ? 'App' : 'Web');
  }, []);

  // 🛡️ STEP LOCKING LOGIC
  const isLicenseComplete = useMemo(() => 
    !!(previews.licenseFront && previews.licenseBack && licenseData.name && licenseData.number), 
  [licenseData, previews]);

  const isCniComplete = useMemo(() => 
    !!(previews.cni && cniData.name && cniData.number), 
  [cniData, previews]);

  const isAddressComplete = useMemo(() => 
    !!(previews.address && addressData.address), 
  [addressData, previews]);

  const handleFileUpload = async (file: File, type: string, side?: string) => {
    const scanKey = side ? `${type}_${side}` : type;
    setActiveScanning(scanKey);

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (side === 'FRONT') setPreviews(p => ({ ...p, licenseFront: result }));
      else if (side === 'BACK') setPreviews(p => ({ ...p, licenseBack: result }));
      else if (type === 'ID_CARD') setPreviews(p => ({ ...p, cni: result }));
      else if (type === 'ADDRESS_PROOF') setPreviews(p => ({ ...p, address: result }));
    };
    reader.readAsDataURL(file);

    // Save actual file for final submission
    const fileKey = side ? `${type.toLowerCase()}${side.toLowerCase()}` : type.toLowerCase();
    setFiles(prev => ({ ...prev, [fileKey]: file }));

    try {
      const { data } = await processOCR({ variables: { file, documentType: type, side } });
      const res = data?.processDocumentOCR;

      if (type === 'LICENSE') {
        const ocrName = (res?.fullName || `${res?.firstName || ''} ${res?.lastName || ''}`).trim();
        const ocrCats = res?.licenseCategories || (res?.licenseCategory ? [res.licenseCategory] : []);
        
        setLicenseData(p => ({
          ...p,
          name: ocrName || p.name,
          number: res?.licenseNumber || p.number,
          expiry: res?.expiryDate || p.expiry,
          categories: ocrCats.length ? Array.from(new Set([...p.categories, ...ocrCats])) : p.categories,
          restrictsToAutomatic: res?.restrictsToAutomatic ?? p.restrictsToAutomatic
        }));
      } else if (type === 'ID_CARD') {
        setCniData(p => ({
          ...p,
          name: res?.fullName || p.name,
          number: res?.documentId || p.number,
          dob: res?.birthDate || p.dob
        }));
      } else if (type === 'ADDRESS_PROOF') {
        setAddressData(p => ({ ...p, address: res?.address || p.address }));
      }
    } catch (e) { console.error(e); } 
    finally { setActiveScanning(null); }
  };

  const handleSubmit = async () => {
    try {
      await updateProfile({
        variables: {
          input: {
            bookingToken: token,
            licenseNumber: licenseData.number,
            licenseExpiry: licenseData.expiry,
            licenseCategory: licenseData.categories[0] || 'B',
            idNumber: cniData.number,
            licenseFrontFile: files.licensefront,
            licenseBackFile: files.licenseback,
            idCardFile: files.id_card,
            addressProofFile: files.address_proof,
          }
        }
      });
      setIsSuccess(true);
    } catch (e) { alert("Verification failed. Please try again."); }
  };

  return (
    <VerificationView
      currentStep={currentStep} setCurrentStep={setCurrentStep}
      activeScanning={activeScanning} isSuccess={isSuccess} device={device}
      previews={previews} licenseData={licenseData} setLicenseData={setLicenseData}
      cniData={cniData} setCniData={setCniData} addressData={addressData}
      setAddressData={setAddressData} handleFileUpload={handleFileUpload}
      handleSubmit={handleSubmit} isLicenseComplete={isLicenseComplete}
      isCniComplete={isCniComplete} isAddressComplete={isAddressComplete}
    />
  );
};