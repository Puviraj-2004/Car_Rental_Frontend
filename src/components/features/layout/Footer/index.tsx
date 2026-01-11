'use client';

import React from 'react';
import { useFooter } from '@/hooks/useFooter';
import { FooterView } from './FooterView';

export default function Footer() {
  const { settings, loading } = useFooter();

  return (
    <FooterView 
      settings={settings} 
      loading={loading} 
    />
  );
}