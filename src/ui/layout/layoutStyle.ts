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
            marginLeft: '234px',
        }
    }
}