import React from "react";
import { Box, List, Tabs, Tab } from "@mui/material";
import { styled } from "@mui/material/styles";
import ChatItem from "./ChatItem";

interface Chat {
  id: string;
  title: string;
  subtitle: string;
  avatar: string;
  date: string;
  isSelected: boolean;
}

interface ChatListProps {
  chats: Chat[];
  selectedChat: Chat | null;
  onChatSelect: (chat: Chat) => void;
  chatType: number;
  onChatTypeChange: (event: React.SyntheticEvent, newValue: number) => void;
}

const ChatListContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  backgroundColor: theme.palette.grey[50],
  overflow: "hidden", // Prevent container overflow
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: "#DBDBDB",
  borderRadius: "33px",
  margin: theme.spacing(2),
  "& .MuiTabs-indicator": {
    display: "none",
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  flex: "1 1 auto",
  height: "60px",
  width: "150px",
  fontSize: 15,
  fontWeight: 600,
  textTransform: "none",
  "&.Mui-selected": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderRadius: "33px",
  },
}));

const ChatListScroll = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: "auto",
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

const ChatList: React.FC<ChatListProps> = ({ chats, selectedChat, onChatSelect, chatType, onChatTypeChange }) => {
  return (
    <ChatListContainer>
      <StyledTabs value={chatType} onChange={onChatTypeChange}>
        <StyledTab label="Chat" />
        <StyledTab label="Event Chat" />
      </StyledTabs>
      <ChatListScroll>
        <List disablePadding>
          {chats.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isSelected={selectedChat?.id === chat.id}
              onClick={() => onChatSelect(chat)}
            />
          ))}
        </List>
      </ChatListScroll>
    </ChatListContainer>
  );
};

export default ChatList;
