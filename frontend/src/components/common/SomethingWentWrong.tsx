import React from "react";
import { Box, Typography } from "@mui/material";

function SomethingWentWrong() {
  return (
    <Box
      sx={{
        height: 600,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}>
      <Typography variant="h2">Something went wrong!</Typography>
    </Box>
  );
}

export default SomethingWentWrong;
