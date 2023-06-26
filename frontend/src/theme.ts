import { ThemeOptions, createTheme } from "@mui/material/styles";

const themeOptions: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: {
      main: "#3fb56a",
    },
    secondary: {
      main: "#a5d6a7",
    },
    success: {
      main: "#64dd17",
    },
  },
};

export const theme = createTheme(themeOptions);
