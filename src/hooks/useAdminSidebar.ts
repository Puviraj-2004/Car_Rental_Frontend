import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery, useApolloClient } from '@apollo/client';
import { deleteCookie } from 'cookies-next';
import { signOut } from 'next-auth/react';
import { 
  Dashboard, DirectionsCar, People, BookOnline, 
  BrandingWatermark 
} from '@mui/icons-material';
import { GET_PLATFORM_SETTINGS_QUERY } from '@/lib/graphql/queries';

export const useAdminSidebar = () => {
  const [open, setOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const client = useApolloClient();

  const { data } = useQuery(GET_PLATFORM_SETTINGS_QUERY);
  const settings = data?.platformSettings;

  const handleToggle = () => setOpen(!open);

  const handleLogout = async () => {
    try {
      deleteCookie('token');
      localStorage.clear();
      await client.clearStore();
      await signOut({ callbackUrl: '/' });
    } catch (err) {
      console.error('Logout failed:', err);
      router.push('/');
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: Dashboard, path: '/admin/dashboard' },
    { text: 'Cars Management', icon: DirectionsCar, path: '/admin/cars' },
    { text: 'Bookings', icon: BookOnline, path: '/admin/bookings' },
    { text: 'Onsite Rentals', icon: BookOnline, path: '/admin/bookings/onsite' },
    { text: 'Replacement Bookings', icon: BookOnline, path: '/admin/bookings/replacement' },
    { text: 'Inventory', icon: BrandingWatermark, path: '/admin/inventory' },
    { text: 'Users', icon: People, path: '/admin/users' },
  ];

  return {
    open,
    pathname,
    settings,
    menuItems,
    handleToggle,
    handleLogout,
    router
  };
};