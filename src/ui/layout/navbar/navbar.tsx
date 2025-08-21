import {
  Box,
  Button,
  FormControl,
  InputAdornment,
  OutlinedInput,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Collapse,
  Switch,
  Alert,
  Snackbar,
  IconButton,
  Popover,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { NavbarStyles } from "./style";
import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import OpenApp from "../../../components/events/OpenApp";
import OpenAppHome from "../../../components/events/OpenApp";
import { useAppSelector, useAppDispatch } from "../../../redux/store";
import { useUpdateUserProfileMutation, useLogoutMutation } from "../../../services/auth/authApi";
import { updateUserMuteStatus, logout } from "../../../services/auth/authSlice";

interface ManageAccountItem {
  text: string;
  icon: string;
  path: string;
  hasSwitch?: boolean;
  switchState?: boolean;
  onSwitchChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isDestructive?: boolean;
}

export default function Sidebar() {
  const [add, setAdd] = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [manageAccountOpen, setManageAccountOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true);
  const [statusEnabled, setStatusEnabled] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">("success");
  const { mainStyle } = NavbarStyles();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const [updateUserProfile] = useUpdateUserProfileMutation();
  const [logoutUser] = useLogoutMutation();
  const [addMenuAnchor, setAddMenuAnchor] = useState<null | HTMLElement>(null);
  const addMenuOpen = Boolean(addMenuAnchor);
  const [openApp, setOpenApp] = useState(false);

  useEffect(() => {
    if (user) {
      setPushNotificationsEnabled(!user.is_mute);
    }
  }, [user]);

  const handleAdd = () => {
    setAdd(true);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
    setManageAccountOpen(false);
    setEditProfileOpen(false);
  };

  const handleManageAccountClick = () => {
    setManageAccountOpen(!manageAccountOpen);
  };

  const handleEditProfileClick = () => {
    setEditProfileOpen(!editProfileOpen);
  };

  const handleMenuItemClick = async (path: string) => {
    if (path === "/login") {
      try {
        const response = await logoutUser(user?.id ?? 0).unwrap();
        if (response.success) {
          dispatch(logout());
          navigate("/login");
        } else {
          setAlertMessage("Failed to logout. Please try again.");
          setAlertSeverity("error");
          setShowAlert(true);
        }
      } catch (error) {
        setAlertMessage("An error occurred while logging out.");
        setAlertSeverity("error");
        setShowAlert(true);
      }
    } else if (path === "/premium") {
      setPremiumOpen(true);
    } else {
      handleProfileMenuClose();
      navigate(path);
    }
  };

  const handleSwitchChange = (type: "push" | "status") => async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (type === "push") {
      try {
        const formData = new FormData();
        formData.append("user_id", user?.id?.toString() || "");
        formData.append("is_mute", event.target.checked ? "0" : "1");

        const response = await updateUserProfile(formData).unwrap();

        if (response.success) {
          dispatch(updateUserMuteStatus(response.is_mute));
          setPushNotificationsEnabled(response.is_mute === 0);
          setAlertMessage(response.message || "Notification settings updated successfully");
          setAlertSeverity("success");
          setShowAlert(true);
        } else {
          setAlertMessage(response.error || "Failed to update notification settings");
          setAlertSeverity("error");
          setShowAlert(true);
        }
      } catch (error) {
        setAlertMessage("An error occurred while updating notification settings");
        setAlertSeverity("error");
        setShowAlert(true);
      }
    } else {
      setStatusEnabled(event.target.checked);
    }
  };

  const manageAccountItems: ManageAccountItem[] = [
    { text: "Change Password", icon: "mdi:lock", path: "/change-password" },
    { text: "Privacy", icon: "mdi:shield-lock", path: "/privacy" },
    {
      text: "Push Notifications",
      icon: "mdi:bell",
      path: "/notifications",
      hasSwitch: true,
      switchState: pushNotificationsEnabled,
      onSwitchChange: handleSwitchChange("push"),
    },
    {
      text: "Status",
      icon: "mdi:information",
      path: "/status",
      hasSwitch: true,
      switchState: statusEnabled,
      onSwitchChange: handleSwitchChange("status"),
    },
    { text: "Delete Account", icon: "mdi:delete", path: "/delete-account", isDestructive: true },
  ];

  const onboardingItems = user?.is_business_profile
    ? [{ text: "Business Info", icon: "mdi:briefcase-outline", path: "/business-info?mode=edit" }]
    : [
        { text: "Home Town", icon: "mdi:home-city", path: "/home-town?mode=edit" },
        { text: "Schools", icon: "mdi:school", path: "/school?mode=edit" },
        { text: "Education Level", icon: "mdi:graduation-cap", path: "/education-level?mode=edit" },
        { text: "Work", icon: "mdi:briefcase", path: "/work?mode=edit" },
      ];

  const mainMenuItems = [
    { text: "Preferences", icon: "mdi:cog", path: "/preferences?mode=edit" },
    {
      text: "Premium Subscription",
      icon: "mdi:crown",
      path: "/premium",
    },
    { text: "Logout", icon: "mdi:logout", path: "/login" },
  ];

  const handleAddMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAddMenuAnchor(event.currentTarget);
  };

  const handleAddMenuClose = () => {
    setAddMenuAnchor(null);
  };

  return (
    <>
      <Box
        sx={{
          ...mainStyle,
          padding: isMobile ? "8px" : "20px",
          position: "relative",
          mr: 0,
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Box sx={{ position: "relative", display: "inline-block" }}>
          <Avatar
            onClick={handleProfileMenuOpen}
            sx={{
              width: isMobile ? 40 : 48,
              height: isMobile ? 40 : 48,
              cursor: "pointer",
              border: `2px solid ${theme.palette.primary.main}`,
              boxShadow: `0 0 0 2px ${theme.palette.primary.lighter}`,
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: `0 0 0 4px ${theme.palette.primary.lighter}`,
              },
            }}
            src={user?.profile_image || "/path-to-your-profile-image.jpg"}
          />
          <IconButton
            sx={{
              position: "absolute",
              bottom: 0,
              right: 0,
              bgcolor: "white",
              boxShadow: 2,
              width: 16,
              height: 16,
              p: 0,
              zIndex: 1,
              "&:hover": { bgcolor: theme.palette.grey[200] },
            }}
          >
            <Icon icon="mdi:settings" fontSize={18} color={theme.palette.grey[800]} />
          </IconButton>
        </Box>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              minWidth: 280,
              boxShadow: theme.shadows[3],
              borderRadius: 2,
              overflow: "hidden",
              border: `1px solid ${theme.palette.primary.lighter}`,
            },
          }}
        >
          <MenuItem
            sx={{
              // backgroundColor: theme.palette.primary.lighter,
              py: 1.5,
              "&:hover": {
                // backgroundColor: theme.palette.primary.light,
              },
            }}
            onClick={handleManageAccountClick}
          >
            <ListItemIcon>
              <Icon icon="mdi:account-cog" fontSize={24} color={theme.palette.primary.main} />
            </ListItemIcon>
            <ListItemText
              primary="Manage Account"
              primaryTypographyProps={{
                // fontWeight: 600,
                color: theme.palette.text.primary,
                fontSize: "0.9rem",
              }}
            />
            <Icon
              icon={manageAccountOpen ? "mdi:chevron-up" : "mdi:chevron-down"}
              fontSize={24}
              color={theme.palette.primary.main}
            />
          </MenuItem>
          <Collapse in={manageAccountOpen}>
            <Box
              sx={{
                pl: 2,
                bgcolor: theme.palette.background.paper,
                borderBottom: `1px solid ${theme.palette.primary.lighter}`,
              }}
            >
              {manageAccountItems.map((item) => (
                <MenuItem
                  key={item.text}
                  onClick={() => !item.hasSwitch && handleMenuItemClick(item.path)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    mb: 0.5,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    "&:hover": {
                      backgroundColor: item.isDestructive ? theme.palette.error.lighter : theme.palette.primary.lighter,
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <ListItemIcon>
                      <Icon 
                        icon={item.icon} 
                        fontSize={22} 
                        color={item.isDestructive ? theme.palette.error.main : theme.palette.primary.main} 
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        color: item.isDestructive ? theme.palette.error.main : theme.palette.text.primary,
                        fontSize: "0.9rem",
                      }}
                    />
                  </Box>
                  {item.hasSwitch && (
                    <Switch
                      checked={item.switchState}
                      onChange={item.onSwitchChange}
                      onClick={(e) => e.stopPropagation()}
                      size="small"
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: theme.palette.primary.main,
                          "& + .MuiSwitch-track": {
                            backgroundColor: theme.palette.primary.main,
                          },
                        },
                      }}
                    />
                  )}
                </MenuItem>
              ))}
            </Box>
          </Collapse>

          {/* Onboarding Steps Section */}
          <MenuItem
            sx={{
              // backgroundColor: theme.palette.primary.lighter,
              py: 1.5,
              "&:hover": {
                // backgroundColor: theme.palette.primary.light,
              },
            }}
            onClick={handleEditProfileClick}
          >
            <ListItemIcon>
              <Icon icon="mdi:account-edit" fontSize={24} color={theme.palette.primary.main} />
            </ListItemIcon>
            <ListItemText
              primary="Edit Profile Information"
              primaryTypographyProps={{
                // fontWeight: 600,
                color: theme.palette.text.primary,
                fontSize: "0.9rem",
              }}
            />
            <Icon
              icon={editProfileOpen ? "mdi:chevron-up" : "mdi:chevron-down"}
              fontSize={24}
              color={theme.palette.primary.main}
            />
          </MenuItem>

          <Collapse in={editProfileOpen}>
            <Box
              sx={{
                pl: 2,
                bgcolor: theme.palette.background.paper,
                borderBottom: `1px solid ${theme.palette.primary.lighter}`,
              }}
            >
              {onboardingItems.map((item) => (
                <MenuItem
                  key={item.text}
                  onClick={() => handleMenuItemClick(item.path)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    pl: 4,
                    mb: 0.5,
                    "&:hover": {
                      backgroundColor: theme.palette.primary.lighter,
                    },
                  }}
                >
                  <ListItemIcon>
                    <Icon icon={item.icon} fontSize={22} color={theme.palette.primary.main} />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      color: theme.palette.text.primary,
                      fontSize: "0.9rem",
                    }}
                  />
                </MenuItem>
              ))}
            </Box>
          </Collapse>

          <Divider sx={{ borderColor: theme.palette.primary.lighter }} />
          {mainMenuItems.map((item, index) => (
            <MenuItem
              key={item.text}
              onClick={() => handleMenuItemClick(item.path ?? "")}
              sx={{
                py: 1.5,
                px: 2,
                "&:hover": {
                  backgroundColor: theme.palette.primary.lighter,
                },
                ...(index === mainMenuItems.length - 1 && {
                  borderTop: `1px solid ${theme.palette.primary.lighter}`,
                  mt: 0.5,
                }),
              }}
            >
              <ListItemIcon>
                <Icon icon={item.icon} fontSize={22} color={theme.palette.primary.main} />
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  color: theme.palette.text.primary,
                  fontSize: "0.9rem",
                }}
              />
            </MenuItem>
          ))}
        </Menu>

        <Box
          sx={{
            width: isMobile ? "auto" : 500,
            marginLeft: isMobile ? "8px" : "auto",
            marginRight: isMobile ? "8px" : "auto",
          }}
        >
          <FormControl variant="outlined" hiddenLabel fullWidth size="medium">
            <OutlinedInput
              id="input-with-icon-adornment"
              placeholder={isMobile ? "Search Anything" : "Search Name of Events"}
              startAdornment={
                <InputAdornment position="start">
                  <Icon icon="tabler:search" fontSize={24} />
                </InputAdornment>
              }
            />
          </FormControl>
        </Box>
        <Box
          sx={{
            zIndex: 10,
          }}
        >
          <Button
            variant="contained"
            onClick={handleAddMenuOpen}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: "white",
              borderRadius: { xs: 4, md: 8 },
              px: { xs: 1.5, md: 3 },
              py: { xs: 1, md: 1.5 },
              fontWeight: 700,
              fontSize: { xs: 12, md: 20 },
              boxShadow: 2,
              minWidth: { xs: 30, md: 120 },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.4,
              textTransform: "none",
              "&:hover": { bgcolor: theme.palette.primary.dark },
            }}
            endIcon={<Icon icon={addMenuOpen ? "mdi:chevron-up" : "mdi:chevron-down"} fontSize={24} />}
            startIcon={<Icon icon="mdi:plus-circle-outline" fontSize={24} />}
          >
            Add
          </Button>
          <Popover
            open={addMenuOpen}
            anchorEl={addMenuAnchor}
            onClose={handleAddMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            PaperProps={{
              sx: {
                mt: 2,
                borderRadius: { xs: 2, md: 4 },
                boxShadow: 4,
                p: { xs: 1.5, md: 3 },
                minWidth: { xs: "60vw", md: 320 },
                maxWidth: { xs: "95vw", md: 400 },
                bgcolor: "white",
                display: "flex",
                flexDirection: "column",
                gap: { xs: 1.5, md: 2.5 },
              },
            }}
          >
            <Button
              fullWidth
              sx={{
                bgcolor: theme.palette.primary.main,
                color: "white",
                borderRadius: { xs: 4, md: 8 },
                fontWeight: 700,
                fontSize: { xs: 16, md: 20 },
                py: { xs: 1.2, md: 2 },
                mb: { xs: 0.5, md: 1 },
                textTransform: "none",
                justifyContent: "flex-start",
                pl: { xs: 2, md: 4 },
                "&:hover": { bgcolor: theme.palette.primary.dark },
                boxShadow: 1,
                gap: 2,
              }}
              startIcon={<Icon icon="mdi:image-multiple-outline" fontSize={20} />}
              onClick={() => {
                handleAddMenuClose();
                navigate("/create-post");
              }}
            >
              Add Photo
            </Button>
            <Button
              fullWidth
              sx={{
                bgcolor: theme.palette.info.main,
                color: "white",
                borderRadius: { xs: 4, md: 8 },
                fontWeight: 700,
                fontSize: { xs: 16, md: 20 },
                py: { xs: 1.2, md: 2 },
                mb: { xs: 0.5, md: 1 },
                textTransform: "none",
                justifyContent: "flex-start",
                pl: { xs: 2, md: 4 },
                "&:hover": { bgcolor: theme.palette.info.dark },
                boxShadow: 1,
                gap: 2,
              }}
              startIcon={<Icon icon="mdi:calendar-month-outline" fontSize={20} />}
              onClick={() => {
                handleAddMenuClose();
                setOpenApp(true);
              }}
            >
              Add Event
            </Button>
            <Button
              fullWidth
              sx={{
                bgcolor: theme.palette.success.main,
                color: "white",
                borderRadius: { xs: 4, md: 8 },
                fontWeight: 700,
                fontSize: { xs: 16, md: 20 },
                py: { xs: 1.2, md: 2 },
                textTransform: "none",
                justifyContent: "flex-start",
                pl: { xs: 2, md: 4 },
                "&:hover": { bgcolor: theme.palette.success.dark },
                boxShadow: 1,
                gap: 2,
              }}
              startIcon={<Icon icon="mdi:account-group-outline" fontSize={20} />}
              onClick={() => {
                handleAddMenuClose();
                setOpenApp(true);
              }}
            >
              Add Group
            </Button>
          </Popover>
        </Box>
      </Box>
      <Snackbar
        open={showAlert}
        autoHideDuration={3000}
        onClose={() => setShowAlert(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setShowAlert(false)} severity={alertSeverity} sx={{ width: "100%" }}>
          {alertMessage}
        </Alert>
      </Snackbar>
      <OpenApp openApp={openApp} setOpenApp={setOpenApp} text="Please open the app to add content." />
    </>
  );
}
