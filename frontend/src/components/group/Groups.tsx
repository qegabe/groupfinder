import React, { useEffect, useState } from "react";
import { Box, Button, Grid, Typography } from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import GroupList from "./GroupList";
import SearchBar from "../common/SearchBar";
import { Link } from "react-router-dom";
import GroupFilter from "./GroupFilter";
import GroupFinderApi from "../../api";
import LoadingSpinner from "../common/LoadingSpinner";

function Groups() {
  const [formData, setFormData] = useState<GroupFilterFormData>({
    startTimeAfter: null,
    startTimeBefore: null,
    maxSize: 10,
    hasGames: [],
  });
  const [groupsData, setGroupsData] = useState<ListGroup[]>([]);
  const [searchData, setSearchData] = useState<GroupFilter>({});
  const [games, setGames] = useState<Game[]>([]);
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGroups() {
      setGroupsData(await GroupFinderApi.getGroups(searchData));
      setLoading(false);
    }
    loadGroups();
  }, [searchData]);

  function search(term: string) {
    const data: GroupFilter = {
      title: term,
      maxSize: formData.maxSize,
    };

    if (formData.hasGames.length > 0) {
      data.hasGames = formData.hasGames;
    }

    if (formData.startTimeAfter) {
      data.startTimeAfter = formData.startTimeAfter.toISOString();
    }
    if (formData.startTimeBefore) {
      data.startTimeBefore = formData.startTimeBefore.toISOString();
    }
    setSearchData(data);
    setLoading(true);
  }

  return (
    <Box sx={{ my: 4, mx: 2 }}>
      <Typography variant="h4">Search for groups</Typography>
      <Box component="div" sx={{ display: "flex", justifyContent: "center" }}>
        <SearchBar submitSearch={search} />
        <Button component={Link} to="/groups/new">
          Create
        </Button>
      </Box>

      <Grid
        container
        spacing={2}
        direction={{ xs: "column-reverse", md: "row" }}>
        <Grid item xs={12} md={8}>
          {loading ? <LoadingSpinner /> : <GroupList groupsData={groupsData} />}
        </Grid>
        <Grid item display={{ xs: "none", md: "block" }} md={4}>
          <GroupFilter
            formData={formData}
            setFormData={setFormData}
            games={games}
            setGames={setGames}
          />
        </Grid>
        <Grid item display={{ xs: "block", md: "none" }} md={4}>
          <Box display="flex" justifyContent="center">
            <Button
              variant="outlined"
              onClick={() => {
                setShowFilter(!showFilter);
              }}>
              <FilterAltIcon />
            </Button>
          </Box>
          {showFilter ? (
            <GroupFilter
              formData={formData}
              setFormData={setFormData}
              games={games}
              setGames={setGames}
            />
          ) : null}
        </Grid>
      </Grid>
    </Box>
  );
}

export default Groups;
