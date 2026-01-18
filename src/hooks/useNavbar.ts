import { useQuery, useApolloClient } from '@apollo/client';
import { useSession, signOut } from 'next-auth/react';
import { deleteCookie } from 'cookies-next';
import { GET_ME_QUERY, GET_PLATFORM_SETTINGS_QUERY } from '@/lib/graphql/queries';

export const useNavbar = () => {
  const client = useApolloClient();
  const { data: session } = useSession();
  
  const { data: userData } = useQuery(GET_ME_QUERY, { 
    skip: !session?.accessToken 
  });
  
  const { data: platformData } = useQuery(GET_PLATFORM_SETTINGS_QUERY);

  const handleLogout = async () => {
    deleteCookie('token');
    await client.clearStore();
    await signOut({ callbackUrl: '/' });
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'About Us', path: '/about' },
    { label: 'Our Fleet', path: '/cars' },
  ];

  return {
    session,
    userData: userData?.me,
    settings: platformData?.platformSettings || {},
    navItems,
    handleLogout,
    isLoggedIn: !!session
  };
};