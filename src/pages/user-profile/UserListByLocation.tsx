import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  CircularProgress,
  Stack,
  Button,
} from "@mui/material";
import { Icon } from "@iconify/react";
import {
  useSearchSchoolUsersMutation,
  useSearchHometownUsersMutation,
} from "../../services/nearby/nearbyApi";
import { useTheme } from "@mui/material/styles";
import Loader from "../../ui/components/core/screenLoader";

// Type for navigation state
interface LocationNavState {
  type: "school" | "hometown";
  value: string;
  user_id: number;
}

const UserListByLocation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const navState = location.state as LocationNavState | undefined;

  // Fallback for missing state
  const [type, setType] = useState<"school" | "hometown" | null>(
    navState?.type || null
  );
  const [value, setValue] = useState<string>(navState?.value || "");
  const [userId, setUserId] = useState<number>(navState?.user_id || 0);

  const [searchSchoolUsers, { data: schoolData, isLoading: isSchoolLoading }] =
    useSearchSchoolUsersMutation();
  const [
    searchHometownUsers,
    { data: hometownData, isLoading: isHometownLoading },
  ] = useSearchHometownUsersMutation();

  useEffect(() => {
    if (!type || !value || !userId) return;
    if (type === "school") {
      searchSchoolUsers({ institute_name: value, user_id: userId });
    } else {
      searchHometownUsers({ home_town: value, user_id: userId });
    }
    // eslint-disable-next-line
  }, [type, value, userId]);

  // Get users list
  const users =
    type === "school"
      ? schoolData?.SameInstituteUsers || []
      : hometownData?.SameHometownUsers || [];
  const isLoading = type === "school" ? isSchoolLoading : isHometownLoading;

  // UI
  return (
    <Box
      sx={{
        bgcolor: theme.palette.background.default,
        minHeight: { xs: "80vh", md: "80vh" },
        px: { xs: 1, sm: 2, md: 0 },
        pt: { xs: 2, md: 4 },
        maxWidth: { xs: "100%", md: 500 },
        mx: { xs: 0, md: "auto" },
        overflow: "hidden",
        borderRadius: { xs: 0, md: 4 },
        // boxShadow: { xs: 0, md: 2 },
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ mb: { xs: 2, md: 3 } }}
      >
        <IconButton
          onClick={() => navigate(-1)}
          sx={{ bgcolor: theme.palette.action.hover, mr: 1 }}
        >
          <Icon
            icon="material-symbols:arrow-back-ios-new"
            style={{ fontSize: 24, color: theme.palette.text.primary }}
          />
        </IconButton>
        <Icon
          icon="material-symbols:check-circle"
          style={{
            color: theme.palette.primary.main,
            fontSize: 24,
            marginRight: 8,
          }}
        />
        <Typography
          variant="subtitle1"
          sx={{
            color: theme.palette.primary.main,
            fontWeight: 600,
            fontSize: { xs: 16, md: 20 },
          }}
        >
          {value}
        </Typography>
      </Stack>
      {/* User List */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Loader />
        </Box>
      ) : users.length === 0 ? (
        <Typography align="center" color="text.secondary" sx={{ mt: 4 }}>
          No users found.
        </Typography>
      ) : (
        <Box
          sx={{
            height: "80vh",
            width: "100%",
            overflow: "auto",
            px: 1,
          }}
        >
          {users.map((user) => (
            <Stack
              key={user.user_id}
              direction="row"
              alignItems="center"
              spacing={{ xs: 1, md: 2 }}
              sx={{ mb: { xs: 1.5, md: 2.5 } }}
            >
              <Avatar
                src={user.user_image}
                sx={{ width: { xs: 48, md: 72 }, height: { xs: 48, md: 72 } }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: 16, md: 20 },
                    color: theme.palette.text.primary,
                  }}
                >
                  {user.user_name}
                </Typography>
                <Typography
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: { xs: 13, md: 15 },
                  }}
                >
                  {Math.ceil(user.distance * 20)} minute walk
                </Typography>
              </Box>
              <Button
                onClick={() => {
                  navigate(`/user-profile/${user.user_id}`);
                }}
                variant="contained"
                sx={{
                  bgcolor: theme.palette.primary.lighter,
                  minWidth: 0,
                  width: { xs: 40, md: 56 },
                  height: { xs: 40, md: 56 },
                  borderRadius: 2,
                  p: 0,
                  boxShadow: "none",
                  "&:hover": { bgcolor: theme.palette.primary.light },
                }}
              >
                <span role="img" aria-label="wave" style={{ fontSize: 24 }}>
                  👋
                </span>
              </Button>
            </Stack>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default UserListByLocation;
