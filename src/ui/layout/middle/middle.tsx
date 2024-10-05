import * as React from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { Typography, useTheme } from "@mui/material";
import { MiddleStyles } from "./style";
import People from "../../../pages/people/people";
import Events from "../../../pages/events/events";

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
      {value === index && <Box sx={{ mt: 1 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index: any) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function Middle() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: any, newValue: any) => {
    setValue(newValue);
  };

  const { homeText, anotherHomeText } = MiddleStyles();

  const theme = useTheme();

  return (
    <Box>
      <Typography variant="h5" sx={{ ...homeText }}>
        Home
      </Typography>
      <Box sx={{ width: "100%" }}>
        <Box
          sx={{
            backgroundColor: theme.palette.grey[300],
            borderRadius: theme.shape.borderRadius * 50,
            p: 0.75,
          }}
        >
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            <Tab sx={{ flex: "1 1 auto" }} label="People" {...a11yProps(0)} />
            <Tab sx={{ flex: "1 1 auto" }} label="Business" {...a11yProps(1)} />
            <Tab sx={{ flex: "1 1 auto" }} label="Events" {...a11yProps(2)} />
            <Tab sx={{ flex: "1 1 auto" }} label="RSVP" {...a11yProps(3)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <People />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          Business
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
          <Events />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={3}>
          Item Four
        </CustomTabPanel>
      </Box>
    </Box>
  );
}
