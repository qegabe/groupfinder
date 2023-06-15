import React from "react";
import { Stack } from "@mui/material";
import UserCard from "./UserCard";

function UserList({ userData, removeUser }: UserListProps) {
  const users = [];
  for (let username in userData) {
    users.push(
      <UserCard
        key={username}
        removeUser={removeUser}
        username={username}
        avatarUrl={userData[username].avatarUrl}
        isOwner={userData[username].isOwner}
      />
    );
  }

  return <Stack spacing={2}>{users}</Stack>;
}

export default UserList;
