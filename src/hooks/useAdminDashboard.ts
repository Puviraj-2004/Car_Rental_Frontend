import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

const GET_DASHBOARD_DATA = gql`
  query GetDashboardData {
    users { id }
    cars { id status }
    bookings {
      id
      totalPrice
      status
      createdAt
      user { fullName email }
      car { brand { name } model { name } }
    }
  }
`;

export const useAdminDashboard = () => {
  const { data, loading, error, refetch } = useQuery(GET_DASHBOARD_DATA, {
    fetchPolicy: 'cache-and-network',
  });

  const stats = {
    totalUsers: data?.users?.length || 0,
    totalCars: data?.cars?.length || 0,
    totalBookings: data?.bookings?.length || 0,
    // Calculate total revenue from non-cancelled bookings
    totalRevenue: data?.bookings?.reduce((acc: number, curr: any) => 
      curr.status !== 'CANCELLED' ? acc + (curr.totalPrice || 0) : acc, 0) || 0,
    recentBookings: data?.bookings?.slice(0, 5) || [],
    availableCars: data?.cars?.filter((c: any) => c.status === 'AVAILABLE').length || 0
  };

  return { stats, loading, error, refetch };
};