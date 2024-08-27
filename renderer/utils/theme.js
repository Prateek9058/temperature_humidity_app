import { createTheme } from "@mui/material/styles";

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: "#24AE6E",
      light: "rgba(52, 125, 0, 0.25)",
    },
    secondary: {
      main: "#A9CF46",
    },
    success: {
      main: "#347D00",
      light: "#CCDEBF",
    },
    info: {
      main: "#697077",
    },
    error: {
      main: "#FF0000",
    },
    warning: {
      main: "#ffb22b",
    },
  },
});

export default theme;
