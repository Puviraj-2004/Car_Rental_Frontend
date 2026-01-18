'use client';

import React from 'react';
import { useHome } from '@/hooks/graphql/useHome';
import { HomeView } from './HomeView';

export const HomeContainer = () => {
  const { featuredCars, loading, error } = useHome();

  // Any home-page specific event handlers (e.g. analytics tracking) 
  // would be defined here as per Chaymae's "Containers" rule.

  return (
    <HomeView 
      featuredCars={featuredCars} 
      loading={loading} 
      error={error} 
    />
  );
};