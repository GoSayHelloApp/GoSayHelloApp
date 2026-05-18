import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Collapse,
  Container,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Switch,
  Typography,
  useTheme,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { useLogoutMutation, useUpdateUserProfileMutation } from "../../services/auth/authApi";
import { logout, updateUserMuteStatus } from "../../services/auth/authSlice";

interface SettingsMenuItem {
  text: string;
  icon: string;
  path: string;
  hasSwitch?: boolean;
  switchState?: boolean;
  onSwitchChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isDestructive?: boolean;
}

const SettingsPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [manageAccountOpen, setManageAccountOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true);
  const [statusEnabled, setStatusEnabled] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">("success");

  const [updateUserProfile] = useUpdateUserProfileMutation();
  const [logoutUser] = useLogoutMutation();

  useEffect(() => {
    if (user) {
      setPushNotificationsEnabled(!user.is_mute);
    }
  }, [user]);

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
      } catch {
        setAlertMessage("An error occurred while updating notification settings");
        setAlertSeverity("error");
        setShowAlert(true);
      }
    } else {
      setStatusEnabled(event.target.checked);
    }
  };

  const manageAccountItems: SettingsMenuItem[] = [
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

  const mainMenuItems: SettingsMenuItem[] = [
    { text: "Preferences", icon: "mdi:cog", path: "/preferences?mode=edit" },
    { text: "Premium Subscription", icon: "mdi:crown", path: "/premium" },
    { text: "Logout", icon: "mdi:logout", path: "/login" },
  ];

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
      } catch {
        setAlertMessage("An error occurred while logging out.");
        setAlertSeverity("error");
        setShowAlert(true);
      }
    } else {
      navigate(path);
    }
  };

  const renderLeafItem = (item: SettingsMenuItem, nested = false) => (
    <ListItemButton
      key={item.text}
      onClick={() => !item.hasSwitch && handleMenuItemClick(item.path)}
      sx={{
        py: 1.5,
        pl: nested ? 4 : 2,
        borderRadius: 2,
        mb: 0.5,
        "&:hover": {
          bgcolor: item.isDestructive ? theme.palette.error.lighter : theme.palette.primary.lighter,
        },
      }}
    >
      <ListItemIcon sx={{ minWidth: 40 }}>
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
          fontSize: "0.95rem",
        }}
      />
      {item.hasSwitch && (
        <Switch
          checked={item.switchState}
          onChange={item.onSwitchChange}
          onClick={(e) => e.stopPropagation()}
          size="small"
          sx={{
            "& .MuiSwitch-switchBase.Mui-checked": {
              color: theme.palette.primary.main,
              "& + .MuiSwitch-track": { backgroundColor: theme.palette.primary.main },
            },
          }}
        />
      )}
    </ListItemButton>
  );

  return (
    <Container maxWidth="sm" sx={{ pb: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 2 }}>
        <IconButton onClick={() => navigate(-1)} aria-label="Go back" sx={{ color: theme.palette.text.primary }}>
          <Icon icon="mdi:arrow-left" fontSize={24} />
        </IconButton>
        <Typography variant="h5" fontWeight={700}>
          Settings
        </Typography>
      </Box>

      {user && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 3,
            p: 2,
            borderRadius: 3,
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.primary.lighter}`,
          }}
        >
          <Box
            component="img"
            src={user.profile_image}
            alt=""
            sx={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover" }}
          />
          <Box minWidth={0}>
            <Typography fontWeight={700} noWrap>
              {user.first_name} {user.last_name}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {user.email}
            </Typography>
          </Box>
        </Box>
      )}

      <List
        sx={{
          bgcolor: theme.palette.background.paper,
          borderRadius: 3,
          overflow: "hidden",
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <ListItemButton
          onClick={() => setManageAccountOpen((o) => !o)}
          sx={{ py: 1.75, borderRadius: 0 }}
        >
          <ListItemIcon>
            <Icon icon="mdi:account-cog" fontSize={24} color={theme.palette.primary.main} />
          </ListItemIcon>
          <ListItemText primary="Manage Account" primaryTypographyProps={{ fontWeight: 600 }} />
          <Icon
            icon={manageAccountOpen ? "mdi:chevron-up" : "mdi:chevron-down"}
            fontSize={24}
            color={theme.palette.primary.main}
          />
        </ListItemButton>
        <Collapse in={manageAccountOpen}>
          <Box sx={{ px: 1, pb: 1, bgcolor: theme.palette.background.neutral }}>
            {manageAccountItems.map((item) => renderLeafItem(item, true))}
          </Box>
        </Collapse>

        <Divider />

        <ListItemButton
          onClick={() => setEditProfileOpen((o) => !o)}
          sx={{ py: 1.75, borderRadius: 0 }}
        >
          <ListItemIcon>
            <Icon icon="mdi:account-edit" fontSize={24} color={theme.palette.primary.main} />
          </ListItemIcon>
          <ListItemText primary="Edit Profile Information" primaryTypographyProps={{ fontWeight: 600 }} />
          <Icon
            icon={editProfileOpen ? "mdi:chevron-up" : "mdi:chevron-down"}
            fontSize={24}
            color={theme.palette.primary.main}
          />
        </ListItemButton>
        <Collapse in={editProfileOpen}>
          <Box sx={{ px: 1, pb: 1, bgcolor: theme.palette.background.neutral }}>
            {onboardingItems.map((item) => renderLeafItem(item, true))}
          </Box>
        </Collapse>

        <Divider />

        {mainMenuItems.map((item, index) => (
          <React.Fragment key={item.text}>
            {renderLeafItem(item)}
            {index === mainMenuItems.length - 2 && <Divider />}
          </React.Fragment>
        ))}
      </List>

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
    </Container>
  );
};

export default SettingsPage;
