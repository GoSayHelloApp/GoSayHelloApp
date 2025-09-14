import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  useTheme,
} from "@mui/material";
import { Icon } from "@iconify/react";

interface Transaction {
  id: string;
  amount: string;
  currency: string;
  from: string;
  status: "Pending" | "Completed" | "Failed";
  date: string;
  type: "received" | "sent" | "earned";
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    amount: "1000",
    currency: "HELLO",
    from: "GoSayHELLO Foundation",
    status: "Pending",
    date: "2024-08-29 01:33:36",
    type: "received",
  },
  {
    id: "2",
    amount: "1000",
    currency: "HELLO",
    from: "GoSayHELLO Foundation",
    status: "Pending",
    date: "2024-08-17 13:33:17",
    type: "received",
  },
  {
    id: "3",
    amount: "1000",
    currency: "HELLO",
    from: "GoSayHELLO Foundation",
    status: "Pending",
    date: "2024-08-15 10:22:45",
    type: "received",
  },
];

const Wallet: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [filteredTransactions, setFilteredTransactions] = useState(mockTransactions);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);

    // Filter transactions based on selected tab
    switch (newValue) {
      case 0: // All
        setFilteredTransactions(mockTransactions);
        break;
      case 1: // Earned
        setFilteredTransactions(mockTransactions.filter((t) => t.type === "earned"));
        break;
      case 2: // Sent
        setFilteredTransactions(mockTransactions.filter((t) => t.type === "sent"));
        break;
      case 3: // Received
        setFilteredTransactions(mockTransactions.filter((t) => t.type === "received"));
        break;
      default:
        setFilteredTransactions(mockTransactions);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "received":
        return <Icon icon="material-symbols:arrow-downward" style={{ color: theme.palette.success.main }} />;
      case "sent":
        return <Icon icon="material-symbols:send" style={{ color: theme.palette.error.main }} />;
      case "earned":
        return <Icon icon="material-symbols:attach-money" style={{ color: theme.palette.warning.main }} />;
      default:
        return <Icon icon="material-symbols:attach-money" style={{ color: theme.palette.primary.main }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return theme.palette.warning.main;
      case "Completed":
        return theme.palette.success.main;
      case "Failed":
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: "auto", position: "relative" }}>
      {/* Header */}
      <Typography variant="h4" sx={{ fontWeight: "bold", color: theme.palette.grey[800], mb: 3 }}>
        Wallet
      </Typography>

      {/* Balance Card */}
      <Card
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          borderRadius: "24px 24px 0 0",
          mb: 0,
          color: "white",
          position: "relative",
          zIndex: 1,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                  width: 48,
                  height: 48,
                  fontSize: "1.5rem",
                }}
              >
                <Icon icon="material-symbols:attach-money" />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: "bold", mb: 0.5 }}>
                  976890
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  0.96 Balance
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
              <Button
                variant="text"
                sx={{
                  color: "white",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.5,
                  minWidth: "auto",
                  px: 1,
                }}
                startIcon={<Icon icon="material-symbols:qr-code" />}
              >
                <Typography variant="caption">Receive</Typography>
              </Button>
              <Button
                variant="text"
                sx={{
                  color: "white",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.5,
                  minWidth: "auto",
                  px: 1,
                }}
                startIcon={<Icon icon="material-symbols:send" />}
              >
                <Typography variant="caption">Send</Typography>
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* History Section - Positioned over the balance card */}
      <Box
        sx={{
          position: "relative",
          mt: -2,
          zIndex: 2,
          backgroundColor: theme.palette.background.paper,
          borderRadius: 3,
          p: 2,
          boxShadow: theme.shadows[2],
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold", color: theme.palette.grey[800], mb: 2 }}>
          History
        </Typography>

        {/* Filter Tabs */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              backgroundColor: theme.palette.grey[300],
              borderRadius: theme.shape.borderRadius * 50,
              p: 0.75,
            }}
          >
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="wallet transaction tabs">
              <Tab sx={{ flex: "1 1 auto" }} label="All" />
              <Tab sx={{ flex: "1 1 auto" }} label="Earned" />
              <Tab sx={{ flex: "1 1 auto" }} label="Sent" />
              <Tab sx={{ flex: "1 1 auto" }} label="Received" />
            </Tabs>
          </Box>
        </Box>

        {/* Transaction List */}
        <List sx={{ gap: 1 }}>
          {filteredTransactions.map((transaction) => (
            <Card
              key={transaction.id}
              sx={{
                mb: 1,
                borderRadius: 2,
                backgroundColor: theme.palette.grey[50],
                border: `1px solid ${theme.palette.grey[200]}`,
              }}
            >
              <ListItem sx={{ py: 2, px: 2 }}>
                <ListItemIcon sx={{ minWidth: 48 }}>
                  <Avatar
                    sx={{
                      bgcolor: theme.palette.success.light,
                      width: 40,
                      height: 40,
                    }}
                  >
                    {getTransactionIcon(transaction.type)}
                  </Avatar>
                </ListItemIcon>

                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: "bold", color: theme.palette.grey[800] }}>
                        {transaction.amount} {transaction.currency}
                      </Typography>
                      <Icon
                        icon="material-symbols:attach-money"
                        style={{ fontSize: 16, color: theme.palette.grey[600] }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" sx={{ color: theme.palette.grey[600], mb: 0.5 }}>
                        from: {transaction.from}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Chip
                          label={transaction.status}
                          size="small"
                          sx={{
                            backgroundColor: getStatusColor(transaction.status),
                            color: "white",
                            fontSize: "0.75rem",
                            height: 20,
                          }}
                        />
                        <Typography variant="caption" sx={{ color: theme.palette.grey[500] }}>
                          {transaction.date}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            </Card>
          ))}
        </List>

        {filteredTransactions.length === 0 && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body1" sx={{ color: theme.palette.grey[500] }}>
              No transactions found
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Wallet;
