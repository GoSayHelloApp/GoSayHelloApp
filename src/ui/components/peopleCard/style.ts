import { useTheme } from "@mui/material";

export const PeopleCardStyles = () => {
    const theme = useTheme();
    return {
        main: {
            backgroundColor: theme.palette.grey[100],
            p: 2,
            borderRadius: 6,
        }
    }
}