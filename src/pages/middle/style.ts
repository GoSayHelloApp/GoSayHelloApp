import { useTheme } from "@mui/material";

export const MiddleStyles = () => {
    const theme = useTheme();
    return {
        homeText: {
            borderBottom: `1px solid ${theme.palette.primary.main}`,
            mb: 3,
        },
        anotherHomeText: {
            borderBottom: '1px solid'
        }
    }
}