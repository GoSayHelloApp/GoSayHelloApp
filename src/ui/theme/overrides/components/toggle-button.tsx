import { alpha, Theme } from '@mui/material/styles';
import { ToggleButtonProps, toggleButtonClasses } from '@mui/material/ToggleButton';

// ----------------------------------------------------------------------

const COLORS = ['primary', 'secondary', 'info', 'success', 'warning', 'error'] as const;

// ----------------------------------------------------------------------

export function toggleButton(theme: Theme) {
  const rootStyles = (ownerState: ToggleButtonProps) => {
    const defaultStyle = {
      [`&.${toggleButtonClasses.selected}`]: {
        borderColor: 'currentColor',
        // boxShadow: '0 0 0 0.5px currentColor',
        backgroundColor: '#009983',
        color: 'white'
      }
    };

    const colorStyle = COLORS.map((color) => ({
      ...(ownerState.color === color && {
        '&:hover': {
          borderColor: alpha(theme.palette[color].main, 0.48),
          backgroundColor: alpha(theme.palette[color].main, theme.palette.action.hoverOpacity)
        }
      })
    }));

    const disabledState = {
      [`&.${toggleButtonClasses.disabled}`]: {
        borderColor: theme.palette.action.disabledBackground,

        [`&.${toggleButtonClasses.selected}`]: {
          borderColor: theme.palette.action.disabledBackground
        }
      }
    };

    return [defaultStyle, ...colorStyle, disabledState];
  };

  return {
    MuiToggleButton: {
      styleOverrides: {
        root: ({ ownerState }: { ownerState: ToggleButtonProps }) => rootStyles(ownerState)
      }
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#00937E14',
          border: `solid 1px transparent`,
          color: '#006F5F'
        },
        grouped: {
          margin: 0,
          [`&.${toggleButtonClasses.selected}`]: {
            boxShadow: 'none',
            backgroundColor: '#009983',
            color: 'white',
            border: 'none'
          },
          '&:not(:first-of-type):not(:last-of-type)': {
            borderColor: 'transparent'
          },
          '&:last-of-type:not(.Mui-selected)': {},
          '&:first-of-type:not(.Mui-selected)': {
            border: 'none !important'
          },
          '&:nth-of-type(n+2):not(.Mui-selected)': {
            border: 'none !important'
          }
        }
      }
    }
  };
}
