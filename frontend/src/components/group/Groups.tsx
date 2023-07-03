import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Button,
  Grid,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import GroupList from "./GroupList";
import SearchBar from "../common/SearchBar";
import { Link } from "react-router-dom";
import GroupFilter from "./GroupFilter";
import GroupFinderApi from "../../api";
import LoadingSpinner from "../common/LoadingSpinner";
import { useAppSelector } from "../../hooks/redux";

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
  const [loading, setLoading] = useState(true);
  const authLoading = useAppSelector((s) => s.auth.loading);

  useEffect(() => {
    async function loadGroups() {
      setGroupsData(await GroupFinderApi.getGroups(searchData));
      setLoading(false);
    }
    if (!authLoading) {
      loadGroups();
    }
  }, [searchData, authLoading]);

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
      <Grid container spacing={2} direction="column" alignItems="center">
        <Grid item container justifyContent="center" alignItems="center">
          <Grid item>
            <Typography variant="h4">Search for groups</Typography>
          </Grid>
        </Grid>
        <Grid item>
          <Button variant="contained" component={Link} to="/groups/new">
            <AddIcon />
            Create Group
          </Button>
        </Grid>
        <Grid item width={{ xs: "100%", lg: "60%" }}>
          <SearchBar submitSearch={search} />
        </Grid>
        <Grid item width={{ xs: "100%", lg: "60%" }}>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="users-content"
              id="users-header">
              <Typography>Filter</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <GroupFilter
                formData={formData}
                setFormData={setFormData}
                games={games}
                setGames={setGames}
              />
            </AccordionDetails>
          </Accordion>
        </Grid>
        <Grid item width={{ xs: "100%", lg: "60%" }}>
          {loading ? <LoadingSpinner /> : <GroupList groupsData={groupsData} />}
        </Grid>
      </Grid>
    </Box>
  );
}

export default Groups;
