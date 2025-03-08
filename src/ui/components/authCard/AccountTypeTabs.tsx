import React from "react";
import { Tabs, Tab, useTheme } from "@mui/material";

interface AccountTypeTabsProps {
    accountType: number;
    onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}

const AccountTypeTabs: React.FC<AccountTypeTabsProps> = ({ accountType, onTabChange }) => {
    const theme = useTheme();
    return (
        <Tabs value={accountType} onChange={onTabChange} sx={{ backgroundColor: theme.palette.grey[400], borderRadius: "33px", mb: 1 }}>
            <Tab sx={{ flex: "1 1 auto", height: "60px", fontSize: "16px" }} label="User Account" />
            <Tab sx={{ flex: "1 1 auto", height: "60px", fontSize: "16px" }} label="Business Account" />
        </Tabs>
    );
};

export default AccountTypeTabs;
