import React from "react";
import { Box, Typography } from "@mui/material";

function Home() {
  return (
    <Box
      sx={{
        height: "calc(100vh - 68px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}>
      <Typography sx={{ fontSize: { xs: "1.75rem", md: "3rem" } }}>
        Welcome to Groupfinder!
      </Typography>
    </Box>
  );
}

export default Home;
