import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Divider,
  Alert,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

interface BlockedUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

const Privacy = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<BlockedUser[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      avatar: "https://i.pravatar.cc/150?img=2",
    },
  ]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSearch = () => {
    // Here you would typically make an API call to search users
    // For now, we'll simulate a search
    const mockResults: BlockedUser[] = [
      {
        id: "3",
        name: "Alice Johnson",
        email: "alice@example.com",
        avatar: "https://i.pravatar.cc/150?img=3",
      },
      {
        id: "4",
        name: "Bob Wilson",
        email: "bob@example.com",
        avatar: "https://i.pravatar.cc/150?img=4",
      },
    ];
    setSearchResults(mockResults);
  };

  const handleBlockUser = (user: BlockedUser) => {
    // Here you would typically make an API call to block the user
    setBlockedUsers((prev) => [...prev, user]);
    setSearchResults((prev) => prev.filter((u) => u.id !== user.id));
    setShowSuccess(true);
    setSuccessMessage(`${user.name} has been blocked`);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleUnblockUser = (userId: string) => {
    // Here you would typically make an API call to unblock the user
    setBlockedUsers((prev) => prev.filter((user) => user.id !== userId));
    setShowSuccess(true);
    setSuccessMessage("User has been unblocked");
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          py: 4,
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
          Manage your blocked users and privacy preferences.
        </Typography>

        {showSuccess && (
          <Alert
            severity="success"
            sx={{ mb: 3, width: "100%" }}
            onClose={() => setShowSuccess(false)}
          >
            {successMessage}
          </Alert>
        )}

        <Box sx={{ width: "100%", mb: 4 }}>
          <TextField
            fullWidth
            label="Search users"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleSearch} edge="end">
                    <Icon
                      icon="mdi:magnify"
                      color={theme.palette.primary.main}
                      fontSize={24}
                    />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {searchResults.length > 0 && (
            <List
              sx={{
                bgcolor: theme.palette.background.paper,
                borderRadius: 2,
                mb: 3,
              }}
            >
              {searchResults.map((user) => (
                <ListItem
                  key={user.id}
                  secondaryAction={
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleBlockUser(user)}
                      sx={{
                        borderRadius: "20px",
                        textTransform: "capitalize",
                      }}
                    >
                      Block
                    </Button>
                  }
                >
                  <ListItemAvatar>
                    <Avatar src={user.avatar} alt={user.name} />
                  </ListItemAvatar>
                  <ListItemText primary={user.name} secondary={user.email} />
                </ListItem>
              ))}
            </List>
          )}

          <Typography
            variant="h6"
            sx={{ mb: 2, color: theme.palette.primary.main }}
          >
            Blocked Users
          </Typography>

          <List
            sx={{ bgcolor: theme.palette.background.paper, borderRadius: 2 }}
          >
            {blockedUsers.map((user, index) => (
              <React.Fragment key={user.id}>
                <ListItem
                  secondaryAction={
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleUnblockUser(user.id)}
                      sx={{
                        borderRadius: "20px",
                        textTransform: "capitalize",
                      }}
                    >
                      Unblock
                    </Button>
                  }
                >
                  <ListItemAvatar>
                    <Avatar src={user.avatar} alt={user.name} />
                  </ListItemAvatar>
                  <ListItemText primary={user.name} secondary={user.email} />
                </ListItem>
                {index < blockedUsers.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Box>

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
