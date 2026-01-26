'use client';

import { use } from 'react';
import { AdminDocumentsContainer } from '@/components/features/admin/bookings/documents/AdminDocumentsContainer';

export default function AdminDocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <AdminDocumentsContainer bookingId={id} />;
}
