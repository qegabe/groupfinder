import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import GroupFinderApi from "../../api";
import GroupForm from "./GroupForm";

const INITIAL_STATE: GroupFormData = {
  title: "",
  description: "",
  startTime: null,
  endTime: null,
  isPrivate: false,
  maxMembers: undefined,
};

function NewGroup() {
  const [formData, setFormData] = useState<GroupFormData>(INITIAL_STATE);

  async function submit() {
    await GroupFinderApi.createGroup(formData as Group);
  }

  return (
    <Box sx={{ display: "grid", justifyItems: "center" }}>
      <Typography variant="h3">Create New Group</Typography>
      <GroupForm
        initialState={INITIAL_STATE}
        formData={formData}
        setFormData={setFormData}
        submit={submit}
        returnPath="/groups"
        shouldReturn={false}
        buttons={{ submit: "Create", cancel: "Cancel" }}
      />
    </Box>
  );
}

export default NewGroup;
