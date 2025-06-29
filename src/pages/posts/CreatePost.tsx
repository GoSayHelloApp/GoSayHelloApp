import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Stack,
  Alert,
  Snackbar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../redux/store";
import { useCreatePostMutation } from "../../services/posts/postsApi";

interface CreatePostFormData {
  image: File | null;
  caption: string;
}

const CreatePost: React.FC = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const [createPost, { isLoading: isUploading }] = useCreatePostMutation();

  const [formData, setFormData] = useState<CreatePostFormData>({
    image: null,
    caption: "",
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Camera functionality
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setAlert({
          type: "error",
          message: "Please select a valid image file.",
        });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setAlert({
          type: "error",
          message: "Image size should be less than 5MB.",
        });
        return;
      }

      setFormData((prev) => ({ ...prev, image: file }));

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleDirectCameraClick = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      setCameraStream(stream);
      setCameraOpen(true);

      // Wait for video to be ready
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (error) {
      console.error("Camera access error:", error);
      setCameraError("Unable to access camera. Please check permissions.");
    }
  };

  const handleCapturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Create file from blob
              const file = new File([blob], `camera-${Date.now()}.jpg`, {
                type: "image/jpeg",
              });

              setFormData((prev) => ({ ...prev, image: file }));

              // Create preview URL
              const url = URL.createObjectURL(blob);
              setPreviewUrl(url);

              // Close camera
              handleCloseCamera();
            }
          },
          "image/jpeg",
          0.8
        );
      }
    }
  };

  const handleCloseCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setCameraOpen(false);
    setCameraError(null);
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async () => {
    if (!formData.image) {
      setAlert({
        type: "error",
        message: "Please select an image to upload.",
      });
      return;
    }

    if (!user?.id) {
      setAlert({
        type: "error",
        message: "Please login to create a post.",
      });
      return;
    }

    try {
      const response = await createPost({
        user_id: user.id,
        image: formData.image,
        caption: formData.caption.trim() || undefined,
      }).unwrap();

      if (response.success) {
        setAlert({
          type: "success",
          message: response.message || "Post created successfully!",
        });

        // Reset form
        setFormData({ image: null, caption: "" });
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }

        // Navigate back after success
        setTimeout(() => navigate(-1), 1500);
      } else {
        setAlert({
          type: "error",
          message: response.message || "Failed to create post.",
        });
      }
    } catch (error: any) {
      setAlert({
        type: "error",
        message:
          error?.data?.message || "Failed to create post. Please try again.",
      });
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <Box
      sx={{
        minHeight: "80vh",
        bgcolor: theme.palette.background.default,
        px: { xs: 2, md: 4 },
        py: { xs: 2, md: 4 },
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
                onClick={handleCancel}
                sx={{
                  bgcolor: theme.palette.background.neutral,
                  "&:hover": { bgcolor: theme.palette.action.hover },
                }}
              >
                <Icon
                  icon="mdi:close"
                  fontSize={24}
                  color={theme.palette.text.primary}
                />
              </IconButton>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: theme.palette.text.primary }}
              >
                Create Post
              </Typography>
            </Stack>

            {/* Image Upload Section */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                }}
              >
                Add Photo
              </Typography>

              {!previewUrl ? (
                <Box
                  sx={{
                    border: `2px dashed ${theme.palette.primary.main}`,
                    borderRadius: 2,
                    p: 4,
                    textAlign: "center",
                    bgcolor: theme.palette.primary.lighter,
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: theme.palette.primary.light,
                    },
                  }}
                >
                  <Stack spacing={2} alignItems="center">
                    <Icon
                      icon="mdi:image-plus"
                      fontSize={48}
                      color={theme.palette.primary.main}
                    />
                    <Typography variant="h6" color="primary.main">
                      Choose Photo
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleGalleryClick}
                        startIcon={<Icon icon="mdi:image-multiple" />}
                      >
                        Gallery
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleDirectCameraClick}
                        startIcon={<Icon icon="mdi:camera" />}
                      >
                        Camera
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              ) : (
                <Box sx={{ position: "relative" }}>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{
                      width: "100%",
                      maxHeight: 400,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />
                  <IconButton
                    onClick={handleRemoveImage}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      bgcolor: "rgba(0,0,0,0.5)",
                      color: "white",
                      "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                    }}
                  >
                    <Icon icon="mdi:close" />
                  </IconButton>
                </Box>
              )}
            </Box>

            {/* Caption Section */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                }}
              >
                Caption (Optional)
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Write a caption for your post..."
                value={formData.caption}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, caption: e.target.value }))
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={isUploading}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!formData.image || isUploading}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  bgcolor: theme.palette.primary.main,
                  "&:hover": { bgcolor: theme.palette.primary.dark },
                  "&:disabled": {
                    bgcolor: theme.palette.action.disabledBackground,
                    color: theme.palette.action.disabled,
                  },
                }}
              >
                {isUploading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "Create Post"
                )}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile Layout */}
          {/* Header */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
            <IconButton onClick={handleCancel}>
              <Icon
                icon="mdi:close"
                fontSize={28}
                color={theme.palette.text.primary}
              />
            </IconButton>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: theme.palette.text.primary }}
            >
              Create Post
            </Typography>
          </Stack>

          {/* Image Upload Section */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{ mb: 2, fontWeight: 600, color: theme.palette.text.primary }}
            >
              Add Photo
            </Typography>

            {!previewUrl ? (
              <Box
                sx={{
                  border: `2px dashed ${theme.palette.primary.main}`,
                  borderRadius: 2,
                  p: 3,
                  textAlign: "center",
                  bgcolor: theme.palette.primary.lighter,
                }}
              >
                <Stack spacing={2} alignItems="center">
                  <Icon
                    icon="mdi:image-plus"
                    fontSize={40}
                    color={theme.palette.primary.main}
                  />
                  <Typography variant="body1" color="primary.main">
                    Choose Photo
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={handleGalleryClick}
                      startIcon={<Icon icon="mdi:image-multiple" />}
                    >
                      Gallery
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={handleDirectCameraClick}
                      startIcon={<Icon icon="mdi:camera" />}
                    >
                      Camera
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            ) : (
              <Box sx={{ position: "relative" }}>
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{
                    width: "100%",
                    maxHeight: 300,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
                <IconButton
                  onClick={handleRemoveImage}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    bgcolor: "rgba(0,0,0,0.5)",
                    color: "white",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                  }}
                >
                  <Icon icon="mdi:close" />
                </IconButton>
              </Box>
            )}
          </Box>

          {/* Caption Section */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="subtitle1"
              sx={{ mb: 2, fontWeight: 600, color: theme.palette.text.primary }}
            >
              Caption (Optional)
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Write a caption for your post..."
              value={formData.caption}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, caption: e.target.value }))
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{
              //   position: "fixed",
              //   left: 0,
              //   right: 0,
              //   bottom: 100,
              display: "flex",
              justifyContent: "center",
              gap: 2,
              px: 2,
            }}
          >
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={isUploading}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                flex: 1,
                maxWidth: 120,
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!formData.image || isUploading}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                bgcolor: theme.palette.primary.main,
                "&:hover": { bgcolor: theme.palette.primary.dark },
                "&:disabled": {
                  bgcolor: theme.palette.action.disabledBackground,
                  color: theme.palette.action.disabled,
                },
                flex: 1,
                maxWidth: 120,
              }}
            >
              {isUploading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Post"
              )}
            </Button>
          </Box>
        </>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        style={{ display: "none" }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageSelect}
        style={{ display: "none" }}
      />

      {/* Camera Modal */}
      <Dialog
        open={cameraOpen}
        onClose={handleCloseCamera}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "black",
            borderRadius: 2,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{ bgcolor: "black", color: "white", textAlign: "center" }}
        >
          Take Photo
        </DialogTitle>
        <DialogContent sx={{ p: 0, position: "relative" }}>
          {cameraError ? (
            <Box sx={{ p: 3, textAlign: "center", color: "white" }}>
              <Icon icon="mdi:camera-off" fontSize={48} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Camera Access Error
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {cameraError}
              </Typography>
            </Box>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                }}
              />
              <canvas ref={canvasRef} style={{ display: "none" }} />
            </>
          )}
        </DialogContent>
        <DialogActions
          sx={{ bgcolor: "black", p: 2, justifyContent: "center" }}
        >
          <Button onClick={handleCloseCamera} sx={{ color: "white" }}>
            Cancel
          </Button>
          {!cameraError && (
            <Button
              onClick={handleCapturePhoto}
              variant="contained"
              color="primary"
              startIcon={<Icon icon="mdi:camera" />}
            >
              Capture
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Alert Snackbar */}
      <Snackbar
        open={!!alert}
        autoHideDuration={3000}
        onClose={() => setAlert(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setAlert(null)}
          severity={alert?.type}
          sx={{ width: "100%" }}
        >
          {alert?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreatePost;
