import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Alert,
  Snackbar,
  CircularProgress,
  Tab,
  Tabs,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { useTheme } from "@mui/material/styles";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useLocation } from "../../hooks/useLocation";
import GoogleMap from "../../components/GoogleMap";
import AddressAutocomplete from "../../components/AddressAutocomplete";
import { APIProvider } from "@vis.gl/react-google-maps";
import { useAppSelector } from "../../redux/store";
import { useAddNewEventMutation } from "../../services/events/eventApi";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";

// Extend dayjs with UTC plugin
dayjs.extend(utc);

interface EventSchedulerForm {
  venue_name: string;
  event_image?: File;
  address_1: string;
  address_2: string;
  event_url: string;
  start_datetime: Dayjs | null;
  end_datetime: Dayjs | null;
  event_type_id: string;
  event_type_name: string;
  is_public: boolean;
  is_paid_event: boolean;
  description: string;
  d_lat?: number;
  d_long?: number;
  country_name: string;
  country_id: number;
  state: string;
  city: string;
  timezone?: string;
  timezone_offset?: number;
}

const EventScheduler: React.FC = () => {
  const theme = useTheme();
  const userLocation = useLocation();
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const eventTypes = useAppSelector((state) => state.appConfig.eventTypes) || [];
  const [addNewEvent, { isLoading: isSubmitting }] = useAddNewEventMutation();
  const user = useAppSelector((state) => state.auth.user);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  const initialFormData: EventSchedulerForm = {
    venue_name: "",
    event_image: undefined,
    address_1: "",
    address_2: "",
    event_url: "",
    start_datetime: null,
    end_datetime: null,
    event_type_id: "",
    event_type_name: "",
    is_public: true,
    is_paid_event: false,
    description: "",
    d_lat: undefined,
    d_long: undefined,
    country_name: "United States",
    country_id: 1,
    state: "California",
    city: "San Francisco",
    timezone: undefined,
    timezone_offset: undefined,
  };

  // Validation schema
  const validationSchema = Yup.object({
    venue_name: Yup.string().required("Venue name is required").min(3, "Venue name must be at least 3 characters long"),
    address_1: Yup.string().required("Address is required"),
    start_datetime: Yup.mixed()
      .required("Start date and time is required")
      .test("not-past-datetime", "Start date and time cannot be in the past", function (value: any) {
        if (!value) return false;
        const now = dayjs();
        return dayjs.isDayjs(value) && value.isAfter(now);
      }),
    end_datetime: Yup.mixed()
      .required("End date and time is required")
      .test("after-start-datetime", "End date and time must be after start date and time", function (value: any) {
        const { start_datetime } = this.parent;
        if (!value || !start_datetime) return false;
        return dayjs.isDayjs(value) && dayjs.isDayjs(start_datetime) && value.isAfter(start_datetime);
      }),
    event_type_id: Yup.string().required("Event type is required"),
    description: Yup.string().required("Description is required"),
  });

  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0); // 0 for public, 1 for private
  const [pricingTabValue, setPricingTabValue] = useState(0); // 0 for free, 1 for paid

  // Set map center when user location is available
  useEffect(() => {
    if (userLocation) {
      setMapCenter({ lat: userLocation.latitude, lng: userLocation.longitude });
    }
  }, [userLocation]);

  // Debug event types loading
  useEffect(() => {
    console.log("Event types loaded:", eventTypes);
  }, [eventTypes]);

  // Handle Google Maps API loading
  useEffect(() => {
    const checkGoogleMapsLoaded = () => {
      if (typeof google !== "undefined" && google.maps && google.maps.Map) {
        setIsGoogleMapsLoaded(true);
      } else {
        // Retry after a short delay
        setTimeout(checkGoogleMapsLoaded, 100);
      }
    };

    checkGoogleMapsLoaded();
  }, []);

  // Helper function to convert Dayjs to UTC
  const convertToUTC = (datetime: Dayjs | null, timezoneOffset?: number): string => {
    if (!datetime) return "";

    // If we have timezone offset, adjust accordingly
    if (timezoneOffset !== undefined) {
      // Convert to UTC by subtracting the timezone offset
      return datetime.subtract(timezoneOffset, "hour").utc().toISOString();
    }

    // Fallback: convert to UTC
    return datetime.utc().toISOString();
  };

  // Fallback timezone detection using coordinates
  const getTimezoneFromCoordinates = async (
    lat: number,
    lng: number
  ): Promise<{ timezone: string; offset: number } | null> => {
    try {
      // Try using a different timezone API as fallback
      const response = await fetch(
        `https://worldtimeapi.org/api/timezone/Etc/GMT${lat > 0 ? "+" : ""}${Math.round(lng / 15)}`
      );
      if (response.ok) {
        const data = await response.json();
        return {
          timezone: data.timezone,
          offset: data.utc_offset ? parseInt(data.utc_offset.replace(":", "")) / 100 : 0,
        };
      }
    } catch (error) {
      console.error("Fallback timezone API error:", error);
    }
    return null;
  };

  const formik = useFormik({
    initialValues: initialFormData,
    validationSchema,
    onSubmit: async (values) => {
      try {
        console.log("Event Data:", values);
        const formData = new FormData();
        formData.append("venue_name", values.venue_name);
        if (values.event_image) {
          formData.append("event_image", values.event_image);
        }
        formData.append("address_1", values.address_1);
        formData.append("address_2", values.address_2);
        formData.append("event_url", values.event_url);

        // Convert datetime to UTC and extract date/time components
        const startDateTimeUTC = convertToUTC(values.start_datetime, values.timezone_offset);
        const endDateTimeUTC = convertToUTC(values.end_datetime, values.timezone_offset);

        // Extract date and time components for backward compatibility
        const startDate = values.start_datetime?.format("YYYY-MM-DD") || "";
        const startTime = values.start_datetime?.format("HH:mm") || "";
        const endDate = values.end_datetime?.format("YYYY-MM-DD") || "";
        const endTime = values.end_datetime?.format("HH:mm") || "";

        formData.append("start_date", startDate);
        formData.append("start_time", startTime);
        formData.append("end_date", endDate);
        formData.append("end_time", endTime);
        formData.append("start_datetime_utc", startDateTimeUTC);
        formData.append("end_datetime_utc", endDateTimeUTC);
        formData.append("event_type_id", values.event_type_id);

        // Ensure event_type_name is set by finding it from eventTypes if it's empty
        let eventTypeName = values.event_type_name;
        if (!eventTypeName && values.event_type_id) {
          const selectedType = eventTypes.find((type) => type.id.toString() === values.event_type_id);
          eventTypeName = selectedType?.type || "";
          console.log("Fallback event type lookup:", { selectedType, eventTypeName, eventTypes });
        }
        formData.append("event_type_name", eventTypeName);
        formData.append("is_public", values.is_public ? "1" : "0");
        formData.append("is_paid_event", values.is_paid_event ? "1" : "0");
        formData.append("description", values.description);
        formData.append("d_lat", values.d_lat?.toString() || "");
        formData.append("d_long", values.d_long?.toString() || "");
        formData.append("country_name", values.country_name);
        formData.append("country_id", values.country_id.toString());
        formData.append("state", values.state);
        formData.append("city", values.city);
        formData.append("user_id", user?.id.toString() || ""); // Placeholder for user_id, replace with actual user ID
        formData.append("zipcode", "94103"); // Placeholder for zipcode, replace with actual zipcode

        const response = await addNewEvent(formData).unwrap();
        console.log("Event created successfully:", response);

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
      }
    },
  });

  // Tab helper functions
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    formik.setFieldValue("is_public", newValue === 0);
  };

  const handlePricingTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setPricingTabValue(newValue);
    formik.setFieldValue("is_paid_event", newValue === 1);
  };

  function a11yProps(index: number) {
    return {
      id: `event-tab-${index}`,
      "aria-controls": `event-tabpanel-${index}`,
    };
  }

  function pricingA11yProps(index: number) {
    return {
      id: `pricing-tab-${index}`,
      "aria-controls": `pricing-tabpanel-${index}`,
    };
  }

  // Sync tab value with formik initial value
  useEffect(() => {
    setTabValue(formik.values.is_public ? 0 : 1);
  }, [formik.values.is_public]);

  // Sync pricing tab with formik initial value
  useEffect(() => {
    setPricingTabValue(formik.values.is_paid_event ? 1 : 0);
  }, [formik.values.is_paid_event]);

  // Handle location selection from map or address autocomplete
  const handleLocationSelect = async (location: { lat: number; lng: number; address: string }) => {
    console.log("Location selected:", location);

    formik.setFieldValue("d_lat", location.lat);
    formik.setFieldValue("d_long", location.lng);
    formik.setFieldValue("address_1", location.address);
    setMapCenter({ lat: location.lat, lng: location.lng });

    // Get timezone for the selected location
    try {
      console.log("Fetching timezone for coordinates:", location.lat, location.lng);

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/timezone/json?location=${location.lat},${
          location.lng
        }&timestamp=${Math.floor(Date.now() / 1000)}&key=${process.env.REACT_APP_GOOGLE_MAP_API}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const timezoneData = await response.json();
      console.log("Timezone API response:", timezoneData);

      if (timezoneData.status === "OK") {
        const timezone = timezoneData.timeZoneId;
        const offset = timezoneData.rawOffset / 3600; // Convert seconds to hours
        const offsetString = offset >= 0 ? `+${offset}` : `${offset}`;

        console.log(`Location timezone: ${timezone} (UTC${offsetString})`);

        // Store timezone info for later use
        formik.setFieldValue("timezone", timezone);
        formik.setFieldValue("timezone_offset", offset);
      } else {
        console.error("Timezone API error:", timezoneData.error_message || timezoneData.status);

        // Try fallback method
        console.log("Trying fallback timezone detection...");
        const fallbackTimezone = await getTimezoneFromCoordinates(location.lat, location.lng);
        if (fallbackTimezone) {
          console.log(
            `Fallback timezone: ${fallbackTimezone.timezone} (UTC${fallbackTimezone.offset >= 0 ? "+" : ""}${
              fallbackTimezone.offset
            })`
          );
          formik.setFieldValue("timezone", fallbackTimezone.timezone);
          formik.setFieldValue("timezone_offset", fallbackTimezone.offset);
        }
      }
    } catch (error) {
      console.error("Error fetching timezone:", error);
    }
  };

  // Handle image selection
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      formik.setFieldValue("event_image", file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
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
        <Box
          sx={{
            // display: "flex",
            // flexDirection: { xs: "column", md: "row" },
            gap: 3,
            mb: 4,
            // alignItems: { xs: "center", md: "flex-start" },
          }}
        >
          {/* Event Image Input */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <Box
              component="label"
              htmlFor="event-image-input"
              sx={{
                width: { xs: 120, md: 200 },
                height: { xs: 120, md: 200 },
                border: `2px dashed ${theme.palette.grey[300]}`,
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                backgroundColor: imagePreview ? "transparent" : theme.palette.grey[100],
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: theme.palette.grey[50],
                },
              }}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Event preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "inherit",
                  }}
                />
              ) : (
                <Icon icon="mdi:camera-plus" fontSize={24} color={theme.palette.grey[500]} />
              )}
            </Box>
            <input
              id="event-image-input"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center" }}>
              {imagePreview ? "Click to change" : "Add image"}
            </Typography>
          </Box>

          {/* Event Name */}
          <Box sx={{ flex: 1, width: "100%" }}>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>
              Event Name
            </Typography>
            <TextField
              fullWidth
              placeholder="Event name"
              name="venue_name"
              value={formik.values.venue_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.venue_name && Boolean(formik.errors.venue_name)}
              helperText={formik.touched.venue_name && formik.errors.venue_name}
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Venue Location
            </Typography>
            {userLocation ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Icon icon="mdi:map-marker" fontSize={16} color={theme.palette.success.main} />
                <Typography variant="caption" color="success.main" sx={{ fontWeight: 500 }}>
                  Location detected
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Icon icon="mdi:map-marker-off" fontSize={16} color={theme.palette.warning.main} />
                <Typography variant="caption" color="warning.main" sx={{ fontWeight: 500 }}>
                  Requesting location...
                </Typography>
              </Box>
            )}
          </Box>

          {/* Google Maps Component */}
          <Box sx={{ mb: 2 }}>
            {isGoogleMapsLoaded ? (
              <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAP_API || ""}>
                <GoogleMap center={mapCenter} onLocationSelect={handleLocationSelect} height={250} width="100%" />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                  💡 Click on the map to select a location, or use the address autocomplete below
                </Typography>
              </APIProvider>
            ) : (
              <Box
                sx={{
                  width: "100%",
                  height: 250,
                  backgroundColor: theme.palette.grey[100],
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `2px solid ${theme.palette.grey[300]}`,
                  gap: 2,
                }}
              >
                <CircularProgress size={40} color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Loading Google Maps...
                </Typography>
              </Box>
            )}
          </Box>

          {/* Address Inputs */}
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2 }}>
            <AddressAutocomplete
              value={formik.values.address_1}
              onChange={(value) => formik.setFieldValue("address_1", value)}
              onLocationSelect={handleLocationSelect}
              placeholder="Address 1"
              error={formik.touched.address_1 && Boolean(formik.errors.address_1)}
              helperText={formik.touched.address_1 && formik.errors.address_1}
              onBlur={formik.handleBlur}
            />

            <TextField
              fullWidth
              placeholder="Address 2"
              name="address_2"
              value={formik.values.address_2}
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

          <Box sx={{ mt: 2 }}>
            {formik.values.timezone && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 2,
                  py: 1,
                  backgroundColor: theme.palette.warning.light,
                  borderRadius: 2,
                  color: theme.palette.warning.contrastText,
                }}
              >
                <Icon icon="mdi:clock-outline" fontSize={16} />
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  {formik.values.timezone} (UTC
                  {formik.values.timezone_offset && formik.values.timezone_offset >= 0 ? "+" : ""}
                  {formik.values.timezone_offset})
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Website Link Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>
            Event URL
          </Typography>
          <TextField
            fullWidth
            placeholder="Event URL | start with https://"
            name="event_url"
            value={formik.values.event_url}
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
            Date & Time
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <DateTimePicker
                label="Start Date & Time"
                value={formik.values.start_datetime}
                onChange={(newValue) => {
                  formik.setFieldValue("start_datetime", newValue);
                }}
                viewRenderers={{
                  hours: renderTimeViewClock,
                  minutes: renderTimeViewClock,
                }}
                minDateTime={dayjs()}
                slotProps={{
                  textField: {
                    error: formik.touched.start_datetime && Boolean(formik.errors.start_datetime),
                    helperText: formik.touched.start_datetime && formik.errors.start_datetime,
                    sx: {
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: theme.palette.grey[100],
                        borderRadius: 2,
                      },
                    },
                  },
                }}
              />
              <DateTimePicker
                label="End Date & Time"
                value={formik.values.end_datetime}
                onChange={(newValue) => {
                  formik.setFieldValue("end_datetime", newValue);
                }}
                viewRenderers={{
                  hours: renderTimeViewClock,
                  minutes: renderTimeViewClock,
                }}
                minDateTime={formik.values.start_datetime || dayjs()}
                slotProps={{
                  textField: {
                    error: formik.touched.end_datetime && Boolean(formik.errors.end_datetime),
                    helperText: formik.touched.end_datetime && formik.errors.end_datetime,
                    sx: {
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: theme.palette.grey[100],
                        borderRadius: 2,
                      },
                    },
                  },
                }}
              />
            </Box>
          </LocalizationProvider>
        </Box>

        {/* Event Type Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>
            Event Type
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Event Type</InputLabel>
            <Select
              name="event_type_id"
              value={formik.values.event_type_id}
              label="Select Event Type"
              onChange={(e) => {
                const selectedValue = e.target.value;
                const selectedType = eventTypes.find((type) => type.id === parseInt(selectedValue));
                console.log(
                  "Selected value:",
                  selectedValue,
                  "Selected type:",
                  selectedType,
                  "Event types:",
                  eventTypes
                );
                formik.setFieldValue("event_type_id", selectedValue);
                formik.setFieldValue("event_type_name", selectedType?.type || "");
              }}
              onBlur={formik.handleBlur}
              error={formik.touched.event_type_id && Boolean(formik.errors.event_type_id)}
              sx={{
                backgroundColor: theme.palette.grey[100],
                borderRadius: 2,
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
              }}
            >
              {eventTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              backgroundColor: theme.palette.grey[400],
              borderRadius: "33px",
              mb: 3,
            }}
          >
            <Tab
              sx={{ flex: "1 1 auto", height: "60px", width: "150px", fontSize: 15, fontWeight: 600 }}
              label="Public Event"
              {...a11yProps(0)}
            />
            <Tab
              sx={{ flex: "1 1 auto", height: "60px", width: "150px", fontSize: 15, fontWeight: 600 }}
              label="Private Event"
              {...a11yProps(1)}
            />
          </Tabs>
        </Box>

        {/* Pricing Section */}
        <Box sx={{ mb: 4 }}>
          <Tabs
            value={pricingTabValue}
            onChange={handlePricingTabChange}
            sx={{
              backgroundColor: theme.palette.grey[400],
              borderRadius: "33px",
              mb: 3,
            }}
          >
            <Tab
              label="Free"
              {...pricingA11yProps(0)}
              sx={{ flex: "1 1 auto", height: "60px", width: "150px", fontSize: 15, fontWeight: 600 }}
            />
            <Tab
              label="Paid"
              {...pricingA11yProps(1)}
              sx={{ flex: "1 1 auto", height: "60px", width: "150px", fontSize: 15, fontWeight: 600 }}
            />
          </Tabs>
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
  );
};

export default EventScheduler;
