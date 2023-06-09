import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import GroupFinderApi from "../../api";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../common/LoadingSpinner";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(duration);
dayjs.extend(relativeTime);

const INITIAL_STATE = {
  id: 0,
  title: "",
  startTime: dayjs(),
  endTime: dayjs(),
};

function GroupDetail() {
  const { id } = useParams();
  const [group, setGroup] = useState<IGroup>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGroup() {
      setGroup(await GroupFinderApi.getGroup(+(id as string)));
      setLoading(false);
    }
    loadGroup();
  }, [id]);

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Typography variant="h3">{group.title}</Typography>
      <Typography>{group.description}</Typography>
      <Typography>Starting at: {group.startTime.format("LLL")}</Typography>
      <Typography>
        Lasts {dayjs.duration(group.endTime.diff(group.startTime)).humanize()}
      </Typography>
    </Box>
  );
}

export default GroupDetail;
