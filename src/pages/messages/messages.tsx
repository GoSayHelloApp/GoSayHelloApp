import React, { useState } from "react";
import { Box, Typography, Tabs, Tab, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import ChatList from "./components/ChatList";
import ChatConversation from "./components/ChatConversation";

const MessagesContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  height: "80vh",
  backgroundColor: theme.palette.background.default,
  [theme.breakpoints.down("md")]: {
    height: "94vh", // Show navbar at top
  },
}));

const PanelsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flex: 1,
  gap: theme.spacing(2),
  minHeight: 0, // Important for flexbox constraints
  maxHeight: "100%", // Prevent height from increasing
  [theme.breakpoints.down("md")]: {
    gap: 0,
  },
}));

const LeftPanel = styled(Paper)(({ theme }) => ({
  width: "350px",
  minWidth: "350px",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  borderRadius: 26,
  [theme.breakpoints.down("md")]: {
    width: "100%",
    minWidth: "100%",
  },
}));

const RightPanel = styled(Box)(({ theme }) => ({
  flex: 1,
  height: "100%",
  maxHeight: "100%", // Prevent height from increasing
  display: "flex",
  flexDirection: "column",
  backgroundColor: theme.palette.grey[50],
  borderRadius: 26,
  overflow: "hidden",
  minHeight: 0, // Important for flexbox constraints
  [theme.breakpoints.down("md")]: {
    width: "100%",
    borderRadius: 0,
  },
}));

const Header = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  overflow: "hidden", // Prevent header content overflow
  [theme.breakpoints.down("md")]: {
    display: "none", // Hide header on mobile
  },
}));

const Title = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: "1.5rem",
  marginBottom: theme.spacing(1),
}));

// Mock data for demonstration
const mockEventChats = [
  {
    id: "1",
    title: "Juneteenth Atlanta Parade...",
    subtitle: "Help us spread the word!",
    avatar: "/images/juneteenth-avatar.jpg",
    date: "May 06",
    isSelected: false,
  },
  {
    id: "2",
    title: "Sneaker Doodle Presents...",
    subtitle: "1345 Piedmont Ave NE, Atlanta...",
    avatar: "/images/sneaker-avatar.jpg",
    date: "May 05",
    isSelected: false,
  },
  {
    id: "3",
    title: "Piedmont Park Pic...",
    subtitle: "1345 Piedmont Ave NE, Atlanta...",
    avatar: "/images/piedmont-avatar.jpg",
    date: "Aug 26",
    isSelected: true,
  },
  {
    id: "4",
    title: "101 TKO RADIO APP RELEASE...",
    subtitle: "OK",
    avatar: "/images/radio-avatar.jpg",
    date: "May 04",
    isSelected: false,
  },
  {
    id: "5",
    title: "CELEBRITY KICKBALL...",
    subtitle: "Saturday was an Awsome turn out...",
    avatar: "/images/kickball-avatar.jpg",
    date: "May 03",
    isSelected: false,
  },
  {
    id: "6",
    title: "100k ATLiens Challenge!",
    subtitle: "Maybe we should start curating events...",
    avatar: "/images/100k-avatar.jpg",
    date: "May 02",
    isSelected: false,
  },
  {
    id: "7",
    title: "Paint N Sit ATL Free Community...",
    subtitle: "Still going",
    avatar: "/images/paint-avatar.jpg",
    date: "May 01",
    isSelected: false,
  },
];

const mockUserChats = [
  {
    id: "1",
    title: "Polly R",
    subtitle: "Hey, how are you doing?",
    avatar: "/images/polly-avatar.jpg",
    date: "2 min",
    isSelected: false,
  },
  {
    id: "2",
    title: "Dale Calhoun",
    subtitle: "Thanks for the help yesterday",
    avatar: "/images/dale-avatar.jpg",
    date: "5 min",
    isSelected: false,
  },
  {
    id: "3",
    title: "Dee Moore",
    subtitle: "See you at the event!",
    avatar: "/images/dee-avatar.jpg",
    date: "1 hour",
    isSelected: false,
  },
  {
    id: "4",
    title: "Deborah J",
    subtitle: "Can't wait to meet you",
    avatar: "/images/deborah-avatar.jpg",
    date: "2 hours",
    isSelected: false,
  },
  {
    id: "5",
    title: "Clarence Edwards",
    subtitle: "Great event last night",
    avatar: "/images/clarence-avatar.jpg",
    date: "3 hours",
    isSelected: false,
  },
  {
    id: "6",
    title: "Maritza R",
    subtitle: "Let's grab coffee soon",
    avatar: "/images/maritza-avatar.jpg",
    date: "1 day",
    isSelected: false,
  },
  {
    id: "7",
    title: "Customer Support",
    subtitle: "How can I help you today?",
    avatar: "/images/support-avatar.jpg",
    date: "Aug 26",
    isSelected: true,
  },
];

