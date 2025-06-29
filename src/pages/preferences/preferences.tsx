import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Divider,
  useTheme,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import {
  useAddPreferencesMutation,
  useGetPreferencesQuery,
} from "../../services/preferences/preferenceApi";
import {
  Preference,
  PreferenceType,
  UserPreference,
} from "../../models/responseModels/preferences";
import PageWrapper from "../../ui/layout/wrappers/pageWrapper";
import {
  cardStyles,
  categoryBoxStyles,
  categoryHeaderStyles,
  chipStyles,
  containerStyles,
  descriptionStyles,
  dividerStyles,
  headerStyles,
  preferenceTypeBoxStyles,
  preferenceTypeChipBoxStyles,
  selectedTypesBoxStyles,
  submitButtonStyles,
} from "../../ui/components/preferences/styles";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { userSelector } from "../../services/auth/authSelectors";
import { userPreferencesRequest } from "../../models/requestModels/preferences";
import { setUserPreferences } from "../../services/auth/authSlice";
import { Icon } from "@iconify/react";

export default function Preferences() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector(userSelector);
  const isEditMode =
    new URLSearchParams(location.search).get("mode") === "edit";
  const dispatch = useAppDispatch();
  const [currentPreference, setCurrentPreference] = useState<
    Preference | undefined
  >();
  const [selectedPreferenceTypes, setSelectedPreferenceTypes] = useState<
    PreferenceType[]
  >([]);
  const [minSelectionError, setMinSelectionError] = useState<
    string | undefined
  >();
  const boxRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useGetPreferencesQuery();
  const [addPreferences, { isLoading: addPreferencesLoading, error, isError }] =
    useAddPreferencesMutation();

  const handleSelectPreference = (preference: Preference) => {
    setCurrentPreference(preference);
  };

  const handleSelectPreferenceType = (type: PreferenceType) => {
    if (!selectedPreferenceTypes.includes(type)) {
      setSelectedPreferenceTypes((prev) => [...prev, type]);
    }
  };

  const handleDeleteInterest = (type: PreferenceType) => {
    setSelectedPreferenceTypes((prev) =>
      prev.filter((item) => item.id !== type.id)
    );
  };

  const handleSubmit = () => {
    if (selectedPreferenceTypes.length < 3) {
      setMinSelectionError("Please select a minimum of 3 preferences.");
      return;
    } else {
      setMinSelectionError(undefined);
    }

    const request: userPreferencesRequest = {
      user_id: user?.id,
      preferences_type_ids: selectedPreferenceTypes.map((p) => p.id).join(","),
    };
    addPreferences(request)
      .unwrap()
      .then((response) => {
        // Create UserPreference objects from selected types
        const preferences: UserPreference[] = selectedPreferenceTypes.map(
          (type) => ({
            id: type.id,
            preference_type_id: type.id,
            preference_name: currentPreference?.name || "",
            preference_type: type.name,
          })
        );

        // Update both Redux and session storage
        dispatch(setUserPreferences(preferences));
        navigate("/nearby");
      })
      .catch((error) => {
        console.error("Request failed:", error);
      });
  };

  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollLeft = boxRef.current.scrollWidth;
    }
  }, [selectedPreferenceTypes]);

  useEffect(() => {
    if (!currentPreference) {
      setCurrentPreference(data?.Preferences[0]);
    }
  }, [data]);

  useEffect(() => {
    if (
      isEditMode &&
      user?.UserPreferences &&
      data?.Preferences &&
      selectedPreferenceTypes.length === 0 // only on first load
    ) {
      // Map UserPreferences to PreferenceType objects
      const userTypeIds = user.UserPreferences.map(
        (up) => up.preference_type_id
      );
      const allTypes: PreferenceType[] = [];
      data.Preferences.forEach((pref) => {
        pref.types.forEach((type) => {
          if (userTypeIds.includes(type.id)) {
            allTypes.push(type);
          }
        });
      });
      setSelectedPreferenceTypes(allTypes);

      // Optionally, set the currentPreference to the first one that matches
      if (allTypes.length > 0) {
        const firstType = allTypes[0];
        const parentPref = data.Preferences.find((pref) =>
          pref.types.some((type) => type.id === firstType.id)
        );
        setCurrentPreference(parentPref);
      }
    }
  }, [isEditMode, user, data]);

  return (
    <PageWrapper isLoading={isLoading}>
      <Box sx={containerStyles}>
        <Box sx={cardStyles}>
          <Box sx={{ position: "relative" }}>
            {isEditMode && (
              <IconButton
                onClick={() => navigate(-1)}
                sx={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  color: theme.palette.text.primary,
                  "&:hover": {
                    backgroundColor: theme.palette.background.neutral,
                  },
                }}
              >
                <Icon icon="mdi:arrow-left" fontSize={24} />
              </IconButton>
            )}
            <Typography
              variant="h3"
              sx={{ ...headerStyles, textAlign: "center" }}
            >
              Preferences
            </Typography>
          </Box>
          <Typography variant="body1" sx={descriptionStyles}>
            Choose at least 3 interests to connect with others who share the
            same.
          </Typography>

          <Typography variant="h4" sx={categoryHeaderStyles}>
            Categories:
          </Typography>
          <Box sx={categoryBoxStyles}>
            {data?.Preferences.map((preference) => (
              <Chip
                key={preference.id}
                label={preference.name}
                sx={{
                  ...chipStyles,
                  bgcolor:
                    currentPreference?.id === preference.id
                      ? theme.palette.primary.main
                      : theme.palette.background.neutral,
                  color:
                    currentPreference?.id === preference.id
                      ? theme.palette.primary.contrastText
                      : theme.palette.text.primary,
                  [theme.breakpoints.up("md")]: {
                    ":hover": {
                      bgcolor:
                        currentPreference?.id === preference.id
                          ? theme.palette.primary.dark
                          : "grey.400",
                    },
                  },
                  transition: "background-color 0.3s ease", // Smooth transition for background color
                }}
                clickable
                onClick={() => handleSelectPreference(preference)}
              />
            ))}
          </Box>

          <Divider sx={dividerStyles} />

          <Box sx={preferenceTypeChipBoxStyles}>
            {currentPreference?.types.map((type) => (
              <Chip
                key={type.id}
                label={type.name}
                onClick={() => handleSelectPreferenceType(type)}
                sx={{
                  ...chipStyles,
                  bgcolor: selectedPreferenceTypes.includes(type)
                    ? theme.palette.primary.main
                    : theme.palette.background.neutral,
                  color: selectedPreferenceTypes.includes(type)
                    ? theme.palette.primary.contrastText
                    : theme.palette.text.primary,
                  [theme.breakpoints.up("md")]: {
                    ":hover": {
                      bgcolor: selectedPreferenceTypes.includes(type)
                        ? theme.palette.primary.dark
                        : "grey.400",
                    },
                  },
                  transition: "background-color 0.3s ease", // Smooth transition for background color
                }}
                clickable
              />
            ))}
          </Box>

          <Box sx={selectedTypesBoxStyles} ref={boxRef}>
            {selectedPreferenceTypes.map((selected) => (
              <Chip
                key={selected.id}
                label={selected.name}
                sx={{
                  bgcolor: theme.palette.info.main,
                  color: theme.palette.primary.contrastText,
                  [theme.breakpoints.up("md")]: {
                    ":hover": {
                      bgcolor: theme.palette.grey[400],
                    },
                  },
                }}
                onDelete={() => handleDeleteInterest(selected)}
              />
            ))}
          </Box>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSubmit}
            sx={submitButtonStyles}
            endIcon={
              addPreferencesLoading && (
                <Icon
                  icon="material-symbols:autorenew"
                  style={{
                    animation: "spin 1s linear infinite",
                    fontSize: "24px",
                  }}
                />
              )
            }
          >
            Submit
          </Button>

          {isError ||
            (minSelectionError && (
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.error.main,
                  fontSize: "14px",
                  textAlign: "center",
                  mt: 1,
                }}
              >
                {selectedPreferenceTypes.length < 3 && minSelectionError
                  ? minSelectionError
                  : error
                  ? (error as any)?.message || "An unexpected error occurred."
                  : ""}
              </Typography>
            ))}
        </Box>
      </Box>
    </PageWrapper>
  );
}
