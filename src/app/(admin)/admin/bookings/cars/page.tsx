import { Suspense } from 'react';
import { CarsContainer } from '@/components/features/cars/CarsContainer';

export default function Page() {
  return (
    <Suspense>
      <CarsContainer />
    </Suspense>
  );
}