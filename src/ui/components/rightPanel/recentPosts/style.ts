import { useTheme } from "@mui/material";

export const RecentPostStyles = () => {
  const theme = useTheme();
  return {
    mainCard: {
        maxWidth: '315px',
        width: '100%',
        minWidth: '315px',
        minHeight: '315px',
        maxHeight: '315px',
        objectFit: 'cover',
        display: 'block',
        margin: 'auto',
        borderRadius: '24px',
        objectPosition: 'top center',
        position: 'relative',
        overflow: 'hidden',
        "&:not(:last-of-type)":{
            mb: 2
        },
        ".reportButton": {
            position: 'absolute',
            top: 16,
            right: 16,
        },
        ".lowerDetails": {
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            padding: '8px 12px 16px',
            backgroundColor: 'rgba(111, 105, 100, 80%)',
        }
    }
  };
};
