import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Typography, IconButton, useTheme } from "@mui/material";
import HeartIcon from "../../assets/svg/HeartIcon";
import CloseIcon from "../../assets/svg/CloseIcon";
import { Icon } from "@iconify/react";
import { useDeletePostMutation } from "../../services/posts/postsApi";
import { useReactOnPostMutation } from "../../services/posts/postsApi";
import ConfirmationModal from "../../components/confirmationModal";
import { useAppSelector } from "../../redux/store";

const UserPostDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const post = location.state?.post;
  const userId = location.state?.userId; // fallback if you want to pass userId
  const currentUser = useAppSelector((state) => state.auth.user);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletePost] = useDeletePostMutation();
  const [reactOnPost, { isLoading: isReacting }] = useReactOnPostMutation();
  const [likeState, setLikeState] = useState({
    is_like: post?.is_like ?? 0,
    number_of_likes: post?.number_of_likes ?? 0,
  });
  const isOwnPost = post && currentUser && post.user_id === currentUser.id;

  if (!post) {
    return (
      <Box sx={{ textAlign: "center", mt: 8 }}>
        <Typography color="error">No post data found.</Typography>
        <IconButton onClick={() => navigate(-1)}>
          <Icon icon="material-symbols:arrow-back" />
        </IconButton>
      </Box>
    );
  }

  const handleDeleteClick = (e: any) => {
    e.stopPropagation();
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async (e: any) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      await deletePost({
        post_id: post.id,
        user_id: post.user_id || userId,
      }).unwrap();
      setIsDeleting(false);
      setConfirmOpen(false);
      navigate(-1);
    } catch (error) {
      setIsDeleting(false);
      setConfirmOpen(false);
      // Optionally show error
    }
  };

  const handleCancelDelete = (e: any) => {
    e.stopPropagation();
    setConfirmOpen(false);
  };

  return (
    <Box
      sx={{
        minHeight: "80vh",
        width: { md: "90vw" },
        // bgcolor: "#F4F6F8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: { xs: "100%", md: "80vw", lg: "60vw" },
          maxWidth: { xs: 400, md: 900 },
          minHeight: { xs: 400, md: "70vh" },
          mx: "auto",
          p: { xs: 2, md: 4 },
          borderRadius: { xs: 2, md: 0 },
          bgcolor: "white",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: { xs: "100%", md: "60%" },
            height: { xs: "auto", md: "60vh" },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={post.image}
            alt="post"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: 16,
              boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
              background: "#f4f6f8",
            }}
          />
          {/* Back arrow at top left */}
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              position: "absolute",
              top: 16,
              left: 16,
              backgroundColor: theme.palette.background.paper,
              "&:hover": {
                backgroundColor: theme.palette.background.default,
              },
              borderRadius: "50%",
              zIndex: 2,
              boxShadow: 1,
            }}
          >
            <Icon
              icon="material-symbols:arrow-back"
              style={{ fontSize: "24px", color: theme.palette.text.primary }}
            />
          </IconButton>
          {/* Cross (delete) button at top right */}
          {isOwnPost && (
            <Box sx={{ position: "absolute", top: 12, right: 12, zIndex: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: "rgba(60,60,60,0.5)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  opacity: isDeleting ? 0.5 : 1,
                  boxShadow: 1,
                }}
                onClick={handleDeleteClick}
              >
                <CloseIcon width={24} height={24} />
              </Box>
            </Box>
          )}
          {/* Heart button at bottom right */}
          <Box sx={{ position: "absolute", bottom: 12, right: 12, zIndex: 1 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                bgcolor: "#23292F",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                cursor: isOwnPost
                  ? "default"
                  : isReacting
                  ? "not-allowed"
                  : "pointer",
                opacity: isOwnPost ? 0.7 : 1,
              }}
              onClick={async (e) => {
                if (isOwnPost || isReacting) return;
                const isCurrentlyLiked = likeState.is_like === 1;
                const is_like = isCurrentlyLiked ? 0 : 1;
                try {
                  await reactOnPost({
                    is_like,
                    posted_image_id: post.id,
                    user_id: currentUser?.id ?? 0,
                  }).unwrap();
                  setLikeState((prev) => ({
                    is_like,
                    number_of_likes:
                      prev.number_of_likes + (isCurrentlyLiked ? -1 : 1),
                  }));
                } catch (e) {
                  // Optionally show error
                }
              }}
            >
              <HeartIcon
                width={26}
                height={26}
                number={
                  likeState.number_of_likes !== 0
                    ? likeState.number_of_likes
                    : ""
                }
                filled={likeState.is_like === 1}
              />
            </Box>
          </Box>
        </Box>
        {/* Optionally, add a details/info section on the right for md+ screens */}
        {/* <Box sx={{ width: { xs: '100%', md: '40%' }, p: 3 }}>
          ...
        </Box> */}
        <ConfirmationModal
          open={confirmOpen}
          title="Delete Post"
          description="Are you sure you want to delete this post?"
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          confirmText="Delete"
          cancelText="Cancel"
          loading={isDeleting}
        />
      </Box>
    </Box>
  );
};

export default UserPostDetails;
