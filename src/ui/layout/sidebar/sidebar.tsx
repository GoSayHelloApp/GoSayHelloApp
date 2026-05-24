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
  Drawer,
} from "@mui/material";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { SidebarStyles } from "./style";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { useAppSelector } from "../../../redux/store";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const { mainStyle, activeStyle } = SidebarStyles();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isCollapsed, setIsCollapsed] = useState(false);
  const user = useAppSelector((state) => state.auth.user);

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
    // Conditionally render Recent item based on screen size
    ...(isMobile
      ? [
          {
            id: 4,
            path: "/waves",
            icon: "mdi:heart",
            label: "Recent",
          },
        ]
      : []), // Hide Recent item on desktop
    {
      id: 5,
      path: "/profile",
      icon: "mdi:account",
      label: "Profile",
    },
  ];

  const handleShareClick = () => {};

  const sidebarContent = (
    <Box
      sx={{
        ...(isMobile
          ? {
              height: "100%",
              display: "flex",
              flexDirection: "column",
              padding: "20px",
              backgroundColor: theme.palette.background.default,
            }
          : {}),
        padding: isMobile ? "20px" : "",
      }}
    >
      {/* User Profile Section for Desktop */}
      {user && (
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
            {isMobile && (
              <IconButton
                aria-label="Settings"
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
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                  navigate("/settings");
                }}
              >
                <Icon icon="mdi:settings" fontSize={18} color={theme.palette.grey[800]} />
              </IconButton>
            )}
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
                onClick={isMobile ? onClose : undefined}
                sx={{
                  ...(location.pathname.split("?").at(0) === index.path ? activeStyle : {}),
                  flexDirection: "row",
                  padding: "12px 16px",
                  ...(isMobile && { gap: 2, borderRadius: "24px" }),
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
                <ListItemText
                  primaryTypographyProps={{
                    fontSize: isMobile ? 14 : 15,
                    fontWeight: 700,
                  }}
                  primary={index.label}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Collapse>
    </Box>
  );

  // Mobile: Render as Drawer
  if (isMobile) {
    return (
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        variant="temporary"
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        PaperProps={{
          sx: {
            width: 280,
            maxWidth: "80vw",
            backgroundColor: theme.palette.background.default,
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  // Desktop: Render as fixed sidebar
  return (
    <Box
      sx={{
        ...mainStyle,
        padding: {
          xs: isCollapsed ? "6px 20px 0px 20px" : "10px 20px 6px 20px",
          sm: isCollapsed ? "16px 20px 12px 20px" : "10px 20px 6px 20px",
          md: "20px 20px 24px 24px",
          lg: "20px 20px 24px 24px",
        },
      }}
    >
      {sidebarContent}
    </Box>
  );
}
