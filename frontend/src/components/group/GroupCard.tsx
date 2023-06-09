import React from "react";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

function GroupCard({ id, title, startTime }: GroupCardProps) {
  return (
    <Card>
      <CardContent>
        <Typography>{title}</Typography>
        <Typography>Starting {dayjs(startTime).fromNow()}</Typography>
      </CardContent>
      <CardActions>
        <Button size="small">Details</Button>
      </CardActions>
    </Card>
  );
}

export default GroupCard;
