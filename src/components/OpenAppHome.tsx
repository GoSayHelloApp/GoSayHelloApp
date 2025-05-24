import { Box, Button, Modal, Typography } from '@mui/material'
import React from 'react'

const OpenApp = ({ openApp, setOpenApp, text }: any) => {

    function isMobile() {
        return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    }
    const handleMobileRedirection = () => {
        if (isMobile()) {
            window.location.href = `https://gosayhello.page.link/?ibi=com.saee.GoSayHELLO&isi=1585044833&apn=com.gosayhello&link=https://gosayhello.page.link`
        }
        else {
            window.location.href = "https://apps.apple.com/pk/app/gosayhello-networking-nearby/id1585044833"
        }
    }
    return (
        <Modal
            open={openApp}
            onClose={() => setOpenApp(false)}
            sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
            <Box
                sx={{
                    p: 4,
                    bgcolor: "black",
                    borderRadius: 2,
                    width: 400,
                    height: 200,
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center ",
                    gap: 2,
                }}
            >
                <Typography variant="body1" color="white">
                    {text}
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleMobileRedirection}
                >
                    Open App
                </Button>
            </Box>
        </Modal>
    )
}

export default OpenApp
