import React, { useState, useEffect } from "react";
import { Box, IconButton, Tooltip, Typography, Avatar } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import GroupFinderApi from "../../api";
import { Link, useParams } from "react-router-dom";
import { useAppSelector } from "../../hooks/redux";
import LoadingSpinner from "../common/LoadingSpinner";

function UserProfile() {
  const { username } = useParams();
  const [userData, setUserData] = useState<User>();
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    async function loadUser() {
      setUserData(await GroupFinderApi.getUser(username as string));
    }
    loadUser();
  }, [username]);

  if (!userData) return <LoadingSpinner />;

  return (
    <Box sx={{ display: "grid", justifyItems: "center" }}>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Avatar src={userData.avatarUrl || undefined} />
        <Typography variant="h3" sx={{ m: 2, textTransform: "capitalize" }}>
          {userData.username}
        </Typography>
        {user?.username === userData.username ? (
          <Tooltip title="Edit">
            <IconButton aria-label="edit" component={Link} to={`/user/edit`}>
              <EditIcon />
            </IconButton>
          </Tooltip>
        ) : null}
      </Box>
      {userData.triviaScore !== null ? (
        <Box>
          <Typography>Trivia High Score: {userData.triviaScore}</Typography>
        </Box>
      ) : null}
      <Box sx={{ my: 2 }}>
        <Typography sx={{ fontStyle: "italic" }}>{userData.bio}</Typography>
      </Box>
    </Box>
  );
}

export default UserProfile;
