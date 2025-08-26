# Google Maps Integration Setup

## Prerequisites

To use the Google Maps functionality in the Event Scheduler, you need to:

1. **Get a Google Maps API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the following APIs:
     - Maps JavaScript API
     - Places API
     - Geocoding API
   - Go to Credentials and create an API key
   - Restrict the API key to your domain for security

2. **Set Environment Variable:**
   Create a `.env` file in your project root and add:
   ```
   REACT_APP_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

## Features

The Event Scheduler now includes:

- **Interactive Google Map** showing current user location
- **Address Autocomplete** with nearby address suggestions
- **Click-to-select** location on the map
- **Reverse geocoding** to get addresses from coordinates
- **Form integration** that updates address fields when locations are selected

## How It Works

1. **Location Detection:** Uses the browser's geolocation API to get the user's current position
2. **Map Display:** Shows an interactive Google Map centered on the user's location
3. **Address Input:** The Address 1 field now provides autocomplete suggestions as you type
4. **Map Interaction:** Click anywhere on the map to select a location, which automatically updates the address field
5. **Coordinate Storage:** Latitude and longitude are stored in the form for precise location data

## Security Notes

- Never commit your API key to version control
- Use environment variables for sensitive configuration
- Consider implementing API key restrictions in Google Cloud Console
- Monitor your API usage to avoid unexpected charges

## Troubleshooting

- **Map not loading:** Check your API key and ensure the required APIs are enabled
- **No autocomplete:** Verify the Places API is enabled and your API key has access
- **Location errors:** Ensure the user has granted location permissions to the browser


