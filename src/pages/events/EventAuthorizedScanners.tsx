import React from "react";
import { Box, IconButton, Typography, Stack } from "@mui/material";
import { Icon } from "@iconify/react";
import { useNavigate, useParams } from "react-router-dom";

/**
 * Placeholder shell for managing authorized ticket scanners for an event (host).
 * Wire list/add/remove APIs here when available.
 */
const EventAuthorizedScanners: React.FC = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();

  return (
    <Box sx={{ minHeight: "100%", bgcolor: "#FAFAFA", px: 2, py: 2, maxWidth: 720, mx: "auto" }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} aria-label="Back" sx={{ color: "#111" }}>
          <Icon icon="mdi:chevron-left" width={28} height={28} />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#111" }}>
          Authorized scanners
        </Typography>
      </Stack>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
        Event #{eventId ?? "—"}
      </Typography>
      <Typography variant="body1" sx={{ color: "#111" }}>
        Add or remove people who can scan tickets at check-in. Full management UI will connect here when the backend endpoints are ready.
      </Typography>
    </Box>
  );
};

export default EventAuthorizedScanners;
