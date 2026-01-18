'use client';

import React from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  Stack
} from '@mui/material';
import { Close, ZoomIn, ZoomOut } from '@mui/icons-material';

interface ImageViewerModalProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
}

export const ImageViewerModal = ({ open, onClose, imageUrl, title }: ImageViewerModalProps) => {
  const [scale, setScale] = React.useState(1);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 1));

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ 
        sx: { 
          borderRadius: 4,
          bgcolor: '#0F172A'
        } 
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', p: 2 }}>
        <Typography variant="subtitle1" fontWeight={800}>{title}</Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ bgcolor: '#0F172A', p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Zoom Controls */}
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <IconButton 
            size="small" 
            onClick={handleZoomOut} 
            disabled={scale <= 1}
            sx={{ color: '#3B82F6' }}
          >
            <ZoomOut />
          </IconButton>
          <Typography variant="body2" sx={{ color: '#64748B', minWidth: '50px', textAlign: 'center' }}>
            {Math.round(scale * 100)}%
          </Typography>
          <IconButton 
            size="small" 
            onClick={handleZoomIn} 
            disabled={scale >= 3}
            sx={{ color: '#3B82F6' }}
          >
            <ZoomIn />
          </IconButton>
        </Stack>

        {/* Image Container */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            maxHeight: '600px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#1E293B',
            borderRadius: 3,
            border: '2px solid #334155',
            overflow: 'auto',
            transform: `scale(${scale})`,
            transformOrigin: 'center',
            transition: 'transform 0.2s ease',
          }}
        >
          <Image
            src={imageUrl}
            alt={title}
            width={500}
            height={600}
            style={{
              maxWidth: '100%',
              height: 'auto',
              borderRadius: '8px'
            }}
            priority
          />
        </Box>

        <Typography variant="caption" sx={{ color: '#64748B', mt: 2 }}>
          💡 Use zoom buttons to see details clearly
        </Typography>
      </DialogContent>
    </Dialog>
  );
};
