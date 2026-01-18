import { AdminBookingsContainer } from '@/components/features/admin/bookings/AdminBookingsContainer';

export default function AdminOnsiteBookingsPage() {
  return (
    <AdminBookingsContainer
      viewFilter={{ label: 'Onsite walk-ins', walkInOnly: true, bookingType: 'RENTAL' }}
    />
  );
}
