import React from "react";
import { Box } from "@mui/material";
import RecentPosts from "../../ui/components/rightPanel/recentPosts/recentPosts";

const Waves: React.FC = () => {
  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <RecentPosts />
    </Box>
  );
};

export default Waves;
