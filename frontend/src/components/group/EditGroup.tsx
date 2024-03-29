import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Button,
  Grid,
  IconButton,
  Modal,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useParams, useNavigate } from "react-router-dom";
import GroupFinderApi from "../../api";
import GroupForm from "./GroupForm";
import LoadingSpinner from "../common/LoadingSpinner";
import AddGame from "../game/AddGame";
import GameList from "../game/GameList";
import AddUser from "../user/AddUser";
import UserList from "../user/UserList";
import { theme } from "../../theme";
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

function EditGroup() {
  const { id } = useParams();
  const groupId = +(id as string);
  const [groupData, setGroupData] = useState<Group>();
  const [formData, setFormData] = useState<GroupFormData>(INITIAL_STATE);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadGroup() {
      const group = await GroupFinderApi.getGroup(groupId);
      setGroupData(group);
      setFormData({
        title: group.title,
        description: group.description,
        startTime: group.startTime,
        endTime: group.endTime,
        address: group.address || "",
        cityData: group.cityId ? { city: group.city, id: group.cityId } : null,
        isPrivate: group.isPrivate,
        maxMembers: group.maxMembers,
      });
    }
    loadGroup();
  }, [groupId]);

  async function submit() {
    if (formData) {
      try {
        await GroupFinderApi.editGroup(groupId, formData);
        dispatch(setAlert("success", "Saved"));
      } catch (error) {
        console.error(error);
      }
    }
  }

  async function deleteGroup() {
    await GroupFinderApi.deleteGroup(groupId);
    dispatch(setAlert("info", "Group Deleted"));
    navigate("/");
  }

  const confirmModal = (
    <Modal
      open={confirmOpen}
      onClose={() => {
        setConfirmOpen(false);
      }}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "#121212",
          p: 5,
        }}>
        <Typography variant="h6">
          Are you sure you want to delete this group?
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Button
            onClick={deleteGroup}
            variant="contained"
            color="error"
            sx={{ mr: 1 }}>
            Delete
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setConfirmOpen(false);
            }}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );

  async function addUser(user: User) {
    try {
      await GroupFinderApi.addUser(groupId, user.username);
      setGroupData((gd) => {
        if (gd)
          return {
            ...gd,
            members: {
              ...gd.members,
              [user.username as keyof object]: {
                avatarUrl: user.avatarUrl,
                isOwner: false,
              },
            },
          };
      });
      dispatch(setAlert("success", `${user.username} added!`));
    } catch (error) {
      dispatch(setAlert("error", `Couldn't add user!`));
    }
  }

  async function removeUser(user: User) {
    try {
      await GroupFinderApi.removeUser(groupId, user.username);
      setGroupData((gd) => {
        const members = { ...gd?.members };
        delete members[user.username as keyof object];
        if (gd)
          return {
            ...gd,
            members,
          };
      });
      dispatch(setAlert("info", `${user.username} removed!`));
    } catch (error) {
      dispatch(setAlert("error", `Couldn't remove user!`));
    }
  }

  async function addGame(game: Game) {
    try {
      await GroupFinderApi.addGame(groupId, game.id);
      setGroupData((gd) => {
        if (gd)
          return {
            ...gd,
            games: [...(gd.games as Game[]), game],
          };
      });
      dispatch(setAlert("success", `${game.title} added!`));
    } catch (error) {
      dispatch(setAlert("error", `Couldn't add game!`));
    }
  }

  async function removeGame(game: Game) {
    try {
      await GroupFinderApi.removeGame(groupId, game.id);
      setGroupData((gd) => {
        if (gd)
          return {
            ...gd,
            games: (gd.games as Game[]).filter((g) => g.id !== game.id),
          };
      });
      dispatch(setAlert("info", `${game.title} removed!`));
    } catch (error) {
      dispatch(setAlert("error", `Couldn't remove game!`));
    }
  }

  //Loading spinner if group not loaded
  if (!groupData) return <LoadingSpinner />;

  const editUsersAndGames = (
    <Grid
      container
      spacing={2}
      justifyContent="space-between"
      direction={{ xs: "column", md: "row" }}
      mt={1}
      px={1}>
      <Grid item xs={5}>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="users-content"
            id="users-header">
            <Typography>Edit Users</Typography>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              backgroundColor: theme.palette.background.default,
              pt: 2,
            }}>
            <AddUser addUser={addUser} />
            <Box mt={2}>
              <UserList userData={groupData.members} removeUser={removeUser} />
            </Box>
          </AccordionDetails>
        </Accordion>
      </Grid>
      <Grid item xs={5}>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="users-content"
            id="users-header">
            <Typography>Edit Games</Typography>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              backgroundColor: theme.palette.background.default,
              pt: 2,
            }}>
            <AddGame addGame={addGame} />
            <Box mt={2}>
              <GameList gameData={groupData.games} removeGame={removeGame} />
            </Box>
          </AccordionDetails>
        </Accordion>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ display: "grid", justifyItems: "center" }}>
      <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
        <Typography sx={{ fontSize: { xs: "1.75rem", md: "3rem" } }}>
          Edit Group
        </Typography>
        <Tooltip title="Delete Group">
          <IconButton
            color="error"
            aria-label="delete group"
            onClick={() => {
              setConfirmOpen(true);
            }}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <GroupForm
        formData={formData as GroupFormData}
        setFormData={setFormData}
        submit={submit}
        returnPath={`/groups/${id}`}
        shouldReturn={false}
        buttons={{ submit: "Save", cancel: "Cancel" }}
        extra={editUsersAndGames}
      />
      {confirmModal}
    </Box>
  );
}

export default EditGroup;
