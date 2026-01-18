'use client';

import React from 'react';
import {
  Box, Typography, FormGroup, FormControlLabel, Checkbox, Divider
} from '@mui/material';

interface FilterSection {
  label: string;
  key: string;
  data: any[];
}

interface FilterPanelProps {
  brands: any[];
  enums: any;
  secondaryFilter: any;
  onCheckboxChange: (key: string, value: string) => void;
}

export const FilterPanel = React.memo<FilterPanelProps>(({ brands, enums, secondaryFilter, onCheckboxChange }) => {
  const filterSections: FilterSection[] = [
    { label: 'Brands', key: 'brandIds', data: brands },
    { label: 'Transmission', key: 'transmissions', data: enums.transmissionEnum?.enumValues },
    { label: 'Fuel Type', key: 'fuelTypes', data: enums.fuelTypeEnum?.enumValues },
    { label: 'CritAir', key: 'critAirRatings', data: enums.critAirEnum?.enumValues },
  ];

  return (
    <Box>
      <Typography variant="h6" fontWeight={800} mb={2}>Filters</Typography>
      {filterSections.map((section) => (
        <Box key={section.key} sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={1}>{section.label}</Typography>
          <FormGroup>
            {section.data?.map((item: any) => (
              <FormControlLabel
                key={item.id || item.name}
                control={<Checkbox size="small" checked={secondaryFilter[section.key].includes(item.id || item.name)} onChange={() => onCheckboxChange(section.key, item.id || item.name)} />}
                label={<Typography variant="body2">{item.name?.replace('_', ' ')}</Typography>}
              />
            ))}
          </FormGroup>
          <Divider sx={{ mt: 2 }} />
        </Box>
      ))}
    </Box>
  );
});

FilterPanel.displayName = 'FilterPanel';
