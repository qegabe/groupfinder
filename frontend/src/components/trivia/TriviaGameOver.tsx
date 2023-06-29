import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import TriviaScores from "./TriviaScores";

function TriviaGameOver({ users, scores, restartButton }: TriviaGameOverProps) {
  return (
    <Box>
      <Grid container height={"calc(100vh - 114px)"}>
        <Grid sx={{ boxShadow: 1, p: 2, mt: 2 }} item xs={12}>
          <Typography variant="h3" display="flex" justifyContent="center">
            Final Scores
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
            <TriviaScores users={users} scores={scores} />
          </Box>
          <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
            {restartButton}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default TriviaGameOver;
