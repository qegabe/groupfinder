import React, { useEffect } from "react";
import Stack from "@mui/material/Stack";
import { loadGroups } from "../../actions/actionCreators";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { shallowEqual } from "react-redux";
import GroupCard from "./GroupCard";

function GroupList() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadGroups());
  }, [dispatch]);

  const groupData = useAppSelector((s) => s.groups, shallowEqual);

  const groups = groupData.map((g) => (
    <GroupCard key={g.id} title={g.title} id={g.id} startTime={g.startTime} />
  ));

  return <Stack spacing={2}>{groups}</Stack>;
}

export default GroupList;
