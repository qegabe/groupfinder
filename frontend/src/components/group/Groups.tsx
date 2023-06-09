import React, { useEffect, useState } from "react";
import { Box, Button, Grid, Typography } from "@mui/material";
import GroupList from "./GroupList";
import SearchBar from "../common/SearchBar";
import { Link } from "react-router-dom";
import GroupFilter from "./GroupFilter";
import GroupFinderApi from "../../api";
import { Dayjs } from "dayjs";

interface FilterData {
  startTimeAfter: Dayjs | null;
  startTimeBefore: Dayjs | null;
  maxSize: number;
}

function Groups() {
  const [formData, setFormData] = useState<FilterData>({
    startTimeAfter: null,
    startTimeBefore: null,
    maxSize: 10,
  });
  const [groupsData, setGroupsData] = useState<IGroupList[]>([]);
  const [searchData, setSearchData] = useState<GroupFilter>({});

  useEffect(() => {
    async function loadGroups() {
      setGroupsData(await GroupFinderApi.getGroups(searchData));
    }
    loadGroups();
  }, [searchData]);

  function search(term: string) {
    const data: GroupFilter = {
      title: term,
      maxSize: formData.maxSize,
    };

    if (formData.startTimeAfter) {
      data.startTimeAfter = formData.startTimeAfter.toISOString();
    }
    if (formData.startTimeBefore) {
      data.startTimeBefore = formData.startTimeBefore.toISOString();
    }
    setSearchData(data);
  }

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h4">Search for groups</Typography>
      <Box component="div" sx={{ display: "flex", justifyContent: "center" }}>
        <SearchBar submitSearch={search} />
        <Button component={Link} to="/groups/new">
          Create
        </Button>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={8}>
          <GroupList groupsData={groupsData} />
        </Grid>
        <Grid item xs={4}>
          <GroupFilter formData={formData} setFormData={setFormData} />
        </Grid>
      </Grid>
    </Box>
  );
}

export default Groups;
