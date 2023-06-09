import React from "react";
import { Box, Button, Typography } from "@mui/material";
import GroupList from "./GroupList";
import SearchBar from "../common/SearchBar";
import { Link } from "react-router-dom";

function Groups() {
  function search(term: string) {}

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h4">Search for groups</Typography>
      <Box component="div" sx={{ display: "flex", justifyContent: "center" }}>
        <SearchBar submitSearch={search} />
        <Button component={Link} to="/groups/new">
          Create
        </Button>
      </Box>

      <GroupList />
    </Box>
  );
}

export default Groups;
