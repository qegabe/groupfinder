import React from "react";
import { Box, Button, TextField } from "@mui/material";
import useFormData from "../../hooks/useFormData";

function SearchBar({ submitSearch }: SearchBarProps) {
  const [formData, handleChange] = useFormData({ term: "" });

  function handleSubmit(evt: React.FormEvent) {
    evt.preventDefault();
    submitSearch(formData.term);
  }

  return (
    <Box
      component="form"
      autoComplete="off"
      sx={{ display: "flex", width: "50%" }}
      onSubmit={handleSubmit}>
      <TextField
        fullWidth
        id="term"
        sx={{ my: 2 }}
        value={formData.term}
        onChange={handleChange}
      />
      <Button
        variant="contained"
        type="submit"
        sx={{ alignSelf: "center", mx: 1 }}>
        Search
      </Button>
    </Box>
  );
}

export default SearchBar;
