import React from 'react';
import { Box, Typography, Link, Divider, Button } from '@mui/material';
import gosayhelloLogo from '../../assets/gosayhello_logo.svg';

const Footer = () => {
    return (
        <Box sx={{
            backgroundColor: '#212124', color: 'white',
            padding: {
                sx: 1,
                md: 1
            },
            mt: {
                sx: 1,
                md: 1
            },
        }}>
            <Divider sx={{
                height: "20px",
                color: "primary"
            }} />
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textAlign: { xs: 'center', md: 'left' },
                    mt: "14px",
                }}
            >

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: { xs: 1, md: 4 },
                        textAlign: { xs: 'center', md: 'left' },
                    }}
                >
                    <img src="/images/gosayhello-logo-white.svg" alt="GoSayHello Logo" style={{ width: '190px', marginBottom: "10px" }} />
                    <Link href="https://www.gosayhelloapp.com/terms-conditions" color="inherit" underline="hover" sx={{
                        display: 'block',
                        textDecoration: "underline",
                        mb: {
                            sx: 0,
                            md: 1,

                        }
                    }}>
                        Terms Of Service
                    </Link>
                    <Link href="https://www.gosayhelloapp.com/privacy-policy" color="inherit" underline="hover" sx={{
                        display: 'block',
                        textDecoration: "underline",
                        mb: {
                            sx: 3,
                            md: 1
                        }
                    }}>
                        Privacy Policy
                    </Link>
                </Box>
                <Box
                    sx={{
                        mt: {
                            sx: 2
                        }
                    }}
                >
                    {/* <Button
                        sx={{ borderRadius: "20px" }}
                        variant="contained"
                        color="primary"
                        size="medium"
                    >
                        Create Your Own Event
                    </Button> */}
                </Box>
            </Box>
        </Box >
    );
};

export default Footer;