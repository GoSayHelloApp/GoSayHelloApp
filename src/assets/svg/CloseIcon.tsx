import React from "react";

interface CloseIconProps {
  width?: number;
  height?: number;
}

const CloseIcon: React.FC<CloseIconProps> = ({ width = 24, height = 24 }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    style={{ zIndex: 0, position: "relative" }}
  >
    <line
      x1="6"
      y1="6"
      x2="18"
      y2="18"
      stroke="#FF5A5A"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="18"
      y1="6"
      x2="6"
      y2="18"
      stroke="#FF5A5A"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export default CloseIcon;
