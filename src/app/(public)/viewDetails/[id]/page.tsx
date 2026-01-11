import { DetailsContainer } from '@/components/features/cars/DetailsContainer';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CarDetailsPage({ params }: PageProps) {
  const { id } = await params;

  return <DetailsContainer id={id} />;
}