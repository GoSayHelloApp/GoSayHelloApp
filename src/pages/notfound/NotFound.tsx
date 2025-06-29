import React from "react";
import { Box, Typography, Button, Container, useTheme } from "@mui/material";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleMobileRedirection = () => {
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      window.location.href = `https://gosayhello.page.link/?ibi=com.saee.GoSayHELLO&isi=1585044833&apn=com.gosayhello&link=https://gosayhello.page.link`;
    } else {
      window.location.href =
        "https://apps.apple.com/pk/app/gosayhello-networking-nearby/id1585044833";
    }
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          py: 8,
          px: 2,
        }}
      >
        <Box
          sx={{
            position: "relative",
            mb: 4,
            animation: "float 6s ease-in-out infinite",
            "@keyframes float": {
              "0%": { transform: "translateY(0px)" },
              "50%": { transform: "translateY(-20px)" },
              "100%": { transform: "translateY(0px)" },
            },
          }}
        >
          <Icon
            icon="mdi:map-marker-question"
            width={120}
            height={120}
            color={theme.palette.primary.main}
          />
        </Box>

        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "6rem", md: "8rem" },
            fontWeight: 700,
            color: theme.palette.primary.main,
            mb: 2,
            textShadow: `2px 2px 4px ${theme.palette.primary.lighter}`,
          }}
        >
          404
        </Typography>

        <Typography
          variant="h4"
          sx={{
            color: theme.palette.text.primary,
            mb: 1,
            fontWeight: 600,
          }}
        >
          Oops! Page Not Found
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: theme.palette.text.secondary,
            mb: 2,
            maxWidth: "500px",
          }}
        >
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: theme.palette.primary.main,
            mb: 4,
            maxWidth: "500px",
            fontWeight: 500,
          }}
        >
          For a better experience, we recommend using our mobile app which
          provides full access to all features.
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate(-1)}
            startIcon={<Icon icon="mdi:arrow-left" />}
            sx={{
              backgroundColor: theme.palette.primary.main,
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
              },
              px: 4,
              py: 1.5,
            }}
          >
            Go Back
          </Button>

          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate("/nearby")}
            startIcon={<Icon icon="mdi:home" />}
            sx={{
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              "&:hover": {
                borderColor: theme.palette.primary.dark,
                backgroundColor: theme.palette.primary.lighter,
              },
              px: 4,
              py: 1.5,
            }}
          >
            Go Home
          </Button>

          <Button
            variant="contained"
            size="large"
            onClick={handleMobileRedirection}
            startIcon={<Icon icon="mdi:cellphone-link" />}
            sx={{
              backgroundColor: theme.palette.success.main,
              "&:hover": {
                backgroundColor: theme.palette.success.dark,
              },
              px: 4,
              py: 1.5,
            }}
          >
            Open App
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default NotFound;
