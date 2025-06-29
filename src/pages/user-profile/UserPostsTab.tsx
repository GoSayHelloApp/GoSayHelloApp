import React, { useState } from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import HeartIcon from "../../assets/svg/HeartIcon";
import CloseIcon from "../../assets/svg/CloseIcon";
import {
  useDeletePostMutation,
  useReactOnPostMutation,
} from "../../services/posts/postsApi";
import { useAppSelector } from "../../redux/store";
import { useNavigate } from "react-router-dom";

interface Post {
  id: number;
  image: string;
  number_of_likes: number;
  user_id: number;
  is_like?: number;
}

interface PostsTabProps {
  posts: Post[];
}

const UserPostsTab: React.FC<PostsTabProps> = ({ posts: initialPosts }) => {
  const user = useAppSelector((state) => state.auth.user);
  const [posts, setPosts] = useState(initialPosts);
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();
  const [reactOnPost, { isLoading: isReacting }] = useReactOnPostMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleRemoveClick = (postId: number) => {
    setSelectedPostId(postId);
    setConfirmOpen(true);
  };

  const handleConfirmClose = () => {
    setConfirmOpen(false);
    setSelectedPostId(null);
  };

  const handleDelete = async () => {
    if (!selectedPostId || !user?.id) return;
    try {
      await deletePost({ post_id: selectedPostId, user_id: user.id }).unwrap();
      setPosts((prev) => prev.filter((p) => p.id !== selectedPostId));
      handleConfirmClose();
    } catch (e) {
      // Optionally show error
      handleConfirmClose();
    }
  };

  const handlePostClick = (img: Post) => {
    navigate("/post-details", { state: { post: img } });
  };

  const handleLike = async (post: Post, idx: number) => {
    if (!user?.id || isReacting) return;
    const isCurrentlyLiked = post.is_like === 1;
    const is_like = isCurrentlyLiked ? 0 : 1;
    try {
      await reactOnPost({
        is_like,
        posted_image_id: post.id,
        user_id: user.id,
      }).unwrap();
      setPosts((prev) =>
        prev.map((p, i) => {
          if (i !== idx) return p;
          return {
            ...p,
            is_like,
            number_of_likes: p.number_of_likes + (isCurrentlyLiked ? -1 : 1),
          };
        })
      );
    } catch (e) {
      // Optionally show error
    }
  };

  if (!posts || posts.length === 0) {
    return (
      <Typography align="center" color="text.secondary">
        No posts yet.
      </Typography>
    );
  }
  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            sm: "repeat(3, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 2,
          justifyContent: "center",
          placeItems: "space-between",
        }}
      >
        {posts.map((img, idx) => (
          <Box
            key={img.id}
            sx={{
              width: "100%",
              aspectRatio: "1 / 1",
              borderRadius: 2,
              overflow: "hidden",
              boxShadow: 1,
              position: "relative",
              cursor: "pointer",
            }}
            onClick={() => handlePostClick(img)}
          >
            <img
              src={img.image}
              alt="post"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            {/* Remove Button */}
            {img.user_id === user?.id && (
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
                    opacity: isDeleting && selectedPostId === img.id ? 0.5 : 1,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    !isDeleting && handleRemoveClick(img.id);
                  }}
                >
                  <CloseIcon width={24} height={24} />
                </Box>
              </Box>
            )}
            {/* Heart Button */}
            {
              <Box
                sx={{ position: "absolute", bottom: 12, right: 12, zIndex: 1 }}
              >
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
                    cursor: isReacting ? "not-allowed" : "pointer",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (img.user_id === user?.id) {
                      return;
                    }
                    handleLike(img, idx);
                  }}
                >
                  <HeartIcon
                    width={26}
                    height={26}
                    number={
                      img.number_of_likes !== 0 ? img.number_of_likes : ""
                    }
                    filled={img.is_like === 1}
                  />
                </Box>
              </Box>
            }
          </Box>
        ))}
      </Box>
      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={handleConfirmClose}>
        <DialogTitle>Delete Post</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this post?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserPostsTab;
