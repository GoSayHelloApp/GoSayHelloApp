import {
  Box,
  Button,
  FormControl,
  InputAdornment,
  Link,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Switch,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import React, { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { debounce } from "lodash";
import Loader from "../../ui/components/core/screenLoader";
import PublicEventCard, { buildInterestedAvatars } from "../../ui/components/eventCard/PublicEventCard";
import { PUBLIC_BRAND } from "../../ui/components/eventCard/publicEventCardStyles";
import { usePublicLocation } from "../../hooks/usePublicLocation";
import { usePublicNearbyEvents } from "../../hooks/usePublicNearbyEvents";
import { formatEventDateTimeForEventCards } from "../../utils/dateTimeFormatter";
import { publicEventsPageSx } from "./publicEventsPageStyles";
import type { Event } from "../../models/responseModels/events";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function PublicEventsPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = usePublicLocation();

  const [selectedMonth, setSelectedMonth] = useState("All");
  const [isFreeOnly, setIsFreeOnly] = useState(false);
  const [searchText, setSearchText] = useState("");

  const filters = useMemo(
    () => ({
      event_type_id: 0,
      is_paid_event: isFreeOnly ? 0 : 2,
      ...(selectedMonth !== "All" && { month: months.indexOf(selectedMonth) + 1 }),
      ...(searchText.trim() !== "" && { event_name: searchText.trim() }),
    }),
    [selectedMonth, isFreeOnly, searchText]
  );

  const { dataList, isLoading, lastElementRef, resetList, totalEvents } = usePublicNearbyEvents(
    filters,
    location
  );

  const handleMonthChange = (event: { target: { value: string } }) => {
    resetList();
    setSelectedMonth(event.target.value);
  };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    resetList();
    setIsFreeOnly(event.target.checked);
  };

  const handleSearchChange = debounce((event: React.ChangeEvent<HTMLInputElement>) => {
    resetList();
    setSearchText(event.target.value);
  }, 500);

  const countLabel = totalEvents != null ? totalEvents : dataList.length;

  const cards = dataList.map((event: Event, index: number) => {
    const { date, time } = formatEventDateTimeForEventCards(
      event.address_1?.at(event.address_1.length - 1) === ".",
      event.start_date,
      event.start_time,
      event.end_date,
      event.end_time
    );
    return (
      <Box
        key={event.id}
        ref={index === Math.floor(dataList.length / 2) ? lastElementRef : null}
      >
        <PublicEventCard
          event={event}
          date={date}
          time={time}
          group={buildInterestedAvatars(event.event_interested_users)}
        />
      </Box>
    );
  });

  return (
    <Box sx={publicEventsPageSx.page}>
      <Box sx={publicEventsPageSx.header}>
        <Link component={RouterLink} to="/public/events" underline="none" sx={{ display: "flex", alignItems: "center" }}>
          <Box component="img" src="/images/logo-transparent.png" alt="GoSayHELLO" sx={{ height: { xs: 36, sm: 44 } }} />
        </Link>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" sx={publicEventsPageSx.signInBtn} onClick={() => navigate("/login")}>
            Sign in
          </Button>
          <Button variant="contained" disableElevation sx={publicEventsPageSx.joinBtn} onClick={() => navigate("/login?signup=1")}>
            Join free
          </Button>
        </Stack>
      </Box>

      <Box sx={{ maxWidth: 1080, mx: "auto", py: { xs: 2.5, md: 4 }, px: { xs: 2, sm: 3 } }}>
        <Box sx={publicEventsPageSx.hero}>
          <Box sx={publicEventsPageSx.heroPattern} />
          <Box sx={{ ...publicEventsPageSx.heroPattern, right: 60, top: 40, width: 100, height: 100, opacity: 0.6 }} />
          <Stack spacing={1} sx={{ position: "relative", zIndex: 1, maxWidth: 560 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Icon icon="solar:calendar-search-bold" width={28} />
              <Typography variant="overline" sx={{ letterSpacing: 1.2, fontWeight: 700, opacity: 0.9 }}>
                Discover locally
              </Typography>
            </Stack>
            <Typography variant="h3" fontWeight={800} sx={{ fontSize: { xs: "1.75rem", sm: "2.25rem" }, lineHeight: 1.15 }}>
              Events happening near you
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.92, fontSize: { xs: "0.95rem", sm: "1.05rem" } }}>
              Browse public gatherings, meetups, and festivals — no account required to explore.
            </Typography>
          </Stack>
        </Box>

        {location.isUsingFallback && (
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              mb: 2,
              px: 2,
              py: 1.25,
              borderRadius: 2,
              bgcolor: alpha(PUBLIC_BRAND.orange, 0.08),
              color: PUBLIC_BRAND.orangeDark,
            }}
          >
            <Icon icon="solar:gps-bold" width={20} />
            <Typography variant="body2" fontWeight={500}>
              Using Atlanta as your area. Allow location access for events closer to you.
            </Typography>
          </Stack>
        )}

        <Box sx={publicEventsPageSx.searchCard}>
          <FormControl variant="outlined" hiddenLabel fullWidth size="medium">
            <OutlinedInput
              sx={publicEventsPageSx.searchInput}
              onChange={handleSearchChange}
              placeholder="Search by event name…"
              startAdornment={
                <InputAdornment position="start">
                  <Icon icon="solar:magnifer-linear" width={22} color={PUBLIC_BRAND.orange} />
                </InputAdornment>
              }
            />
          </FormControl>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
            spacing={1.5}
            sx={{ mt: 2 }}
          >
            <FormControl variant="outlined" size={isMobile ? "small" : "medium"} sx={{ minWidth: { xs: "100%", sm: 200 } }}>
              <Select value={selectedMonth} onChange={handleMonthChange} sx={publicEventsPageSx.filterSelect}>
                <MenuItem value="All">All months</MenuItem>
                {months.map((month) => (
                  <MenuItem key={month} value={month}>
                    {month}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack direction="row" alignItems="center" spacing={1} sx={publicEventsPageSx.freeToggle}>
              <Icon icon="solar:ticket-bold" width={20} color={PUBLIC_BRAND.orange} />
              <Typography fontWeight={700} sx={{ fontSize: { xs: 13, sm: 15 }, flex: 1 }}>
                Free events only
              </Typography>
              <Switch
                checked={isFreeOnly}
                onChange={handleSwitchChange}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": { color: PUBLIC_BRAND.orange },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    bgcolor: PUBLIC_BRAND.orange,
                  },
                }}
              />
            </Stack>
          </Stack>
        </Box>

        <Box sx={publicEventsPageSx.countBadge}>
          <Icon icon="solar:fire-bold" width={18} />
          <span>
            {countLabel} {countLabel === 1 ? "event" : "events"} nearby
          </span>
        </Box>

        <Box sx={publicEventsPageSx.eventsGrid}>
          {cards}
        </Box>

        {dataList.length === 0 && !isLoading && (
          <Box sx={publicEventsPageSx.emptyState}>
            <Icon icon="solar:calendar-minimalistic-bold-duotone" width={56} color={PUBLIC_BRAND.orange} />
            <Typography variant="h6" fontWeight={700} sx={{ mt: 2, color: PUBLIC_BRAND.ink }}>
              No events found
            </Typography>
            <Typography variant="body2" color={PUBLIC_BRAND.muted} sx={{ mt: 0.5, maxWidth: 320, mx: "auto" }}>
              Try a different month or turn off “Free events only” to see more results.
            </Typography>
          </Box>
        )}

        {isLoading && (
          <Box sx={{ py: 4 }}>
            <Loader />
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default PublicEventsPage;
