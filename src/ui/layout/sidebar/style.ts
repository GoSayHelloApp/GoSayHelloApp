import { useTheme } from "@mui/material";
import { transform } from "lodash";

export const SidebarStyles = () => {
    const theme = useTheme();
    return {
        mainStyle: {
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)'
        },
    }
}