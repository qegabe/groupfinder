import React, { useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import GroupFinderApi from "../../api";
import { Link, useParams } from "react-router-dom";
import LoadingSpinner from "../common/LoadingSpinner";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import { useAppSelector } from "../../hooks/redux";
import GameList from "../game/GameList";
dayjs.extend(duration);
dayjs.extend(relativeTime);

function GroupDetail() {
  const { id } = useParams();
  const [group, setGroup] = useState<Group>();
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    async function loadGroup() {
      setGroup(await GroupFinderApi.getGroup(+(id as string)));
    }
    loadGroup();
  }, [id]);

  if (!group) return <LoadingSpinner />;

  let edit = null;
  if (group.members) {
    if (group.members[user.username as keyof object]) {
      edit = (
        <Button variant="contained" component={Link} to={`/groups/${id}/edit`}>
          Edit
        </Button>
      );
    }
  }

  return (
    <Box sx={{ display: "grid", justifyItems: "center" }}>
      <Typography variant="h3" sx={{ my: 2, textTransform: "capitalize" }}>
        {group.title}
      </Typography>
      <Box sx={{ my: 2 }}>
        <Typography sx={{ fontStyle: "italic" }}>
          {group.description}
        </Typography>
      </Box>

      <Typography>Starting at: {group.startTime.format("LLL")}</Typography>
      <Typography>
        Lasts {dayjs.duration(group.endTime.diff(group.startTime)).humanize()}
      </Typography>
      <Box sx={{ my: 3 }}>
        <Typography>Games</Typography>
        <GameList gameData={group.games} />
      </Box>

      {edit}
    </Box>
  );
}

export default GroupDetail;
