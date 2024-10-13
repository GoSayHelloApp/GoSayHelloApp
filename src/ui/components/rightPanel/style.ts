import { useTheme } from "@mui/material";

export const RightPanelStyles = () => {
  const theme = useTheme();
  return {
    main: {
      ".MuiAccordion-heading": {
        px: 3,
        py: 0,
        display: 'block'
      },
      "[class*=MuiAccordion-root]": {
        backgroundColor: theme.palette.grey[200],
        borderRadius: `24px !important`,
        mb: 3,
        boxShadow: "none",
        "&:before": {
          display: "none",
        },
        "&.Mui-expanded": {
            boxShadow: "none",
            backgroundColor: theme.palette.grey[200],
        },
        ".MuiAccordionSummary-root": {
            minHeight: 76
        },
        ".MuiAccordionSummary-content": {
            m: 0,
        },
        ".MuiCollapse-root": {
            maxHeight: 'calc(100svh - 76px - 76px - 48px - 150px)',
            overflowY: 'auto'
        }
      },
    },
  };
};
