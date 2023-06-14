import React, { useState, useEffect } from "react";
import {
  Alert,
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
import { Link, useParams } from "react-router-dom";
import GroupFinderApi from "../../api";
import parseFormErrors from "../../helpers/parseFormErrors";
import LoadingSpinner from "../common/LoadingSpinner";
import AddGame from "../game/AddGame";

const INITIAL_STATE: GroupFormData = {
  title: "",
  description: "",
  startTime: null,
  endTime: null,
  isPrivate: false,
  maxMembers: undefined,
};

function EditGroupForm() {
  const { id } = useParams();
  const [formData, handleChange, setFormData] = useFormData(INITIAL_STATE);
  const [formErrors, setFormErrors] = useState<any>({});
  const [alertData, setAlertData] = useState<any[]>([]);

  useEffect(() => {
    async function loadGroup() {
      const group = await GroupFinderApi.getGroup(+(id as string));
      setFormData({
        title: group.title,
        description: group.description as string,
        startTime: group.startTime,
        endTime: group.endTime,
        isPrivate: group.isPrivate as boolean,
        maxMembers: group.maxMembers || undefined,
      });
    }
    loadGroup();
  }, [id, setFormData]);

  function setTimeData(value: Dayjs | null, prop: string) {
    setFormData((fd: GroupFormData) => ({
      ...fd,
      [prop]: value,
    }));
  }

  async function handleSubmit(evt: React.FormEvent) {
    evt.preventDefault();
    try {
      await GroupFinderApi.editGroup(+(id as string), formData as IGroup);
    } catch (error: any) {
      if (typeof error === "string") {
        setFormErrors(parseFormErrors(error));
      } else console.error(error);
    }
  }

  async function addGame(game: Game) {
    await GroupFinderApi.addGame(+(id as string), game.id);
    setAlertData([{ severity: "success", text: `${game.title} added!` }]);
  }

  const alerts = alertData.map((a) => (
    <Alert key={a.text} severity={a.severity}>
      {a.text}
    </Alert>
  ));

  if (formData.title === "") return <LoadingSpinner />;

  return (
    <Box sx={{ display: "grid", justifyItems: "center" }}>
      <Typography variant="h3">Edit Group</Typography>
      {alerts}
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
          {...formErrors.title}
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
          {...formErrors.description}
        />
        <DateTimePicker
          sx={{ width: "50%" }}
          label="Start Time"
          value={formData.startTime}
          onChange={(value) => setTimeData(value, "startTime")}
          slotProps={{ textField: { ...formErrors.startTime } }}
        />
        <DateTimePicker
          sx={{ width: "50%" }}
          label="End Time"
          value={formData.endTime}
          onChange={(value) => setTimeData(value, "endTime")}
          slotProps={{ textField: { ...formErrors.endTime } }}
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
                  setFormData((fd: GroupFormData) => ({
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
            {...formErrors.maxMembers}
          />
        </Box>
        <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <Button type="submit" variant="contained">
            Save
          </Button>
          <Button
            component={Link}
            to="/groups"
            variant="contained"
            color="secondary">
            Back
          </Button>
        </Box>
      </Box>
      <AddGame addGame={addGame} />
    </Box>
  );
}

export default EditGroupForm;
