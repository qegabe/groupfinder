import React, { useState, useEffect, useMemo, ChangeEvent } from "react";
import {
  Autocomplete,
  Box,
  Button,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
  debounce,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import { Link, useNavigate } from "react-router-dom";
import parseFormErrors from "../../helpers/parseFormErrors";
import GroupFinderApi from "../../api";

interface City {
  city: string;
  id: number;
}

function GroupForm({
  initialState,
  formData,
  setFormData,
  submit,
  returnPath,
  shouldReturn,
  buttons,
  extra,
}: GroupFormProps) {
  const [isOnline, setIsOnline] = useState(formData.address ? false : true);
  const [cities, setCities] = useState<City[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [formErrors, setFormErrors] = useState<any>({});
  const navigate = useNavigate();

  const search = useMemo(
    () =>
      debounce(async (term: string) => {
        const options = await GroupFinderApi.searchCities(term);
        setCities(options);
      }, 400),
    []
  );

  useEffect(() => {
    if (searchValue === "") {
      setCities([]);
    } else if (!formData.cityData) {
      search(searchValue);
    }
  }, [searchValue, search, formData.cityData]);

  function onlineToggle(evt: ChangeEvent<HTMLInputElement>) {
    setIsOnline(evt.target.checked);
    if (evt.target.checked) {
      setFormData((fd: GroupFormData) => ({
        ...fd,
        address: "",
        cityData: null,
      }));
    }
  }

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
      if (initialState) {
        setFormData(initialState);
      }
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
      sx={{ display: "block", my: 3, px: 1, width: { xs: "100%", md: "60%" } }}
      onSubmit={handleSubmit}>
      <TextField
        fullWidth
        required
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
        sx={{ width: "50%", my: 1 }}
        label="Start Time"
        value={formData.startTime}
        onChange={(value) => setTimeData(value, "startTime")}
        slotProps={{ textField: { ...formErrors.startTime } }}
      />
      <DateTimePicker
        sx={{ width: "50%", my: 1 }}
        label="End Time"
        value={formData.endTime}
        onChange={(value) => setTimeData(value, "endTime")}
        slotProps={{ textField: { ...formErrors.endTime } }}
      />
      {isOnline ? (
        <Box sx={{ my: 1, display: "flex", justifyContent: "center" }}>
          <FormControlLabel
            control={
              <Switch
                id="isOnline"
                checked={isOnline}
                onChange={onlineToggle}
              />
            }
            label="Online"
          />
        </Box>
      ) : (
        <Box
          sx={{ display: "flex", flexDirection: { xs: "column", md: "row" } }}>
          <FormControlLabel
            control={
              <Switch
                id="isOnline"
                checked={isOnline}
                onChange={onlineToggle}
              />
            }
            label="Online"
          />
          <TextField
            fullWidth
            required
            id="address"
            label="Address"
            sx={{ my: 1 }}
            value={formData.address}
            onChange={handleChange}
            {...formErrors.address}
          />
          <Autocomplete
            sx={{ my: 1, width: { xs: "100%", md: "60%" } }}
            getOptionLabel={(option) =>
              typeof option === "string" ? option : option.city
            }
            filterOptions={(x) => x}
            options={cities}
            autoComplete
            includeInputInList
            filterSelectedOptions
            value={formData.cityData}
            noOptionsText="Start typing to search cities..."
            onChange={(e: any, newValue: City | null) => {
              setCities(newValue ? [newValue, ...cities] : cities);
              setFormData((fd: GroupFormData) => ({
                ...fd,
                cityData: newValue,
              }));
            }}
            onInputChange={(e: any, newInputValue) => {
              setSearchValue(newInputValue);
            }}
            renderInput={(params) => (
              <TextField {...params} label="City" fullWidth required />
            )}
            renderOption={(props, city) => {
              return (
                <li {...props} key={city.id}>
                  <Typography>{city.city}</Typography>
                </li>
              );
            }}
          />
        </Box>
      )}

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
          inputProps={{ min: 0 }}
          value={formData.maxMembers}
          onChange={handleChange}
          {...formErrors.maxMembers}
        />
      </Box>
      {extra ? extra : null}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          mt: 2,
        }}>
        <Button type="submit" variant="contained" sx={{ mr: 1 }}>
          {buttons.submit}
        </Button>
        <Button
          component={Link}
          to={returnPath}
          variant="outlined"
          color="secondary">
          {buttons.cancel}
        </Button>
      </Box>
    </Box>
  );
}

export default GroupForm;
