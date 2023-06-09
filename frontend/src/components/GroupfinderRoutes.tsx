import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./Home";
import Register from "./user/Register";
import Login from "./user/Login";
import Groups from "./group/Groups";
import NewGroupForm from "./group/NewGroupForm";

function GroupfinderRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/groups" element={<Groups />} />
      <Route path="/groups/new" element={<NewGroupForm />} />

      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default GroupfinderRoutes;
