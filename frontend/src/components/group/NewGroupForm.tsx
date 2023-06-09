import React from "react";
import {
  Box,
  Button,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import useFormData from "../../hooks/useFormData";
import { DateTimePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../hooks/redux";
import { addGroup } from "../../actions/actionCreators";

interface NewGroup {
  title: string;
  description: string;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  isPrivate: boolean;
  maxMembers: number | undefined;
}

const INITIAL_STATE: NewGroup = {
  title: "",
  description: "",
  startTime: null,
  endTime: null,
  isPrivate: false,
  maxMembers: undefined,
};

function NewGroupForm() {
  const [formData, handleChange, setFormData] = useFormData(INITIAL_STATE);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  function setTimeData(value: Dayjs | null, prop: string) {
    setFormData((fd: NewGroup) => ({
      ...fd,
      [prop]: value,
    }));
  }

  function handleSubmit(evt: React.FormEvent) {
    evt.preventDefault();
    dispatch(addGroup(formData as IGroup));
    setFormData(INITIAL_STATE);
    navigate("/groups");
  }

  return (
    <Box sx={{ display: "grid", justifyItems: "center" }}>
      <Typography variant="h3">Create New Group</Typography>
      <Box
        component="form"
        autoComplete="off"
        sx={{ display: "block", my: 3, width: "60%" }}
        onSubmit={handleSubmit}>
        <TextField
          fullWidth
          id="title"
          label="Title"
          sx={{ my: 1 }}
          value={formData.title}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          id="description"
          label="Description"
          multiline
          maxRows={4}
          sx={{ my: 1 }}
          value={formData.description}
          onChange={handleChange}
        />
        <DateTimePicker
          sx={{ width: "50%" }}
          label="Start Time"
          disablePast
          value={formData.startTime}
          onChange={(value) => setTimeData(value, "startTime")}
        />
        <DateTimePicker
          sx={{ width: "50%" }}
          label="End Time"
          disablePast
          value={formData.endTime}
          onChange={(value) => setTimeData(value, "endTime")}
        />
        <Box
          sx={{
            my: 1,
            display: "flex",
            justifyContent: "space-around",
          }}>
          <FormControlLabel
            control={
              <Switch
                id="isPrivate"
                checked={formData.isPrivate}
                onChange={(e) =>
                  setFormData((fd: NewGroup) => ({
                    ...fd,
                    isPrivate: e.target.checked,
                  }))
                }
              />
            }
            label="Private Group?"
          />
          <TextField
            id="maxMembers"
            label="Maximum Members"
            type="number"
            value={formData.maxMembers}
            onChange={handleChange}
          />
        </Box>
        <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <Button type="submit" variant="contained">
            Create
          </Button>
          <Button
            component={Link}
            to="/groups"
            variant="contained"
            color="secondary">
            Cancel
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default NewGroupForm;