// Messages for user chats (1-on-1 conversations)
const mockUserMessages = [
  {
    id: "1",
    sender: "Customer Support",
    message: "Hello! How can I help you today?",
    timestamp: "Aug 26, 12:20 PM",
    isOwn: false,
    avatar: "/images/support-avatar.jpg",
    isOnline: true,
  },
  {
    id: "2",
    sender: "You",
    message: "Hi, I'm having trouble with my account settings",
    timestamp: "Aug 26, 12:22 PM",
    isOwn: true,
    avatar: "/images/your-avatar.jpg",
    isOnline: true,
  },
  {
    id: "3",
    sender: "Customer Support",
    message: "I'd be happy to help you with that. What specific issue are you experiencing?",
    timestamp: "Aug 26, 12:23 PM",
    isOwn: false,
    avatar: "/images/support-avatar.jpg",
    isOnline: true,
  },
  {
    id: "4",
    sender: "You",
    message: "I can't seem to update my profile picture",
    timestamp: "Aug 26, 12:25 PM",
    isOwn: true,
    avatar: "/images/your-avatar.jpg",
    isOnline: true,
  },
  {
    id: "5",
    sender: "Customer Support",
    message: "Let me check that for you. Can you try refreshing the page first?",
    timestamp: "Aug 26, 12:26 PM",
    isOwn: false,
    avatar: "/images/support-avatar.jpg",
    isOnline: true,
  },
];

// Messages for event chats (multiple users)
const mockEventMessages = [
  {
    id: "1",
    sender: "Lexx Thornton",
    message: "Is anyone here?",
    timestamp: "Aug 26, 12:26 PM",
    isOwn: false,
    avatar: "/images/lexx-avatar.jpg",
    isOnline: true,
  },
  {
    id: "2",
    sender: "Mathew Martinez",
    message:
      "Y'all. I love you guys. pull out your phone and look at the Google map.it will say active circle. There are also signs all over the park. It's a big field with a track around it.",
    timestamp: "Aug 26, 12:27 PM",
    isOwn: true,
    avatar: "/images/mathew-avatar.jpg",
    isOnline: true,
  },
  {
    id: "3",
    sender: "Nesa Rankin",
    message: "We walking up by where the tents for that private event. which way from there?",
    timestamp: "Aug 26, 12:28 PM",
    isOwn: false,
    avatar: "/images/nesa-avatar.jpg",
    isOnline: true,
  },
  {
    id: "4",
    sender: "Lexx Thornton",
    message: "We are under a tree",
    timestamp: "Aug 26, 12:28 PM",
    isOwn: false,
    avatar: "/images/lexx-avatar.jpg",
    isOnline: true,
  },
];

const Messages: React.FC = () => {
  const [chatType, setChatType] = useState<number>(0); // 0 for chat, 1 for event
  const [selectedChat, setSelectedChat] = useState<any>(null); // No chat selected initially
  const [showConversation, setShowConversation] = useState(false); // For mobile view

  const handleChatTypeChange = (event: React.SyntheticEvent, newValue: number) => {
    setChatType(newValue);
    // Reset selected chat when switching tabs
    setSelectedChat(null);
    setShowConversation(false); // Reset mobile view to chat list
  };

  const handleChatSelect = (chat: any) => {
    setSelectedChat(chat);
    setShowConversation(true); // Show conversation on mobile
  };

  const handleBackToList = () => {
    setShowConversation(false); // Go back to chat list on mobile
  };

  const currentChats = chatType === 0 ? mockUserChats : mockEventChats;
  const currentMessages = chatType === 0 ? mockUserMessages : mockEventMessages;

  return (
    <MessagesContainer>
      <Header>
        <Title>Chat</Title>
      </Header>
      <PanelsContainer>
        {/* Desktop: Show both panels */}
        <Box sx={{ display: { xs: "none", md: "flex" }, flex: 1, gap: 2 }}>
          <LeftPanel elevation={0}>
            <ChatList
              chats={currentChats}
              selectedChat={selectedChat}
              onChatSelect={handleChatSelect}
              chatType={chatType}
              onChatTypeChange={handleChatTypeChange}
            />
          </LeftPanel>

          <RightPanel>
            {selectedChat ? (
              <ChatConversation chat={selectedChat} messages={currentMessages} />
            ) : (
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
            )}
          </RightPanel>
        </Box>

        {/* Mobile: Show only one panel at a time */}
        <Box sx={{ display: { xs: "flex", md: "none" }, flex: 1 }}>
          {!showConversation ? (
            <LeftPanel elevation={0}>
              <ChatList
                chats={currentChats}
                selectedChat={selectedChat}
                onChatSelect={handleChatSelect}
                chatType={chatType}
                onChatTypeChange={handleChatTypeChange}
              />
            </LeftPanel>
          ) : (
            <RightPanel>
              <ChatConversation
                chat={selectedChat}
                messages={currentMessages}
                onBackToList={handleBackToList}
                isMobile={true}
              />
            </RightPanel>
          )}
        </Box>
      </PanelsContainer>
    </MessagesContainer>
  );
};

export default Messages;
