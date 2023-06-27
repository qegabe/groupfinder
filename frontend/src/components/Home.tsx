import React from "react";
import { Box } from "@mui/material";

function Home() {
  return (
    <Box
      sx={{
        height: "calc(100vh - 68px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: { xs: "1.75rem", md: "3rem" },
      }}>
      Welcome to Groupfinder!
    </Box>
  );
}

export default Home;
