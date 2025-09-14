import React from "react";
import { ListItem, ListItemButton, ListItemAvatar, Avatar, ListItemText, Typography, Box } from "@mui/material";
import { styled } from "@mui/material/styles";

interface Chat {
  id: string;
  title: string;
  subtitle: string;
  avatar: string;
  date: string;
  isSelected: boolean;
}

interface ChatItemProps {
  chat: Chat;
  isSelected: boolean;
  onClick: () => void;
}

const StyledListItem = styled(ListItem)(({ theme }) => ({
  padding: 0,
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const StyledListItemButton = styled(ListItemButton)<{ isSelected: boolean }>(({ theme, isSelected }) => ({
  padding: theme.spacing(1.5, 2),
  backgroundColor: isSelected ? theme.palette.primary.main : "transparent",
  color: isSelected ? theme.palette.primary.contrastText : theme.palette.text.primary,
  borderRadius: isSelected ? "12px" : "0px",
  margin: isSelected ? theme.spacing(0.5, 1) : "0px",
  overflow: "hidden", // Prevent content overflow
  "&:hover": {
    backgroundColor: isSelected ? theme.palette.primary.dark : theme.palette.action.hover,
    borderRadius: isSelected ? "12px" : "0px",
  },
  "& .MuiListItemText-primary": {
    color: isSelected ? theme.palette.primary.contrastText : theme.palette.text.primary,
    fontWeight: 600,
    fontSize: "0.95rem",
    lineHeight: 1.3,
  },
  "& .MuiListItemText-secondary": {
    color: isSelected ? theme.palette.primary.contrastText : theme.palette.text.secondary,
    fontSize: "0.85rem",
    lineHeight: 1.2,
    marginTop: theme.spacing(0.25),
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 48,
  height: 48,
  marginRight: theme.spacing(1.5),
}));

const DateText = styled(Typography)<{ isSelected: boolean }>(({ theme, isSelected }) => ({
  fontSize: "0.75rem",
  color: isSelected ? theme.palette.primary.contrastText : theme.palette.text.secondary,
  fontWeight: 500,
  marginTop: theme.spacing(0.5),
}));

const ChatItem: React.FC<ChatItemProps> = ({ chat, isSelected, onClick }) => {
  return (
    <StyledListItem disablePadding>
      <StyledListItemButton isSelected={isSelected} onClick={onClick}>
        <ListItemAvatar>
          <StyledAvatar
            src={chat.avatar}
            alt={chat.title}
            sx={{
              background: isSelected ? "rgba(255,255,255,0.2)" : undefined,
            }}
          />
        </ListItemAvatar>
        <ListItemText
          primary={chat.title}
          secondary={chat.subtitle}
          sx={{
            flex: 1,
            minWidth: 0, // Allow flex item to shrink below content size
            "& .MuiListItemText-primary": {
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            },
            "& .MuiListItemText-secondary": {
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            },
          }}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            minWidth: "60px",
            maxWidth: "80px",
            marginLeft: 1,
            flexShrink: 0, // Prevent shrinking
          }}
        >
          <DateText isSelected={isSelected}>{chat.date}</DateText>
        </Box>
      </StyledListItemButton>
    </StyledListItem>
  );
};

export default ChatItem;
