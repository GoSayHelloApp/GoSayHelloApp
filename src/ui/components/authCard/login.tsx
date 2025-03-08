import React, { useState } from "react";
import { TextField, Button, Typography, Box, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { ForgotPasswordValidationSchema, loginValidationSchema } from "../../validations/loginFormValidations";
import { useForgotPasswordMutation, useLoginMutation } from "../../../services/auth/authApi";
import { Icon } from "@iconify/react";
import { ForgotPasswordRequest, UserLoginRequest } from "../../../models/requestModels/user";
import { useDispatch } from "react-redux";
import { setUser } from "../../../services/auth/authSlice";

interface LoginFormValues {
    email: string;
    password: string;
}

const Login: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
    const [login, { isLoading, error, isError }] = useLoginMutation();
    const [forgotPassword, { isLoading: isForgotLoading, isSuccess, isError: isForgotError, error: forgotError, data: forgotPasswordResponse }] = useForgotPasswordMutation();
    console.log(isForgotLoading, isSuccess, isForgotError, forgotError, forgotPasswordResponse)
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
                if (response.UserPreferences.length >= 3) {
                    navigate("/nearby");
                }
                else {
                    navigate("/preferences");
                }

            })
            .catch((error) => {
                console.error("Login failed:", error);
            });
    };

    const handleForgotPassword = async (email: string) => {
        try {
            const request: ForgotPasswordRequest = {
                email: email
            }
            await forgotPassword(request).unwrap();
        } catch (error) {
        }
    };

    const forgotPasswordFormik = useFormik({
        initialValues: {
            email: "",
        },
        validationSchema: ForgotPasswordValidationSchema,
        onSubmit: (values) => {
            handleForgotPassword(values.email);
        },
    });

    const formik = useFormik<LoginFormValues>({
        initialValues: {
            email: "",
            password: "",
        },
        validationSchema: loginValidationSchema,
        onSubmit: handleLogin,
    });

    return (
        <>
            {forgotPasswordMode ? (
                <form onSubmit={forgotPasswordFormik.handleSubmit}>
                    <Typography variant="h3" fontWeight="semiBold" mb={3} mt={5}>
                        Forgot Password
                    </Typography>
                    <Typography variant="body2" fontWeight="semibold" sx={{ fontSize: "20px" }} color="textSecondary" mb={4}>
                        Enter your email to reset your password.
                    </Typography>
                    <TextField
                        label="Your email"
                        type="email"
                        variant="outlined"
                        fullWidth
                        sx={{
                            mb: 2,
                        }}
                        {...forgotPasswordFormik.getFieldProps("email")}
                        error={forgotPasswordFormik.touched.email && Boolean(forgotPasswordFormik.errors.email)}
                        helperText={forgotPasswordFormik.touched.email && forgotPasswordFormik.errors.email}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        endIcon={isForgotLoading && <Icon icon="material-symbols:autorenew" style={{
                            animation: "spin 1s linear infinite",
                            fontSize: "24px",
                        }} />}
                        sx={{
                            borderRadius: "40px",
                            textTransform: "capitalize",
                            padding: "10px",
                            height: "60px",
                        }}
                    >
                        Reset Password
                    </Button>
                    <Button
                        variant="text"
                        color="primary"
                        onClick={() => setForgotPasswordMode(false)}
                        fullWidth
                        sx={{
                            borderRadius: "40px",
                            textTransform: "capitalize",
                            padding: "10px",
                            height: "60px",
                            marginTop: "20px"
                        }}
                    >
                        Back to Login
                    </Button>
                    {isForgotError && (
                        <Typography
                            variant="body2"
                            sx={{
                                color: theme.palette.error.main,
                                fontSize: "14px",
                                textAlign: "center",
                                mt: 1,
                            }}
                        >
                            {typeof forgotError === "string"
                                ? forgotError
                                : (forgotError as any)?.message || "An unexpected error occurred."}
                        </Typography>
                    )}
                    {isSuccess && (
                        <Typography
                            variant="body2"
                            sx={{
                                color: theme.palette.error.main,
                                fontSize: "14px",
                                textAlign: "center",
                                mt: 1,
                            }}
                        >
                            {isSuccess ? forgotPasswordResponse?.message || "Email sent successfully" : typeof forgotError === "string"
                                ? forgotError
                                : (forgotError as any)?.message || "An unexpected error occurred."}
                        </Typography>
                    )}
                </form>
            ) : (
                <form onSubmit={formik.handleSubmit}>
                    <Typography variant="h3" fontWeight="semiBold" mb={3} mt={5}>
                        Welcome Back
                    </Typography>
                    <Typography variant="body2" fontWeight="semibold" sx={{ fontSize: "20px" }} color="textSecondary" mb={4}>
                        Sign in using your email to continue.
                    </Typography>
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
                            mb: 1,
                        }}
                        {...formik.getFieldProps("password")}
                        error={formik.touched.password && Boolean(formik.errors.password)}
                        helperText={formik.touched.password && formik.errors.password}
                    />
                    <Typography
                        variant="body2"
                        fontWeight="medium"
                        sx={{ fontSize: "12px", textAlign: "left", paddingLeft: '10px', cursor: "pointer" }}
                        color="textPrimary"
                        mb={2}
                        onClick={() => setForgotPasswordMode(true)}
                    >
                        Forget Password?
                    </Typography>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        endIcon={isLoading && <Icon icon="material-symbols:autorenew" style={{
                            animation: "spin 1s linear infinite",
                            fontSize: "24px",
                        }} />}
                        sx={{
                            borderRadius: "40px",
                            textTransform: "capitalize",
                            padding: "10px",
                            height: "60px",
                        }}
                    >
                        Login
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
                            {typeof error === "string"
                                ? error
                                : (error as any)?.message || "An unexpected error occurred."}
                        </Typography>
                    )}
                </form>
            )}
        </>
    );
};

export default Login;
