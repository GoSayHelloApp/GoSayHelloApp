import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, FormControl, Select, MenuItem, Button, useTheme } from "@mui/material";
import { Icon } from "@iconify/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppSelector } from "../../redux/store";
import {
  useGetStatesByCountryMutation,
  useGetCitiesByStateMutation,
  useSaveUserPersonalInformationMutation,
  useGetAccountSettingInformationMutation,
} from "../../services/appconfiguration/configApi";
import { Country } from "../../models/responseModels/appConfig";
import { State, City } from "../../models/responseModels/location";
import { userSelector } from "../../services/auth/authSelectors";

const HomeTown: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get("mode") === "edit";

  // Redux selectors
  const countries = useAppSelector((state) => state.appConfig.countries) || [];
  const user = useAppSelector(userSelector);

  // API mutations
  const [getStatesByCountry, { data: statesData }] = useGetStatesByCountryMutation();
  const [getCitiesByState, { data: citiesData }] = useGetCitiesByStateMutation();
  const [saveUserPersonalInformation] = useSaveUserPersonalInformationMutation();
  const [getAccountSettingInformation] = useGetAccountSettingInformationMutation();

  console.log("statesData", statesData); 
  // Local state
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  // Fetch existing user data if in edit mode
  useEffect(() => {
    if (isEditMode && user?.id && countries.length > 0) {
      const fetchUserData = async () => {
        try {
          const response = await getAccountSettingInformation({ user_id: user.id }).unwrap();
          console.log("HomeTown API Response:", response);

          if (response.success && response.user_information) {
            const userData = response.user_information;
            console.log("HomeTown User Data:", userData);

            // Check if we have home town data
            if (userData.home_town_country_id && userData.home_town_state_id && userData.home_town_city_id) {
              console.log("Setting country:", userData.home_town_country_id);

              // Find and set the country
              const country = countries.find((c) => c.id === userData.home_town_country_id);
              if (country) {
                setSelectedCountry(country);
                console.log("Country set:", country.name);

                // Fetch states for this country
                setIsLoadingStates(true);
                const statesResponse = await getStatesByCountry({ country_id: country.id }).unwrap();
                console.log("States response:", statesResponse);

                if (statesResponse.success && statesResponse.stateNames) {
                  setStates(statesResponse.stateNames);
                  setIsLoadingStates(false);

                  // Find and set the state
                  const state = statesResponse.stateNames.find((s) => s.id === userData.home_town_state_id);
                  if (state) {
                    setSelectedState(state);
                    console.log("State set:", state.state_name);

                    // Fetch cities for this state
                    setIsLoadingCities(true);
                    const citiesResponse = await getCitiesByState({ state_id: state.id }).unwrap();
                    console.log("Cities response:", citiesResponse);

                    if (citiesResponse.success && citiesResponse.cities) {
                      setCities(citiesResponse.cities);
                      setIsLoadingCities(false);

                      // Find and set the city
                      const city = citiesResponse.cities.find((c) => c.id === userData.home_town_city_id);
                      if (city) {
                        setSelectedCity(city);
                        console.log("City set:", city.city);
                      }
                    }
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setIsLoadingStates(false);
          setIsLoadingCities(false);
        }
      };
      fetchUserData();
    }
  }, [isEditMode, user?.id, countries, getAccountSettingInformation, getStatesByCountry, getCitiesByState]);

  // Set default country if available and fetch states (only for new users)
  useEffect(() => {
    if (!isEditMode && countries.length > 0 && !selectedCountry) {
      const defaultCountry = countries[0];
      setSelectedCountry(defaultCountry);
      // Automatically fetch states for the default country
      if (defaultCountry) {
        setIsLoadingStates(true);
        getStatesByCountry({ country_id: defaultCountry.id })
          .unwrap()
          .catch((error) => {
            console.error("Error fetching states for default country:", error);
            setIsLoadingStates(false);
          });
      }
    }
  }, [countries, selectedCountry, isEditMode, getStatesByCountry]);

  // Handle states data update (only for non-edit mode)
  useEffect(() => {
    if (statesData?.success && statesData.stateNames) {
      setStates(statesData.stateNames);
      setIsLoadingStates(false);
    }
  }, [statesData, isEditMode]);

  // Handle cities data update (only for non-edit mode)
  useEffect(() => {
    if (citiesData?.success && citiesData.cities) {
      setCities(citiesData.cities);
      setIsLoadingCities(false);
    }
  }, [citiesData, isEditMode]);

  const handleCountryChange = async (country: Country) => {
    setSelectedCountry(country);
    setSelectedState(null);
    setSelectedCity(null);
    setStates([]);
    setCities([]);

    if (country) {
      setIsLoadingStates(true);
      try {
        await getStatesByCountry({ country_id: country.id }).unwrap();
      } catch (error) {
        console.error("Error fetching states:", error);
        setIsLoadingStates(false);
      }
    }
  };

  const handleStateChange = async (state: State) => {
    setSelectedState(state);
    setSelectedCity(null);
    setCities([]);

    if (state) {
      setIsLoadingCities(true);
      try {
        await getCitiesByState({ state_id: state.id }).unwrap();
      } catch (error) {
        console.error("Error fetching cities:", error);
        setIsLoadingCities(false);
      }
    }
  };

  const handleSave = async () => {
    if (!selectedCountry || !selectedState || !selectedCity || !user?.id) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await saveUserPersonalInformation({
        city_id: selectedCity.id,
        country_id: selectedCountry.id,
        state_id: selectedState.id,
        user_id: user.id,
        city: selectedCity.city,
        country_name: selectedCountry.name,
        state: selectedState.state_name,
        information_type: 1,
      }).unwrap();

      if (response.success) {
        console.log("Location saved successfully:", response);
        // Redirect based on mode
        if (isEditMode) {
          navigate("/nearby?tab=people"); // Go back to preferences in edit mode
        } else {
          navigate("/school"); // Go to next step for new users
        }
      } else {
        console.error("Failed to save location:", response);
        // You might want to show an error message to the user here
      }
    } catch (error) {
      console.error("Error saving location:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    // Handle skip logic here
    console.log("Skipping location setup");
    // Redirect based on mode
    if (isEditMode) {
      navigate("/nearby?tab=people"); // Go back to preferences in edit mode
    } else {
      navigate("/school"); // Go to next step for new users
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
        backgroundColor: theme.palette.background.default,
        padding: "20px",
      }}
    >
      {/* Title */}
      <Typography
        variant="h4"
        component="h1"
        sx={{
          color: theme.palette.grey[800],
          fontWeight: 600,
          marginBottom: 2,
          textAlign: "center",
        }}
      >
        {isEditMode ? "Edit Home Town" : "Home Town"}
      </Typography>

      {/* Subtitle */}
      <Typography
        variant="body1"
        sx={{
          color: theme.palette.grey[600],
          marginBottom: 4,
          textAlign: "center",
          fontSize: "16px",
        }}
      >
        {isEditMode
          ? "Update your location information"
          : "Let's set up your location to help you connect with people nearby"}
      </Typography>

      {/* Form Container */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "400px",
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        {/* Country Field */}
        <FormControl fullWidth>
          <Select
            value={selectedCountry?.id || ""}
            onChange={(e) => {
              const country = countries.find((c) => c.id === e.target.value);
              if (country) handleCountryChange(country);
            }}
            displayEmpty
            sx={{
              borderRadius: "12px",
              border: `1px solid ${theme.palette.primary.light}`,
              "& .MuiSelect-select": {
                color: theme.palette.grey[800],
                fontWeight: 500,
                padding: "16px 20px",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                border: "none",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                border: "none",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                border: "none",
              },
            }}
            IconComponent={() => (
              <Icon
                icon="mdi:chevron-down"
                style={{
                  marginRight: "16px",
                  color: theme.palette.grey[600],
                  fontSize: "20px",
                }}
              />
            )}
          >
            {countries.map((country) => (
              <MenuItem key={country.id} value={country.id}>
                {country.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* State Field */}
        <FormControl fullWidth>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.grey[500],
              marginBottom: 1,
              fontSize: "14px",
            }}
          >
            State
          </Typography>
          <Select
            value={selectedState?.id || ""}
            onChange={(e) => {
              const state = states.find((s) => s.id === e.target.value);
              if (state) handleStateChange(state);
            }}
            displayEmpty
            disabled={!selectedCountry || isLoadingStates}
            sx={{
              borderRadius: "12px",
              border: `1px solid ${theme.palette.primary.light}`,
              "& .MuiSelect-select": {
                color: theme.palette.grey[800],
                fontWeight: 500,
                padding: "16px 20px",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                border: "none",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                border: "none",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                border: "none",
              },
            }}
            IconComponent={() => (
              <Icon
                icon={isLoadingStates ? "material-symbols:autorenew" : "mdi:chevron-down"}
                style={{
                  marginRight: "16px",
                  color: theme.palette.grey[600],
                  fontSize: "20px",
                  animation: isLoadingStates ? "spin 1s linear infinite" : "none",
                }}
              />
            )}
          >
            {states.map((state) => (
              <MenuItem key={state.id} value={state.id}>
                {state.state_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* City Field */}
        <FormControl fullWidth>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.grey[500],
              marginBottom: 1,
              fontSize: "14px",
            }}
          >
            City
          </Typography>
          <Select
            value={selectedCity?.id || ""}
            onChange={(e) => {
              const city = cities.find((c) => c.id === e.target.value);
              if (city) setSelectedCity(city);
            }}
            displayEmpty
            disabled={!selectedState || isLoadingCities}
            sx={{
              borderRadius: "12px",
              border: `1px solid ${theme.palette.primary.light}`,
              "& .MuiSelect-select": {
                color: theme.palette.grey[800],
                fontWeight: 500,
                padding: "16px 20px",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                border: "none",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                border: "none",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                border: "none",
              },
            }}
            IconComponent={() => (
              <Icon
                icon={isLoadingCities ? "material-symbols:autorenew" : "mdi:chevron-down"}
                style={{
                  marginRight: "16px",
                  color: theme.palette.grey[600],
                  fontSize: "20px",
                  animation: isLoadingCities ? "spin 1s linear infinite" : "none",
                }}
              />
            )}
          >
            {cities.map((city) => (
              <MenuItem key={city.id} value={city.id}>
                {city.city}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Save Button */}
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSaving || !selectedCity}
          endIcon={
            isSaving && (
              <Icon
                icon="material-symbols:autorenew"
                style={{
                  animation: "spin 1s linear infinite",
                  fontSize: "20px",
                }}
              />
            )
          }
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: "white",
            borderRadius: "full",
            padding: "8px 16px",
            fontWeight: 600,
            fontSize: "16px",
            textTransform: "none",
            alignSelf: "flex-end",
            marginTop: 1,
            height: "40px",
          }}
        >
          {isSaving ? "Saving..." : isEditMode ? "Update" : "Save"}
        </Button>
      </Box>

      {/* Skip/Back Button */}
      <Button
        variant="contained"
        onClick={handleSkip}
        fullWidth
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: "white",
          borderRadius: "40px",
          textTransform: "capitalize",
          padding: "10px",
          height: "40px",
          marginTop: 6,
          maxWidth: "400px",
          "&:hover": {
            backgroundColor: theme.palette.primary.dark,
          },
        }}
      >
        {isEditMode ? "Back" : "Skip"}
      </Button>
    </Box>
  );
};

export default HomeTown;
