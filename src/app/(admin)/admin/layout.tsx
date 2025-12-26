import Sidebar from '@/components/sidebar';
import { Box } from '@mui/material';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#FBFBFE' }}>
    <Sidebar />
        <Box component="main" sx={{ 
            flexGrow: 1, 
            p: 4, 
            transition: 'margin 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
            {children}
        </Box>
    </Box>
  );
}