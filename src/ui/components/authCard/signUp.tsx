import React, { useState } from "react";
import { TextField, Button, Typography, Box, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { signupValidationSchema } from "../../validations/signUpFormValidations";
import TermsAndConditions from "./TermsAndConditions";
import AccountTypeTabs from "./AccountTypeTabs";
import { useSignupMutation } from "../../../services/auth/authApi";
import { Icon } from "@iconify/react";
import { useDispatch } from "react-redux";
import { setUser } from "../../../services/auth/authSlice";
import { resolvePostAuthNavigation, shouldSkipOnboardingAfterAuth } from "../../../utils/ticketPurchaseReturn";

interface SignupFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  image: File | null;
}

const Signup: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState(0);
  const [image, setImage] = useState<string | null>(null);
  const [signup, { isLoading, error, isError }] = useSignupMutation();

  const handleSubmit = (values: SignupFormValues) => {
    const formData = new FormData();
    formData.append("first_name", values.firstName);
    formData.append("last_name", values.lastName);
    formData.append("email", values.email);
    formData.append("password", values.password);
    formData.append("password_confirmation", values.password);
    if (values.image) {
      formData.append("profile_image", values.image);
    }
    // Add business profile flag based on account type
    formData.append("is_business_profile", accountType === 1 ? "1" : "0");

    signup(formData)
      .unwrap()
      .then((response) => {
        dispatch(setUser(response));
        if (shouldSkipOnboardingAfterAuth()) {
          navigate(resolvePostAuthNavigation(response.UserPreferences));
          return;
        }
        if (accountType === 1) {
          navigate("/business-info");
        } else {
          navigate("/home-town");
        }
      })
      .catch((error) => {
        console.error("Signup failed:", error);
      });
  };

  const formik = useFormik<SignupFormValues>({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      image: null,
    },
    validationSchema: signupValidationSchema,
    onSubmit: handleSubmit,
  });

  const handleBoxClick = () => {
    document.getElementById("image-upload-input")?.click();
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setAccountType(newValue);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    formik.touched.image = true;
    const file = event.target.files?.[0];
    if (file) {
      if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
        formik.setErrors({ ...formik.errors, image: "Unsupported format" });
        console.log(formik.errors);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        formik.setFieldValue("image", file);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <Box
          sx={{
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            justifyItems: "center",
          }}
        >
          <Box
            onClick={handleBoxClick}
            sx={{
              width: {
                xs: "120px",
                sm: "120px",
                md: "150px",
              },
              height: {
                xs: "120px",
                sm: "120px",
                md: "150px",
              },

              borderRadius: "8px",
              border: `2px solid ${theme.palette.text.disabled}`,
              mt: 3,
              mb: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme.palette.text.secondary,
              cursor: "pointer",
              backgroundColor: image ? "transparent" : theme.palette.text.disabled,
              margin: "0 auto", // Ensures horizontal centering
              position: "relative", // Allows for better alignment control
            }}
          >
            {image ? (
              <img
                src={image}
                alt="Uploaded preview"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
            ) : (
              <Typography sx={{ py: 2 }} color={theme.palette.info.contrastText}>
                Choose photo
              </Typography>
            )}
            <input
              id="image-upload-input"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
          </Box>
          {formik.touched.image && formik.errors.image && (
            <Typography color="error" mb={3} variant="body2">
              {formik.errors.image}
            </Typography>
          )}

          <TextField
            label="First name"
            variant="outlined"
            fullWidth
            sx={{
              mb: 2,
              mt: 2,
            }}
            {...formik.getFieldProps("firstName")}
            error={formik.touched.firstName && Boolean(formik.errors.firstName)}
            helperText={formik.touched.firstName && formik.errors.firstName}
          />
          <TextField
            label="Last name"
            variant="outlined"
            fullWidth
            sx={{
              mb: 2,
            }}
            {...formik.getFieldProps("lastName")}
            error={formik.touched.lastName && Boolean(formik.errors.lastName)}
            helperText={formik.touched.lastName && formik.errors.lastName}
          />
          <TextField
            label="Your email"
            type="email"
            variant="outlined"
            fullWidth
            sx={{
              mb: 2,
            }}
            {...formik.getFieldProps("email")}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
          <TextField
            label="Your password"
            type="password"
            variant="outlined"
            fullWidth
            sx={{
              mb: 3,
            }}
            {...formik.getFieldProps("password")}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
          <AccountTypeTabs accountType={accountType} onTabChange={handleTabChange} />
          <TermsAndConditions />
        </Box>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          endIcon={
            isLoading && (
              <Icon
                icon="material-symbols:autorenew"
                style={{
                  animation: "spin 1s linear infinite",
                  fontSize: "24px",
                }}
              />
            )
          }
          sx={{
            borderRadius: "40px",
            textTransform: "capitalize",
            borderColor: "black",
            padding: "10px",
            height: "60px",
          }}
        >
          Sign Up
        </Button>
        {isError && (
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.error.main,
              fontSize: "14px",
              textAlign: "center",
              mt: 1,
            }}
          >
            {typeof error === "string" ? error : (error as any)?.message || "An unexpected error occurred."}
          </Typography>
        )}
      </form>
    </>
  );
};

export default Signup;
