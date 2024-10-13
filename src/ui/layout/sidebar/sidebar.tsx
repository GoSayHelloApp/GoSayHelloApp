import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import { SidebarStyles } from "./style";
import { Icon } from "@iconify/react";

const sidebarItems = [
  {
    id: 0,
    path: "/home",
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
    path: "/chat",
    icon: "ant-design:message-filled",
    label: "Chat",
  },
  {
    id: 3,
    path: "/wallet",
    icon: "ant-design:message-filled",
    label: "Wallet",
  },
  {
    id: 4,
    path: "/recent",
    icon: "mdi:heart",
    label: "Recent",
  },
  {
    id: 5,
    path: "/waves",
    icon: "ant-design:message-filled",
    label: "Waves",
  },
];

export default function Sidebar() {
  const { mainStyle, activeStyle } = SidebarStyles();
  const location = useLocation();
  const theme = useTheme();
  return (
    <Box sx={{ ...mainStyle }}>
      <List>
        {sidebarItems.map((index) => (
          <ListItem key={index.id}>
            <ListItemButton
              LinkComponent={"a"}
              href={index.path}
              sx={{
                ...(location.pathname === index.path ? activeStyle : {}),
              }}
            >
              <ListItemIcon>
                <Icon
                  icon={index.icon}
                  fontSize={32}
                  color={theme.palette.action.disabled}
                />
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{ fontSize: 15, fontWeight: 700 }}
                primary={index.label}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
