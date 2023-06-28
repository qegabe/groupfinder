import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import GroupList from "./GroupList";
import GroupFinderApi from "../../api";
import LoadingSpinner from "../common/LoadingSpinner";
import { useAppSelector } from "../../hooks/redux";

function UserGroups() {
  const user = useAppSelector((s) => s.auth.user);
  const [groupsData, setGroupsData] = useState<ListGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGroups() {
      setGroupsData(
        await GroupFinderApi.getGroups({ hasUsers: [user?.username] })
      );
      setLoading(false);
    }
    loadGroups();
  }, [user?.username]);

  return (
    <Box sx={{ my: 4, mx: 2 }}>
      <Typography variant="h4">Your Groups</Typography>
      {loading ? <LoadingSpinner /> : <GroupList groupsData={groupsData} />}
    </Box>
  );
}

export default UserGroups;
