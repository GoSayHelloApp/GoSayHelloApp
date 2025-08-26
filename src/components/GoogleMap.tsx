import React, { useEffect, useState } from 'react';
import { Map, Marker } from '@vis.gl/react-google-maps';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface GoogleMapProps {
  center?: { lat: number; lng: number } | null;
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
  height?: number;
  width?: string;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ 
  center, 
  onLocationSelect, 
  height = 200, 
  width = "100%" 
}) => {
  const theme = useTheme();
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(center || null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Set loaded to true since APIProvider will handle script loading
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (center && !selectedLocation) {
      setSelectedLocation(center);
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
          // Use the Google Maps API from the context
          const geocoder = new google.maps.Geocoder();
          const response = await geocoder.geocode({ location: { lat, lng } });
          if (response.results[0]) {
            const address = response.results[0].formatted_address;
            onLocationSelect({ lat, lng, address });
          }
        } catch (error) {
          console.error('Error reverse geocoding:', error);
        }
      }
    }
  };

  if (!isLoaded) {
    return (
      <Box
        sx={{
          width,
          height,
          backgroundColor: theme.palette.grey[100],
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `2px solid ${theme.palette.grey[300]}`,
        }}
      >
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (!selectedLocation) {
    return (
      <Box
        sx={{
          width,
          height,
          backgroundColor: theme.palette.grey[100],
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
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
        mapId="event-scheduler-map"
        center={selectedLocation}
        zoom={15}
        onClick={handleMapClick}
        style={{ width: '100%', height: '100%', borderRadius: 8 }}
      >
        <Marker
          position={selectedLocation}
        />
      </Map>
    </Box>
  );
};

export default GoogleMap;
