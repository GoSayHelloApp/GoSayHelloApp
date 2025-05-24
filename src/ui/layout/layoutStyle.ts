import { useTheme } from "@mui/material";

export const LayoutStyles = () => {
    const theme = useTheme();
    return {
        mainStyle: {
            display: 'block',
            width: '100%',
            marginLeft: '250px'
        },
        layoutStyle: {
            display: 'block',
            marginLeft: {
                xs: 0,
                sm: 0,
                md: '250px',
                lg: '250px',
            }
        }
    }
}