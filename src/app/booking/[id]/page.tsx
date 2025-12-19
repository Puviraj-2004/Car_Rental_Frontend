'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StripeCheckoutForm from '@/components/StripeCheckoutForm';
import { getTranslation } from '@/lib/i18n';

// GraphQL query to fetch car details
const GET_CAR = gql`
  query GetCar($id: ID!) {
    car(id: $id) {
      id
      brand
      model
      pricePerDay
    }
  }
`;

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function BookingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    // Get language from localStorage or default to 'en'
    const lang = typeof window !== 'undefined' ? localStorage.getItem('language') || 'en' : 'en';
    setLanguage(lang);
  }, []);

  const steps = [
    getTranslation(language, 'booking.step1'), 
    getTranslation(language, 'booking.step2')
  ];

  const { loading, error: queryError, data } = useQuery(GET_CAR, {
    variables: { id: params.id },
  });

  const handleNext = () => {
    if (activeStep === 0) {
      setError('');

      if (!startDate || !endDate) {
        setError(getTranslation(language, 'forms.selectDates'));
        return;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start >= end) {
        setError(getTranslation(language, 'forms.invalidDate'));
        return;
      }
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSuccess = (bookingId: string) => {
    router.push(`/success/${bookingId}`);
  };

  if (loading) return <Typography>{getTranslation(language, 'home.loading')}</Typography>;
  if (queryError) return <Typography>{getTranslation(language, 'errors.generic')}: {queryError.message}</Typography>;

  const car = data?.car;

  return (
    <div>
      <Button 
        variant="outlined" 
        onClick={() => router.back()}
        sx={{ mb: 2 }}
      >
        {getTranslation(language, 'booking.back')}
      </Button>
      
      <Typography variant="h4" gutterBottom>
        {getTranslation(language, 'booking.title', { brand: car.brand, model: car.model })}
      </Typography>
      
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Card>
        <CardContent>
          {activeStep === 0 && (
            <>
              <Typography variant="h5" gutterBottom>
                {getTranslation(language, 'booking.step1')}
              </Typography>
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              
              <Box sx={{ mt: 2 }}>
                <TextField
                  label={getTranslation(language, 'booking.startDate')}
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                
                <TextField
                  label={getTranslation(language, 'booking.endDate')}
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                
                <TextField
                  label={getTranslation(language, 'booking.pickupLocation')}
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                
                <TextField
                  label={getTranslation(language, 'booking.dropoffLocation')}
                  value={dropoffLocation}
                  onChange={(e) => setDropoffLocation(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                
                <Typography variant="h6" sx={{ mt: 2 }}>
                  {getTranslation(language, 'carDetails.pricePerDay')}: €{car.pricePerDay}/day
                </Typography>
                
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  onClick={handleNext}
                  sx={{ mt: 2 }}
                >
                  {getTranslation(language, 'booking.continueToPayment')}
                </Button>
              </Box>
            </>
          )}

          {activeStep === 1 && (
            <>
              <Typography variant="h5" gutterBottom>
                {getTranslation(language, 'booking.step2')}
              </Typography>
              
              <Elements stripe={stripePromise}>
                <StripeCheckoutForm 
                  carId={params.id}
                  startDate={startDate}
                  endDate={endDate}
                  pickupLocation={pickupLocation}
                  dropoffLocation={dropoffLocation}
                  onSuccess={handleSuccess}
                />
              </Elements>
              
              <Button 
                variant="outlined" 
                onClick={handleBack}
                sx={{ mt: 2 }}
              >
                {getTranslation(language, 'booking.back')}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}