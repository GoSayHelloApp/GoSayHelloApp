import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import EventFooter from "../../components/events/eventFooter";
import { EventCard } from "../../components/events-list/EventCard";
import { EventCardSkeleton } from "../../components/events-list/EventCardSkeleton";
import { FilterBar, type FiltersState } from "../../components/events-list/FilterBar";
import { useNearbyEvents } from "../../hooks/useNearbyEvents";
import { useUserLocation } from "../../hooks/useUserLocation";
import { tokens } from "./invitation/tokens";
import { withAlpha } from "./invitation/useColorExtraction";

function useFiltersFromUrl(): [FiltersState, (next: FiltersState) => void] {
  const [params, setParams] = useSearchParams();
  const value: FiltersState = useMemo(
    () => ({
      search: params.get("q") || "",
      month: Number(params.get("month") || 0),
      freeOnly: params.get("free") === "1",
    }),
    [params]
  );
  const setValue = (next: FiltersState) => {
    const p = new URLSearchParams();
    if (next.search) p.set("q", next.search);
    if (next.month) p.set("month", String(next.month));
    if (next.freeOnly) p.set("free", "1");
    setParams(p, { replace: true });
  };
  return [value, setValue];
}

export default function EventsListPage() {
  const location = useUserLocation();
  const [filters, setFilters] = useFiltersFromUrl();

  const queryParams = useMemo(
    () => ({
      latitude: location.lat,
      longitude: location.lng,
      event_type_id: 0,
      is_paid_event: (filters.freeOnly ? 0 : 2) as 0 | 1 | 2,
      month: filters.month || undefined,
      search: filters.search || undefined,
    }),
    [location.lat, location.lng, filters.freeOnly, filters.month, filters.search]
  );

  const {
    events,
    totalEvents,
    totalPages,
    currentPage,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
  } = useNearbyEvents(queryParams);

  const hasMore = currentPage > 0 && currentPage < totalPages;
  const isEmpty = !isLoading && !error && events.length === 0;

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        background: tokens.color.paper,
        color: tokens.color.inkPrimary,
        fontFamily: tokens.font.sans,
        overflowX: "hidden",
      }}
    >
      {/* Soft static top wash */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 480,
          background: `radial-gradient(60% 80% at 70% 10%, ${withAlpha(
            tokens.color.brandOrange,
            0.12
          )} 0%, ${withAlpha(tokens.color.brandOrange, 0)} 70%), linear-gradient(180deg, ${withAlpha(
            tokens.color.brandOrange,
            0.05
          )} 0%, ${tokens.color.paper} 100%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Top bar */}
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          borderBottom: `1px solid ${tokens.color.line}`,
        }}
      >
        <Box
          sx={{
            maxWidth: 1200,
            mx: "auto",
            px: { xs: 2.5, sm: 5, md: 8 },
            py: { xs: 1.5, md: 2 },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box
            component="a"
            href="/"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              textDecoration: "none",
            }}
          >
            <Box
              component="img"
              src="/images/gosayhello-hand.png"
              alt=""
              sx={{
                width: { xs: 28, md: 32 },
                height: { xs: 28, md: 32 },
                borderRadius: "50%",
                display: "block",
              }}
            />
            <Box
              sx={{
                fontFamily: tokens.font.serif,
                fontSize: { xs: 18, md: 22 },
                fontWeight: 600,
                letterSpacing: "-0.02em",
                lineHeight: 1,
                color: tokens.color.inkPrimary,
              }}
            >
              GoSay
              <Box component="span" sx={{ color: tokens.color.brandOrange }}>
                HELLO
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, md: 1.25 },
            }}
          >
            {/* Open app — primary filled */}
            <Box
              component="a"
              href="https://apps.apple.com/pk/app/gosayhello-networking-nearby/id1585044833"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.75,
                px: { xs: 1.75, md: 2.25 },
                py: { xs: 0.875, md: 1.125 },
                borderRadius: 999,
                background: tokens.color.brandOrange,
                color: "#FFFFFF",
                textDecoration: "none",
                fontFamily: tokens.font.sans,
                fontSize: { xs: 11, md: 12.5 },
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                outline: "none",
                WebkitTapHighlightColor: "transparent",
                boxShadow: `0 4px 12px ${withAlpha(
                  tokens.color.brandOrange,
                  0.25
                )}`,
                transition: `transform 200ms ${tokens.motion.swift}, box-shadow 200ms ${tokens.motion.swift}, filter 200ms ${tokens.motion.swift}`,
                "& .chev": {
                  transition: `transform 200ms ${tokens.motion.swift}`,
                },
                "&:hover": {
                  transform: "translateY(-1px)",
                  filter: "brightness(1.05)",
                  boxShadow: `0 8px 20px ${withAlpha(
                    tokens.color.brandOrange,
                    0.35
                  )}`,
                },
                "&:focus-visible": {
                  boxShadow: `0 0 0 3px ${withAlpha("#FFFFFF", 0.6)}, 0 0 0 6px ${withAlpha(
                    tokens.color.brandOrange,
                    0.45
                  )}, 0 4px 12px ${withAlpha(tokens.color.brandOrange, 0.25)}`,
                },
                "&:hover .chev": { transform: "translateX(2px)" },
              }}
            >
              <Box
                component="span"
                sx={{ display: { xs: "none", sm: "inline" } }}
              >
                Open app
              </Box>
              <Box
                component="span"
                sx={{ display: { xs: "inline", sm: "none" } }}
              >
                Get app
              </Box>
              <Box component="span" className="chev" sx={{ display: "inline-flex" }}>
                <Icon icon="ph:arrow-right-bold" width={12} />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1200,
          mx: "auto",
          px: { xs: 2.5, sm: 5, md: 8 },
          pt: { xs: 4, sm: 6, md: 8 },
          pb: { xs: 6, sm: 8, md: 10 },
        }}
      >
        {/* Hero */}
        <Box sx={{ mb: { xs: 4, md: 6 } }}>
          <Box
            sx={{
              fontFamily: tokens.font.sans,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: tokens.color.brandOrange,
              mb: 1.5,
            }}
          >
            Events
          </Box>
          <Typography
            component="h1"
            sx={{
              fontFamily: tokens.font.serif,
              fontWeight: 700,
              fontSize: { xs: 40, sm: 56, md: 72 },
              lineHeight: 0.98,
              letterSpacing: "-0.03em",
              color: tokens.color.inkPrimary,
              m: 0,
              maxWidth: 760,
            }}
          >
            Something{" "}
            <Box
              component="span"
              sx={{
                fontStyle: "italic",
                fontWeight: 500,
                color: tokens.color.brandOrange,
              }}
            >
              happening
            </Box>{" "}
            nearby.
          </Typography>
          <Box
            sx={{
              mt: 2,
              maxWidth: 540,
              fontFamily: tokens.font.serif,
              fontStyle: "italic",
              fontSize: { xs: 16, md: 18 },
              lineHeight: 1.5,
              color: tokens.color.inkSecondary,
            }}
          >
            Real people, real places — within a minute's walk. Tap any card to
            see the invitation.
          </Box>
        </Box>

        {/* Filter bar */}
        <FilterBar
          value={filters}
          onChange={setFilters}
          resultCount={isLoading ? undefined : totalEvents}
          locationLabel={location.label}
        />

        {/* Grid */}
        <Box
          sx={{
            mt: { xs: 4, md: 5 },
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: { xs: 2.5, md: 3 },
          }}
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <EventCardSkeleton key={i} />
              ))
            : events.map((e) => <EventCard key={e.id} event={e} />)}
        </Box>

        {/* Empty state */}
        {isEmpty ? (
          <Box
            sx={{
              mt: 6,
              p: { xs: 4, md: 6 },
              textAlign: "center",
              background: tokens.color.raised,
              border: `1px solid ${tokens.color.line}`,
              borderRadius: `${tokens.radius.lg}px`,
              maxWidth: 560,
              mx: "auto",
            }}
          >
            <Box
              sx={{
                fontFamily: tokens.font.serif,
                fontStyle: "italic",
                fontSize: { xs: 22, md: 28 },
                fontWeight: 500,
                color: tokens.color.inkPrimary,
                mb: 1,
              }}
            >
              Nothing here yet.
            </Box>
            <Box
              sx={{
                fontFamily: tokens.font.sans,
                fontSize: 14,
                color: tokens.color.inkSecondary,
                mb: 3,
              }}
            >
              No events match your filters. Try widening your search or clearing
              the filters.
            </Box>
            <Box
              component="button"
              onClick={() =>
                setFilters({ search: "", month: 0, freeOnly: false })
              }
              sx={{
                appearance: "none",
                border: `1px solid ${tokens.color.brandOrange}`,
                background: "transparent",
                color: tokens.color.brandOrange,
                fontFamily: tokens.font.sans,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                px: 2.5,
                py: 1.25,
                borderRadius: 999,
                cursor: "pointer",
                transition: "background 200ms ease, color 200ms ease",
                "&:hover": {
                  background: tokens.color.brandOrange,
                  color: "#FFFFFF",
                },
              }}
            >
              Reset filters
            </Box>
          </Box>
        ) : null}

        {/* Error state */}
        {error && !isLoading ? (
          <Box
            sx={{
              mt: 6,
              p: { xs: 4, md: 6 },
              textAlign: "center",
              background: tokens.color.raised,
              border: `1px solid ${tokens.color.line}`,
              borderRadius: `${tokens.radius.lg}px`,
              maxWidth: 520,
              mx: "auto",
            }}
          >
            <Typography
              sx={{
                fontFamily: tokens.font.serif,
                fontSize: { xs: 22, md: 28 },
                fontStyle: "italic",
                color: tokens.color.inkPrimary,
                mb: 1,
              }}
            >
              Couldn't load events.
            </Typography>
            <Typography
              sx={{
                fontFamily: tokens.font.sans,
                fontSize: 14,
                color: tokens.color.inkSecondary,
                mb: 3,
              }}
            >
              Check your connection and try again.
            </Typography>
            <Box
              component="button"
              onClick={() => window.location.reload()}
              sx={{
                appearance: "none",
                border: "none",
                background: tokens.color.brandOrange,
                color: "#FFFFFF",
                fontFamily: tokens.font.sans,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                px: 2.5,
                py: 1.25,
                borderRadius: 999,
                cursor: "pointer",
                "&:hover": { filter: "brightness(1.05)" },
              }}
            >
              Retry
            </Box>
          </Box>
        ) : null}

        {/* Load more */}
        {hasMore ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: { xs: 5, md: 6 } }}>
            <Box
              component="button"
              onClick={loadMore}
              disabled={isLoadingMore}
              sx={{
                appearance: "none",
                cursor: isLoadingMore ? "default" : "pointer",
                background: tokens.color.raised,
                border: `1px solid ${tokens.color.line}`,
                color: tokens.color.inkPrimary,
                fontFamily: tokens.font.sans,
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                px: 4,
                py: 1.75,
                borderRadius: 999,
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                transition: "border-color 200ms ease, background 200ms ease",
                opacity: isLoadingMore ? 0.6 : 1,
                "&:hover:not(:disabled)": {
                  borderColor: tokens.color.brandOrange,
                  color: tokens.color.brandOrange,
                },
              }}
            >
              {isLoadingMore ? (
                <>
                  <Box
                    sx={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      border: `2px solid ${tokens.color.line}`,
                      borderTopColor: tokens.color.brandOrange,
                      animation: "invitation-spin 700ms linear infinite",
                      "@keyframes invitation-spin": {
                        to: { transform: "rotate(360deg)" },
                      },
                    }}
                  />
                  Loading…
                </>
              ) : (
                <>
                  Load more
                  <Icon icon="ph:arrow-down-bold" width={14} />
                </>
              )}
            </Box>
          </Box>
        ) : null}

        {/* Footer */}
        <Box sx={{ mt: { xs: 8, md: 12 } }}>
          <EventFooter />
        </Box>
      </Box>
    </Box>
  );
}
