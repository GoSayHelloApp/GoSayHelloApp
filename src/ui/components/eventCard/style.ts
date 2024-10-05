import { useTheme } from "@mui/material";

export const EventCardStyles = () => {
    const theme = useTheme();
    return {
        main: {
            backgroundColor: theme.palette.grey[100],
            p: 2,
            borderRadius: 4,
            position: 'relative'
        },
    }
}