import React from "react";
import { Avatar, Box, Stack, Typography } from "@mui/material";

function Score({
  username,
  avatarUrl,
  score,
}: {
  username: string;
  avatarUrl: string | null;
  score: number;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Avatar
        sx={{ width: 20, height: 20, mr: 1 }}
        src={avatarUrl || undefined}
      />
      <Typography variant="h6" component="span">
        {username}:
      </Typography>
      <Typography
        data-testid={`${username}-score`}
        component="span"
        sx={{ ml: 1 }}>
        {score}
      </Typography>
    </Box>
  );
}

function TriviaScores({ users, scores }: TriviaScoresProps) {
  const scoreList = [];

  for (let username in users) {
    scoreList.push(
      <Score
        key={username}
        username={username}
        avatarUrl={users[username].avatarUrl}
        score={scores[username] || 0}
      />
    );
  }

  return <Stack spacing={1}>{scoreList}</Stack>;
}

export default TriviaScores;
