import {
  Avatar,
  Box,
  Button,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from "@mui/material";
import React from "react";
import { RecentPostStyles } from "./style";
import { Icon } from "@iconify/react";

function CustomTabPanel(props: any) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ mt: 1, pb: 1 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: any) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}
export default function RecentPosts() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: any, newValue: any) => {
    setValue(newValue);
  };

  const { mainCard } = RecentPostStyles();
  const theme = useTheme();
  return (
    <React.Fragment>
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="basic tabs example"
      >
        <Tab
          sx={{ flex: "1 1 auto", fontSize: 15 }}
          label="Nearby Users"
          {...a11yProps(0)}
        />
        <Tab
          sx={{ flex: "1 1 auto", fontSize: 15 }}
          label="Connected Users"
          {...a11yProps(1)}
        />
      </Tabs>
      <CustomTabPanel value={value} index={0}>
        {["Dee", "Watson", "Mark", "Emma"].map((value) => (
          <Box
            key={value}
            sx={{
              ...mainCard,
              backgroundImage: `url("https://picsum.photos/315/315")`,
            }}
          >
            <Button
              sx={{ color: "white" }}
              className="reportButton"
              variant="soft"
              color="inherit"
            >
              Report
            </Button>
            <Box className="lowerDetails">
              <Stack direction={"row"} alignItems={"center"} gap={2}>
                <Avatar sx={{ width: 50, height: 50 }} src="" />
                <Box display={"block"} flex={"1"}>
                  <Typography
                    fontSize={15}
                    fontWeight={700}
                    color={theme.palette.common.white}
                  >
                    Dee Moore
                  </Typography>
                  <Typography
                    fontSize={15}
                    fontWeight={600}
                    color={theme.palette.grey[400]}
                  >
                    7 hrs ago
                  </Typography>
                  <Typography
                    fontSize={15}
                    fontWeight={600}
                    color={theme.palette.grey[400]}
                  >
                    17 minute walk
                  </Typography>
                </Box>
                <IconButton sx={{ backgroundColor: "#2D343A" }}>
                  <Icon
                    icon="mdi:heart"
                    fontSize={28}
                    color={theme.palette.common.white}
                  />
                </IconButton>
              </Stack>
            </Box>
          </Box>
        ))}
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}></CustomTabPanel>
    </React.Fragment>
  );
}
