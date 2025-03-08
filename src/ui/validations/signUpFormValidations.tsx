import * as Yup from "yup";

export const signupValidationSchema = Yup.object({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email address").required("Email is required"),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    image: Yup.mixed()
        .nullable()
        .required("Image is required")
        .test("fileSize", "File too large", (value) => !value || (value && value.toString().length <= 5000000)),
});
