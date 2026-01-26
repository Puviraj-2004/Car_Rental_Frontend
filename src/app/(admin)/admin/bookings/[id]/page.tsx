import { use } from 'react';
import { AdminBookingDetailsContainer } from '@/components/features/admin/bookings/AdminBookingDetailsContainer';

export default function AdminBookingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <AdminBookingDetailsContainer bookingId={id} />;
}
