import React from "react";
import { Box, Typography } from "@mui/material";

function Home() {
  return (
    <Box
      component="div"
      sx={{
        height: 600,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}>
      <Typography variant="h2">Welcome to Groupfinder!</Typography>
    </Box>
  );
}

export default Home;
