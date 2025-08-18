import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, TextField, Button, useTheme, Autocomplete } from "@mui/material";
import { Icon } from "@iconify/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppSelector } from "../../redux/store";
import {
  useGetEducationalInstitutesMutation,
  useSaveUserPersonalInformationMutation,
  useGetAccountSettingInformationMutation,
  useDeleteUserPersonalInformationMutation,
} from "../../services/appconfiguration/configApi";
import { userSelector } from "../../services/auth/authSelectors";
import { debounce } from "lodash";

interface School {
  id: number;
  institute_name: string;
  user_school_info_id?: number; // Original ID from backend for deletion
}

const School: React.FC = () => {
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
  const [deleteUserPersonalInformation] = useDeleteUserPersonalInformationMutation();

  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedSchools, setSelectedSchools] = useState<School[]>([]);

  // Debounced search function
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
          if (response.success && response.user_information) {
            const userData = response.user_information;
            const schools: School[] = [];

            // Check for existing schools from SchoolInformation array
            if (userData.SchoolInformation && Array.isArray(userData.SchoolInformation)) {
              userData.SchoolInformation.forEach((school: any, index: number) => {
                if (school && school.institute_name) {
                  schools.push({
                    id: index + 1,
                    institute_name: school.institute_name,
                    user_school_info_id: school.id || school.user_school_info_id, // Store original backend ID
                  });
                }
              });
            }

            setSelectedSchools(schools);
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

  // Handle add school
  const handleAddSchool = async () => {
    if (!selectedSchool || !user?.id) return;

    // Check if we already have 3 schools
    if (selectedSchools.length >= 3) {
      console.log("Maximum 3 schools allowed");
      return;
    }

    // Create new school with sequential ID and no backend ID
    const newSchool: School = {
      id: selectedSchools.length + 1,
      institute_name: selectedSchool.institute_name,
      // No user_school_info_id for new schools - they'll get one when saved
    };

    // Add school to the list
    setSelectedSchools((prev) => [...prev, newSchool]);

    // Clear the search and selection
    setSearchQuery("");
    setSelectedSchool(null);
    setSearchResults([]);
  };

  // Handle remove school
  const handleRemoveSchool = async (schoolToRemove: School) => {
    console.log("Removing school with ID:", schoolToRemove.id);
    console.log("Schools before removal:", selectedSchools);

    // Find the school to get its user_school_info_id
    const schoolToRemoveWithBackendId = selectedSchools.find((school) => school.id === schoolToRemove.id);

    if (schoolToRemoveWithBackendId?.user_school_info_id && user?.id) {
      try {
        // Call delete API first
        const deleteResponse = await deleteUserPersonalInformation({
          user_id: user.id,
          information_type: 2,
          user_school_info_id: schoolToRemoveWithBackendId.user_school_info_id,
        }).unwrap();

        if (deleteResponse.success) {
          console.log("School deleted successfully from backend:", deleteResponse);
        } else {
          console.error("Failed to delete school from backend:", deleteResponse);
          return; // Don't remove from UI if backend deletion failed
        }
      } catch (error) {
        console.error("Error deleting school from backend:", error);
        return; // Don't remove from UI if backend deletion failed
      }
    }

    setSelectedSchools((prev) => {
      // Remove the school
      const filteredSchools = prev.filter((school) => school.id !== schoolToRemove.id);
      console.log("Schools after filtering:", filteredSchools);

      // Reorder the remaining schools to fill the gaps
      const reorderedSchools = filteredSchools.map((school, index) => ({
        ...school,
        id: index + 1,
      }));
      console.log("Schools after reordering:", reorderedSchools);

      return reorderedSchools;
    });
  };

  // Handle next (save all schools and navigate)
  const handleNext = async () => {
    if (!user?.id) return;

    if (selectedSchools.length === 0) {
      // No schools selected, just navigate
      navigate("/education-level");
      return;
    }

    setIsAdding(true);
    try {
      // Only save schools that don't have user_school_info_id (new schools)
      const newSchools = selectedSchools.filter((school) => !school.user_school_info_id);
      console.log("New schools to save:", newSchools);

      if (newSchools.length > 0) {
        // Save new schools
        const promises = newSchools.map((school, index) => {
          const schoolParam = index === 0 ? "first_school" : index === 1 ? "second_school" : "third_school";

          return saveUserPersonalInformation({
            [schoolParam]: school.institute_name,
            information_type: 2,
            user_id: user.id,
          }).unwrap();
        });

        await Promise.all(promises);
        console.log("New schools saved successfully");
      }

      // Navigate based on mode
      if (isEditMode) {
        navigate("/nearby?tab=people"); // Go back to preferences in edit mode
      } else {
        navigate("/education-level"); // Go to next step for new users
      }
    } catch (error) {
      console.error("Error saving schools:", error);
    } finally {
      setIsAdding(false);
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
        {isEditMode ? "Edit Schools" : "School"}
      </Typography>

      {/* Optional indicator */}
      <Typography
        variant="body1"
        sx={{
          color: theme.palette.grey[600],
          marginBottom: 4,
          textAlign: "center",
          fontSize: "16px",
        }}
      >
        (Optional)
      </Typography>

      {/* Search Container */}
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
        {/* Selected Schools List */}
        {selectedSchools.length > 0 && (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mb: 3,
            }}
          >
            {selectedSchools.map((school, index) => (
              <Box
                key={school.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: "8px",
                  border: `1px solid ${theme.palette.grey[200]}`,
                  gap: 2, // Ensure space between text and icon
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    flex: 1, // Take available space
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    minWidth: 0, // Allow flex item to shrink below content size
                  }}
                >
                  School: {school.institute_name}
                </Typography>
                <Icon
                  icon="mdi:close-circle"
                  style={{
                    color: theme.palette.error.main,
                    fontSize: "24px",
                    cursor: "pointer",
                    flexShrink: 0, // Prevent icon from shrinking
                  }}
                  onClick={() => handleRemoveSchool(school)}
                />
              </Box>
            ))}
          </Box>
        )}

        {/* Search Input and Add Button */}
        <Box
          sx={{
            display: "flex",
            width: "100%",
            gap: 2,
            alignItems: "flex-end",
          }}
        >
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
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Search school name"
                variant="standard"
                sx={{
                  "& .MuiInput-underline:before": {
                    borderBottomColor: theme.palette.grey[300],
                  },
                  "& .MuiInput-underline:after": {
                    borderBottomColor: theme.palette.primary.main,
                  },
                  "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                    borderBottomColor: theme.palette.grey[400],
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
            sx={{ flex: 1 }}
          />

          {/* Add Button */}
          <Button
            variant="contained"
            onClick={handleAddSchool}
            disabled={!selectedSchool || isAdding || selectedSchools.length >= 3}
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: "white",
              borderRadius: "8px",
              padding: "8px 16px",
              minWidth: "80px",
              height: "40px",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {isAdding ? (
              <Icon
                icon="material-symbols:autorenew"
                style={{
                  animation: "spin 1s linear infinite",
                  fontSize: "20px",
                }}
              />
            ) : (
              "Add"
            )}
          </Button>
        </Box>
      </Box>

      {/* Next Button */}
      <Button
        variant="contained"
        onClick={handleNext}
        disabled={isAdding}
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
          "&:disabled": {
            backgroundColor: theme.palette.grey[400],
          },
        }}
      >
        {isAdding ? (
          <Icon
            icon="material-symbols:autorenew"
            style={{
              animation: "spin 1s linear infinite",
              fontSize: "20px",
            }}
          />
        ) : isEditMode ? (
          "Update"
        ) : (
          "Next"
        )}
      </Button>
    </Box>
  );
};

export default School;
