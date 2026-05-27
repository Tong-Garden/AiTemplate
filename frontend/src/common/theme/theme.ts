import { createTheme } from '@mui/material/styles';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#f7f4ec',
      paper: '#ffffff',
    },
    primary: {
      main: '#2f6f46',
      light: '#4e8f63',
      dark: '#1f5634',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#d9861a',
      light: '#f0a33f',
      dark: '#b36b12',
      contrastText: '#1f1b16',
    },
    error: {
      main: '#b3261e',
      light: '#ef5c4e',
      dark: '#7f0000',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f2a900',
      light: '#ffcb4d',
      dark: '#be7f00',
      contrastText: '#1f1b16',
    },
    info: {
      main: '#2f6f46',
      light: '#5f9874',
      dark: '#1f5634',
      contrastText: '#ffffff',
    },
    success: {
      main: '#3f8a53',
      light: '#66ad79',
      dark: '#2c6b3f',
      contrastText: '#ffffff',
    },
    text: {
      primary: '#1f1b16',
      secondary: '#5f564a',
      disabled: '#9a9288',
    },
    divider: '#e2dacb',
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#121812',
      paper: '#1c241b',
    },
    primary: {
      main: '#6fb285',
      light: '#8dc5a0',
      dark: '#4d8f65',
      contrastText: '#0f140f',
    },
    secondary: {
      main: '#f2a43a',
      light: '#ffbf66',
      dark: '#cd811e',
      contrastText: '#1a1208',
    },
    error: {
      main: '#ffb4ab',
      light: '#ffd2cc',
      dark: '#e07a70',
      contrastText: '#2a120f',
    },
    warning: {
      main: '#ffcb6a',
      light: '#ffe09d',
      dark: '#dca944',
      contrastText: '#1f1b16',
    },
    info: {
      main: '#8ec9a1',
      light: '#b6debf',
      dark: '#68a982',
      contrastText: '#0f140f',
    },
    success: {
      main: '#74bd8a',
      light: '#9ad1ab',
      dark: '#549e6f',
      contrastText: '#0f140f',
    },
    text: {
      primary: '#f4f2ea',
      secondary: '#cdc7b9',
      disabled: '#8d8a83',
    },
    divider: '#304033',
  },
});

export { lightTheme, darkTheme };
export default lightTheme;
