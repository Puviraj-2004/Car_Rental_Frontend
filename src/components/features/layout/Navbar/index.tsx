'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useNavbar } from '@/hooks/useNavbar';
import { NavbarView } from './NavbarView';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { settings, navItems, isLoggedIn, userData, handleLogout } = useNavbar();

  // Local UI State
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  // Handlers
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);
  
  const handleNavigate = (path: string) => {
    setMobileOpen(false);
    handleCloseUserMenu();
    router.push(path);
  };

  return (
    <NavbarView
      settings={settings}
      navItems={navItems}
      isLoggedIn={isLoggedIn}
      userData={userData}
      pathname={pathname}
      mobileOpen={mobileOpen}
      anchorElUser={anchorElUser}
      onOpenMobile={() => setMobileOpen(true)}
      onCloseMobile={() => setMobileOpen(false)}
      onOpenUserMenu={handleOpenUserMenu}
      onCloseUserMenu={handleCloseUserMenu}
      onLogout={handleLogout}
      onNavigate={handleNavigate}
    />
  );
}