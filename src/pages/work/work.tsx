import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, useTheme } from "@mui/material";
import { Icon } from "@iconify/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppSelector } from "../../redux/store";
import {
  useSaveUserPersonalInformationMutation,
  useGetAccountSettingInformationMutation,
  useDeleteUserPersonalInformationMutation,
} from "../../services/appconfiguration/configApi";
import { userSelector } from "../../services/auth/authSelectors";

interface Company {
  id: string;
  name: string;
  user_work_place_id?: number; // Original ID from backend for deletion
}

const Work: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get("mode") === "edit";

  // Redux selectors
  const user = useAppSelector(userSelector);

  // API mutations
  const [saveUserPersonalInformation] = useSaveUserPersonalInformationMutation();
  const [getAccountSettingInformation] = useGetAccountSettingInformationMutation();
  const [deleteUserPersonalInformation] = useDeleteUserPersonalInformationMutation();

  // Local state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Fetch existing user data if in edit mode
  useEffect(() => {
    if (isEditMode && user?.id) {
      const fetchUserData = async () => {
        try {
          const response = await getAccountSettingInformation({ user_id: user.id }).unwrap();
          if (response.success && response.user_information) {
            const userData = response.user_information;
            const companiesList: Company[] = [];

            // Check for existing companies from WorkPlaceInformation array
            if (userData.WorkPlaceInformation && Array.isArray(userData.WorkPlaceInformation)) {
              userData.WorkPlaceInformation.forEach((company: any, index: number) => {
                if (company && company.company_name) {
                  companiesList.push({
                    id: (index + 1).toString(),
                    name: company.company_name,
                    user_work_place_id: company.id || company.user_work_place_id, // Store original backend ID
                  });
                }
              });
            }

            setCompanies(companiesList);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUserData();
    }
  }, [isEditMode, user?.id, getAccountSettingInformation]);

  // Handle add company
  const handleAddCompany = () => {
    if (!newCompanyName.trim() || companies.length >= 3) return;

    const newCompany: Company = {
      id: (companies.length + 1).toString(),
      name: newCompanyName.trim(),
      // No user_work_place_id for new companies - they'll get one when saved
    };

    setCompanies((prev) => [...prev, newCompany]);
    setNewCompanyName("");
  };

  // Handle remove company
  const handleRemoveCompany = async (companyId: string) => {
    console.log("Removing company with ID:", companyId);
    console.log("Companies before removal:", companies);

    // Find the company to get its user_work_place_id
    const companyToRemove = companies.find((company) => company.id === companyId);

    if (companyToRemove?.user_work_place_id && user?.id) {
      try {
        // Call delete API first
        const deleteResponse = await deleteUserPersonalInformation({
          user_id: user.id,
          information_type: 0,
          user_work_place_id: companyToRemove.user_work_place_id,
        }).unwrap();

        if (deleteResponse.success) {
          console.log("Company deleted successfully from backend:", deleteResponse);
        } else {
          console.error("Failed to delete company from backend:", deleteResponse);
        }
      } catch (error) {
        console.error("Error deleting company from backend:", error);
        return; // Don't remove from UI if backend deletion failed
      }
    }

    setCompanies((prev) => {
      // Remove the company
      const filteredCompanies = prev.filter((company) => company.id !== companyId);
      console.log("Companies after filtering:", filteredCompanies);

      // Reorder the remaining companies to fill the gaps
      const reorderedCompanies = filteredCompanies.map((company, index) => ({
        ...company,
        id: (index + 1).toString(),
      }));
      console.log("Companies after reordering:", reorderedCompanies);

      return reorderedCompanies;
    });
  };

  // Handle next (save all companies and navigate)
  const handleNext = async () => {
    if (!user?.id) return;

    if (companies.length === 0) {
      // No companies, just navigate
      if (isEditMode) {
        navigate("/nearby?tab=people"); // Go back to preferences in edit mode
      } else {
        navigate("/preferences"); // Go to preferences for new users
      }
      return;
    }

    setIsSaving(true);
    try {
      // Prepare parameters for single API call
      const params: any = {
        information_type: 0,
        user_id: user.id,
      };

      // Only save companies that don't have user_work_place_id (new companies)
      const newCompanies = companies.filter((company) => !company.user_work_place_id);
      console.log("New companies to save:", newCompanies);

      if (newCompanies.length > 0) {
        // Set company names based on their order
        newCompanies.forEach((company, index) => {
          if (index === 0) params.first_company_name = company.name;
          else if (index === 1) params.second_company_name = company.name;
          else if (index === 2) params.third_company_name = company.name;
        });
      }

      console.log("API params:", params);

      // Single API call with all company names
      const response = await saveUserPersonalInformation(params).unwrap();

      if (response.success) {
        console.log("All companies saved successfully:", response);
        if (isEditMode) {
          navigate("/nearby?tab=people"); // Go back to preferences in edit mode
        } else {
          navigate("/preferences"); // Go to preferences for new users
        }
      } else {
        console.error("Failed to save companies:", response);
      }
    } catch (error) {
      console.error("Error saving companies:", error);
    } finally {
      setIsSaving(false);
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
        {isEditMode ? "Edit Work" : "Work"}
      </Typography>

      {/* Optional indicator */}
      <Typography
        variant="body1"
        sx={{
          color: theme.palette.grey[600],
          marginBottom: 6,
          textAlign: "center",
          fontSize: "16px",
        }}
      >
        (Optional)
      </Typography>

      {/* Companies Container */}
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
        {/* Existing Companies List */}
        {companies.map((company, index) => (
          <Box
            key={company.id}
            sx={{
              width: "100%",
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
              Company: {company.name}
            </Typography>
            <Icon
              icon="mdi:close-circle"
              style={{
                color: theme.palette.error.main,
                fontSize: "24px",
                cursor: "pointer",
                flexShrink: 0, // Prevent icon from shrinking
              }}
              onClick={() => handleRemoveCompany(company.id)}
            />
          </Box>
        ))}

        {/* Add New Company Input */}
        {companies.length < 3 && (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              gap: 2,
              alignItems: "flex-end",
            }}
          >
            <TextField
              fullWidth
              placeholder="Add company name"
              variant="standard"
              value={newCompanyName}
              onChange={(e) => setNewCompanyName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddCompany()}
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
            <Button
              variant="contained"
              onClick={handleAddCompany}
              disabled={!newCompanyName.trim()}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: "white",
                borderRadius: "8px",
                padding: "8px 16px",
                minWidth: "80px",
                height: "40px",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: theme.palette.primary.dark,
                },
                "&:disabled": {
                  backgroundColor: theme.palette.grey[400],
                },
              }}
            >
              Add
            </Button>
          </Box>
        )}
      </Box>

      {/* Next Button */}
      <Button
        variant="contained"
        onClick={handleNext}
        disabled={isSaving}
        fullWidth
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: "white",
          borderRadius: "40px",
          textTransform: "capitalize",
          padding: "10px",
          height: "60px",
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
        {isSaving ? (
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

export default Work;
