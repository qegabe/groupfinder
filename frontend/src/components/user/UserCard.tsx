import React, { MouseEvent } from "react";
import {
  IconButton,
  Card,
  CardActions,
  CardContent,
  Typography,
  Avatar,
} from "@mui/material";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import { Link } from "react-router-dom";

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
        <Avatar
          sx={{ width: 30, height: 30, mr: 1 }}
          src={avatarUrl || undefined}
        />
        <Typography
          variant="h6"
          component={Link}
          to={`/users/${username}`}
          sx={{ color: "black", textDecoration: "none" }}>
          {username}
        </Typography>
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
