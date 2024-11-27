import {
  Box,
  Button,
  FormControl,
  Input,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  OutlinedInput,
  TextField,
  useTheme,
} from "@mui/material";
import { useLocation, Link } from "react-router-dom";
import { NavbarStyles } from "./style";
import { Icon } from "@iconify/react";
import Logo from "../../../assets/gosayhello_logo.svg";

export default function Sidebar() {
  const { mainStyle } = NavbarStyles();
  const location = useLocation();
  const theme = useTheme();
  return (
    <Box sx={{ ...mainStyle }}>
      <img className="logo" src={Logo} alt="" />
      <Box width={500}>
        <FormControl variant="outlined" hiddenLabel fullWidth size="medium">
          <OutlinedInput
            id="input-with-icon-adornment"
            placeholder="Search Name of Events"
            startAdornment={
              <InputAdornment position="start">
                <Icon icon="tabler:search" fontSize={24} />
              </InputAdornment>
            }
          />
        </FormControl>
      </Box>
      <Button
        size="medium"
        startIcon={<Icon icon="material-symbols-light:add-circle-outline" />}
        endIcon={<Icon icon="mingcute:down-line" />}
        variant="contained"
        color="primary"
      >
        Add
      </Button>
    </Box>
  );
}
