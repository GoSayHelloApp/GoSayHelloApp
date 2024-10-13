import { Theme } from '@mui/material/styles';
import { menuItem } from '../../css';

// ----------------------------------------------------------------------

export function menu(theme: Theme) {
  return {
    MuiMenuItem: {
      styleOverrides: {
        root: {
          ...menuItem(theme),
          '& .MuiListItemIcon-root': {
            marginRight: 0 // Remove margin right from MuiListItemIcon-root
          }
        }
      }
    }
  };
}
