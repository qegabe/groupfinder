import React, { useState, ChangeEvent } from "react";
import {
  Box,
  Button,
  FormControlLabel,
  Switch,
  TextField,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import { Link, useNavigate } from "react-router-dom";
import parseFormErrors from "../../helpers/parseFormErrors";

function GroupForm({
  initialState,
  formData,
  setFormData,
  submit,
  returnPath,
  shouldReturn,
  buttons,
}: GroupFormProps) {
  const [formErrors, setFormErrors] = useState<any>({});
  const navigate = useNavigate();

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setFormData((fd: GroupFormData) => ({
      ...fd,
      [event.target.id]: event.target.value,
    }));
  }

  function setTimeData(value: Dayjs | null, prop: string) {
    setFormData((fd: GroupFormData) => ({
      ...fd,
      [prop]: value,
    }));
  }

  async function handleSubmit(evt: React.FormEvent) {
    evt.preventDefault();
    try {
      await submit();
      setFormData(initialState);
      if (shouldReturn) {
        navigate(returnPath);
      }
    } catch (error: any) {
      if (typeof error === "string") {
        setFormErrors(parseFormErrors(error));
      } else console.error(error);
    }
  }

  return (
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
          {buttons.submit}
        </Button>
        <Button
          component={Link}
          to={returnPath}
          variant="contained"
          color="secondary">
          {buttons.cancel}
        </Button>
      </Box>
    </Box>
  );
}

export default GroupForm;
