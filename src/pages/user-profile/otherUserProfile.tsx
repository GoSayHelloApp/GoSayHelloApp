import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Avatar,
  Typography,
  Chip,
  CircularProgress,
  Link,
  Stack,
  useTheme,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Alert,
  Snackbar,
} from "@mui/material";
import { useGetUserProfileMutation } from "../../services/auth/authApi";
import { useUpdateBlockStatusMutation } from "../../services/privacy/privacyApi";
import UserPostsTab from "./UserPostsTab";
import { UserProfileResponse } from "../../models/responseModels/user";
import { Icon } from "@iconify/react";
import { palette } from "../../ui/theme/palette";
import ViewImageModal from "../../components/ViewImageModal";
import { useAppSelector } from "../../redux/store";
import Loader from "../../ui/components/core/screenLoader";
import OpenApp from "../../components/events/OpenApp";

const PAGE_NO = 1;

const OtherUserProfile = () => {
  const user = useAppSelector((state) => state.auth.user);
  const theme = useTheme();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [getUserProfile, { data, isLoading, isError }] =
    useGetUserProfileMutation();
  const [updateBlockStatus, { isLoading: isBlocking }] =
    useUpdateBlockStatusMutation();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [imageModal, setImageModal] = useState<{
    open: boolean;
    type: "cover" | "profile" | null;
  }>({ open: false, type: null });
  const [coverBgSize, setCoverBgSize] = useState<"cover" | "contain">("cover");
  const coverBoxRef = useRef<HTMLDivElement>(null);
  const [openApp, setOpenApp] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchorEl);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };
  const handleMenuClose = (e: any) => {
    e.stopPropagation();
    setMenuAnchorEl(null);
  };

  useEffect(() => {
    if (userId) {
      getUserProfile({ user_id: Number(userId), page_no: PAGE_NO }).then(
        (res: any) => {
          if (res?.data) setProfile(res.data);
        }
      );
    }
  }, [userId, getUserProfile]);

  // Responsive cover image sizing logic
  useEffect(() => {
    if (!profile?.cover_image) return;
    const img = new window.Image();
    img.src = profile.cover_image;
    img.onload = () => {
      if (!coverBoxRef.current) return;
      const box = coverBoxRef.current;
      const boxWidth = box.offsetWidth;
      const boxHeight = box.offsetHeight;
      // If image is smaller than container, use 'contain', else 'cover'
      if (img.naturalWidth < boxWidth || img.naturalHeight < boxHeight) {
        setCoverBgSize("contain");
      } else {
        setCoverBgSize("cover");
      }
    };
  }, [profile?.cover_image]);

  const handleBlockUser = async (e: any) => {
    e.stopPropagation();
    if (!user?.id || !userId) return;

    const isCurrentlyBlocked = profile?.is_block === 1;
    const is_block = isCurrentlyBlocked ? 0 : 1;

    try {
      const response = await updateBlockStatus({
        block_user_id: Number(userId),
        is_block,
        user_id: user.id,
      }).unwrap();

      if (response.success) {
        // Update the profile state to reflect the new block status
        setProfile((prev) => (prev ? { ...prev, is_block } : null));
        setAlert({
          type: "success",
          message: isCurrentlyBlocked
            ? "User unblocked successfully."
            : "User blocked successfully.",
        });
        handleMenuClose({ stopPropagation: () => {} });
      } else {
        setAlert({
          type: "error",
          message: response.message || "Failed to update block status.",
        });
      }
    } catch (error: any) {
      setAlert({
        type: "error",
        message:
          error?.data?.message ||
          "An error occurred while updating block status.",
      });
    }
  };

  if (isLoading || !profile) {
    return (
      <Box
        sx={{
          width: "100vw",
          height: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loader />
      </Box>
    );
  }

  if (isError || !profile) {
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

  const coverImage = profile.cover_image || "/images/profile-bg.jpg";
  const profileImage = profile.profile_image;
  const fullName = `${profile.first_name} ${profile.last_name}`;
  const addressInfo = profile.PersonalInformation;
  const schoolInfo = profile.PersonalInformation?.SchoolInformation;
  const personalWebsites = [
    profile.personal_website,
    profile.personal_website_2,
    profile.personal_website_3,
    profile.personal_website_4,
  ].filter(Boolean);

  // Compose address string
  const addressString = addressInfo
    ? [
        addressInfo.home_town_city,
        addressInfo.home_town_state,
        addressInfo.home_town_country,
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  // Chat button logic (copied from people.tsx)
  type ChatButton = {
    text: string;
    color:
      | "error"
      | "inherit"
      | "info"
      | "primary"
      | "secondary"
      | "success"
      | "warning";
  };
  const confirmation_status = profile.confirmation_status;
  const is_connection_requested = profile.is_connection_requested;
  const chatButton: ChatButton =
    confirmation_status === -1 || confirmation_status === 2
      ? { text: "Wave", color: "primary" }
      : confirmation_status === 0
      ? {
          text: is_connection_requested ? "You Waved" : "Wave back",
          color: is_connection_requested ? "inherit" : "success",
        }
      : { text: "Message", color: "success" };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "90vh",
        bgcolor: "#F9FAFB", // GREY.100 from palette
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: { xs: 2, md: 4 },
      }}
    >
      {/* Back Button */}
      <Box sx={{ position: "absolute", top: 100, left: 20, zIndex: 10 }}>
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
          minHeight: "80vh",
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Cover Image */}
        <Box
          ref={coverBoxRef}
          sx={{
            width: "100%",
            height: { xs: 180, md: 260 },
            backgroundImage: `url(${coverImage})`,
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: { xs: "cover", md: coverBgSize },
            position: "relative",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            cursor: "pointer",
          }}
          onClick={() => setImageModal({ open: true, type: "cover" })}
        >
          {/* More Button */}
          <IconButton
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              bgcolor: theme.palette.grey[300],
              color: "black",
              zIndex: 2,
              "&:hover": { bgcolor: "rgba(60,60,60,0.25)" },
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleMenuOpen(e);
            }}
          >
            <Icon icon="mdi:dots-horizontal" fontSize={20} />
          </IconButton>
          <Menu
            anchorEl={menuAnchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem
              disabled={profile.is_user_reported === 1}
              onClick={(e) => {
                handleMenuClose(e);
                navigate(`/report-user/${userId}`);
              }}
            >
              {profile.is_user_reported === 1 ? "Reported" : "Report"}
            </MenuItem>
            <MenuItem disabled={isBlocking} onClick={handleBlockUser}>
              {isBlocking ? (
                <CircularProgress size={16} color="inherit" />
              ) : profile.is_block === 1 ? (
                "Unblock"
              ) : (
                "Block"
              )}
            </MenuItem>
          </Menu>
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
        <Box
          sx={{
            pt: { xs: 8, md: 12 },
            pb: 2,
            textAlign: "center",
            width: "100%",
          }}
        >
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
            {profile.UserPreferences?.map((pref) => (
              <Chip
                key={pref.id}
                label={pref.preference_type.trim()}
                color="info"
                sx={{ fontSize: { xs: 12, md: 14 }, px: { xs: 1, md: 2 } }}
              />
            ))}
          </Box>
        </Box>
        {/* Stats */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: { xs: 4, md: 8 },
            mb: 2,
            width: "100%",
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
        {/* Chat Button */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <Button
            variant="contained"
            color={chatButton.color}
            size="large"
            sx={{ px: 5 }}
            disableElevation
            onClick={(e) => {
              e.stopPropagation();
              if (
                chatButton.text === "Wave" ||
                chatButton.text === "Wave back" ||
                chatButton.text === "Message"
              ) {
                setOpenApp(true);
                setSelectedEventId(profile.id);
              }
            }}
          >
            {chatButton.text}
          </Button>
        </Box>
        {/* Info Section with Icons */}
        <Stack spacing={1.5} sx={{ mx: 6, mb: 4 }}>
          {/* School */}
          {schoolInfo &&
            schoolInfo.length > 0 &&
            schoolInfo[0].institute_name && (
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
                      value: schoolInfo[0].institute_name,
                      user_id: user?.id ?? 0,
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
                  {schoolInfo[0].institute_name}
                </Typography>
              </Box>
            )}
          {/* Address */}
          {addressString && (
            <Box
              sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
              onClick={() =>
                navigate("/users-by-location", {
                  state: {
                    type: "hometown",
                    value: profile.PersonalInformation.home_town_city,
                    user_id: user?.id ?? 0,
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
                {addressString}
              </Typography>
            </Box>
          )}
          {/* Personal Website(s) */}
          {personalWebsites.length > 0 && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Icon
                icon="mdi:link-variant"
                fontSize={20}
                color={theme.palette.primary.main}
              />
              <Box>
                {personalWebsites.map((url, idx) => (
                  <Link
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="body2"
                    color="primary"
                    sx={{ display: "block", wordBreak: "break-all" }}
                  >
                    {url}
                  </Link>
                ))}
              </Box>
            </Stack>
          )}
        </Stack>
        {/* User's Posts */}
        <Box
          sx={{
            maxWidth: { xs: 400, md: 800 },
            mx: "auto",
            minHeight: 200,
            px: { xs: 2, md: 0 },
            mb: {
              xs: 10,
              md: 2,
            },
            width: "100%",
          }}
        >
          <UserPostsTab posts={profile.ListOfImages || []} />
        </Box>
      </Box>
      {/* Image Modal */}
      <ViewImageModal
        open={imageModal.open}
        image={imageModal.type === "cover" ? coverImage : profileImage}
        alt={imageModal.type === "cover" ? "Cover" : "Profile"}
        onClose={() => setImageModal({ open: false, type: null })}
      />
      <OpenApp
        eventId={selectedEventId}
        openApp={openApp}
        setOpenApp={setOpenApp}
        text="Please open the app to wave at this user."
      />
      <Snackbar
        open={!!alert}
        autoHideDuration={3000}
        onClose={() => setAlert(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setAlert(null)}
          severity={alert?.type}
          sx={{ width: "100%" }}
        >
          {alert?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OtherUserProfile;
