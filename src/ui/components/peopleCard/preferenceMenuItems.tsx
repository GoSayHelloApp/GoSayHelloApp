import React from 'react';
import { MenuItem, Box, useTheme } from '@mui/material';
import { PreferenceType } from '../../../models/responseModels/preferences';

interface PreferenceMenuItemsProps {
    preferences: PreferenceType[];
    onSelect: (selectedType: PreferenceType) => void;
}

const PreferenceMenuItems: React.FC<PreferenceMenuItemsProps> = ({ preferences, onSelect }) => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                position: 'absolute',
                width: '92%',
                maxHeight: '200px',
                overflow: 'auto',
                left: 33,
                marginY: 1,
                borderRadius: '4px 4px 4px 4px',
                bgcolor: theme.palette.background.neutral,
                paddingRight: 0.5,
                top: 60,
                zIndex: 10,
            }}
        >
            {preferences.length > 0 ? (
                preferences.map((option) => (
                    <MenuItem
                        sx={{
                            borderRadius: 4,
                            width: '100%',
                        }}
                        key={option.name}
                        value={option.name}
                        onClick={() => onSelect(option)}
                    >
                        {option.name}
                    </MenuItem>
                ))
            ) : (
                <MenuItem sx={{ borderRadius: 4 }}>No results found</MenuItem>
            )}
        </Box>
    );
};

export default PreferenceMenuItems;