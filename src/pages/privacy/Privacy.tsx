import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

const Privacy = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const privacyOptions = [
    {
      title: "Block Users",
      description: "Manage users you want to block",
      icon: "mdi:account-cancel",
      path: "/block-user",
      color: theme.palette.error.main,
    },
    // Add more privacy options here in the future
  ];

  return (
    <Container
      maxWidth="sm"
      sx={{ height: "80vh", display: "flex", flexDirection: "column" }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          py: 4,
          overflow: "auto",
        }}
      >
        <Typography variant="h3" fontWeight="semiBold" mb={3} mt={5}>
          Privacy Settings
        </Typography>
        <Typography
          variant="body2"
          fontWeight="semibold"
          sx={{ fontSize: "20px" }}
          color="textSecondary"
          mb={4}
        >
          Manage your privacy preferences and blocked users.
        </Typography>

        <List
          sx={{
            width: "100%",
            bgcolor: theme.palette.background.paper,
            borderRadius: 2,
            mb: 4,
          }}
        >
          {privacyOptions.map((option) => (
            <ListItem
              key={option.title}
              onClick={() => navigate(option.path)}
              sx={{
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: theme.palette.background.neutral,
                },
              }}
            >
              <ListItemIcon>
                <Icon icon={option.icon} color={option.color} fontSize={24} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    variant="subtitle1"
                    fontWeight="medium"
                    color={theme.palette.text.primary}
                  >
                    {option.title}
                  </Typography>
                }
                secondary={
                  <Typography
                    variant="body2"
                    color={theme.palette.text.secondary}
                  >
                    {option.description}
                  </Typography>
                }
              />
              <Icon
                icon="mdi:chevron-right"
                color={theme.palette.text.secondary}
                fontSize={24}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      <Box sx={{ py: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => navigate(-1)}
          sx={{
            borderRadius: "40px",
            textTransform: "capitalize",
            padding: "10px",
            height: "60px",
            borderColor: theme.palette.primary.main,
            color: theme.palette.primary.main,
            "&:hover": {
              borderColor: theme.palette.primary.dark,
              backgroundColor: theme.palette.primary.lighter,
            },
          }}
        >
          Back
        </Button>
      </Box>
    </Container>
  );
};

export default Privacy;
