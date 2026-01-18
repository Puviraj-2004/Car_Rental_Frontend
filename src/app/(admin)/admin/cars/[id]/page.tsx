import { EditCarContainer } from '@/components/features/admin/edit-car/EditCarContainer';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <EditCarContainer id={id} />;
}