'use client';

import React from 'react';
import { useAdminSidebar } from '@/hooks/useAdminSidebar';
import { AdminSidebarView } from './AdminSidebarView';

/**
 * Senior Architect Note:
 * AdminSidebar Container.
 * Orchestrates navigation and auth state logic via the custom hook.
 */
export default function AdminSidebar() {
  const { 
    open, 
    pathname, 
    settings, 
    menuItems, 
    handleToggle, 
    handleLogout, 
    router 
  } = useAdminSidebar();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <AdminSidebarView
      open={open}
      pathname={pathname}
      settings={settings}
      menuItems={menuItems}
      onToggle={handleToggle}
      onLogout={handleLogout}
      onNavigate={handleNavigate}
    />
  );
}