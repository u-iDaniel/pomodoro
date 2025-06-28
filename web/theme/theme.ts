import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2FA4D0', // background
      light: '#54B5D9',
      dark: '#2183A6',
      contrastText: '#ededed',
    },
    secondary: {
      main: '#DE8421', // secondary
      light: '#E59D4A',
      dark: '#B16A1A',
      contrastText: '#ededed',
    },
    tertiary: {
      main: '#8421DE', // tertiary
      light: '#9D4AE5',
      dark: '#6A1AB1',
      contrastText: '#ededed',
    },
    success: {
      main: '#21DE84', // success
      light: '#4AE59D',
      dark: '#1AB16A',
      contrastText: '#ededed',
    },
    error: {
      main: '#DE3721', // warning
      light: '#E5594A',
      dark: '#B12C1A',
      contrastText: '#ededed',
    },
    background: {
      default: '#2FA4D0',
      paper: '#ffffff',
    },
    text: {
      primary: '#171717', // foreground
      secondary: '#cccccc',
    },
  },
  typography: {
    fontFamily: 'Montserrat, Arial, sans-serif',
    button: {
      textTransform: 'none',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '@media (prefers-color-scheme: dark)': {
          ':root': {
            colorScheme: 'dark',
          },
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  ...theme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#2FA4D0',
      light: '#54B5D9',
      dark: '#2183A6',
      contrastText: '#ededed',
    },
    secondary: {
      main: '#DE8421',
      light: '#E59D4A',
      dark: '#B16A1A',
      contrastText: '#ededed',
    },
    tertiary: {
      main: '#8421DE',
      light: '#9D4AE5',
      dark: '#6A1AB1',
      contrastText: '#ededed',
    },
    success: {
      main: '#21DE84',
      light: '#4AE59D',
      dark: '#1AB16A',
      contrastText: '#ededed',
    },
    error: {
      main: '#DE3721',
      light: '#E5594A',
      dark: '#B12C1A',
      contrastText: '#ededed',
    },
    background: {
      default: '#2FA4D0',
      paper: '#171717',
    },
    text: {
      primary: '#ededed',
      secondary: '#cccccc',
    },
  },
});

// Augment the Theme interface
declare module '@mui/material/styles' {
  interface Palette {
    tertiary: Palette['primary'];
  }
  interface PaletteOptions {
    tertiary?: PaletteOptions['primary'];
  }
}