import { useEffect, useState } from "react";
import { Box, MenuItem, Select, Switch } from "@mui/material";
import { Icon } from "@iconify/react";
import { tokens } from "../../pages/events/invitation/tokens";
import { withAlpha } from "../../pages/events/invitation/useColorExtraction";

const MONTHS = [
  { v: 0, l: "Any month" },
  { v: 1, l: "January" },
  { v: 2, l: "February" },
  { v: 3, l: "March" },
  { v: 4, l: "April" },
  { v: 5, l: "May" },
  { v: 6, l: "June" },
  { v: 7, l: "July" },
  { v: 8, l: "August" },
  { v: 9, l: "September" },
  { v: 10, l: "October" },
  { v: 11, l: "November" },
  { v: 12, l: "December" },
];

export interface FiltersState {
  search: string;
  month: number;
  freeOnly: boolean;
}

interface Props {
  value: FiltersState;
  onChange: (next: FiltersState) => void;
  resultCount?: number;
  locationLabel?: string;
}

export function FilterBar({ value, onChange, resultCount, locationLabel }: Props) {
  const update = (patch: Partial<FiltersState>) =>
    onChange({ ...value, ...patch });

  // Local draft for search — only commits on Enter / icon click
  const [searchDraft, setSearchDraft] = useState(value.search);
  useEffect(() => {
    setSearchDraft(value.search);
  }, [value.search]);

  const commitSearch = () => {
    if (searchDraft === value.search) return;
    update({ search: searchDraft });
  };

  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 5,
        background: `${tokens.color.paper}E6`,
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${tokens.color.line}`,
        py: { xs: 1.5, md: 2 },
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr auto",
            md: "minmax(0, 1fr) auto auto",
          },
          gap: { xs: 1.25, md: 1.5 },
          alignItems: "center",
        }}
      >
        {/* Search */}
        <Box
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box
            onClick={commitSearch}
            role="button"
            tabIndex={0}
            aria-label="Search"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                commitSearch();
              }
            }}
            sx={{
              position: "absolute",
              left: 6,
              top: "50%",
              transform: "translateY(-50%)",
              width: 30,
              height: 30,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              color: tokens.color.inkSecondary,
              cursor: "pointer",
              transition: "background 180ms ease, color 180ms ease",
              "&:hover, &:focus-visible": {
                background: `${tokens.color.brandOrange}1A`,
                color: tokens.color.brandOrange,
                outline: "none",
              },
            }}
          >
            <Icon icon="ph:magnifying-glass-bold" width={16} />
          </Box>
          <Box
            component="input"
            type="search"
            placeholder="Search events — press enter"
            value={searchDraft}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchDraft(e.target.value)
            }
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitSearch();
              }
            }}
            sx={{
              width: "100%",
              fontFamily: tokens.font.sans,
              // iOS Safari auto-zooms inputs with font-size < 16px on focus.
              // Use 16px on mobile to prevent the page zoom + horizontal clip,
              // and the usual 14px from sm+ where it's not an issue.
              fontSize: { xs: 16, sm: 14 },
              fontWeight: 500,
              color: tokens.color.inkPrimary,
              background: tokens.color.raised,
              border: `1px solid ${tokens.color.line}`,
              borderRadius: 999,
              py: 1.25,
              pl: 5,
              pr: 2,
              outline: "none",
              transition: "border-color 200ms ease",
              "&:focus": { outline: "none" },
              "&:focus-visible": {
                borderColor: tokens.color.brandOrange,
                boxShadow: `0 0 0 3px ${tokens.color.brandOrange}33`,
              },
              "&::placeholder": { color: tokens.color.inkMuted },
            }}
          />
        </Box>

        {/* Month */}
        <Select
          value={value.month}
          onChange={(e) => update({ month: Number(e.target.value) })}
          size="small"
          IconComponent={(iconProps) => (
            <Box
              {...iconProps}
              sx={{
                ...iconProps.sx,
                color: tokens.color.inkSecondary,
                right: 12,
                display: "inline-flex",
                pointerEvents: "none",
              }}
            >
              <Icon icon="ph:caret-down-bold" width={14} />
            </Box>
          )}
          MenuProps={{
            anchorOrigin: { vertical: "bottom", horizontal: "left" },
            transformOrigin: { vertical: "top", horizontal: "left" },
            PaperProps: {
              elevation: 0,
              sx: {
                mt: 1,
                borderRadius: `${tokens.radius.lg}px`,
                border: `1px solid ${tokens.color.line}`,
                background: tokens.color.raised,
                boxShadow: tokens.shadow.lift,
                overflow: "hidden",
                "& .MuiList-root": {
                  py: 1,
                },
              },
            },
          }}
          sx={{
            minWidth: { xs: "100%", sm: 160 },
            fontFamily: tokens.font.sans,
            // Match search input — 16px on mobile to avoid iOS zoom-on-focus
            fontSize: { xs: 16, sm: 14 },
            fontWeight: 600,
            background: tokens.color.raised,
            borderRadius: 999,
            "& .MuiSelect-select": {
              py: { xs: 1.25, sm: 1 },
              pl: 2.25,
              pr: 4,
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: tokens.color.line,
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: tokens.color.inkSecondary,
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: tokens.color.brandOrange,
              borderWidth: 1,
            },
          }}
        >
          {MONTHS.map((m) => (
            <MenuItem
              key={m.v}
              value={m.v}
              sx={{
                fontFamily: tokens.font.sans,
                fontSize: { xs: 15, sm: 14 },
                fontWeight: 500,
                color: tokens.color.inkPrimary,
                px: 2.25,
                py: { xs: 1.25, sm: 1 },
                position: "relative",
                transition: "background 160ms ease, color 160ms ease",
                "&:hover": {
                  background: withAlpha(tokens.color.brandOrange, 0.06),
                },
                "&.Mui-selected, &.Mui-selected:hover": {
                  background: withAlpha(tokens.color.brandOrange, 0.1),
                  color: tokens.color.brandOrange,
                  fontWeight: 700,
                },
                "&.Mui-selected::before": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: 8,
                  bottom: 8,
                  width: "3px",
                  borderRadius: "0 2px 2px 0",
                  background: tokens.color.brandOrange,
                },
              }}
            >
              {m.l}
            </MenuItem>
          ))}
        </Select>

        {/* Free toggle */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            background: tokens.color.raised,
            border: `1px solid ${tokens.color.line}`,
            borderRadius: 999,
            px: 1.5,
            py: 0.5,
            height: 40,
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{
              fontFamily: tokens.font.sans,
              fontSize: 13,
              fontWeight: 600,
              color: tokens.color.inkPrimary,
              userSelect: "none",
            }}
          >
            Free only
          </Box>
          <Switch
            size="small"
            checked={value.freeOnly}
            onChange={(_, checked) => update({ freeOnly: checked })}
            sx={{
              "& .MuiSwitch-thumb": { boxShadow: "0 1px 3px rgba(0,0,0,0.18)" },
              "& .MuiSwitch-switchBase.Mui-checked": {
                color: "#FFFFFF",
              },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: tokens.color.brandOrange,
                opacity: 1,
              },
            }}
          />
        </Box>
      </Box>

      {/* Result line */}
      {typeof resultCount === "number" && (
        <Box
          sx={{
            mt: { xs: 1.25, md: 1.5 },
            fontFamily: tokens.font.sans,
            fontSize: 13,
            color: tokens.color.inkSecondary,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: tokens.color.brandOrange,
              boxShadow: `0 0 0 3px ${tokens.color.brandOrange}33`,
            }}
          />
          Showing {resultCount} event{resultCount === 1 ? "" : "s"}
          {locationLabel ? ` near ${locationLabel}` : ""}
        </Box>
      )}
    </Box>
  );
}
