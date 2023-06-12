import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Home from "./Home";
import Register from "./user/Register";
import Login from "./user/Login";
import Groups from "./group/Groups";
import NewGroupForm from "./group/NewGroupForm";
import GroupDetail from "./group/GroupDetail";
import { useAppSelector } from "../hooks/redux";
import EditGroupForm from "./group/EditGroupForm";

function GroupfinderRoutes() {
  const user = useAppSelector((s) => s.auth.user);

  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/groups" element={<Groups />} />
      {user.username ? (
        <>
          <Route path="/groups/new" element={<NewGroupForm />} />
          <Route path="/groups/:id" element={<GroupDetail />} />
          <Route path="/groups/:id/edit" element={<EditGroupForm />} />
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
