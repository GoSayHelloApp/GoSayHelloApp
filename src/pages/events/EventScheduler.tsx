import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Paper,
  Alert,
  Snackbar,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { useTheme } from "@mui/material/styles";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useLocation } from "../../hooks/useLocation";
import GoogleMap from "../../components/GoogleMap";
import AddressAutocomplete from "../../components/AddressAutocomplete";
import { APIProvider } from "@vis.gl/react-google-maps";

interface EventSchedulerForm {
  eventName: string;
  address1: string;
  address2: string;
  websiteLink: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  eventType: string;
  isPublic: boolean;
  isFree: boolean;
  description: string;
  latitude?: number;
  longitude?: number;
}

const EventScheduler: React.FC = () => {
  const theme = useTheme();
  const userLocation = useLocation();
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  
  const initialFormData: EventSchedulerForm = {
    eventName: "",
    address1: "",
    address2: "",
    websiteLink: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    eventType: "",
    isPublic: true,
    isFree: true,
    description: "",
    latitude: undefined,
    longitude: undefined,
  };

  const eventTypes = ["Conference", "Workshop", "Meetup", "Party", "Seminar", "Concert", "Sports", "Other"];

  // Validation schema
  const validationSchema = Yup.object({
    eventName: Yup.string().required("Event name is required"),
    address1: Yup.string().required("Address is required"),
    startDate: Yup.string().required("Start date is required"),
    startTime: Yup.string().required("Start time is required"),
    endDate: Yup.string().required("End date is required"),
    endTime: Yup.string().required("End time is required"),
    eventType: Yup.string().required("Event type is required"),
    description: Yup.string().required("Description is required"),
  });

  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set map center when user location is available
  useEffect(() => {
    if (userLocation) {
      setMapCenter({ lat: userLocation.latitude, lng: userLocation.longitude });
    }
  }, [userLocation]);

  // Handle location selection from map or address autocomplete
  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    formik.setFieldValue("latitude", location.lat);
    formik.setFieldValue("longitude", location.lng);
    formik.setFieldValue("address1", location.address);
    setMapCenter({ lat: location.lat, lng: location.lng });
  };

  const formik = useFormik({
    initialValues: initialFormData,
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        console.log("Event Data:", values);
        // TODO: Implement API call to create event

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Show success message
        setAlert({
          type: "success",
          message: "Event created successfully!",
        });

        // Reset form after success
        formik.resetForm();
      } catch (error: any) {
        setAlert({
          type: "error",
          message: error?.message || "Failed to create event. Please try again.",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''}>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, mx: "auto" }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              position: "relative",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: -8,
                left: 0,
                width: 60,
              height: 3,
                backgroundColor: theme.palette.primary.main,
                borderRadius: 1.5,
              },
            }}
          >
            Event Scheduler
          </Typography>
        </Box>

      <Paper
        component="form"
        onSubmit={formik.handleSubmit}
        sx={{
          p: { xs: 3, md: 4 },
          backgroundColor: "white",
          borderRadius: 3,
          boxShadow: 2,
        }}
      >
        {/* Event Details Section */}
        <Box sx={{ display: "flex", gap: 3, mb: 4, alignItems: "flex-start" }}>
          {/* Event Image Placeholder */}
          <Avatar
            sx={{
              width: 80,
              height: 80,
              backgroundColor: theme.palette.grey[200],
              borderRadius: 2,
            }}
          >
            <Icon icon="mdi:account" fontSize={40} color={theme.palette.grey[500]} />
          </Avatar>

          {/* Event Name */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>
              Event Name
            </Typography>
            <TextField
              fullWidth
              placeholder="Event name"
              name="eventName"
              value={formik.values.eventName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.eventName && Boolean(formik.errors.eventName)}
              helperText={formik.touched.eventName && formik.errors.eventName}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: theme.palette.grey[100],
                  borderRadius: 2,
                },
              }}
            />
          </Box>
        </Box>

        {/* Venue Location Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Venue Location
            </Typography>
            {userLocation ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Icon icon="mdi:map-marker" fontSize={16} color={theme.palette.success.main} />
                <Typography variant="caption" color="success.main" sx={{ fontWeight: 500 }}>
                  Location detected
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Icon icon="mdi:map-marker-off" fontSize={16} color={theme.palette.warning.main} />
                <Typography variant="caption" color="warning.main" sx={{ fontWeight: 500 }}>
                  Requesting location...
                </Typography>
              </Box>
            )}
          </Box>

          {/* Google Maps Component */}
          <Box sx={{ mb: 2 }}>
            <GoogleMap
              center={mapCenter}
              onLocationSelect={handleLocationSelect}
              height={250}
              width="100%"
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              💡 Click on the map to select a location, or use the address autocomplete below
            </Typography>
          </Box>

          {/* Address Inputs */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <AddressAutocomplete
              value={formik.values.address1}
              onChange={(value) => formik.setFieldValue("address1", value)}
              onLocationSelect={handleLocationSelect}
              placeholder="Address 1"
              error={formik.touched.address1 && Boolean(formik.errors.address1)}
              helperText={formik.touched.address1 && formik.errors.address1}
              onBlur={formik.handleBlur}
            />
            <TextField
              fullWidth
              placeholder="Address 2"
              name="address2"
              value={formik.values.address2}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: theme.palette.grey[100],
                  borderRadius: 2,
                },
              }}
            />
          </Box>
        </Box>

        {/* Website Link Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>
            Website Link
          </Typography>
          <TextField
            fullWidth
            placeholder="Website Link | start with https://"
            name="websiteLink"
            value={formik.values.websiteLink}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: theme.palette.grey[100],
                borderRadius: 2,
              },
            }}
          />
        </Box>

        {/* Date and Time Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>
            Event Date & Time
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField
              type="date"
              placeholder="Start Date"
              name="startDate"
              value={formik.values.startDate}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.startDate && Boolean(formik.errors.startDate)}
              helperText={formik.touched.startDate && formik.errors.startDate}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: theme.palette.grey[100],
                  borderRadius: 2,
                },
              }}
            />
            <TextField
              type="time"
              placeholder="Start Time"
              name="startTime"
              value={formik.values.startTime}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.startTime && Boolean(formik.errors.startTime)}
              helperText={formik.touched.startTime && formik.errors.startTime}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: theme.palette.grey[100],
                  borderRadius: 2,
                },
              }}
            />
            <TextField
              type="date"
              placeholder="End Date"
              name="endDate"
              value={formik.values.endDate}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.endDate && Boolean(formik.errors.endDate)}
              helperText={formik.touched.endDate && formik.errors.endDate}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: theme.palette.grey[100],
                  borderRadius: 2,
                },
              }}
            />
            <TextField
              type="time"
              placeholder="End Time"
              name="endTime"
              value={formik.values.endTime}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.endTime && Boolean(formik.errors.endTime)}
              helperText={formik.touched.endTime && formik.errors.endTime}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: theme.palette.grey[100],
                  borderRadius: 2,
                },
              }}
            />
          </Box>
        </Box>

        {/* Event Type Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>
            Event Type
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Event Type</InputLabel>
            <Select
              name="eventType"
              value={formik.values.eventType}
              label="Select Event Type"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.eventType && Boolean(formik.errors.eventType)}
              sx={{
                backgroundColor: theme.palette.grey[100],
                borderRadius: 2,
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
              }}
            >
              {eventTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Public/Private Toggle */}
          <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
            Event Visibility
          </Typography>
          <ToggleButtonGroup
            value={formik.values.isPublic}
            exclusive
            onChange={(e, value) => {
              if (value !== null) {
                formik.setFieldValue("isPublic", value);
              }
            }}
            sx={{
              "& .MuiToggleButton-root": {
                borderRadius: 2,
                border: "none",
                px: 3,
                py: 1,
                "&.Mui-selected": {
                  backgroundColor: theme.palette.primary.main,
                  color: "white",
                  "&:hover": {
                    backgroundColor: theme.palette.primary.dark,
                  },
                },
              },
            }}
          >
            <ToggleButton value={true}>Public Event</ToggleButton>
            <ToggleButton value={false}>Private Event</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Pricing Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
            Event Pricing
          </Typography>
          <ToggleButtonGroup
            value={formik.values.isFree}
            exclusive
            onChange={(e, value) => {
              if (value !== null) {
                formik.setFieldValue("isFree", value);
              }
            }}
            sx={{
              "& .MuiToggleButton-root": {
                borderRadius: 2,
                border: "none",
                px: 3,
                py: 1,
                "&.Mui-selected": {
                  backgroundColor: theme.palette.primary.main,
                  color: "white",
                  "&:hover": {
                    backgroundColor: theme.palette.primary.dark,
                  },
                },
              },
            }}
          >
            <ToggleButton value={true}>Free</ToggleButton>
            <ToggleButton value={false}>Paid</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Description Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>
            Description
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Enter event description..."
            name="description"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: theme.palette.grey[100],
                borderRadius: 2,
              },
            }}
          />
        </Box>

        {/* Submit Button */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isSubmitting}
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: "white",
            borderRadius: 2,
            py: 1.5,
            fontSize: 18,
            fontWeight: 600,
            textTransform: "none",
            "&:hover": {
              backgroundColor: theme.palette.primary.dark,
            },
          }}
        >
          {isSubmitting ? "Creating Event..." : "Add Event"}
        </Button>
      </Paper>

      {/* Alert/Snackbar */}
      <Snackbar
        open={!!alert}
        autoHideDuration={6000}
        onClose={() => setAlert(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setAlert(null)} severity={alert?.type || "info"} sx={{ width: "100%" }}>
          {alert?.message || ""}
        </Alert>
      </Snackbar>
      </Box>
    </APIProvider>
  );
};

export default EventScheduler;
