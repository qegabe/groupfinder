import React from "react";
import { Stack } from "@mui/material";
import GroupCard from "./GroupCard";

function GroupList({ groupsData }: GroupListProps) {
  const groups = groupsData.map((g) => (
    <GroupCard
      key={g.id}
      title={g.title}
      id={g.id as number}
      startTime={g.startTime}
    />
  ));

  return <Stack spacing={2}>{groups}</Stack>;
}

export default GroupList;
