import React from "react";
import { Stack } from "@mui/material";
import GameCard from "./GameCard";

function GameList({ gameData, removeGame }: GameListProps) {
  const games = gameData.map((g) => (
    <GameCard key={g.id} removeGame={removeGame} {...g} />
  ));

  return <Stack spacing={2}>{games}</Stack>;
}

export default GameList;
