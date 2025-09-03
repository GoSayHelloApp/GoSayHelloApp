import {
  Avatar,
  Box,
  Button,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
  useTheme,
  useMediaQuery,
  Paper,
} from "@mui/material";
import React from "react";
import { RecentPostStyles } from "./style";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../../../redux/store";
import { userSelector } from "../../../../services/auth/authSelectors";
import { useFetchHomeScreenDataMutation } from "../../../../services/appconfiguration/configApi";
import { useLocation } from "../../../../hooks/useLocation";
import { useInfiniteScroll } from "../../../../hooks/useInfiniteScroll";
import { useReactOnPostMutation } from "../../../../services/posts/postsApi";
import Loader from "../../../../ui/components/core/screenLoader";

interface RecentPostsProps {
  onPostCountChange?: (count: number) => void;
}

function CustomTabPanel(props: any) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ mt: 1, pb: 1 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: any) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function RecentPosts({ onPostCountChange }: RecentPostsProps) {
  const [value, setValue] = React.useState(0);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Redux selectors
  const user = useAppSelector(userSelector);

  // Location hook
  const location = useLocation();

  // API mutations
  const [fetchHomeScreenData, { isLoading: isLoadingPosts }] = useFetchHomeScreenDataMutation();
  const [reactOnPost, { isLoading: isReacting }] = useReactOnPostMutation();

  // State for posts data
  const [nearbyPosts, setNearbyPosts] = React.useState<any[]>([]);
  const [connectedPosts, setConnectedPosts] = React.useState<any[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [hasMorePages, setHasMorePages] = React.useState(true);
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);

  const handleChange = (event: any, newValue: any) => {
    setValue(newValue);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    setNearbyPosts([]);
    setConnectedPosts([]);
    setHasMorePages(true);
  };

  // Handle post like/unlike
  const handleLike = async (post: any, postIndex: number, isNearby: boolean) => {
    if (!user?.id || isReacting) return;

    const isCurrentlyLiked = post.is_like === 1;
    const is_like = isCurrentlyLiked ? 0 : 1;

    try {
      await reactOnPost({
        is_like,
        posted_image_id: post.posted_image_id || post.id,
        user_id: user.id,
      }).unwrap();

      // Update the post in the appropriate state
      if (isNearby) {
        setNearbyPosts((prev) =>
          prev.map((p, i) => {
            if (i !== postIndex) return p;
            return {
              ...p,
              is_like,
            };
          })
        );
      } else {
        setConnectedPosts((prev) =>
          prev.map((p, i) => {
            if (i !== postIndex) return p;
            return {
              ...p,
              is_like,
            };
          })
        );
      }
    } catch (error) {
      console.error("Error reacting to post:", error);
    }
  };

  // Infinite scroll hook
  const lastElementRef = useInfiniteScroll(() => {
    if (hasMorePages && !isLoadingPosts) {
      setCurrentPage((prev) => prev + 1);
    }
  }, isLoadingPosts);

  const { mainCard } = RecentPostStyles();

  // Format timestamp to relative time (e.g., "7 hrs ago", "2 days ago")
  const formatTimeAgo = (timestamp: string) => {
    timestamp = new Date(timestamp).toUTCString();
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInMs = now.getTime() - postTime.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hr${diffInHours > 1 ? "s" : ""} ago`;
    } else {
      return "Recently";
    }
  };

  // Fetch posts data
  React.useEffect(() => {
    if (!user?.id) return;

    const fetchPosts = async () => {
      try {
        if (value === 0) {
          // Fetch nearby users posts
          if (location) {
            const response = await fetchHomeScreenData({
              user_id: user.id,
              page_no: currentPage,
              is_nearby: 1,
              latitude: location.latitude,
              longitude: location.longitude,
            }).unwrap();

            if (response.success && response.ConnectedUserPost) {
              if (currentPage === 1) {
                setNearbyPosts(response.ConnectedUserPost);
                setIsInitialLoading(false);
              } else {
                setNearbyPosts((prev) => [...prev, ...response.ConnectedUserPost]);
              }

              // Check if there are more pages
              if (response.total_pages && currentPage >= response.total_pages) {
                setHasMorePages(false);
              }
            }
          }
        } else {
          // Fetch connected users posts
          const response = await fetchHomeScreenData({
            user_id: user.id,
            page_no: currentPage,
          }).unwrap();

          if (response.success && response.ConnectedUserPost) {
            if (currentPage === 1) {
              setConnectedPosts(response.ConnectedUserPost);
              setIsInitialLoading(false);
            } else {
              setConnectedPosts((prev) => [...prev, ...response.ConnectedUserPost]);
            }

            // Check if there are more pages
            if (response.total_pages && currentPage >= response.total_pages) {
              setHasMorePages(false);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, [currentPage, user?.id, location, fetchHomeScreenData, value]); // Removed 'value' from dependencies

  // Reset pagination when tab changes (separate effect)
  React.useEffect(() => {
    setCurrentPage(1);
    setNearbyPosts([]);
    setConnectedPosts([]);
    setHasMorePages(true);
    setIsInitialLoading(true);
  }, [value]); // Only reset when tab changes, not when page changes

  // Calculate and pass post count to parent component
  React.useEffect(() => {
    if (onPostCountChange) {
      const currentPosts = value === 0 ? nearbyPosts : connectedPosts;
      const postsPerPage = currentPosts.length;
      const totalPages = 1; // Default to 1 if not available
      const estimatedCount = postsPerPage * totalPages;
      onPostCountChange(estimatedCount);
    }
  }, [nearbyPosts, connectedPosts, value, onPostCountChange]);

  // Show loading state if location is not available for nearby tab
  const isLocationLoading = value === 0 && !location;

  // Mobile header component
  const MobileHeader = () => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        padding: "16px 20px",
        borderBottom: `1px solid ${theme.palette.grey[200]}`,
        backgroundColor: "white",
        position: "sticky",
        top: 0,
        zIndex: 1,
      }}
    >
      <IconButton
        onClick={handleBack}
        sx={{
          marginRight: "16px",
          color: theme.palette.grey[800],
        }}
      >
        <Icon icon="mdi:arrow-left" fontSize={24} />
      </IconButton>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          color: theme.palette.grey[800],
          fontSize: 24,
          flex: 1,
          textAlign: "center",
          marginRight: "40px", // Compensate for back button width
        }}
      >
        Recent Posts
      </Typography>
      {/* <IconButton
        onClick={handleRefresh}
        sx={{
          color: theme.palette.grey[800],
        }}
      >
        <Icon icon="mdi:refresh" fontSize={24} />
      </IconButton> */}
    </Box>
  );

  const DesktopTabs = () => (
    <Tabs
      value={value}
      onChange={handleChange}
      sx={{
        backgroundColor: theme.palette.grey[400],
        borderRadius: "33px",
        mb: 3,
      }}
    >
      <Tab
        sx={{ flex: "1 1 auto", height: "60px", width: "150px", fontSize: 15, fontWeight: 600 }}
        label="Nearby Users"
        {...a11yProps(0)}
      />
      <Tab
        sx={{ flex: "1 1 auto", height: "60px", width: "150px", fontSize: 15, fontWeight: 600 }}
        label="Connected Users"
        {...a11yProps(1)}
      />
    </Tabs>
  );

const handleReportUser = (userId:number)=>{
  navigate(`/report-user/${userId}`);
}

  return (
    <React.Fragment>
      {isMobile && <MobileHeader />}
      {isMobile ? (
        <Box
          sx={{
            // maxWidth: { xs: 400, md: 600 },
            mx: "auto",
            mb: 2,
            px: { xs: 2, md: 0 },
          }}
        >
          <DesktopTabs />
        </Box>
      ) : (
        <DesktopTabs />
      )}

      <CustomTabPanel value={value} index={0}>
        {isLocationLoading ? (
          <Box sx={{ textAlign: "center", padding: "20px" }}>
            <Loader />
            <Typography sx={{ marginTop: 1 }}>Getting your location...</Typography>
          </Box>
        ) : isInitialLoading ? (
          <Loader />
        ) : !location ? (
          <Box sx={{ textAlign: "center", padding: "20px" }}>
            <Typography color="text.secondary" sx={{ marginBottom: 2 }}>
              Location permission required to see nearby posts
            </Typography>
            <Button variant="outlined" onClick={handleRefresh} startIcon={<Icon icon="mdi:refresh" />}>
              Retry
            </Button>
          </Box>
        ) : nearbyPosts.length > 0 ? (
          nearbyPosts.map((post, index) => (
            <Box
              ref={index === nearbyPosts.length - 1 ? lastElementRef : null}
              key={post.posted_image_id || index}
              sx={{
                display: "flex",
                justifyContent: "center",
                mb: 2,
                maxWidth: "100%",
              }}
            >
              <Box
                sx={{
                  ...mainCard,
                  backgroundImage: post.posted_image
                    ? `url("${post.posted_image}")`
                    : `url("https://picsum.photos/315/315")`,
                  margin: isMobile ? "8px 20px" : "8px 0",
                  borderRadius: isMobile ? "16px" : mainCard.borderRadius,
                  position: "relative",
                  overflow: "hidden",
                  backgroundPosition: "top center",
                  backgroundSize: "cover",
                }}
              >
                <Button sx={{ color: "white" }} className="reportButton" variant="soft" color="inherit" onClick={() => handleReportUser(post.connected_user_id)}>
                  Report
                </Button>
                <Box className="lowerDetails">
                  <Stack direction={"row"} alignItems={"center"} gap={2}>
                    <Avatar
                      sx={{
                        width: 50,
                        height: 50,
                        cursor: "pointer",
                        "&:hover": { opacity: 0.8 },
                      }}
                      src={post.connected_user_profile_image || ""}
                      onClick={() => navigate(`/user-profile/${post.connected_user_id || post.id}`)}
                    />
                    <Box display={"block"} flex={"1"}>
                      <Typography fontSize={15} fontWeight={700} color={theme.palette.common.white}>
                        {post.connected_user_name || "User"}
                      </Typography>
                      <Typography fontSize={15} fontWeight={600} color={theme.palette.grey[400]}>
                        {post.posted_time ? formatTimeAgo(post.posted_time) : "Recently"}
                      </Typography>
                      <Typography fontSize={15} fontWeight={600} color={theme.palette.grey[400]}>
                        {post.distance ? `${Math.ceil(post.distance * 20)} minute walk` : "0 minute walk"}
                      </Typography>
                    </Box>
                    <IconButton
                      sx={{
                        backgroundColor: post.is_like === 1 ? theme.palette.primary.main : "#2D343A",
                        "&:hover": {
                          backgroundColor: post.is_like === 1 ? theme.palette.primary.dark : "#2D343A",
                        },
                        cursor: isReacting ? "not-allowed" : "pointer",
                        opacity: isReacting ? 0.7 : 1,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(post, index, true);
                      }}
                      disabled={isReacting}
                    >
                      <Icon icon="mdi:heart" fontSize={28} color={theme.palette.common.white} />
                    </IconButton>
                  </Stack>
                </Box>
              </Box>
            </Box>
          ))
        ) : (
          <Box sx={{ textAlign: "center", padding: "20px" }}>
            <Typography color="text.secondary">No nearby posts found</Typography>
          </Box>
        )}
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        {isInitialLoading ? (
          <Loader />
        ) : connectedPosts.length > 0 ? (
          connectedPosts.map((post, index) => (
            <Box
              ref={index === connectedPosts.length - 1 ? lastElementRef : null}
              key={post.posted_image_id || index}
              sx={{
                display: "flex",
                justifyContent: "center",
                mb: 2,
              }}
            >
              <Box
                sx={{
                  ...mainCard,
                  backgroundImage: post.posted_image
                    ? `url("${post.posted_image}")`
                    : `url("https://picsum.photos/315/315")`,
                  margin: isMobile ? "8px 20px" : "8px 0",
                  borderRadius: isMobile ? "16px" : mainCard.borderRadius,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Button sx={{ color: "white" }} className="reportButton" variant="soft" color="inherit" onClick={() => handleReportUser(post.connected_user_id)}>
                  Report
                </Button>
                <Box className="lowerDetails">
                  <Stack direction={"row"} alignItems={"center"} gap={2}>
                    <Avatar
                      sx={{
                        width: 50,
                        height: 50,
                        cursor: "pointer",
                        "&:hover": { opacity: 0.8 },
                      }}
                      src={post.connected_user_profile_image || ""}
                      onClick={() => navigate(`/user-profile/${post.connected_user_id || post.id}`)}
                    />
                    <Box display={"block"} flex={"1"}>
                      <Typography fontSize={15} fontWeight={700} color={theme.palette.common.white}>
                        {post.connected_user_name || "User"}
                      </Typography>
                      <Typography fontSize={15} fontWeight={600} color={theme.palette.grey[400]}>
                        {post.posted_time ? formatTimeAgo(post.posted_time) : "Recently"}
                      </Typography>
                      <Typography fontSize={15} fontWeight={600} color={theme.palette.grey[400]}>
                        {"Connected"}
                      </Typography>
                    </Box>
                    <IconButton
                      sx={{
                        backgroundColor: post.is_like === 1 ? theme.palette.primary.main : "#2D343A",
                        "&:hover": {
                          backgroundColor: post.is_like === 1 ? theme.palette.primary.dark : "#2D343A",
                        },
                        cursor: isReacting ? "not-allowed" : "pointer",
                        opacity: isReacting ? 0.7 : 1,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(post, index, false);
                      }}
                      disabled={isReacting}
                    >
                      <Icon icon="mdi:heart" fontSize={28} color={theme.palette.common.white} />
                    </IconButton>
                  </Stack>
                </Box>
              </Box>
            </Box>
          ))
        ) : (
          <Box sx={{ textAlign: "center", padding: "20px" }}>
            <Typography color="text.secondary">No connected posts found</Typography>
          </Box>
        )}
      </CustomTabPanel>
    </React.Fragment>
  );
}
