import React from "react";
import { Typography, useTheme, Link } from "@mui/material";

const TermsAndConditions: React.FC = () => {
    const theme = useTheme();

    return (
        <Typography variant="body2" color="textGray" fontWeight="medium" mb={3}>
            By signing up you are agreeing to our{" "}
            <Link
                href="https://www.gosayhelloapp.com/privacy-policy/"
                fontWeight="bold"
                fontSize={14}
                color={theme.palette.info.main}
                sx={{ cursor: "pointer" }}
                target="_blank"
                rel="noopener noreferrer"
            >
                Privacy Policy
            </Link>{" "}
            and{" "}
            <Link
                href="https://www.gosayhelloapp.com/terms-conditions/"
                fontWeight="bold"
                fontSize={14}
                color={theme.palette.info.main}
                sx={{ cursor: "pointer" }}
                target="_blank"
                rel="noopener noreferrer"
            >
                Terms of Use
            </Link>
        </Typography>
    );
};

export default TermsAndConditions;
