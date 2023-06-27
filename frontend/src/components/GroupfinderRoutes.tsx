import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Home from "./Home";
import Register from "./user/Register";
import Login from "./user/Login";
import Groups from "./group/Groups";
import NewGroup from "./group/NewGroup";
import GroupDetail from "./group/GroupDetail";
import { useAppSelector } from "../hooks/redux";
import EditGroup from "./group/EditGroup";
import UserGroups from "./group/UserGroups";
import EditUser from "./user/EditUser";
import UserProfile from "./user/UserProfile";
import TriviaGame from "./trivia/TriviaGame";

function GroupfinderRoutes() {
  const user = useAppSelector((s) => s.auth.user);

  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/groups" element={<Groups />} />
      <Route path="/groups/:id" element={<GroupDetail />} />
      <Route path="/users/:username" element={<UserProfile />} />
      {user ? (
        <>
          <Route path="/games/trivia/:id" element={<TriviaGame />} />
          <Route path="/groups/new" element={<NewGroup />} />
          <Route path="/groups/:id/edit" element={<EditGroup />} />
          <Route path="/user/groups" element={<UserGroups />} />
          <Route path="/user/edit" element={<EditUser />} />
        </>
      ) : (
        <>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </>
      )}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default GroupfinderRoutes;
