import React, { useState } from "react";
import { Box } from "@mui/material";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useDispatch } from "react-redux";
import {
  ForgotPasswordValidationSchema,
  loginValidationSchema,
} from "../../validations/loginFormValidations";
import {
  useForgotPasswordMutation,
  useLoginMutation,
} from "../../../services/auth/authApi";
import {
  ForgotPasswordRequest,
  UserLoginRequest,
} from "../../../models/requestModels/user";
import { setUser } from "../../../services/auth/authSlice";
import { resolvePostAuthNavigation } from "../../../utils/ticketPurchaseReturn";
import { tokens } from "../../../pages/events/invitation/tokens";
import { withAlpha } from "../../../pages/events/invitation/useColorExtraction";
import AuthTextField from "./TextField";
import PasswordField from "./PasswordField";
import AuthButton from "./AuthButton";
import TermsAndConditions from "./TermsAndConditions";

interface LoginFormValues {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [login, { isLoading, error, isError }] = useLoginMutation();
  const [
    forgotPassword,
    {
      isLoading: isForgotLoading,
      isSuccess,
      isError: isForgotError,
      error: forgotError,
      data: forgotPasswordResponse,
    },
  ] = useForgotPasswordMutation();
  console.log(
    isForgotLoading,
    isSuccess,
    isForgotError,
    forgotError,
    forgotPasswordResponse
  );

  const handleLogin = (values: LoginFormValues) => {
    const loginData: UserLoginRequest = {
      email: values.email,
      password: values.password,
    };

    login(loginData)
      .unwrap()
      .then((response) => {
        console.log("User logged in:", response);
        dispatch(setUser(response));
        navigate(resolvePostAuthNavigation(response.UserPreferences));
      })
      .catch((error) => {
        console.error("Login failed:", error);
      });
  };

  const handleForgotPassword = async (email: string) => {
    try {
      const request: ForgotPasswordRequest = { email };
      await forgotPassword(request).unwrap();
    } catch (error) {
      // surfaced through isForgotError
    }
  };

  const forgotPasswordFormik = useFormik({
    initialValues: { email: "" },
    validationSchema: ForgotPasswordValidationSchema,
    onSubmit: (values) => handleForgotPassword(values.email),
  });

  const formik = useFormik<LoginFormValues>({
    initialValues: { email: "", password: "" },
    validationSchema: loginValidationSchema,
    onSubmit: handleLogin,
  });

  const errorMessage = (err: unknown): string => {
    if (typeof err === "string") return err;
    return ((err as { message?: string })?.message) || "An unexpected error occurred.";
  };

  if (forgotPasswordMode) {
    return (
      <Box component="form" onSubmit={forgotPasswordFormik.handleSubmit}>
        <Box
          sx={{
            fontFamily: tokens.font.poppins,
            fontSize: 20,
            fontWeight: 600,
            color: tokens.color.inkPrimary,
            mb: 0.5,
          }}
        >
          Reset password
        </Box>
        <Box
          sx={{
            fontFamily: tokens.font.poppins,
            fontSize: 14,
            color: tokens.color.inkSecondary,
            mb: 2.5,
          }}
        >
          Enter your email and we'll send you a reset link.
        </Box>

        <AuthTextField
          label="Email address"
          type="email"
          placeholder="Email address"
          autoComplete="email"
          startAdornment={<Icon icon="ph:envelope-simple" width={20} />}
          {...forgotPasswordFormik.getFieldProps("email")}
          error={
            forgotPasswordFormik.touched.email &&
            Boolean(forgotPasswordFormik.errors.email)
          }
          valid={
            forgotPasswordFormik.touched.email &&
            !forgotPasswordFormik.errors.email &&
            forgotPasswordFormik.values.email.trim().length > 0
          }
          helperText={
            forgotPasswordFormik.touched.email && forgotPasswordFormik.errors.email
          }
        />

        {isForgotError ? (
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
            {errorMessage(forgotError)}
          </Box>
        ) : null}
        {isSuccess ? (
          <Box
            sx={{
              mt: 1.5,
              px: 1.75,
              py: 1.25,
              borderRadius: "12px",
              background: withAlpha(tokens.color.brandOrange, 0.08),
              border: `1px solid ${withAlpha(tokens.color.brandOrange, 0.25)}`,
              color: tokens.color.brandOrangeDark,
              fontFamily: tokens.font.poppins,
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            {forgotPasswordResponse?.message || "Email sent successfully"}
          </Box>
        ) : null}

        <Box sx={{ mt: 2.5 }}>
          <AuthButton
            type="submit"
            label={isForgotLoading ? "Sending…" : "Reset password"}
            onClick={() => forgotPasswordFormik.handleSubmit()}
          />
        </Box>

        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Box
            component="button"
            type="button"
            onClick={() => setForgotPasswordMode(false)}
            sx={{
              appearance: "none",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              p: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              fontFamily: tokens.font.poppins,
              fontSize: 14,
              fontWeight: 600,
              color: tokens.color.inkSecondary,
              outline: "none",
              WebkitTapHighlightColor: "transparent",
              transition: `color 200ms ${tokens.motion.swift}`,
              "& .back": {
                transition: `transform 220ms ${tokens.motion.swift}`,
                display: "inline-flex",
              },
              "&:hover, &:focus-visible": {
                color: tokens.color.brandOrange,
              },
              "&:hover .back, &:focus-visible .back": {
                transform: "translateX(-3px)",
              },
            }}
          >
            <Box component="span" className="back">
              <Icon icon="ph:arrow-left-bold" width={12} />
            </Box>
            Back to sign in
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
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
        placeholder="Password"
        autoComplete="current-password"
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

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0.25, mb: 2.5 }}>
        <Box
          component="button"
          type="button"
          onClick={() => setForgotPasswordMode(true)}
          sx={{
            appearance: "none",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            p: 0,
            fontFamily: tokens.font.poppins,
            fontSize: 14,
            fontWeight: 600,
            color: tokens.color.brandOrange,
            outline: "none",
            WebkitTapHighlightColor: "transparent",
            transition: `opacity 200ms ${tokens.motion.swift}`,
            "&:hover, &:focus-visible": {
              opacity: 0.7,
            },
          }}
        >
          Forgot password?
        </Box>
      </Box>

      {isError ? (
        <Box
          sx={{
            mb: 2,
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

      <AuthButton
        type="submit"
        label={isLoading ? "Signing in…" : "Sign In"}
        onClick={() => formik.handleSubmit()}
      />

      <Box sx={{ mt: 2 }}>
        <TermsAndConditions />
      </Box>
    </Box>
  );
};

export default Login;
