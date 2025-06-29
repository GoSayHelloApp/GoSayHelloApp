import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  IconButton,
  Collapse,
  Avatar,
  Button,
  Typography,
} from "@mui/material";
import { useLocation, Link, Navigate, useNavigate } from "react-router-dom";
import { SidebarStyles } from "./style";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { useAppSelector } from "../../../redux/store";

export default function Sidebar() {
  const navigate = useNavigate();
  const { mainStyle, activeStyle } = SidebarStyles();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [isCollapsed, setIsCollapsed] = useState(false);
  const user = useAppSelector((state) => state.auth.user);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const sidebarItems = [
    {
      id: 0,
      path: "/nearby",
      icon: "ic:sharp-home",
      label: "Home",
    },
    {
      id: 1,
      path: "/search",
      icon: "ic:round-search",
      label: "Search",
    },
    {
      id: 2,
      path: "/messages",
      icon: "ant-design:message-filled",
      label: "Chat",
    },
    {
      id: 3,
      path: "/wallet",
      icon: "ant-design:wallet",
      label: "Wallet",
    },
    {
      id: 4,
      path: "/waves",
      icon: "mdi:heart",
      label: "Recent",
    },
    {
      id: 5,
      path: "/profile",
      icon: "mdi:account",
      label: "Profile",
    },
  ];

  const handleShareClick = () => {};
  return (
    <Box
      sx={{
        ...mainStyle,
        padding: {
          xs: isCollapsed ? "6px 20px 0px 20px" : "10px 20px 6px 20px",
          sm: isCollapsed ? "16px 20px 12px 20px" : "10px 20px 12px 20px",
          md: "20px 20px 24px 24px",
          lg: "20px 20px 24px 24px",
        },
      }}
    >
      {/* User Profile Section for Desktop */}
      {isDesktop && user && (
        <Box sx={{ display: "flex", alignItems: "center", mb: 4, mt: 2 }}>
          <Box
            sx={{ position: "relative", mr: 2, cursor: "pointer" }}
            onClick={() => {
              navigate("/profile?tab=posts");
            }}
          >
            <Avatar
              src={user.profile_image}
              sx={{
                width: 80,
                height: 80,
                border: "4px solid white",
                boxShadow: 3,
              }}
            />
            {/* <IconButton
              sx={{
                position: "absolute",
                bottom: 0,
                right: 0,
                bgcolor: "white",
                boxShadow: 2,
                width: 28,
                height: 28,
                p: 0,
                zIndex: 1,
                "&:hover": { bgcolor: theme.palette.grey[200] },
              }}
            >
              <Icon
                icon="mdi:settings"
                fontSize={18}
                color={theme.palette.grey[800]}
              />
            </IconButton> */}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: 16,
                mb: 1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user.first_name} {user.last_name}
            </Typography>
            <Button
              endIcon={<Icon icon="material-symbols:share-windows" />}
              size="small"
              variant="contained"
              color="info"
              sx={{
                flexShrink: 0,
                ml: 1,
              }}
              onClick={handleShareClick}
            >
              Invite
            </Button>
          </Box>
        </Box>
      )}

      {isMobile && (
        <Box
          sx={{
            position: "absolute",
            top: -18,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 2,
          }}
        >
          <IconButton
            onClick={toggleSidebar}
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.common.white,
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
              },
              width: 40,
              height: 40,
              boxShadow: theme.shadows[3],
            }}
          >
            <Icon
              icon={isCollapsed ? "mdi:chevron-up" : "mdi:chevron-down"}
              fontSize={24}
            />
          </IconButton>
        </Box>
      )}

      <Collapse in={!isCollapsed || !isMobile}>
        <List>
          {sidebarItems.map((index) => (
            <ListItem
              key={index.id}
              sx={{
                width: {
                  xs: "auto",
                  sm: "auto",
                  md: "100%",
                  lg: "100%",
                },
              }}
            >
              <ListItemButton
                component={Link}
                to={index.path}
                sx={{
                  ...(location.pathname.split("?").at(0) === index.path
                    ? activeStyle
                    : {}),
                  flexDirection: {
                    xs: "column",
                    sm: "column",
                    md: "row",
                    lg: "row",
                  },
                  padding: {
                    xs: "4px 8px",
                    sm: "4px 8px",
                    md: "8px 16px",
                    lg: "8px 16px",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    justifyContent: "center",
                    minWidth: {
                      xs: "auto",
                      sm: "auto",
                      md: "40px",
                      lg: "40px",
                    },
                  }}
                >
                  <Icon
                    icon={index.icon}
                    fontSize={isMobile ? 24 : 32}
                    color={
                      location.pathname.split("?").at(0) === index.path
                        ? theme.palette.primary.light
                        : theme.palette.action.disabled
                    }
                  />
                </ListItemIcon>
                {!isMobile && (
                  <ListItemText
                    primaryTypographyProps={{ fontSize: 15, fontWeight: 700 }}
                    primary={index.label}
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Collapse>
    </Box>
  );
}
