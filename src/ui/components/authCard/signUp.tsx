import React, { useState } from "react";
import { Box } from "@mui/material";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useDispatch } from "react-redux";
import { signupValidationSchema } from "../../validations/signUpFormValidations";
import { useSignupMutation } from "../../../services/auth/authApi";
import { setUser } from "../../../services/auth/authSlice";
import {
  resolvePostAuthNavigation,
  shouldSkipOnboardingAfterAuth,
} from "../../../utils/ticketPurchaseReturn";
import { tokens } from "../../../pages/events/invitation/tokens";
import { withAlpha } from "../../../pages/events/invitation/useColorExtraction";
import AuthTextField from "./TextField";
import PasswordField from "./PasswordField";
import AvatarUploader from "./AvatarUploader";
import AccountTypeTabs from "./AccountTypeTabs";
import TermsAndConditions from "./TermsAndConditions";
import AuthButton from "./AuthButton";

interface SignupFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  image: File | null;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif"];

const Signup: React.FC = () => {
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

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setAccountType(newValue);
  };

  const handleFileSelected = (file: File) => {
    formik.setFieldTouched("image", true, false);
    if (!ACCEPTED_TYPES.includes(file.type)) {
      formik.setErrors({ ...formik.errors, image: "Unsupported format" });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      formik.setFieldValue("image", file);
      formik.setFieldError("image", undefined);
    };
    reader.readAsDataURL(file);
  };

  const errorMessage = (err: unknown): string => {
    if (typeof err === "string") return err;
    return ((err as { message?: string })?.message) || "An unexpected error occurred.";
  };

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      {/* Avatar uploader inside a soft panel */}
      <Box
        sx={{
          background: tokens.color.iosFieldBg,
          borderRadius: "16px",
          py: 2.5,
          mb: 2.5,
        }}
      >
        <AvatarUploader
          imageUrl={image}
          onFileSelected={handleFileSelected}
          error={Boolean(formik.touched.image && formik.errors.image)}
          helperText={
            formik.touched.image && formik.errors.image
              ? String(formik.errors.image)
              : undefined
          }
        />
      </Box>

      <AccountTypeTabs
        accountType={accountType}
        onTabChange={handleTabChange}
      />

      <AuthTextField
        label="First name"
        placeholder="First name"
        autoComplete="given-name"
        startAdornment={<Icon icon="ph:user" width={20} />}
        {...formik.getFieldProps("firstName")}
        error={formik.touched.firstName && Boolean(formik.errors.firstName)}
        valid={
          formik.touched.firstName &&
          !formik.errors.firstName &&
          formik.values.firstName.trim().length > 0
        }
        helperText={formik.touched.firstName && formik.errors.firstName}
      />
      <AuthTextField
        label="Last name"
        placeholder="Last name"
        autoComplete="family-name"
        startAdornment={<Icon icon="ph:user" width={20} />}
        {...formik.getFieldProps("lastName")}
        error={formik.touched.lastName && Boolean(formik.errors.lastName)}
        valid={
          formik.touched.lastName &&
          !formik.errors.lastName &&
          formik.values.lastName.trim().length > 0
        }
        helperText={formik.touched.lastName && formik.errors.lastName}
      />
      <AuthTextField
        label="Email address"
        type="email"
        placeholder="Email address"
        autoComplete="email"
        startAdornment={<Icon icon="ph:envelope-simple" width={20} />}
        {...formik.getFieldProps("email")}
        error={formik.touched.email && Boolean(formik.errors.email)}
        valid={
          formik.touched.email &&
          !formik.errors.email &&
          formik.values.email.trim().length > 0
        }
        helperText={formik.touched.email && formik.errors.email}
      />
      <PasswordField
        label="Password"
        placeholder="Password (8+ chars)"
        autoComplete="new-password"
        startAdornment={<Icon icon="ph:lock" width={20} />}
        {...formik.getFieldProps("password")}
        error={formik.touched.password && Boolean(formik.errors.password)}
        valid={
          formik.touched.password &&
          !formik.errors.password &&
          formik.values.password.length > 0
        }
        helperText={formik.touched.password && formik.errors.password}
      />

      {isError ? (
        <Box
          sx={{
            mt: 1.5,
            px: 1.75,
            py: 1.25,
            borderRadius: "12px",
            background: withAlpha("#D14545", 0.08),
            border: `1px solid ${withAlpha("#D14545", 0.2)}`,
            color: "#9F2A2A",
            fontFamily: tokens.font.poppins,
            fontSize: 13,
            lineHeight: 1.45,
          }}
        >
          {errorMessage(error)}
        </Box>
      ) : null}

      <Box sx={{ mt: 2.5 }}>
        <AuthButton
          type="submit"
          label={isLoading ? "Creating account…" : "Create Account"}
          onClick={() => formik.handleSubmit()}
        />
      </Box>

      <Box sx={{ mt: 2 }}>
        <TermsAndConditions />
      </Box>
    </Box>
  );
};

export default Signup;
