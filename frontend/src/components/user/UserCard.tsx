import React, { MouseEvent } from "react";
import {
  IconButton,
  Card,
  CardActions,
  CardContent,
  Typography,
} from "@mui/material";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";

function UserCard({ username, avatarUrl, isOwner, removeUser }: UserCardProps) {
  function handleClick(evt: MouseEvent) {
    if (removeUser !== undefined) {
      removeUser({ username, avatarUrl });
    }
  }

  const disabled = { disabled: isOwner };

  return (
    <Card sx={{ display: "flex", justifyContent: "space-between" }}>
      <CardContent sx={{ display: "flex" }}>
        <img
          style={{ width: "12%", marginRight: 30 }}
          src={avatarUrl || undefined}
          alt="avatar"
        />
        <Typography variant="h6">{username}</Typography>
      </CardContent>
      {removeUser !== undefined ? (
        <CardActions>
          <IconButton
            {...disabled}
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

export default UserCard;
