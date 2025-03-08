import React from 'react';
import { Box } from '@mui/material';

interface LoaderProps {
    width?: string;
    height?: string;
}

const Loader: React.FC<LoaderProps> = ({ width = '100px', height = '100px' }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: '100%',
            }}
        >
            <img
                src="/images/GoSayHelloLoading.gif"
                alt="Loading..."
                style={{ width, height }}
            />
        </Box>
    );
};

export default Loader;