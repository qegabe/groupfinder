import React from "react";
import { Box, Grid, Typography } from "@mui/material";

function TriviaRoundTransition({ round }: { round: number }) {
  const roundDesc = ["Easy Questions", "Medium Questions", "Hard Questions"];

  return (
    <Box>
      <Grid container height={"calc(100vh - 114px)"}>
        <Grid sx={{ boxShadow: 1, p: 2, mt: 2 }} item xs={12}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              justifyItems: "center",
              alignContent: "center",
              alignItems: "center",
              my: 3,
            }}>
            <Typography variant="h3">Round {round}</Typography>
            <Typography variant="h5">{roundDesc[round - 1]}</Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default TriviaRoundTransition;
