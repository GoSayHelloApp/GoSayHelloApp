import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  CircularProgress,
  Stack,
  Alert,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { useAppSelector } from "../../redux/store";
import Loader from "../../ui/components/core/screenLoader";
import {
  useGetReportReasonsMutation,
  useReportUserMutation,
} from "../../services/privacy/privacyApi";

interface Reason {
  reason_id: number;
  reason: string;
}

const ReportUser: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const user = useAppSelector((state) => state.auth.user);
  const [reasons, setReasons] = useState<Reason[]>([]);
  const [selectedReason, setSelectedReason] = useState<number | null>(null);
  const [getReportReasons, { isLoading: loading }] =
    useGetReportReasonsMutation();
  const [reportUser, { isLoading: isReporting }] = useReportUserMutation();
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    getReportReasons({ report_type_id: 1, user_id: Number(user?.id) })
      .unwrap()
      .then((res) => {
        setReasons(res.reasons || []);
      })
      .catch(() => {});
  }, [user, getReportReasons]);

  const handleReport = async () => {
    if (!user?.id || !userId || !selectedReason) return;
    try {
      const res = await reportUser({
        user_id: user.id,
        report_type_id: 1,
        report_reason_id: selectedReason,
        reported_user_id: Number(userId),
      }).unwrap();
      if (res.success) {
        setAlert({
          type: "success",
          message: res.message || "User reported successfully.",
        });
        setTimeout(() => navigate(-1), 1500);
      } else {
        setAlert({
          type: "error",
          message: res.message || "Failed to report user.",
        });
      }
    } catch (e: any) {
      setAlert({
        type: "error",
        message: e?.data?.message || "Failed to report user.",
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "80vh",
        bgcolor: theme.palette.background.default,
        px: { xs: 2, md: 4 },
        pt: { xs: 2, md: 4 },
        display: "flex",
        flexDirection: "column",
        alignItems: isDesktop ? "center" : "stretch",
      }}
    >
      {isDesktop ? (
        <Card
          sx={{
            width: "100%",
            maxWidth: 600,
            mt: 4,
            boxShadow: theme.shadows[4],
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            {/* Header */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ mb: 3 }}
            >
              <IconButton
                onClick={() => navigate(-1)}
                sx={{
                  bgcolor: theme.palette.background.neutral,
                  "&:hover": { bgcolor: theme.palette.action.hover },
                }}
              >
                <Icon
                  icon="mdi:arrow-left"
                  fontSize={24}
                  color={theme.palette.text.primary}
                />
              </IconButton>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: theme.palette.text.primary }}
              >
                Report User
              </Typography>
            </Stack>
            <Typography
              variant="h6"
              sx={{ mb: 3, fontWeight: 600, color: theme.palette.text.primary }}
            >
              Choose Reason
            </Typography>
            {loading ? (
              <Box
                sx={{ display: "flex", justifyContent: "center", mt: 4, mb: 4 }}
              >
                <Loader />
              </Box>
            ) : (
              <RadioGroup
                value={selectedReason}
                onChange={(_, value) => setSelectedReason(Number(value))}
              >
                {reasons.map((reason) => (
                  <FormControlLabel
                    key={reason.reason_id}
                    value={reason.reason_id}
                    control={
                      <Radio
                        sx={{
                          color: theme.palette.primary.main,
                          "&.Mui-checked": {
                            color: theme.palette.primary.main,
                          },
                        }}
                      />
                    }
                    label={
                      <Typography
                        sx={{
                          fontSize: { xs: 16, md: 18 },
                          color: theme.palette.text.primary,
                          lineHeight: 1.5,
                        }}
                      >
                        {reason.reason}
                      </Typography>
                    }
                    sx={{
                      mb: 2,
                      ml: 1,
                      p: 1,
                      borderRadius: 1,
                      "&:hover": {
                        bgcolor: theme.palette.action.hover,
                      },
                    }}
                  />
                ))}
              </RadioGroup>
            )}
            {alert && (
              <Alert severity={alert.type} sx={{ mt: 3, mb: 3 }}>
                {alert.message}
              </Alert>
            )}
            <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
              <Button
                variant="contained"
                disabled={!selectedReason || isReporting}
                sx={{
                  borderRadius: 3,
                  px: { xs: 6, md: 8 },
                  py: { xs: 1.5, md: 2 },
                  fontWeight: 700,
                  fontSize: { xs: 16, md: 18 },
                  bgcolor: theme.palette.primary.main,
                  "&:hover": { bgcolor: theme.palette.primary.dark },
                  "&:disabled": {
                    bgcolor: theme.palette.action.disabledBackground,
                    color: theme.palette.action.disabled,
                  },
                  minWidth: { xs: 120, md: 160 },
                }}
                onClick={handleReport}
              >
                {isReporting ? <CircularProgress /> : "Report"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile Layout */}
          {/* Header */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <IconButton onClick={() => navigate(-1)}>
              <Icon
                icon="mdi:arrow-left"
                fontSize={28}
                color={theme.palette.text.primary}
              />
            </IconButton>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: theme.palette.text.primary }}
            >
              Report User
            </Typography>
          </Stack>
          <Typography
            variant="subtitle1"
            sx={{ mb: 2, fontWeight: 600, color: theme.palette.text.primary }}
          >
            Choose Reason
          </Typography>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Loader />
            </Box>
          ) : (
            <RadioGroup
              value={selectedReason}
              onChange={(_, value) => setSelectedReason(Number(value))}
            >
              {reasons.map((reason) => (
                <FormControlLabel
                  key={reason.reason_id}
                  value={reason.reason_id}
                  control={
                    <Radio
                      sx={{
                        color: theme.palette.primary.main,
                        "&.Mui-checked": { color: theme.palette.primary.main },
                      }}
                    />
                  }
                  label={
                    <Typography
                      sx={{ fontSize: 18, color: theme.palette.text.primary }}
                    >
                      {reason.reason}
                    </Typography>
                  }
                  sx={{ mb: 1.5, ml: 1 }}
                />
              ))}
            </RadioGroup>
          )}
          {alert && (
            <Alert severity={alert.type} sx={{ mt: 2 }}>
              {alert.message}
            </Alert>
          )}
          <Box
            sx={{
              position: "fixed",
              left: 0,
              right: 0,
              bottom: 100,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Button
              variant="contained"
              disabled={!selectedReason || isReporting}
              sx={{
                borderRadius: 8,
                px: 8,
                py: 1.5,
                fontWeight: 700,
                fontSize: 20,
                bgcolor: theme.palette.primary.main,
                "&:hover": { bgcolor: theme.palette.primary.dark },
                "&:disabled": {
                  bgcolor: theme.palette.action.disabledBackground,
                  color: theme.palette.action.disabled,
                },
              }}
              onClick={handleReport}
            >
              {isReporting ? <CircularProgress /> : "Report"}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default ReportUser;
