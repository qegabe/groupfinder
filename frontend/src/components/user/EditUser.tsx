import React, { useEffect, useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import useFormData from "../../hooks/useFormData";
import GroupFinderApi from "../../api";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import parseFormErrors from "../../helpers/parseFormErrors";
import { Link } from "react-router-dom";
import { setAlert, setAvatar } from "../../actions/actionCreators";

function EditUser() {
  const [formErrors, setFormErrors] = useState<any>({});
  const [formData, handleChange, setFormData] = useFormData({
    avatarUrl: "",
    bio: "",
  });
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();

  useEffect(() => {
    async function loadUser() {
      const userData = await GroupFinderApi.getUser(user?.username as string);
      setFormData((fd) => ({
        avatarUrl: userData.avatarUrl || "",
        bio: userData.bio || "",
      }));
    }
    loadUser();
  }, [user?.username, setFormData]);

  async function handleSubmit(evt: any) {
    evt.preventDefault();
    try {
      await GroupFinderApi.updateProfile(user?.username as string, formData);
      dispatch(setAvatar(formData.avatarUrl));
      dispatch(setAlert("success", "Saved"));
    } catch (error: any) {
      if (typeof error === "string") {
        setFormErrors(parseFormErrors(error));
      } else console.error(error);
    }
  }

  return (
    <Box sx={{ display: "grid", justifyItems: "center" }}>
      <Typography variant="h3" sx={{ mt: 2 }}>
        Edit Profile
      </Typography>
      <Box
        component="form"
        autoComplete="off"
        sx={{
          display: "grid",
          my: 3,
          px: 1,
          width: { xs: "100%", lg: "60%" },
          justifyItems: "center",
        }}
        onSubmit={handleSubmit}>
        <TextField
          fullWidth
          id="avatarUrl"
          label="Avatar URL"
          variant="outlined"
          type="url"
          sx={{ my: 1 }}
          value={formData.avatarUrl}
          onChange={handleChange}
          {...formErrors.avatarUrl}
        />
        <TextField
          fullWidth
          id="bio"
          label="Bio"
          multiline
          maxRows={4}
          variant="outlined"
          sx={{ my: 1 }}
          value={formData.bio}
          onChange={handleChange}
          {...formErrors.bio}
        />
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            my: 2,
          }}>
          <Button type="submit" variant="contained" sx={{ mr: 1 }}>
            Save
          </Button>
          <Button
            component={Link}
            to={user ? `/users/${user.username}` : "/"}
            variant="outlined"
            color="secondary">
            Cancel
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default EditUser;
