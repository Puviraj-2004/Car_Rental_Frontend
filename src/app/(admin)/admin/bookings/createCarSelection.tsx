import { useRouter, useSearchParams } from 'next/navigation';
import { AdminCarsContainer } from '@/components/features/admin/cars/AdminCarsContainer';

export default function AdminBookingCarSelectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // bookingType: 'RENTAL' | 'REPLACEMENT', isWalkIn: boolean
  const bookingType = searchParams.get('bookingType') || 'RENTAL';
  const isWalkIn = searchParams.get('isWalkIn') === 'true';

  // When a car is selected, navigate to booking creation page with correct params
  const handleCarSelect = (carId: string) => {
    const params = new URLSearchParams();
    params.set('carId', carId);
    params.set('bookingType', bookingType);
    if (isWalkIn) params.set('isWalkIn', 'true');
    if (bookingType === 'REPLACEMENT') params.set('totalPrice', '0');
    router.push(`/booking?${params.toString()}`);
  };

  return (
    <AdminCarsContainer onCarSelect={handleCarSelect} />
  );
}
