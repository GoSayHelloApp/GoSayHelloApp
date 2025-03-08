import { Tab, Tabs, useTheme } from "@mui/material";
import React from "react";

interface SearchTabsProps {
    onTabChange: (tabIndex: number) => void;
}

const SearchTabs: React.FC<SearchTabsProps> = ({ onTabChange }) => {
    const theme = useTheme();
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
        onTabChange(newValue);
    };

    return (
        <Tabs value={value} onChange={handleChange} aria-label="search tabs">
            <Tab
                sx={{
                    borderRadius: "48px 0 0 48px",
                    paddingX: "10px",
                    paddingY: "2px",
                    maxHeight: 2,
                    fontSize: 14,
                    bgcolor: theme.palette.grey[300],
                }}
                label="Preferences"
            />
            <Tab
                sx={{
                    borderRadius: "0 48px 48px 0",
                    paddingX: "10px",
                    paddingY: "2px",
                    maxHeight: 2,
                    fontSize: 14,
                    bgcolor: theme.palette.grey[300],
                }}
                label="Names"
            />
        </Tabs>
    );
};

export default SearchTabs;
