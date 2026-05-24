import React, { useState } from "react";
import { Box } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import Signup from "../../ui/components/authCard/signUp";
import Login from "../../ui/components/authCard/login";
import AuthLayout from "../../ui/components/authCard/AuthLayout";
import AuthTabs from "../../ui/components/authCard/AuthTabs";
import AuthCardHeader from "../../ui/components/authCard/AuthCardHeader";
import CyclingTagline from "../../ui/components/authCard/CyclingTagline";
import { tokens } from "../events/invitation/tokens";

const Auth: React.FC = () => {
  const [searchParams] = useSearchParams();
  // 0 = Sign Up, 1 = Login — preserved from previous behavior
  const [value, setValue] = useState(
    searchParams.get("signup") === "1" ? 0 : 1
  );

  const isSignup = value === 0;

  return (
    <AuthLayout
      headline={
        isSignup ? (
          <>
            Join the{" "}
            <Box component="span" sx={{ color: tokens.color.brandOrange }}>
              room
            </Box>
            .
          </>
        ) : (
          <>
            Where strangers
            <br />
            become{" "}
            <Box component="span" sx={{ color: tokens.color.brandOrange }}>
              stories
            </Box>
            .
          </>
        )
      }
      body={
        <>
          Real people, real places — within a minute's walk. Welcome to
          GoSayHELLO.
        </>
      }
    >
      <AuthCardHeader />
      <AuthTabs
        value={value}
        onChange={(v) => setValue(v)}
        options={["Create account", "Sign in"]}
      />
      <CyclingTagline />
      {isSignup ? <Signup /> : <Login />}
    </AuthLayout>
  );
};

export default Auth;
