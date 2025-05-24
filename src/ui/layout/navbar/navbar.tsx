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
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { NavbarStyles } from "./style";
import { Icon } from "@iconify/react";
import { useState } from "react";
import OpenApp from "../../../components/events/OpenApp";
import OpenAppHome from "../../../components/events/OpenApp";
import { useAppSelector } from "../../../redux/store";

export default function Sidebar() {
  const [add, setAdd] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [manageAccountOpen, setManageAccountOpen] = useState(false);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] =
    useState(true);
  const [statusEnabled, setStatusEnabled] = useState(true);
  const { mainStyle } = NavbarStyles();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const user = useAppSelector((state) => state.auth.user);

  const handleAdd = () => {
    setAdd(true);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
    setManageAccountOpen(false);
  };

  const handleManageAccountClick = () => {
    setManageAccountOpen(!manageAccountOpen);
  };

  const handleMenuItemClick = (path: string) => {
    handleProfileMenuClose();
    navigate(path);
  };

  const handleSwitchChange =
    (type: "push" | "status") =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (type === "push") {
        setPushNotificationsEnabled(event.target.checked);
      } else {
        setStatusEnabled(event.target.checked);
      }
    };

  const manageAccountItems = [
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
  ];

  const mainMenuItems = [
    { text: "Preferences", icon: "mdi:cog", path: "/preferences?mode=edit" },
    { text: "Premium Subscription", icon: "mdi:crown", path: "/premium" },
    { text: "Logout", icon: "mdi:logout", path: "/login" },
  ];

  return (
    <Box
      sx={{
        ...mainStyle,
        padding: isMobile ? "8px" : "20px",
        backgroundColor: theme.palette.background.default,
      }}
    >
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
            backgroundColor: theme.palette.primary.lighter,
            py: 1.5,
            "&:hover": {
              backgroundColor: theme.palette.primary.light,
            },
          }}
          onClick={handleManageAccountClick}
        >
          <ListItemIcon>
            <Icon
              icon="mdi:account-cog"
              fontSize={24}
              color={theme.palette.primary.main}
            />
          </ListItemIcon>
          <ListItemText
            primary="Manage Account"
            primaryTypographyProps={{
              fontWeight: 600,
              color: theme.palette.primary.main,
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
                onClick={() =>
                  !item.hasSwitch && handleMenuItemClick(item.path)
                }
                sx={{
                  py: 1.5,
                  px: 2,
                  mb: 0.5,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  "&:hover": {
                    backgroundColor: theme.palette.primary.lighter,
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <ListItemIcon>
                    <Icon
                      icon={item.icon}
                      fontSize={22}
                      color={theme.palette.primary.main}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      color: theme.palette.text.primary,
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
        <Divider sx={{ borderColor: theme.palette.primary.lighter }} />
        {mainMenuItems.map((item, index) => (
          <MenuItem
            key={item.text}
            onClick={() => handleMenuItemClick(item.path)}
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
              <Icon
                icon={item.icon}
                fontSize={22}
                color={theme.palette.primary.main}
              />
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
      <Button
        size="medium"
        startIcon={<Icon icon="material-symbols-light:add-circle-outline" />}
        endIcon={<Icon icon="mingcute:down-line" />}
        variant="contained"
        color="primary"
        onClick={handleAdd}
        sx={{
          whiteSpace: "nowrap",
          padding: isMobile ? "6px 12px" : "8px 16px",
        }}
      >
        Add
      </Button>
      <OpenAppHome
        openApp={add}
        setOpenApp={setAdd}
        text="Please open the app to perform this action"
      />
    </Box>
  );
}
