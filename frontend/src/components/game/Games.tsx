import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";

function Games() {
  return (
    <Box sx={{ display: "grid", justifyContent: "center" }}>
      <Box sx={{ my: 2 }}>
        <Typography variant="h3">Games</Typography>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", my: 2 }}>
        <Button
          size="large"
          variant="contained"
          component={Link}
          to="/games/trivia">
          Trivia Game
        </Button>
      </Box>
    </Box>
  );
}

export default Games;
