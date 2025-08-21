import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useAppSelector, useAppDispatch } from '../../redux/store';
import { useDeleteUserAccountMutation } from '../../services/auth/authApi';
import { logout } from '../../services/auth/authSlice';

const DeleteAccount: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [deleteUserAccount] = useDeleteUserAccountMutation();

  const handleDeleteClick = () => {
    setShowConfirmation(true);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setError(null);
  };

  const handleConfirmDelete = async () => {
    if (!user?.id) {
      setError('User information not found');
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await deleteUserAccount({ user_id: user.id }).unwrap();
      
      if (response.success) {
        // Account deleted successfully, clear user state and redirect to login
        dispatch(logout());
        navigate('/login');
      } else {
        setError(response.message || 'Failed to delete account. Please try again.');
      }
    } catch (err: any) {
      setError(err?.data?.message || 'An error occurred while deleting your account. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowConfirmation(false);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{ 
        minHeight: "100vh", 
        display: "flex", 
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          py: 4,
          width: "100%",
          maxWidth: 500,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 3,
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: theme.palette.error.light,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <Icon icon="mdi:alert-circle" fontSize={48} color="white" />
          </Box>
        </Box>

        <Typography variant="h3" component="h1" gutterBottom sx={{ color: theme.palette.error.main, fontWeight: 'bold', textAlign: 'center' }}>
          Delete Account
        </Typography>

        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6, textAlign: 'center', color: theme.palette.text.secondary }}>
          This action cannot be undone. Deleting your account will permanently remove all your data, 
          including your profile, posts, events, and connections.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          justifyContent: 'center', 
          flexWrap: 'wrap',
          mt: 2
        }}>
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
            sx={{ 
              minWidth: 120,
              borderColor: theme.palette.grey[400],
              color: theme.palette.text.primary,
              '&:hover': {
                borderColor: theme.palette.grey[600],
                backgroundColor: theme.palette.grey[50],
              }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleDeleteClick}
            sx={{ 
              minWidth: 120,
              bgcolor: theme.palette.error.main,
              color: theme.palette.error.contrastText,
              '&:hover': {
                bgcolor: theme.palette.error.dark,
              }
            }}
            startIcon={<Icon icon="mdi:delete" />}
          >
            Delete Account
          </Button>
        </Box>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmation}
        onClose={handleCancel}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            border: `1px solid ${theme.palette.error.lighter}`,
          }
        }}
      >
        <DialogTitle sx={{ color: theme.palette.error.main, fontWeight: 'bold' }}>
          Final Confirmation
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2, color: theme.palette.text.primary }}>
            Are you absolutely sure you want to delete your account? This action is irreversible and will permanently remove:
          </Typography>
          <Box component="ul" sx={{ pl: 2, mb: 2 }}>
            <Typography component="li" variant="body2" sx={{ color: theme.palette.text.secondary }}>Your profile and personal information</Typography>
            <Typography component="li" variant="body2" sx={{ color: theme.palette.text.secondary }}>All your posts and content</Typography>
            <Typography component="li" variant="body2" sx={{ color: theme.palette.text.secondary }}>Your events and RSVPs</Typography>
            <Typography component="li" variant="body2" sx={{ color: theme.palette.text.secondary }}>All connections and relationships</Typography>
            <Typography component="li" variant="body2" sx={{ color: theme.palette.text.secondary }}>Your preferences and settings</Typography>
          </Box>
          <Typography variant="body1" sx={{ color: theme.palette.error.main, fontWeight: 'bold' }}>
            This action cannot be undone!
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCancel} 
            disabled={isDeleting}
            sx={{
              borderColor: theme.palette.grey[400],
              color: theme.palette.text.primary,
              '&:hover': {
                borderColor: theme.palette.grey[600],
                backgroundColor: theme.palette.grey[50],
              }
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            disabled={isDeleting}
            sx={{
              bgcolor: theme.palette.error.main,
              color: theme.palette.error.contrastText,
              '&:hover': {
                bgcolor: theme.palette.error.dark,
              }
            }}
            startIcon={isDeleting ? <CircularProgress size={16} /> : <Icon icon="mdi:delete" />}
          >
            {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
  );
};

export default DeleteAccount;
