import { useMemo } from 'react';
import { palette } from './palette';
import { merge } from 'lodash';
import { CssBaseline, ThemeOptions, ThemeProvider, createTheme } from '@mui/material';
import { componentsOverrides } from './overrides';
import { customShadows } from './custom-shadows';
import { shadows } from './shadows';
import { typography } from './typography';

type Props = {
  children: React.ReactNode;
};

export default function AppThemeProvider({ children }: Props) {
  const baseOption = useMemo(
    () => ({
      palette: palette('light'),
      shadows: shadows('light'),
      customShadows: customShadows('light'),
      typography,
      shape: { borderRadius: 8 }
    }),
    []
  );

  const memoizedValue = useMemo(() => merge(baseOption), [baseOption]);

  const theme = createTheme(memoizedValue as ThemeOptions);

  theme.components = merge(componentsOverrides(theme));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
