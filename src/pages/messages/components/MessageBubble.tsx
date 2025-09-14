import React from "react";
import { Box, Typography, Avatar, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";

interface Message {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  isOwn: boolean;
  avatar: string;
  isOnline: boolean;
}

interface MessageBubbleProps {
  message: Message;
}

const MessageContainer = styled(Box)<{ isOwn: boolean }>(({ theme, isOwn }) => ({
  display: "flex",
  justifyContent: isOwn ? "flex-end" : "flex-start",
  marginBottom: theme.spacing(2),
  alignItems: "flex-start",
  gap: theme.spacing(1),
}));

const MessageBubble = styled(Paper)<{ isOwn: boolean }>(({ theme, isOwn }) => ({
  maxWidth: "70%",
  padding: theme.spacing(1.5, 2),
  backgroundColor: isOwn ? theme.palette.primary.main : theme.palette.background.paper,
  color: isOwn ? theme.palette.primary.contrastText : theme.palette.text.primary,
  borderRadius: isOwn ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
  wordWrap: "break-word",
  overflowWrap: "break-word",
}));

const MessageText = styled(Typography)(({ theme }) => ({
  fontSize: "0.95rem",
  lineHeight: 1.4,
  margin: 0,
}));

const Timestamp = styled(Typography)(({ theme }) => ({
  fontSize: "0.75rem",
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.5),
  textAlign: "left",
}));

const SenderAvatar = styled(Avatar)(({ theme }) => ({
  width: 32,
  height: 32,
  border: `2px solid ${theme.palette.success.main}`,
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 8,
    height: 8,
    backgroundColor: theme.palette.success.main,
    borderRadius: "50%",
    border: `2px solid ${theme.palette.background.paper}`,
  },
}));

const MessageBubbleComponent: React.FC<MessageBubbleProps> = ({ message }) => {
  return (
    <MessageContainer isOwn={message.isOwn}>
      {!message.isOwn && (
        <SenderAvatar
          src={message.avatar}
          alt={message.sender}
          sx={{
            "&::after": {
              display: message.isOnline ? "block" : "none",
            },
          }}
        />
      )}

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: message.isOwn ? "flex-end" : "flex-start",
          flex: 1,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, marginBottom: 0.5, color: "text.primary" }}>
          {message.sender}
        </Typography>
        <MessageBubble isOwn={message.isOwn}>
          <MessageText>{message.message}</MessageText>
        </MessageBubble>
        <Timestamp>{message.timestamp}</Timestamp>
      </Box>

      {message.isOwn && (
        <SenderAvatar
          src={message.avatar}
          alt={message.sender}
          sx={{
            "&::after": {
              display: message.isOnline ? "block" : "none",
            },
          }}
        />
      )}
    </MessageContainer>
  );
};

export default MessageBubbleComponent;
