import React from "react";
import { Box } from "@mui/material";
import { tokens } from "../../../pages/events/invitation/tokens";

interface AccountTypeTabsProps {
  accountType: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}

const OPTIONS = ["Personal", "Business"];

/**
 * iOS-style account type selector — "Personal" / "Business" pills.
 * Active pill is orange filled, inactive is gray-outlined.
 * Preserves the (SyntheticEvent, newValue) callback signature.
 */
const AccountTypeTabs: React.FC<AccountTypeTabsProps> = ({
  accountType,
  onTabChange,
}) => {
  const accent = tokens.color.brandOrange;
  return (
    <Box sx={{ mb: 1.5 }}>
      <Box
        sx={{
          fontFamily: tokens.font.poppins,
          fontSize: 14,
          fontWeight: 600,
          color: tokens.color.inkPrimary,
          mb: 1,
        }}
      >
        Account type
      </Box>
      <Box sx={{ display: "flex", gap: 1.25 }}>
        {OPTIONS.map((label, i) => {
          const active = i === accountType;
          return (
            <Box
              key={label}
              component="button"
              type="button"
              onClick={() => onTabChange({} as React.SyntheticEvent, i)}
              sx={{
                appearance: "none",
                cursor: "pointer",
                px: 3,
                height: 44,
                borderRadius: "22px",
                fontFamily: tokens.font.poppins,
                fontSize: 15,
                fontWeight: 600,
                background: active ? accent : "transparent",
                color: active ? "#FFFFFF" : tokens.color.iosTabInactive,
                border: active
                  ? `1.5px solid ${accent}`
                  : `1.5px solid ${tokens.color.iosFieldIcon}`,
                outline: "none",
                WebkitTapHighlightColor: "transparent",
                transition: `background 220ms ${tokens.motion.swift}, color 220ms ${tokens.motion.swift}, border-color 220ms ${tokens.motion.swift}`,
                "&:hover": active
                  ? {}
                  : { borderColor: tokens.color.inkSecondary, color: tokens.color.inkSecondary },
              }}
            >
              {label}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default AccountTypeTabs;
