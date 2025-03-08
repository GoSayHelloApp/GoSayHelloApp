import React, { useState } from "react";
import { Box, Tabs, Tab, useTheme, Typography } from "@mui/material";
import Signup from "../../ui/components/authCard/signUp";
import Login from "../../ui/components/authCard/login";


const Auth: React.FC = () => {
    const theme = useTheme();
    const [value, setValue] = useState(1);

    const handleChange = (_: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };
    function a11yProps(index: any) {
        return {
            id: `simple-tab-${index}`,
            "aria-controls": `simple-tabpanel-${index}`,
        };
    }

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                width: "100vw",
                backgroundColor: theme.palette.grey[100],
            }}
        >
            <Box
                sx={{
                    width: "100%",
                    maxWidth: "450px",
                    padding: "2rem",
                    borderRadius: "10px",
                    bgcolor: {
                        lg: theme.palette.background.paper,
                    },
                    boxShadow: {
                        lg: theme.shadows[4]
                    },
                    textAlign: "center",
                }}
            >
                <Typography sx={{ color: theme.palette.primary.main, fontWeight: "bold", paddingBottom: "20px" }}>
                    <img src="images/gosayhello_logo.jpg" alt="" width="50%" />
                </Typography>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    sx={{ backgroundColor: theme.palette.grey[400], borderRadius: "33px", mb: 3 }}
                >
                    <Tab sx={{ flex: "1 1 auto", height: "60px", width: "150px" }} label="Sign Up" {...a11yProps(0)} />
                    <Tab sx={{ flex: "1 1 auto", height: "60px", width: "150px" }} label="Login" {...a11yProps(1)} />
                </Tabs>
                {value === 0 ? <Signup /> : <Login />}
            </Box>
        </Box>
    );
};

export default Auth;
