import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import React from "react";
import RecentPosts from "./recentPosts/recentPosts";
import Notifications from "./notifications/notifications";
import Messages from "./messages/messages";
import { Icon } from "@iconify/react";
import { RightPanelStyles } from "./style";

export default function RightPanel() {
  const [expanded, setExpanded] = React.useState("panel1");

  const handleChange = (panel: any) => (event: any, newExpanded: any) => {
    setExpanded(newExpanded ? panel : false);
  };

  const theme = useTheme();
  const { main } = RightPanelStyles();

  const mainStackStyle = {
    gap: 1,
    alignItems: "center",
    width: "100%",
  };

  const BadgeStyle = {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.background.default,
    px: 2,
    py: 0.5,
    borderRadius: "10px",
  };
  return (
    <Box sx={{ ...main }}>
      <Accordion
        expanded={expanded === "panel1"}
        onChange={handleChange("panel1")}
      >
        <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
          <Box sx={{ display: "block", width: "100%" }}>
            <Stack
              direction={"row"}
              sx={{ ...mainStackStyle, justifyContent: "space-between" }}
            >
              <Stack
                direction={"row"}
                sx={{ ...mainStackStyle }}
                flex={"1"}
              >
                <Typography variant="h5">Recent Posts</Typography>
                <Icon
                  icon="mdi:heart"
                  fontSize={24}
                  color={theme.palette.primary.main}
                />
              </Stack>
              <Box sx={{ ...BadgeStyle }}>
                <Typography variant="subtitle2">18</Typography>
              </Box>
            </Stack>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <RecentPosts />
        </AccordionDetails>
      </Accordion>
      <Accordion
        expanded={expanded === "panel2"}
        onChange={handleChange("panel2")}
      >
        <AccordionSummary aria-controls="panel2d-content" id="panel2d-header">
          <Stack direction={"row"} sx={{ ...mainStackStyle }}>
            <Stack
              direction={"row"}
              sx={{ ...mainStackStyle }}
              flex={"1 1 auto"}
            >
              <Typography variant="h5">Notifications</Typography>
              <Icon
                icon="fa-solid:bell"
                fontSize={24}
                color={theme.palette.primary.main}
              />
            </Stack>
            <Box sx={{ ...BadgeStyle }}>
              <Typography variant="subtitle2">6</Typography>
            </Box>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Notifications />
        </AccordionDetails>
      </Accordion>
      <Accordion
        expanded={expanded === "panel3"}
        onChange={handleChange("panel3")}
      >
        <AccordionSummary aria-controls="panel3d-content" id="panel3d-header">
          <Stack direction={"row"} sx={{ ...mainStackStyle }}>
            <Stack
              direction={"row"}
              sx={{ ...mainStackStyle }}
              flex={"1 1 auto"}
            >
              <Typography variant="h5">Messages</Typography>
              <Icon
                icon="ant-design:message-filled"
                fontSize={24}
                color={theme.palette.primary.main}
              />
            </Stack>
            <Box sx={{ ...BadgeStyle }}>
              <Typography variant="subtitle2">12</Typography>
            </Box>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Messages />
        </AccordionDetails>
      </Accordion>{" "}
    </Box>
  );
}
