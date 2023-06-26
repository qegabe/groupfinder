import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Avatar } from "@mui/material";
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
      </Box>
      <Box sx={{ my: 2 }}>
        <Typography sx={{ fontStyle: "italic" }}>{userData.bio}</Typography>
      </Box>
      {userData.triviaScore !== null ? (
        <Box>
          <Typography>Trivia High Score: {userData.triviaScore}</Typography>
        </Box>
      ) : null}
      {user?.username === userData.username ? (
        <Button variant="contained" component={Link} to={`/user/edit`}>
          Edit
        </Button>
      ) : null}
    </Box>
  );
}

export default UserProfile;
