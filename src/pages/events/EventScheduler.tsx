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
import { useAppSelector } from "../../redux/store";
import { useAddNewEventMutation } from "../../services/events/eventApi";
import { useMediaQuery } from "@mui/material";

interface EventSchedulerForm {
  venue_name: string;
  event_image?: File;
  address_1: string;
  address_2: string;
  event_url: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
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
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const userLocation = useLocation();
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const eventTypes = useAppSelector((state) => state.appConfig.eventTypes) || [];
  const [addNewEvent, { isLoading: isSubmitting }] = useAddNewEventMutation();
  const user = useAppSelector((state) => state.auth.user);

  const initialFormData: EventSchedulerForm = {
    venue_name: "",
    event_image: undefined,
    address_1: "",
    address_2: "",
    event_url: "",
    start_date: "",
    start_time: "",
    end_date: "",
    end_time: "",
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
    start_date: Yup.string()
      .required("Start date is required")
      .test("not-past-date", "Start date cannot be in the past", function (value) {
        if (!value) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startDate = new Date(value);
        return startDate >= today;
      }),
    start_time: Yup.string().required("Start time is required"),
    end_date: Yup.string()
      .required("End date is required")
      .test("after-start-date", "End date must be after start date", function (value) {
        const { start_date } = this.parent;
        if (!value || !start_date) return false;
        const startDate = new Date(start_date);
        const endDate = new Date(value);
        return endDate >= startDate;
      }),
    end_time: Yup.string().required("End time is required"),
    event_type_id: Yup.string().required("Event type is required"),
    description: Yup.string().required("Description is required"),
  });

  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  // Helper function to get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Helper function to get minimum end date based on start date
  const getMinEndDate = () => {
    return formik.values.start_date || getMinDate();
  };

  // Helper function to convert local time to UTC
  const convertToUTC = (date: string, time: string, timezoneOffset?: number): string => {
    if (!date || !time) return "";

    // Create a date object with the local date and time
    const localDateTime = new Date(`${date}T${time}`);

    // If we have timezone offset, adjust accordingly
    if (timezoneOffset !== undefined) {
      // Convert to UTC by subtracting the timezone offset
      const utcTime = new Date(localDateTime.getTime() - timezoneOffset * 60 * 60 * 1000);
      return utcTime.toISOString();
    }

    // Fallback: assume local timezone and convert to UTC
    return localDateTime.toISOString();
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
        // Convert local times to UTC
        const startDateTimeUTC = convertToUTC(values.start_date, values.start_time, values.timezone_offset);
        const endDateTimeUTC = convertToUTC(values.end_date, values.end_time, values.timezone_offset);

        formData.append("start_date", values.start_date);
        formData.append("start_time", values.start_time);
        formData.append("end_date", values.end_date);
        formData.append("end_time", values.end_time);
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
  return (
    <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAP_API || ""}>
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
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 3,
              mb: 4,
              alignItems: { xs: "center", md: "flex-start" },
            }}
          >
            {/* Event Image Input */}
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
              <Box
                component="label"
                htmlFor="event-image-input"
                sx={{
                  width: 80,
                  height: 80,
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
                      borderRadius: 6,
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
              <GoogleMap center={mapCenter} onLocationSelect={handleLocationSelect} height={250} width="100%" />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                💡 Click on the map to select a location, or use the address autocomplete below
              </Typography>
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
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField
                type="date"
                placeholder="Start Date"
                name="start_date"
                value={formik.values.start_date}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                inputProps={{ min: getMinDate() }}
                error={formik.touched.start_date && Boolean(formik.errors.start_date)}
                helperText={formik.touched.start_date && formik.errors.start_date}
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
                name="start_time"
                value={formik.values.start_time}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.start_time && Boolean(formik.errors.start_time)}
                helperText={formik.touched.start_time && formik.errors.start_time}
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
                name="end_date"
                value={formik.values.end_date}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                inputProps={{ min: getMinEndDate() }}
                error={formik.touched.end_date && Boolean(formik.errors.end_date)}
                helperText={formik.touched.end_date && formik.errors.end_date}
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
                name="end_time"
                value={formik.values.end_time}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.end_time && Boolean(formik.errors.end_time)}
                helperText={formik.touched.end_time && formik.errors.end_time}
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

            <ToggleButtonGroup
              value={formik.values.is_public}
              exclusive
              fullWidth
              onChange={(e, value) => {
                if (value !== null) {
                  formik.setFieldValue("is_public", value);
                }
              }}
              sx={{
                "& .MuiToggleButton-root": {
                  borderRadius: 2,
                  border: "none",
                  px: 3,
                  py: 1,
                  width: "100%",
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
            <ToggleButtonGroup
              value={!formik.values.is_paid_event}
              exclusive
              fullWidth
              onChange={(e, value) => {
                if (value !== null) {
                  formik.setFieldValue("is_paid_event", !value);
                }
              }}
              sx={{
                "& .MuiToggleButton-root": {
                  borderRadius: 2,
                  border: "none",
                  px: 3,
                  py: 1,
                  width: "100%",
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
