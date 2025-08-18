import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  useTheme,
  Autocomplete,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  FormControl,
  Select,
  InputLabel,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppSelector } from "../../redux/store";
import {
  useGetEducationalInstitutesMutation,
  useSaveUserPersonalInformationMutation,
  useGetAccountSettingInformationMutation,
} from "../../services/appconfiguration/configApi";
import { userSelector } from "../../services/auth/authSelectors";
import { debounce } from "lodash";

interface School {
  id: number;
  institute_name: string;
}

interface AddressPrivacyOption {
  id: number;
  label: string;
  description: string;
}

const BusinessInfo: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get("mode") === "edit";

  // Redux selectors
  const user = useAppSelector(userSelector);

  // API mutations
  const [getEducationalInstitutes, { data: schoolsData, isLoading: isSearching }] =
    useGetEducationalInstitutesMutation();
  const [saveUserPersonalInformation] = useSaveUserPersonalInformationMutation();
  const [getAccountSettingInformation] = useGetAccountSettingInformationMutation();

  // Local state
  const [description, setDescription] = useState("");
  const [websiteLink, setWebsiteLink] = useState("");
  const [businessType, setBusinessType] = useState<number | "">("");
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<School[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Address privacy menu
  const [addressMenuAnchor, setAddressMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedAddressPrivacy, setSelectedAddressPrivacy] = useState<AddressPrivacyOption | null>(null);

  const addressPrivacyOptions: AddressPrivacyOption[] = [
    { id: 1, label: "Only Me", description: "Only you can see this information" },
    { id: 3, label: "Public", description: "Everyone can see this information" },
    { id: 2, label: "Connections", description: "Your connections can see this information" },
  ];

  const businessTypeOptions = [
    { id: 1, label: "University/School" },
    { id: 2, label: "Other" },
  ];

  // Debounced search function for schools
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim() || !user?.id) {
        setSearchResults([]);
        return;
      }

      try {
        const response = await getEducationalInstitutes({ user_id: user.id }).unwrap();
        if (response.success && response.EducationalInstitutes) {
          // Filter schools based on search query
          const filteredSchools = response.EducationalInstitutes.filter((school: School) =>
            school.institute_name.toLowerCase().includes(query.toLowerCase())
          );
          setSearchResults(filteredSchools);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Error fetching schools:", error);
        setSearchResults([]);
      }
    }, 500),
    [getEducationalInstitutes, user?.id]
  );

  // Fetch existing user data if in edit mode
  useEffect(() => {
    if (isEditMode && user?.id) {
      const fetchUserData = async () => {
        try {
          const response = await getAccountSettingInformation({ user_id: user.id }).unwrap();
          console.log("API Response:", response);
          if (response.success && response.user_information) {
            const userData = response.user_information;
            console.log("User Data:", userData);

            // Check if AddressInformation exists and has data
            if (userData.AddressInformation && userData.AddressInformation.success) {
              const addressData = userData.AddressInformation;
              console.log("Address Data:", addressData);

              // Pre-fill form with existing data from AddressInformation
              if (addressData.description) {
                console.log("Setting description:", addressData.description);
                setDescription(addressData.description);
              }
              if (addressData.website_link) {
                console.log("Setting website:", addressData.website_link);
                setWebsiteLink(addressData.website_link);
              }
              if (addressData.business_type_id) {
                console.log("Setting business type:", addressData.business_type_id);
                setBusinessType(addressData.business_type_id);
              }
              if (addressData.institute_id) {
                console.log("Setting school:", addressData.institute_id, addressData.school_name);
                // Set the selected school using institute_id
                setSelectedSchool({ id: addressData.institute_id, institute_name: addressData.school_name || "" });
                setSearchQuery(addressData.school_name || "");
              }
              if (addressData.address_audience) {
                console.log("Setting address audience:", addressData.address_audience);
                const privacyOption = addressPrivacyOptions.find((opt) => opt.id === addressData.address_audience);
                if (privacyOption) setSelectedAddressPrivacy(privacyOption);
              }
            } else {
              console.log("No AddressInformation found or not successful");
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUserData();
    }
  }, [isEditMode, user?.id, getAccountSettingInformation]);

  // Cleanup debounced function
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Handle search input change
  const handleSearchChange = (newValue: string) => {
    setSearchQuery(newValue);
    debouncedSearch(newValue);
  };

  // Handle school selection
  const handleSchoolSelect = (school: School | null) => {
    setSelectedSchool(school);
    if (school) {
      setSearchQuery(school.institute_name);
    }
  };

  // Handle address privacy menu
  const handleAddressMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAddressMenuAnchor(event.currentTarget);
  };

  const handleAddressMenuClose = () => {
    setAddressMenuAnchor(null);
  };

  const handleAddressPrivacySelect = (option: AddressPrivacyOption) => {
    setSelectedAddressPrivacy(option);
    handleAddressMenuClose();
  };

  // Handle save
  const handleSave = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      const params: any = {
        information_type: 4,
        user_id: user.id,
        is_public: 0,
        update_address: 1,
        // Business info parameters
        address_audience: selectedAddressPrivacy ? selectedAddressPrivacy.id : "",
        business_type_id: businessType || "",
        description: description || "",
        website_link: websiteLink || "",
        education_id: selectedSchool ? selectedSchool.id : "",
        // Location parameters
        address_lat: 0.0,
        address_long: 0.0,
        city: "cityfix",
        country_id: 1,
        country_name: "country_namefix",
        state: "statefix",
      };

      console.log("API params:", params);

      const response = await saveUserPersonalInformation(params).unwrap();

      if (response.success) {
        console.log("Business info saved successfully:", response);
        if (isEditMode) {
          navigate("/nearby?tab=people");
        } else {
          navigate("/preferences");
        }
      } else {
        console.error("Failed to save business info:", response);
      }
    } catch (error) {
      console.error("Error saving business info:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle skip
  const handleSkip = () => {
    if (isEditMode) {
      navigate("/nearby?tab=people");
    } else {
      navigate("/preferences");
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
        {isEditMode ? "Edit Business Info" : "Business Info"}
      </Typography>

      {/* Form Container */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "400px",
          display: "flex",
          flexDirection: "column",
          gap: 3,
          alignItems: "center",
        }}
      >
        {/* Address Field with Privacy Options */}
        <Box sx={{ width: "100%", position: "relative" }}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              marginBottom: 1,
              color: theme.palette.text.primary,
            }}
          >
            Address
          </Typography>

          {/* Clickable Address Field */}
          <Box
            sx={{
              width: "100%",
              height: "56px",
              borderRadius: "8px",
              border: `1px solid ${theme.palette.grey[300]}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 16px",
              cursor: "pointer",
              "&:hover": {
                borderColor: theme.palette.primary.main,
              },
            }}
            onClick={handleAddressMenuOpen}
          >
            <Typography
              variant="body1"
              color={selectedAddressPrivacy ? "text.primary" : "text.secondary"}
              sx={{ fontWeight: selectedAddressPrivacy ? 500 : 400 }}
            >
              {selectedAddressPrivacy ? selectedAddressPrivacy.label : "Address"}
            </Typography>
            <Icon icon="mdi:dots-vertical" fontSize={20} color={theme.palette.grey[600]} />
          </Box>
        </Box>

        {/* Address Privacy Menu */}
        <Menu
          anchorEl={addressMenuAnchor}
          open={Boolean(addressMenuAnchor)}
          onClose={handleAddressMenuClose}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 250,
              boxShadow: theme.shadows[3],
              borderRadius: 2,
              border: `2px solid ${theme.palette.primary.main}`,
            },
          }}
        >
          {addressPrivacyOptions.map((option) => (
            <MenuItem
              key={option.id}
              onClick={() => handleAddressPrivacySelect(option)}
              sx={{
                py: 1.5,
                px: 2,
                backgroundColor: "transparent",
                "&:hover": {
                  backgroundColor: theme.palette.primary.lighter,
                },
                "&.Mui-selected": {
                  backgroundColor: "transparent",
                },
                "&.Mui-selected:hover": {
                  backgroundColor: theme.palette.primary.lighter,
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 500,
                    color: theme.palette.text.primary,
                  }}
                >
                  {option.label}
                </Typography>

                {/* Radio Button */}
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    border: `2px solid ${theme.palette.grey[400]}`,
                    backgroundColor:
                      selectedAddressPrivacy?.id === option.id ? theme.palette.primary.main : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {selectedAddressPrivacy?.id === option.id && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: "white",
                      }}
                    />
                  )}
                </Box>
              </Box>
            </MenuItem>
          ))}
        </Menu>

        {/* Description Field */}
        <TextField
          fullWidth
          placeholder="Description"
          variant="outlined"
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              backgroundColor: theme.palette.background.paper,
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.primary.main,
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.primary.main,
              },
            },
          }}
        />

        {/* Website Link Field */}
        <TextField
          fullWidth
          placeholder="Website Link(start with https://)"
          variant="outlined"
          value={websiteLink}
          onChange={(e) => setWebsiteLink(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              backgroundColor: theme.palette.background.paper,
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.primary.main,
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.primary.main,
              },
            },
          }}
        />

        {/* Business Type Selection */}
        <FormControl fullWidth required>
          <InputLabel>Select Business Type</InputLabel>
          <Select
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value as number)}
            label="Select Business Type"
            sx={{
              borderRadius: "8px",
              backgroundColor: theme.palette.background.paper,
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.primary.main,
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.primary.main,
              },
            }}
          >
            {businessTypeOptions.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* School/University Search Field */}
        <Autocomplete
          fullWidth
          options={searchResults}
          getOptionLabel={(option) => option.institute_name}
          loading={isSearching}
          inputValue={searchQuery}
          onInputChange={(_, newValue) => {
            handleSearchChange(newValue);
          }}
          onChange={(_, newValue) => {
            handleSchoolSelect(newValue);
          }}
          value={selectedSchool}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search School/University"
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  backgroundColor: theme.palette.background.paper,
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.palette.primary.main,
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
            />
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <Typography variant="body1">{option.institute_name}</Typography>
            </Box>
          )}
          noOptionsText="No schools found"
        />
      </Box>

      {/* Buttons Container */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "400px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          marginTop: 4,
          alignItems: "flex-end",
        }}
      >
        {/* Save Button */}
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSaving || !businessType || !selectedAddressPrivacy}
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: "white",
            borderRadius: "full",
            textTransform: "capitalize",
            padding: "8px 16px",
            minWidth: "80px",
            height: "40px",
            fontWeight: 600,
          }}
        >
          {isSaving ? (
            <Icon
              icon="material-symbols:autorenew"
              style={{
                animation: "spin 1s linear infinite",
                fontSize: "20px",
              }}
            />
          ) : (
            "Save"
          )}
        </Button>

        {/* Skip Button */}
        <Button
          variant="outlined"
          onClick={handleSkip}
          fullWidth
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: "white",
            borderRadius: "40px",
            textTransform: "capitalize",
            padding: "10px",
            height: "40px",
            fontWeight: 600,
          }}
        >
          {isEditMode ? "Back" : "Skip"}
        </Button>
      </Box>
    </Box>
  );
};

export default BusinessInfo;
