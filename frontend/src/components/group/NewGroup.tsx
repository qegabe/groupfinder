import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import GroupFinderApi from "../../api";
import GroupForm from "./GroupForm";
import { useAppDispatch } from "../../hooks/redux";
import { setAlert } from "../../actions/actionCreators";

const INITIAL_STATE: GroupFormData = {
  title: "",
  description: "",
  startTime: null,
  endTime: null,
  address: "",
  cityData: null,
  isPrivate: false,
  maxMembers: 10,
};

function NewGroup() {
  const [formData, setFormData] = useState<GroupFormData>(INITIAL_STATE);
  const dispatch = useAppDispatch();

  async function submit() {
    await GroupFinderApi.createGroup(formData);
    dispatch(setAlert("success", "Group Created"));
  }

  return (
    <Box sx={{ display: "grid", justifyItems: "center", mt: 2 }}>
      <Typography sx={{ fontSize: { xs: "1.75rem", md: "3rem" } }}>
        Create New Group
      </Typography>
      <GroupForm
        initialState={INITIAL_STATE}
        formData={formData}
        setFormData={setFormData}
        submit={submit}
        returnPath="/groups"
        shouldReturn={true}
        buttons={{ submit: "Create", cancel: "Cancel" }}
      />
    </Box>
  );
}

export default NewGroup;
