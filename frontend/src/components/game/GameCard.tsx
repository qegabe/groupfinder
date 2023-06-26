import React, { MouseEvent } from "react";
import {
  Avatar,
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
    <Card
      data-testid={`gamecard-${id}`}
      sx={{ display: "flex", justifyContent: "space-between" }}>
      <CardContent sx={{ display: "flex" }}>
        <Avatar
          variant="square"
          sx={{ width: 30, height: 30, mr: 1 }}
          src={coverUrl !== "" ? coverUrl : "/game-controller.png"}
        />
        <Typography variant="h6">{title}</Typography>
      </CardContent>
      <CardActions>
        {removeGame !== undefined ? (
          <IconButton
            aria-label="delete"
            sx={{ ml: 3 }}
            color="error"
            onClick={handleClick}>
            <RemoveCircleIcon />
          </IconButton>
        ) : null}
      </CardActions>
    </Card>
  );
}

export default GameCard;
