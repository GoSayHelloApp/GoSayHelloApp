import React, { useState, useEffect, useRef } from "react";
import { Box, List, ListItem, ListItemText, Paper, TextField, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Loader } from "@googlemaps/js-api-loader";

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect?: (location: { lat: number; lng: number; address: string; nearby?: any[] }) => void;
  placeholder?: string;
  fullWidth?: boolean;
  error?: boolean;
  helperText?: string | false | undefined;
  onBlur?: (e?: any) => void;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  onLocationSelect,
  placeholder = "Enter address...",
  fullWidth = true,
  error = false,
  helperText,
  onBlur,
}) => {
  const theme = useTheme();
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [service, setService] = useState<google.maps.places.AutocompleteService | null>(null);
  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const dummyMap = useRef<HTMLDivElement>(null);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => setUserLocation(null)
      );
    }
  }, []);

  // Load Google Maps API + Places
  useEffect(() => {
    const init = async () => {
      const loader = new Loader({
        apiKey: process.env.REACT_APP_GOOGLE_MAP_API as string,
        version: "weekly",
        libraries: ["places"],
      });

      await loader.importLibrary("places");
      await loader.importLibrary("maps");

      const autocompleteService = new google.maps.places.AutocompleteService();
      setService(autocompleteService);

      if (dummyMap.current) {
        const map = new google.maps.Map(dummyMap.current, {
          center: userLocation || { lat: 31.582045, lng: 74.329376 }, // fallback: Lahore
          zoom: 13,
        });
        const ps = new google.maps.places.PlacesService(map);
        setPlacesService(ps);
      }
    };

    init();
  }, [userLocation]);

  const handleInputChange = (inputValue: string) => {
    onChange(inputValue);

    if (!inputValue.trim() || !service) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

    setIsLoading(true);

    service.getPlacePredictions(
      {
        input: inputValue,
        locationBias: userLocation
          ? {
              center: new google.maps.LatLng(userLocation.lat, userLocation.lng),
              radius: 5000, // 5km bias
            }
          : undefined,
      },
      (results) => {
        if (results && results.length > 0) {
          setPredictions(results);
          setShowPredictions(true);
        } else {
          setPredictions([]);
          setShowPredictions(false);
        }
        setIsLoading(false);
      }
    );
  };

  const handlePredictionSelect = (prediction: google.maps.places.AutocompletePrediction) => {
    if (!placesService) return;

    placesService.getDetails(
      {
        placeId: prediction.place_id,
        fields: ["geometry", "formatted_address", "name"],
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          const address = place.formatted_address || place.name || prediction.description;
          onChange(address);
          setShowPredictions(false);
          setPredictions([]);

          if (onLocationSelect && place.geometry?.location) {
            const location = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
              address,
            };

            // Fetch nearby places (restaurants within 1.5km as example)
            placesService.nearbySearch(
              {
                location: place.geometry.location,
                radius: 1500,
              },
              (nearbyResults, nearbyStatus) => {
                if (nearbyStatus === google.maps.places.PlacesServiceStatus.OK && nearbyResults) {
                  onLocationSelect({
                    ...location,
                    nearby: nearbyResults,
                  });
                } else {
                  onLocationSelect(location);
                }
              }
            );
          }
        }
      }
    );
  };

  const handleInputBlur = (e?: any) => {
    setTimeout(() => {
      setShowPredictions(false);
    }, 200);
    onBlur?.(e);
  };

  return (
    <Box sx={{ position: "relative", width: fullWidth ? "100%" : "auto" }}>
      <TextField
        fullWidth={fullWidth}
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onBlur={handleInputBlur}
        onFocus={() => value.trim() && setShowPredictions(true)}
        placeholder={placeholder}
        error={error}
        helperText={helperText}
        sx={{
          "& .MuiOutlinedInput-root": {
            backgroundColor: theme.palette.grey[100],
            borderRadius: 2,
          },
        }}
      />

      {/* Predictions dropdown */}
      {showPredictions && predictions.length > 0 && (
        <Paper
          elevation={3}
          sx={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 1000,
            maxHeight: 200,
            overflow: "auto",
            mt: 1,
            borderRadius: 2,
          }}
        >
          <List dense>
            {predictions.map((p, idx) => (
              <ListItem
                key={idx}
                component="button"
                onClick={() => handlePredictionSelect(p)}
                sx={{
                  width: "100%",
                  textAlign: "left",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <ListItemText
                  primary={p.description}
                  primaryTypographyProps={{
                    variant: "body2",
                    fontWeight: 500,
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {isLoading && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            right: 16,
            transform: "translateY(-50%)",
            zIndex: 1,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Loading...
          </Typography>
        </Box>
      )}

      {/* hidden div for PlacesService */}
      <div ref={dummyMap} style={{ display: "none" }} />
    </Box>
  );
};

export default AddressAutocomplete;
