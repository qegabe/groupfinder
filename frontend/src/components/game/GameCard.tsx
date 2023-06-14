import React, { MouseEvent } from "react";
import {
  IconButton,
  Card,
  CardActions,
  CardContent,
  Typography,
} from "@mui/material";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";

function GameCard({ id, title, coverUrl, removeGame }: GameCardProps) {
  function handleClick(evt: MouseEvent) {
    if (removeGame !== undefined) {
      removeGame({ id, title, coverUrl });
    }
  }

  return (
    <Card sx={{ display: "flex", justifyContent: "space-between" }}>
      <CardContent sx={{ display: "flex" }}>
        <img
          style={{ width: "12%", marginRight: 5 }}
          src={coverUrl}
          alt="cover art"
        />
        <Typography variant="h6">{title}</Typography>
      </CardContent>
      {removeGame !== undefined ? (
        <CardActions>
          <IconButton
            aria-label="delete"
            sx={{ ml: 3 }}
            color="error"
            onClick={handleClick}>
            <RemoveCircleIcon />
          </IconButton>
        </CardActions>
      ) : null}
    </Card>
  );
}

export default GameCard;
