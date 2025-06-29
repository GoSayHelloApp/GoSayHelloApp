import React from "react";

interface HeartIconProps {
  width?: number;
  height?: number;
  number?: string | number;
  filled?: boolean;
}

const HeartIcon: React.FC<HeartIconProps> = ({
  width = 26,
  height = 26,
  number = "",
  filled = false,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill={filled ? "#EB7D32" : "white"}
    style={{ zIndex: 1, position: "relative" }}
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    {number !== "" && (
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fontSize="10"
        fontWeight="bold"
        fill="black"
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        {number}
      </text>
    )}
  </svg>
);

export default HeartIcon;
