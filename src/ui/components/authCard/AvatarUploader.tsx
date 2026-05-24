import React, { useRef } from "react";
import { Box, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import { tokens } from "../../../pages/events/invitation/tokens";
import { withAlpha } from "../../../pages/events/invitation/useColorExtraction";

export interface AvatarUploaderProps {
  imageUrl: string | null;
  onFileSelected: (file: File) => void;
  helperText?: React.ReactNode;
  error?: boolean;
  acceptedTypes?: string[];
  size?: number;
}

/**
 * iOS-style profile photo uploader — orange dashed ring, gray camera icon,
 * orange "+" badge bottom-right, "Add profile photo" caption.
 */
export default function AvatarUploader({
  imageUrl,
  onFileSelected,
  helperText,
  error,
  acceptedTypes = ["image/jpeg", "image/png", "image/gif"],
  size = 104,
}: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const accent = tokens.color.brandOrange;
  const errColor = "#D14545";

  const handleClick = () => inputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onFileSelected(file);
    // reset so picking the same file again still fires change
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Box
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        sx={{
          position: "relative",
          width: size,
          height: size,
          borderRadius: "50%",
          background: imageUrl ? "transparent" : "#FFFFFF",
          border: imageUrl
            ? `2.5px solid ${error ? errColor : accent}`
            : `2.5px dashed ${error ? errColor : accent}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: error ? errColor : tokens.color.iosFieldIcon,
          cursor: "pointer",
          outline: "none",
          WebkitTapHighlightColor: "transparent",
          overflow: "visible",
          transition: `transform 200ms ${tokens.motion.swift}, box-shadow 200ms ${tokens.motion.swift}`,
          "&:hover, &:focus-visible": {
            transform: "translateY(-1px)",
            boxShadow: `0 8px 20px ${withAlpha(accent, 0.22)}`,
          },
          "& > img": {
            borderRadius: "50%",
          },
        }}
      >
        {imageUrl ? (
          <Box
            component="img"
            src={imageUrl}
            alt="Profile preview"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <Icon icon="ph:camera" width={Math.round(size * 0.3)} />
        )}

        {/* orange + / edit badge — shown in both states like iOS */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            right: 2,
            bottom: 2,
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: accent,
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(20,19,26,0.18)",
            border: `2.5px solid #FFFFFF`,
          }}
        >
          <Icon
            icon={imageUrl ? "ph:pencil-simple-fill" : "ph:plus-bold"}
            width={14}
          />
        </Box>

        <input
          ref={inputRef}
          type="file"
          accept={acceptedTypes.join(",")}
          style={{ display: "none" }}
          onChange={handleChange}
        />
      </Box>
      <Typography
        component="div"
        sx={{
          mt: 1.25,
          fontFamily: tokens.font.poppins,
          fontSize: 14,
          fontWeight: 500,
          color: error ? errColor : tokens.color.iosPlaceholder,
          textAlign: "center",
        }}
      >
        {helperText ?? (imageUrl ? "Change photo" : "Add profile photo")}
      </Typography>
    </Box>
  );
}
