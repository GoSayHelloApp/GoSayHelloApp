import { useTheme } from '@mui/material';
import React from 'react'

export const EventDetailsStyles = () => {
    const theme = useTheme();
    return {
        mainStyles: {
            // backgroundColor: theme.palette.grey[200],
            // borderRadius: '24px',
            // width: "100%",
            // position: "relative",
            // maxHeight: 'calc(100svh - 76px)',
            // overflow: "auto"
        },
        imageBoxStyles: (bgImage: string) => {
            return {
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                borderRadius: '24px',
                height: '1203px',
            }

        },
        scrollBoxStyles: {
            overflow: 'auto',
            height: '200px',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        mapContainerStyles: {
            height: '200px',
            width: '100%',
            borderRadius: '24px',
            marginTop: '10px',
        },
    };
};
