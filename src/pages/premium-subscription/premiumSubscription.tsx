import React from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Container,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Icon } from "@iconify/react";

const premiumFeatures = [
  "Unlimited HELLOs so that you never miss a wave or potential nearby connection",
  "Unlimited business posts shared to the nearby community",
  "Up to 1000 $HELLO for each close proximity connection with active wallet",
  "“FREE one-time wallet activation” to premium purchase",
  "Send RSVP event invitations to all nearby users 100X faster",
];

const PremiumSubscription = ({ onClose }: { onClose?: () => void }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Container maxWidth="sm" sx={{ py: 4, position: "relative" }}>
      {/* Close Button */}
      {onClose && (
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            color: theme.palette.grey[700],
          }}
        >
          <Icon icon="mdi:close" fontSize={28} />
        </IconButton>
      )}

      {/* Title */}
      <Typography
        variant="h3"
        fontWeight="semiBold"
        align="center"
        mb={3}
        mt={5}
      >
        Premium Subscription
      </Typography>

      {/* Features List */}
      <Box sx={{ mb: 4 }}>
        {premiumFeatures.map((feature, idx) => (
          <Box
            key={idx}
            sx={{
              display: "flex",
              alignItems: "flex-start",
              mb: 2.5,
              gap: 1.5,
            }}
          >
            <Icon
              icon="mdi:check-bold"
              color={theme.palette.primary.main}
              fontSize={28}
              style={{ marginTop: 2 }}
            />
            <Typography
              variant="body1"
              sx={{ color: theme.palette.text.primary, fontSize: 17 }}
            >
              {feature}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Price Box */}
      <Box
        sx={{
          border: `2px solid ${theme.palette.primary.main}`,
          borderRadius: 3,
          p: 3,
          mb: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: theme.palette.primary.lighter,
          position: "relative",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -18,
            left: "50%",
            transform: "translateX(-50%)",
            background: theme.palette.primary.main,
            color: "#fff",
            borderRadius: "20px",
            px: 2.5,
            py: 0.5,
            fontWeight: 600,
            fontSize: 16,
            boxShadow: 1,
          }}
        >
          Unlimited
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", mt: 2, mb: 1 }}>
          <Icon
            icon="mdi:hand-wave"
            color={theme.palette.primary.main}
            fontSize={36}
            style={{ marginRight: 10 }}
          />
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{ color: theme.palette.text.primary }}
          >
            $18.99 <span style={{ fontWeight: 400 }}>/ year</span>
          </Typography>
        </Box>
        <Typography
          variant="body2"
          sx={{ color: theme.palette.text.secondary, fontSize: 16 }}
        >
          ($1.58 per month)
        </Typography>
      </Box>

      {/* Subscribe Button */}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        size="large"
        sx={{
          borderRadius: "40px",
          textTransform: "capitalize",
          padding: "10px",
          height: "60px",
          backgroundColor: theme.palette.primary.main,
          "&:hover": {
            backgroundColor: theme.palette.primary.dark,
          },
          fontWeight: 600,
          fontSize: 20,
        }}
      >
        Subscribe Now
      </Button>
    </Container>
  );
};

export default PremiumSubscription;
