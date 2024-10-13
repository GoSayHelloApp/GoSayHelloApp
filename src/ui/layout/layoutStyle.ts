import { useTheme } from "@mui/material";

export const LayoutStyles = () => {
    const theme = useTheme();
    return {
        mainStyle: {
            display: 'block',
            width: '100%',
            marginRight: '250px'
        },
    }
}