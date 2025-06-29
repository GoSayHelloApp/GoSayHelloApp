import React, { useState, useEffect } from "react";
import {
  Box,
  Avatar,
  Typography,
  Chip,
  Tabs,
  Tab,
  Paper,
  IconButton,
} from "@mui/material";
import { useGetUserProfileMutation } from "../../services/auth/authApi";
import { useAppSelector } from "../../redux/store";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "../../ui/components/core/screenLoader";
import UserPostsTab from "./UserPostsTab";
import UserEventsTab from "./UserEventsTab";
import { Icon } from "@iconify/react";
import { useTheme } from "@mui/material/styles";
import ViewImageModal from "../../components/ViewImageModal";

const PAGE_NO = 1;

const UserProfile = () => {
  const [tab, setTab] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const [imageModal, setImageModal] = useState<{
    open: boolean;
    type: "cover" | "profile" | null;
  }>({ open: false, type: null });

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
    // Update URL with query parameter
    const tabName = newValue === 0 ? "posts" : "events";
    navigate(`?tab=${tabName}`, { replace: true });
  };

  // Sync tab state with URL query parameter on component mount and URL changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get("tab");

    if (tabParam === "events") {
      setTab(1);
    } else if (tabParam === "posts" || !tabParam) {
      setTab(0);
      // Set default query parameter to "posts" if no tab parameter exists
      if (!tabParam) {
        navigate("?tab=posts", { replace: true });
      }
    }
  }, [location.search, navigate]);

  const user = useAppSelector((state) => state.auth.user);
  const [getUserProfile, { data, isLoading, isError, error }] =
    useGetUserProfileMutation();

  useEffect(() => {
    if (user?.id) {
      getUserProfile({ user_id: user.id, page_no: PAGE_NO });
    }
  }, [getUserProfile, user?.id]);

  if (!user?.id) {
    return (
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography color="text.secondary">User not found.</Typography>
      </Box>
    );
  }

  if (isLoading) {
    return <Loader width="80px" height="80px" />;
  }

  if (isError || !data) {
    return (
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography color="error">Failed to load profile.</Typography>
      </Box>
    );
  }

  const profile = data;
  const coverImage = profile.cover_image || "/images/profile-bg.jpg";
  const profileImage = profile.profile_image;
  const fullName = `${profile.first_name} ${profile.last_name}`;

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "90vh",
        bgcolor: "#F9FAFB",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: { xs: 2, md: 4 },
        position: "relative",
      }}
    >
      {/* Back Button */}
      <Box
        sx={{
          position: "absolute",
          top: 32,
          left: 20,
          zIndex: 10,
          visibility: { xs: "visible", md: "hidden" },
        }}
      >
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            bgcolor: "white",
            boxShadow: 2,
            borderRadius: "50%",
            width: 44,
            height: 44,
            "&:hover": { bgcolor: "#f4f6f8" },
          }}
        >
          <Icon
            icon="material-symbols:arrow-back"
            style={{ fontSize: 24, color: theme.palette.text.primary }}
          />
        </IconButton>
      </Box>
      {/* Overlay for readability */}
      <Box
        sx={{
          width: "100%",
          minHeight: "90vh",
          bgcolor: "rgba(255,255,255,0.85)",
        }}
      >
        {/* Cover Image */}
        <Box
          sx={{
            width: "100%",
            height: { xs: 180, md: 260 },
            backgroundImage: `url(${coverImage})`,
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            position: "relative",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            cursor: "pointer",
          }}
          onClick={() => setImageModal({ open: true, type: "cover" })}
        >
          {/* Profile Avatar */}
          <Avatar
            src={profileImage}
            alt={fullName}
            sx={{
              width: { xs: 120, md: 160 },
              height: { xs: 120, md: 160 },
              position: "absolute",
              left: "50%",
              bottom: { xs: -60, md: -80 },
              transform: "translateX(-50%)",
              border: "4px solid white",
              boxShadow: 3,
              cursor: "pointer",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setImageModal({ open: true, type: "profile" });
            }}
          />
        </Box>
        <Box sx={{ pt: { xs: 8, md: 12 }, pb: 2, textAlign: "center" }}>
          <Typography
            variant="h5"
            fontWeight={600}
            sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}
          >
            {fullName}
          </Typography>
          {/* Preferences */}
          <Box
            sx={{
              mt: 2,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 1,
            }}
          >
            {profile.UserPreferences?.map((pref: any) => (
              <Chip
                key={pref.id}
                label={pref.preference_type.trim()}
                color="info"
                sx={{ fontSize: { xs: 12, md: 14 }, px: { xs: 1, md: 2 } }}
              />
            ))}
          </Box>
        </Box>
        {/* School and Address Info */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 2 }}>
          {/* School clickable */}
          {profile.PersonalInformation?.SchoolInformation?.length > 0 &&
            profile.PersonalInformation.SchoolInformation[0].institute_name && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() =>
                  navigate("/users-by-location", {
                    state: {
                      type: "school",
                      value:
                        profile.PersonalInformation.SchoolInformation[0]
                          .institute_name,
                      user_id: user.id,
                    },
                  })
                }
              >
                <Icon
                  icon="mdi:school"
                  fontSize={20}
                  color={theme.palette.primary.main}
                  style={{ marginRight: 4 }}
                />
                <Typography
                  variant="body2"
                  color="primary.main"
                  sx={{ fontWeight: 500 }}
                >
                  {
                    profile.PersonalInformation.SchoolInformation[0]
                      .institute_name
                  }
                </Typography>
              </Box>
            )}
          {/* Address clickable */}
          {profile.PersonalInformation?.home_town_city && (
            <Box
              sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
              onClick={() =>
                navigate("/users-by-location", {
                  state: {
                    type: "hometown",
                    value: profile.PersonalInformation.home_town_city,
                    user_id: user.id,
                  },
                })
              }
            >
              <Icon
                icon="mdi:map-marker"
                fontSize={20}
                color={theme.palette.primary.main}
                style={{ marginRight: 4 }}
              />
              <Typography
                variant="body2"
                color="primary.main"
                sx={{ fontWeight: 500 }}
              >
                {profile.PersonalInformation.home_town_city}
              </Typography>
            </Box>
          )}
        </Box>
        {/* Stats */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: { xs: 4, md: 8 },
            mb: 2,
          }}
        >
          <Box>
            <Typography
              variant="h6"
              align="center"
              sx={{ fontSize: { xs: "1.1rem", md: "1.3rem" } }}
            >
              {profile.no_of_post}
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Posts
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="h6"
              align="center"
              sx={{ fontSize: { xs: "1.1rem", md: "1.3rem" } }}
            >
              {profile.no_of_connection}
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Connections
            </Typography>
          </Box>
        </Box>
        {/* Tabs */}
        <Box
          sx={{
            maxWidth: { xs: 400, md: 600 },
            mx: "auto",
            mb: 2,
            px: { xs: 2, md: 0 },
          }}
        >
          <Paper sx={{ borderRadius: 4 }}>
            <Tabs value={tab} onChange={handleTabChange} variant="fullWidth">
              <Tab label="Posts" />
              <Tab label="Events" />
            </Tabs>
          </Paper>
        </Box>
        {/* Tab Panels */}
        <Box
          sx={{
            maxWidth: { xs: 400, md: 800 },
            mx: "auto",
            minHeight: 200,
            px: { xs: 2, md: 0 },
          }}
        >
          {tab === 0 && <UserPostsTab posts={profile.ListOfImages || []} />}
          {tab === 1 && <UserEventsTab />}
        </Box>
      </Box>
      {/* Image Modal */}
      <ViewImageModal
        open={imageModal.open}
        image={imageModal.type === "cover" ? coverImage : profileImage}
        alt={imageModal.type === "cover" ? "Cover" : "Profile"}
        onClose={() => setImageModal({ open: false, type: null })}
      />
    </Box>
  );
};

export default UserProfile;
