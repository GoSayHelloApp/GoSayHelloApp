import React, { useEffect, useRef, useState } from "react";
import { Box, CircularProgress, Fade, IconButton, InputBase, Modal, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import { tokens } from "../../pages/events/invitation/tokens";
import { withAlpha } from "../../pages/events/invitation/useColorExtraction";
import { isIOSDevice } from "../../utils/ticketDownload";
import { trackEventTraffic } from "../../services/events/eventTrafficApi";
import { isInAppBrowser, openGoSayHelloApp, safariUrl } from "../../utils/openApp";
import {
  confirmRsvpLink,
  RsvpConfirmResponse,
  sendRsvpCode,
  verifyRsvpCode,
} from "../../services/events/publicRsvpApi";

type Step = "email" | "code" | "done" | "linking";

interface GuestRsvpModalProps {
  open: boolean;
  onClose: () => void;
  eventId: number;
  eventName?: string;
  accent?: string;
  /** token from the email's "Confirm my RSVP" link (?rsvp_confirm=…) */
  confirmToken?: string | null;
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** White field with a visible border; accent ring when focused. */
const fieldSx = (accent: string) => ({
  width: "100%",
  height: 52,
  px: 2,
  borderRadius: "14px",
  background: "#FFFFFF",
  border: "1.5px solid rgba(20, 19, 26, 0.14)",
  boxShadow: "0 1px 2px rgba(20,19,26,0.04)",
  fontFamily: tokens.font.sans,
  fontSize: 16, // ≥16px: no iOS zoom on focus
  color: tokens.color.inkPrimary,
  transition: "border-color 150ms ease, box-shadow 150ms ease",
  "& input::placeholder": { color: tokens.color.inkMuted, opacity: 1 },
  "&.Mui-focused": {
    borderColor: accent,
    boxShadow: `0 0 0 4px ${withAlpha(accent, 0.18)}`,
  },
});

/**
 * Web guest RSVP: email → 6-digit code from the email → "You're going" + Add to Apple Wallet.
 * Nothing is saved until the email is confirmed. Wallet button shows on iPhone / iPad only.
 */
const GuestRsvpModal: React.FC<GuestRsvpModalProps> = ({
  open,
  onClose,
  eventId,
  eventName,
  accent = tokens.color.brandOrange,
  confirmToken,
}) => {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [result, setResult] = useState<RsvpConfirmResponse | null>(null);
  const linkHandled = useRef<string | null>(null);

  // Countdown for "Resend code".
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  // Arrived from the email link → confirm straight away.
  useEffect(() => {
    if (!open || !confirmToken || linkHandled.current === confirmToken) return;
    linkHandled.current = confirmToken;
    setStep("linking");
    setError("");
    confirmRsvpLink(confirmToken).then((res) => {
      if (res.success) {
        setResult(res);
        setEmail(res.email || "");
        if (!res.already_rsvped) trackEventTraffic(eventId, "convert");
        setStep("done");
      } else {
        setError(res.message || "This link has expired.");
        setStep("email");
      }
    });
  }, [open, confirmToken]);

  /** Back to the email step (keeps what was typed) — used by "Change email". */
  const reset = () => {
    setStep("email");
    setCode("");
    setError("");
    setInfo("");
    setResult(null);
  };

  /** Closing the popup clears everything, so the next RSVP starts fresh. */
  const handleClose = () => {
    onClose();
    setTimeout(() => {
      reset();
      setEmail("");
      setName("");
      setResendIn(0);
      setBusy(false);
    }, 300); // after the fade-out
  };

  const sendCode = async () => {
    const e = email.trim().toLowerCase();
    if (!EMAIL_RE.test(e)) {
      setError("Please enter a valid email address.");
      return;
    }
    setBusy(true);
    setError("");
    const res = await sendRsvpCode({ event_id: eventId, email: e, name: name.trim() || undefined });
    setBusy(false);
    if (res.resend_after) setResendIn(res.resend_after);
    if (res.success) {
      setEmail(e);
      setCode("");
      setInfo(res.message || `We sent a code to ${e}.`);
      setStep("code");
    } else {
      setError(res.message || "Couldn't send the code. Please try again.");
    }
  };

  const verify = async (value = code) => {
    if (value.length !== 6) return;
    setBusy(true);
    setError("");
    const res = await verifyRsvpCode({ event_id: eventId, email, code: value });
    setBusy(false);
    if (res.success) {
      setResult(res);
      if (!res.already_rsvped) trackEventTraffic(eventId, "convert");
      setStep("done");
    } else {
      setError(res.message || "That code isn't right.");
      if (res.expired) setCode("");
    }
  };

  const onCodeChange = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 6);
    setCode(digits);
    setError("");
    if (digits.length === 6) verify(digits);
  };

  const primaryBtn = (label: React.ReactNode, onClick: () => void, disabled = false) => (
    <Box
      component="button"
      type="button"
      disabled={disabled || busy}
      onClick={onClick}
      sx={{
        appearance: "none",
        cursor: disabled || busy ? "default" : "pointer",
        width: "100%",
        height: 52,
        borderRadius: 999,
        border: "none",
        color: "#FFFFFF",
        fontFamily: tokens.font.sans,
        fontSize: 15,
        fontWeight: 700,
        background: accent,
        opacity: disabled ? 0.5 : 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        transition: `transform 200ms ${tokens.motion.swift}`,
        "&:hover": { transform: disabled || busy ? "none" : "translateY(-1px)" },
      }}
    >
      {busy ? <CircularProgress size={20} sx={{ color: "#FFFFFF" }} /> : label}
    </Box>
  );

  const walletUrl = result?.apple_wallet_url;
  const showWallet = !!walletUrl && isIOSDevice();
  // Instagram / Facebook … in-app browsers download the pass but can't hand it to Wallet.
  const inAppBrowser = isInAppBrowser();

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(20, 19, 26, 0.55)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          },
        },
      }}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center", px: 2 }}
    >
      <Fade in={open} timeout={280}>
        <Box
          sx={{
            position: "relative",
            width: "100%",
            maxWidth: 420,
            background: tokens.color.paper,
            borderRadius: `${tokens.radius.xl}px`,
            overflow: "hidden",
            outline: "none",
            boxShadow: "0 24px 48px rgba(20,19,26,0.35)",
          }}
        >
          <IconButton
            onClick={handleClose}
            aria-label="Close"
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              zIndex: 2,
              width: 34,
              height: 34,
              color: tokens.color.inkSecondary,
              background: "rgba(255,255,255,0.7)",
              border: `1px solid ${tokens.color.line}`,
            }}
          >
            <Icon icon="ph:x-bold" width={16} />
          </IconButton>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              px: { xs: 3, sm: 4.5 },
              pt: 5,
              pb: 4,
              gap: 2,
            }}
          >
            {step === "linking" && (
              <>
                <CircularProgress sx={{ color: accent }} />
                <Typography sx={{ fontFamily: tokens.font.sans, color: tokens.color.inkSecondary }}>
                  Confirming your RSVP…
                </Typography>
              </>
            )}

            {step === "email" && (
              <>
                <Box sx={{ fontSize: 40, lineHeight: 1 }}>🎈</Box>
                <Box>
                  <Typography sx={titleSx}>RSVP{eventName ? ` to ${eventName}` : ""}</Typography>
                  <Typography sx={subSx}>
                    Enter your email — we'll send a 6-digit code to confirm it's you.
                  </Typography>
                </Box>
                <Box
                  component="button"
                  type="button"
                  onClick={() => openGoSayHelloApp(eventId)}
                  sx={memberBtnSx(accent)}
                >
                  <Icon icon="ph:device-mobile-fill" width={18} />
                  Already a member? RSVP in the app
                </Box>
                <Box sx={orDividerSx}>or RSVP with your email</Box>
                <InputBase
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && sendCode()}
                  sx={fieldSx(accent)}
                />
                <InputBase
                  autoComplete="name"
                  placeholder="Your name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendCode()}
                  sx={fieldSx(accent)}
                />
                {error && <Typography sx={errorSx}>{error}</Typography>}
                {primaryBtn("Send code", sendCode, !email.trim() || resendIn > 0)}
                {resendIn > 0 && (
                  <Typography sx={{ ...subSx, fontSize: 12 }}>You can request a new code in {resendIn}s</Typography>
                )}
              </>
            )}

            {step === "code" && (
              <>
                <Box sx={{ fontSize: 40, lineHeight: 1 }}>📬</Box>
                <Box>
                  <Typography sx={titleSx}>Check your email</Typography>
                  <Typography sx={subSx}>{info}</Typography>
                </Box>
                <InputBase
                  autoFocus
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="••••••"
                  value={code}
                  onChange={(e) => onCodeChange(e.target.value)}
                  inputProps={{ maxLength: 6, "aria-label": "6-digit code" }}
                  sx={{
                    ...fieldSx(accent),
                    height: 60,
                    "& input": {
                      textAlign: "center",
                      fontSize: 28,
                      letterSpacing: "0.4em",
                      fontWeight: 700,
                      fontFamily: tokens.font.mono,
                    },
                  }}
                />
                {error && <Typography sx={errorSx}>{error}</Typography>}
                {primaryBtn("Confirm RSVP", () => verify(), code.length !== 6)}
                <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                  <Box
                    component="button"
                    type="button"
                    disabled={resendIn > 0 || busy}
                    onClick={sendCode}
                    sx={linkBtnSx(resendIn > 0)}
                  >
                    {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
                  </Box>
                  <Box component="button" type="button" onClick={reset} sx={linkBtnSx(false)}>
                    Change email
                  </Box>
                </Box>
              </>
            )}

            {step === "done" && result && (
              <>
                <Box sx={{ fontSize: 48, lineHeight: 1 }}>🎉</Box>
                <Box>
                  <Typography sx={titleSx}>
                    {result.already_rsvped ? "You're already going!" : "You're going!"}
                  </Typography>
                  <Typography sx={subSx}>
                    {result.already_rsvped
                      ? `${result.email || email} is already on the list.`
                      : `See you there! We sent the details to ${result.email || email}.`}
                  </Typography>
                </Box>
                {showWallet && (
                  <Box
                    component="a"
                    href={inAppBrowser ? safariUrl(walletUrl as string) : (walletUrl as string)}
                    sx={{
                      width: "100%",
                      height: 52,
                      borderRadius: 999,
                      background: "#000000",
                      color: "#FFFFFF",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                      fontFamily: tokens.font.sans,
                      fontSize: 15,
                      fontWeight: 700,
                      "&:hover": { filter: "brightness(1.25)" },
                    }}
                  >
                    <Icon icon="ic:baseline-apple" width={20} />
                    {inAppBrowser ? "Open in Safari to add to Apple Wallet" : "Add to Apple Wallet"}
                  </Box>
                )}
                <Box
                  component="button"
                  type="button"
                  onClick={() => openGoSayHelloApp(eventId)}
                  sx={{
                    appearance: "none",
                    cursor: "pointer",
                    width: "100%",
                    height: 48,
                    borderRadius: 999,
                    border: `1px solid ${tokens.color.line}`,
                    background: "#FFFFFF",
                    color: tokens.color.inkPrimary,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: tokens.font.sans,
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  Open the app to chat with who's going
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

const titleSx = {
  fontFamily: tokens.font.serif,
  fontSize: { xs: 22, sm: 24 },
  fontWeight: 600,
  lineHeight: 1.2,
  color: tokens.color.inkPrimary,
  letterSpacing: "-0.01em",
};

const subSx = {
  mt: 0.75,
  fontFamily: tokens.font.sans,
  fontSize: 14,
  lineHeight: 1.5,
  color: tokens.color.inkSecondary,
};

const errorSx = {
  fontFamily: tokens.font.sans,
  fontSize: 13,
  color: "#C62828",
  width: "100%",
};

const linkBtnSx = (disabled: boolean) => ({
  appearance: "none",
  border: "none",
  background: "none",
  p: 0,
  cursor: disabled ? "default" : "pointer",
  fontFamily: tokens.font.sans,
  fontSize: 13,
  fontWeight: 600,
  color: disabled ? tokens.color.inkMuted : tokens.color.inkPrimary,
  textDecoration: disabled ? "none" : "underline",
});

const memberBtnSx = (accent: string) => ({
  appearance: "none",
  width: "100%",
  minHeight: 50,
  px: 2,
  py: 1,
  borderRadius: 999,
  border: `1.5px solid ${accent}`,
  background: withAlpha(accent, 0.08),
  color: tokens.color.inkPrimary,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 1,
  fontFamily: tokens.font.sans,
  fontSize: 14.5,
  fontWeight: 700,
  "&:hover": { background: withAlpha(accent, 0.14) },
});

const orDividerSx = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  fontFamily: tokens.font.sans,
  fontSize: 12,
  color: tokens.color.inkSecondary,
  "&::before, &::after": { content: '""', flex: 1, height: "1px", background: tokens.color.line },
};

export default GuestRsvpModal;
