import React, { useEffect, useRef, useState } from 'react';
import { TextField, Box, List, ListItem, ListItemText, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
  placeholder?: string;
  fullWidth?: boolean;
  error?: boolean;
  helperText?: string | false | undefined;
  onBlur?: (e?: any) => void;
}

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
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
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const mapDivRef = useRef<HTMLDivElement>(null);

  // Load Google Maps script
  useEffect(() => {
    // Set loaded to true since APIProvider will handle script loading
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      autocompleteService.current = new google.maps.places.AutocompleteService();
      if (mapDivRef.current) {
        placesService.current = new google.maps.places.PlacesService(mapDivRef.current);
      }
    }
  }, [isLoaded]);

  const handleInputChange = async (inputValue: string) => {
    onChange(inputValue);
    
    if (!inputValue.trim() || !autocompleteService.current) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await autocompleteService.current.getPlacePredictions({
        input: inputValue,
        types: ['address'],
        componentRestrictions: { country: 'us' }, // You can modify this for different countries
      });
      
      setPredictions(response.predictions || []);
      setShowPredictions(true);
    } catch (error) {
      console.error('Error fetching predictions:', error);
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePredictionSelect = async (prediction: PlacePrediction) => {
    onChange(prediction.description);
    setShowPredictions(false);
    setPredictions([]);

    if (onLocationSelect && placesService.current) {
      try {
        const place = await new Promise<google.maps.places.PlaceResult>((resolve, reject) => {
          placesService.current!.getDetails(
            {
              placeId: prediction.place_id,
              fields: ['geometry', 'formatted_address'],
            },
            (result, status) => {
              if (status === window.google.maps.places.PlacesServiceStatus.OK && result) {
                resolve(result);
              } else {
                reject(new Error(`Places service error: ${status}`));
              }
            }
          );
        });

        if (place.geometry?.location) {
          onLocationSelect({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            address: place.formatted_address || prediction.description,
          });
        }
      } catch (error) {
        console.error('Error getting place details:', error);
      }
    }
  };

  const handleInputBlur = () => {
    // Delay hiding predictions to allow clicking on them
    setTimeout(() => {
      setShowPredictions(false);
    }, 200);
    onBlur?.();
  };

  return (
    <Box sx={{ position: 'relative', width: fullWidth ? '100%' : 'auto' }}>
      {/* Hidden div for Places service */}
      <div ref={mapDivRef} style={{ display: 'none' }} />
      
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
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            maxHeight: 200,
            overflow: 'auto',
            mt: 1,
            borderRadius: 2,
          }}
        >
          <List dense>
            {predictions.map((prediction) => (
                             <ListItem
                 key={prediction.place_id}
                 component="button"
                 onClick={() => handlePredictionSelect(prediction)}
                 sx={{
                   width: '100%',
                   textAlign: 'left',
                   border: 'none',
                   background: 'none',
                   cursor: 'pointer',
                   '&:hover': {
                     backgroundColor: theme.palette.action.hover,
                   },
                 }}
               >
                <ListItemText
                  primary={prediction.structured_formatting.main_text}
                  secondary={prediction.structured_formatting.secondary_text}
                  primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: 500,
                  }}
                  secondaryTypographyProps={{
                    variant: 'caption',
                    color: 'text.secondary',
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
      
      {/* Loading indicator */}
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            right: 16,
            transform: 'translateY(-50%)',
            zIndex: 1,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Loading...
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AddressAutocomplete;
