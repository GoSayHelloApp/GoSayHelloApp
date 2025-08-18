import React, { useState, useEffect } from "react";
import { Box, Typography, Button, useTheme, Chip } from "@mui/material";
import { Icon } from "@iconify/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppSelector } from "../../redux/store";
import {
  useSaveUserPersonalInformationMutation,
  useGetAccountSettingInformationMutation,
} from "../../services/appconfiguration/configApi";
import { userSelector } from "../../services/auth/authSelectors";

type EducationLevel = "High School" | "Undergrad" | "Post Grad" | "Prefer Not to Say";

const EducationLevel: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get("mode") === "edit";

  // Redux selectors
  const user = useAppSelector(userSelector);

  // API mutations
  const [saveUserPersonalInformation] = useSaveUserPersonalInformationMutation();
  const [getAccountSettingInformation] = useGetAccountSettingInformationMutation();

  // Local state
  const [selectedLevel, setSelectedLevel] = useState<EducationLevel | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch existing user data if in edit mode
  useEffect(() => {
    if (isEditMode && user?.id) {
      const fetchUserData = async () => {
        try {
          const response = await getAccountSettingInformation({ user_id: user.id }).unwrap();
          if (response.success && response.user_information) {
            const userData = response.user_information;
            if (userData.education_level) {
              setSelectedLevel(userData.education_level as EducationLevel);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUserData();
    }
  }, [isEditMode, user?.id, getAccountSettingInformation]);

  // Handle education level selection
  const handleLevelSelect = (level: EducationLevel) => {
    setSelectedLevel(level);
  };

  // Handle save
  const handleSave = async () => {
    if (!selectedLevel || !user?.id) return;

    setIsSaving(true);
    try {
      const response = await saveUserPersonalInformation({
        education_level: selectedLevel,
        information_type: 3,
        user_id: user.id,
      }).unwrap();

      if (response.success) {
        console.log("Education level saved successfully:", response);
        // Navigate based on mode
        if (isEditMode) {
          navigate("/nearby?tab=people"); // Go back to preferences in edit mode
        } else {
          navigate("/work"); // Go to next step for new users
        }
      } else {
        console.error("Failed to save education level:", response);
      }
    } catch (error) {
      console.error("Error saving education level:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle skip
  const handleSkip = () => {
    console.log("Skipping education level setup");
    // Navigate based on mode
    if (isEditMode) {
      navigate("/nearby?tab=people"); // Go back to preferences in edit mode
    } else {
      navigate("/work"); // Go to next step for new users
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
        {isEditMode ? "Edit Education Level" : "Education Level"}
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

      {/* Education Level Options Grid */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "400px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 2,
          mb: 6,
        }}
      >
        {/* High School */}
        <Chip
          label="High School"
          onClick={() => handleLevelSelect("High School")}
          sx={{
            height: "60px",
            fontSize: "16px",
            fontWeight: 500,
            backgroundColor: selectedLevel === "High School" ? theme.palette.primary.main : theme.palette.grey[300],
            color: selectedLevel === "High School" ? "white" : theme.palette.grey[700],
            "&:hover": {
              backgroundColor: selectedLevel === "High School" ? theme.palette.primary.dark : theme.palette.grey[400],
            },
          }}
        />

        {/* Undergrad */}
        <Chip
          label="Undergrad"
          onClick={() => handleLevelSelect("Undergrad")}
          sx={{
            height: "60px",
            fontSize: "16px",
            fontWeight: 500,
            backgroundColor: selectedLevel === "Undergrad" ? theme.palette.primary.main : theme.palette.grey[300],
            color: selectedLevel === "Undergrad" ? "white" : theme.palette.grey[700],
            "&:hover": {
              backgroundColor: selectedLevel === "Undergrad" ? theme.palette.primary.dark : theme.palette.grey[400],
            },
          }}
        />

        {/* Post Grad */}
        <Chip
          label="Post Grad"
          onClick={() => handleLevelSelect("Post Grad")}
          sx={{
            height: "60px",
            fontSize: "16px",
            fontWeight: 500,
            backgroundColor: selectedLevel === "Post Grad" ? theme.palette.primary.main : theme.palette.grey[300],
            color: selectedLevel === "Post Grad" ? "white" : theme.palette.grey[700],
            "&:hover": {
              backgroundColor: selectedLevel === "Post Grad" ? theme.palette.primary.dark : theme.palette.grey[400],
            },
          }}
        />

        {/* Prefer Not to Say */}
        <Chip
          label="Prefer Not to Say"
          onClick={() => handleLevelSelect("Prefer Not to Say")}
          sx={{
            height: "60px",
            fontSize: "16px",
            fontWeight: 500,
            backgroundColor:
              selectedLevel === "Prefer Not to Say" ? theme.palette.primary.main : theme.palette.grey[300],
            color: selectedLevel === "Prefer Not to Say" ? "white" : theme.palette.grey[700],
            "&:hover": {
              backgroundColor:
                selectedLevel === "Prefer Not to Say" ? theme.palette.primary.dark : theme.palette.grey[400],
            },
          }}
        />
      </Box>

      {/* Action Buttons */}
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
        {/* Save Button */}
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!selectedLevel || isSaving}
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: "white",
            borderRadius: "full",
            padding: "8px 16px",
            fontWeight: 600,
            fontSize: "16px",
            textTransform: "none",
            alignSelf: "flex-end",
            height: "40px",
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
            "Save"
          )}
        </Button>

        {/* Skip Button */}
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
            "&:hover": {
              backgroundColor: theme.palette.primary.dark,
            },
          }}
        >
          {isEditMode ? "Back" : "Skip"}
        </Button>
      </Box>
    </Box>
  );
};

export default EducationLevel;
