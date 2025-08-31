import React, { useEffect, useState } from "react";
import { Map, Marker } from "@vis.gl/react-google-maps";
import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface GoogleMapProps {
  center?: { lat: number; lng: number } | null;
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
  height?: number;
  width?: string;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ center, onLocationSelect, height = 200, width = "100%" }) => {
  const theme = useTheme();
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(center || null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(center || null);

  useEffect(() => {
    if (center && !selectedLocation) {
      setSelectedLocation(center);
      setMapCenter(center);
    }
  }, [center, selectedLocation]);

  const handleMapClick = async (event: any) => {
    if (event.detail && event.detail.latLng) {
      const lat = event.detail.latLng.lat;
      const lng = event.detail.latLng.lng;

      setSelectedLocation({ lat, lng });

      // Reverse geocode to get address
      if (onLocationSelect) {
        try {
          // Ensure Google Maps API is loaded before using geocoder
          if (typeof google !== 'undefined' && google.maps && google.maps.Geocoder) {
            const geocoder = new google.maps.Geocoder();
            const response = await geocoder.geocode({ location: { lat, lng } });
            if (response.results[0]) {
              const address = response.results[0].formatted_address;
              onLocationSelect({ lat, lng, address });
            }
          } else {
            console.warn("Google Maps API not fully loaded yet");
            // Fallback: just pass coordinates without address
            onLocationSelect({ lat, lng, address: `${lat}, ${lng}` });
          }
        } catch (error) {
          console.error("Error reverse geocoding:", error);
          // Fallback: just pass coordinates without address
          onLocationSelect({ lat, lng, address: `${lat}, ${lng}` });
        }
      }
    }
  };

  if (!selectedLocation) {
    return (
      <Box
        sx={{
          width,
          height,
          backgroundColor: theme.palette.grey[100],
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `2px solid ${theme.palette.grey[300]}`,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Loading location...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width, height }}>
      <Map
        mapId="google-map"
        defaultCenter={mapCenter || undefined}
        zoom={15}
        onClick={handleMapClick}
        onCenterChanged={(e) => {
          if (e.detail && e.detail.center) {
            setMapCenter(e.detail.center);
          }
        }}
        style={{ width: "100%", height: "100%", borderRadius: 8 }}
        gestureHandling={"greedy"}
      >
        <Marker position={selectedLocation} />
      </Map>
    </Box>
  );
};

export default GoogleMap;
