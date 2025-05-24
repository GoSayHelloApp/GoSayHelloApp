import * as React from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { Typography, useTheme } from "@mui/material";
import { MiddleStyles } from "./style";
import People from "../../../pages/people/people";
import Events from "../../../pages/events/events";
import { a11yProps } from "../../components/core/allyProps";
import Business from "../../../pages/business/business";
import { useLocation, useNavigate } from "react-router-dom";
import OpenApp from "../../../components/events/OpenApp";
import OpenAppHome from "../../../components/events/OpenApp";

const tabNames = ["people", "business", "events", "rsvp"];
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
      {value === index && <Box sx={{ mt: 1, overflow: "auto", height: "70vh" }} >{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};


export default function Middle() {
  const [value, setValue] = React.useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const handleChange = (event: any, newValue: any) => {
    setValue(newValue);
    navigate(`?tab=${tabNames[newValue]}`);
  };

  const { homeText, anotherHomeText } = MiddleStyles();

  const theme = useTheme();

  React.useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get("tab");
    const tabNames = ["people", "business", "events", "rsvp"];
    const tabIndex = tabNames.indexOf(tab ?? "");
    if (tabIndex !== -1) {
      setValue(tabIndex);
    }
    else {
      navigate(`?tab=${tabNames[0]}`);
      setValue(0);
    }
  }, [location.search]);


  return (

    <Box>
      {/* <Typography variant="h5" sx={{ ...homeText }}>
        Home
      </Typography> */}
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
          <People nearbyType={1} />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          {/* <People nearbyType={2} /> */}
          <Business />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
          <Events />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={3}>
          <OpenAppHome openApp={value == 3} setOpenApp={(closed: boolean) => { !closed == true && setValue(0) }} text="Open the App to view RSVP events" />
        </CustomTabPanel>
      </Box>
    </Box>
  );
}
