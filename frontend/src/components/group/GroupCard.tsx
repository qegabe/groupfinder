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
import { Link } from "react-router-dom";
dayjs.extend(relativeTime);

function GroupCard({ id, title, startTime }: GroupCardProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{title}</Typography>
        <Typography>Starting {startTime.fromNow()}</Typography>
      </CardContent>
      <CardActions>
        <Button component={Link} to={`/groups/${id}`} size="small">
          Details
        </Button>
      </CardActions>
    </Card>
  );
}

export default GroupCard;
