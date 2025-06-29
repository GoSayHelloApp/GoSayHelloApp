import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  useTheme,
  useMediaQuery,
  Divider,
  Alert,
  CircularProgress,
  Autocomplete,
  TextField,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import {
  useSearchUsersForBlockMutation,
  useGetBlockedUsersMutation,
  useUpdateBlockStatusMutation,
} from "../../services/privacy/privacyApi";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import {
  addBlockedUser,
  removeBlockedUser,
  setBlockedUsers,
} from "../../services/privacy/privacySlice";
import { SearchedUser } from "../../models/responseModels/privacy";
import { userSelector } from "../../services/auth/authSelectors";
import { debounce } from "lodash";
import Loader from "../../ui/components/core/screenLoader";

const BlockUser = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchUsersForBlock, { isLoading: isSearching }] =
    useSearchUsersForBlockMutation();
  const [getBlockedUsers, { isLoading: isLoadingBlocked }] =
    useGetBlockedUsersMutation();
  const [updateBlockStatus] = useUpdateBlockStatusMutation();
  const blockedUsers = useAppSelector((state) => state.privacy.blockedUsers);
  const user = useAppSelector(userSelector);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchedUser[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch blocked users on component mount
  useEffect(() => {
    if (user?.id) {
      fetchBlockedUsers();
    }
  }, [user?.id]);

  const fetchBlockedUsers = async () => {
    try {
      const response = await getBlockedUsers(user?.id ?? 0).unwrap();
      if (response.success) {
        const formattedUsers = response.block_users_list.map((user) => ({
          user_id: user.block_user_id,
          name: user.name,
          image: user.image,
          distance: user.distance,
        }));
        dispatch(setBlockedUsers(formattedUsers));
      }
    } catch (err) {
      setError("Failed to fetch blocked users");
    }
  };

  const performSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        const response = await searchUsersForBlock({
          page_no: 1,
          search_tag: query.trim(),
          user_id: user?.id ?? 0,
        }).unwrap();

        if (response.success) {
          setSearchResults(response.SearchedUsers);
          setError("");
        } else {
          setError("Failed to search users");
          setSearchResults([]);
        }
      } catch (err) {
        setError("An error occurred while searching users");
        setSearchResults([]);
      }
    },
    [searchUsersForBlock, user?.id]
  );

  const debouncedSearch = useMemo(
    () => debounce((query: string) => performSearch(query), 500),
    [performSearch]
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleBlockUser = async (userToBlock: SearchedUser) => {
    try {
      const response = await updateBlockStatus({
        block_user_id: userToBlock.user_id,
        is_block: 1,
        user_id: user?.id ?? 0,
      }).unwrap();

      if (response.success) {
        dispatch(addBlockedUser(userToBlock));
        setSearchResults((prev) =>
          prev.filter((u) => u.user_id !== userToBlock.user_id)
        );
        setShowSuccess(true);
        setSuccessMessage(response.message);
        setTimeout(() => setShowSuccess(false), 3000);
        setSearchQuery("");
      } else {
        setError("Failed to block user");
      }
    } catch (err) {
      setError("An error occurred while blocking user");
    }
  };

  const handleUnblockUser = async (userId: number) => {
    try {
      const response = await updateBlockStatus({
        block_user_id: userId,
        is_block: 0,
        user_id: user?.id ?? 0,
      }).unwrap();

      if (response.success) {
        dispatch(removeBlockedUser(userId));
        setShowSuccess(true);
        setSuccessMessage("User unblocked Successfully.");
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setError("Failed to unblock user");
      }
    } catch (err) {
      setError("An error occurred while unblocking user");
    }
  };

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
          Block Users
        </Typography>
        <Typography
          variant="body2"
          fontWeight="semibold"
          sx={{ fontSize: "20px" }}
          color="textSecondary"
          mb={4}
        >
          Search and block users you want to restrict.
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

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, width: "100%" }}
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        <Autocomplete
          fullWidth
          options={searchResults}
          getOptionLabel={(option) => option.name}
          loading={isSearching}
          inputValue={searchQuery}
          onInputChange={(_, newValue) => {
            setSearchQuery(newValue);
            debouncedSearch(newValue);
          }}
          onChange={(_, newValue) => {
            if (newValue) {
              setSearchQuery(newValue.name);
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search users"
              variant="outlined"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {isSearching ? <Loader /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          renderOption={(props, option) => (
            <Box
              component="li"
              {...props}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
                py: 1,
                px: 2,
                width: "100%",
                "&:hover": {
                  backgroundColor: theme.palette.background.neutral,
                },
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}
              >
                <Avatar
                  src={option.image}
                  alt={option.name}
                  sx={{ width: 32, height: 32 }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1">{option.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {Math.round(option.distance)}m away
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBlockUser(option);
                }}
                sx={{
                  borderRadius: "20px",
                  textTransform: "capitalize",
                  minWidth: "80px",
                  ml: 2,
                }}
              >
                Block
              </Button>
            </Box>
          )}
          noOptionsText="No users found"
          sx={{ mb: 4 }}
        />

        <Typography
          variant="h6"
          sx={{ mb: 2, color: theme.palette.primary.main }}
        >
          Blocked Users
        </Typography>

        {isLoadingBlocked ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
              my: 2,
            }}
          >
            <Loader />
          </Box>
        ) : (
          <List
            sx={{
              bgcolor: theme.palette.background.paper,
              borderRadius: 2,
              width: "100%",
              mb: 4,
            }}
          >
            {blockedUsers.map((user, index) => (
              <React.Fragment key={user.user_id}>
                <ListItem
                  secondaryAction={
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleUnblockUser(user.user_id)}
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
                    <Avatar src={user.image} alt={user.name} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.name}
                    secondary={`${Math.round(user.distance)}m away`}
                  />
                </ListItem>
                {index < blockedUsers.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
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

export default BlockUser;
