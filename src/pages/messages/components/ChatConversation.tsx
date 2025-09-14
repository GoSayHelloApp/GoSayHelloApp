import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, TextField, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Icon } from "@iconify/react";
import MessageBubble from "./MessageBubble";

interface Chat {
  id: string;
  title: string;
  subtitle: string;
  avatar: string;
  date: string;
  isSelected: boolean;
}

interface Message {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  isOwn: boolean;
  avatar: string;
  isOnline: boolean;
}

interface ChatConversationProps {
  chat: Chat | null;
  messages: Message[];
  onBackToList?: () => void;
  isMobile?: boolean;
}

const ConversationContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  minHeight: 0, // Important for flexbox scrolling
  overflow: "hidden", // Prevent overflow
  maxHeight: "100%", // Ensure it doesn't exceed parent height
  position: "relative", // Ensure proper positioning
}));

const Header = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  backgroundColor: "#DBDBDB",
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  flexShrink: 0, // Prevent header from shrinking
  height: "80px", // Fixed height instead of minHeight
  boxSizing: "border-box", // Include padding in height calculation
}));

const BackButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.primary,
  padding: theme.spacing(0.5),
}));

const ChatTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: "1.1rem",
  marginBottom: theme.spacing(0.5),
}));

const ChatSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: "0.9rem",
  color: theme.palette.text.secondary,
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: "auto",
  padding: theme.spacing(2),
  minHeight: 0, // Important for flexbox scrolling
  "&::-webkit-scrollbar": {
    width: "6px",
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    background: theme.palette.grey[300],
    borderRadius: "3px",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    background: theme.palette.grey[400],
  },
}));

const InputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  display: "flex",
  alignItems: "center",
  position: "relative",
  flexShrink: 0, // Prevent input from shrinking
  height: "80px", // Fixed height instead of minHeight
  boxSizing: "border-box", // Include padding in height calculation
}));

const InputWrapper = styled(Box)(({ theme }) => ({
  position: "relative",
  flex: 1,
  display: "flex",
  alignItems: "center",
}));

const MessageInput = styled(TextField)(({ theme }) => ({
  flex: 1,
  "& .MuiOutlinedInput-root": {
    borderRadius: "24px",
    backgroundColor: "#FFFFFF",
    paddingRight: "50px",
    "& fieldset": {
      border: "none",
    },
    "&:hover fieldset": {
      border: "none",
    },
    "&.Mui-focused fieldset": {
      border: "none",
    },
  },
}));

const SendButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  right: 6,
  top: "50%",
  transform: "translateY(-50%)",
  color: theme.palette.primary.main,
  width: 40,
  height: 40,
  backgroundColor: "transparent",
  "&:hover": {
    backgroundColor: "transparent",
    color: theme.palette.primary.dark,
  },
  "&:disabled": {
    color: theme.palette.grey[400],
  },
}));

const ChatConversation: React.FC<ChatConversationProps> = ({ chat, messages, onBackToList, isMobile }) => {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Here you would typically send the message to your backend
      console.log("Sending message:", newMessage);
      setNewMessage("");
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  if (!chat) {
    return (
      <ConversationContainer>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "text.secondary",
          }}
        >
          <Typography variant="h6">Select a chat to start messaging</Typography>
        </Box>
      </ConversationContainer>
    );
  }

  return (
    <ConversationContainer>
      <Header>
        {isMobile && onBackToList && (
          <BackButton onClick={onBackToList}>
            <Icon icon="material-symbols:arrow-back" fontSize={24} />
          </BackButton>
        )}
        <Box sx={{ flex: 1 }}>
          <ChatTitle>{chat.title}</ChatTitle>
          <ChatSubtitle>{chat.subtitle}</ChatSubtitle>
        </Box>
      </Header>

      <MessagesContainer>
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </MessagesContainer>

      <InputContainer>
        <InputWrapper>
          <MessageInput
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            multiline
            maxRows={3}
            variant="outlined"
            size="small"
          />
          <SendButton onClick={handleSendMessage} disabled={!newMessage.trim()}>
            <Icon icon="material-symbols:send" fontSize={28} style={{ transform: "rotate(-45deg)" }} />
          </SendButton>
        </InputWrapper>
      </InputContainer>
    </ConversationContainer>
  );
};

export default ChatConversation;
