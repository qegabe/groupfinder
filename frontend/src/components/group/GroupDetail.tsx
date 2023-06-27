import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  IconButton,
  Button,
  Tooltip,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import GroupFinderApi from "../../api";
import { Link, useParams } from "react-router-dom";
import LoadingSpinner from "../common/LoadingSpinner";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import { useAppSelector } from "../../hooks/redux";
import GameList from "../game/GameList";
import UserList from "../user/UserList";
import SomethingWentWrong from "../common/SomethingWentWrong";
import GroupChat from "./GroupChat";
dayjs.extend(duration);
dayjs.extend(relativeTime);

function GroupDetail() {
  const { id } = useParams();
  const [group, setGroup] = useState<Group>();
  const [isPrivate, setIsPrivate] = useState(false);
  const [isError, setIsError] = useState(false);
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    async function loadGroup() {
      try {
        setGroup(await GroupFinderApi.getGroup(+(id as string)));
      } catch (error: any) {
        if (error === `You are not a member of group with id: ${id}`) {
          setIsPrivate(true);
        } else {
          setIsError(true);
        }
      }
    }
    loadGroup();
  }, [id]);

  async function joinGroup() {
    try {
      await GroupFinderApi.joinGroup(+(id as string));
      if (group && user) {
        setGroup(
          (g) =>
            ({
              ...g,
              members: {
                ...g?.members,
                [user.username]: { avatarUrl: user.avatarUrl, isOwner: false },
              },
            } as Group)
        );
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function leaveGroup() {
    try {
      await GroupFinderApi.leaveGroup(+(id as string));
      if (group && user) {
        setGroup((g) => {
          const members = g?.members;
          if (members) {
            delete members[user.username];
          }
          return {
            ...g,
            members,
          } as Group;
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  if (isError) return <SomethingWentWrong />;

  if (isPrivate) {
    return (
      <Box
        sx={{
          height: 600,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}>
        <Typography variant="h2">This group is private!</Typography>
      </Box>
    );
  }

  if (!group) return <LoadingSpinner />;

  const isMember = Boolean(group.members[user?.username as keyof object]);
  const isOwner = Boolean(
    group.members[user?.username as keyof object]?.isOwner
  );

  const hasTrivia = group.games.some((g) => g.id === -1);

  return (
    <Grid container spacing={2}>
      <Grid item xs={2}>
        <Box sx={{ mt: 2, ml: 2 }}>
          <Typography>Users</Typography>
          <UserList userData={group.members} />
        </Box>
      </Grid>
      <Grid item container direction="column" xs={7}>
        <Grid item container justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Typography
              variant="h3"
              sx={{ mt: 2, textTransform: "capitalize" }}>
              {group.title}
            </Typography>
            {isOwner ? (
              <Tooltip title="Edit">
                <IconButton
                  sx={{ mt: 2, height: 40, width: 40 }}
                  component={Link}
                  to={`/groups/${id}/edit`}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
            ) : null}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
            {isMember && !isOwner ? (
              <Button variant="contained" onClick={leaveGroup}>
                Leave Group
              </Button>
            ) : null}
            {!isMember && user ? (
              <Button variant="contained" onClick={joinGroup}>
                Join Group
              </Button>
            ) : null}
          </Box>
        </Grid>
        <Grid item>
          <hr />
          <Box>
            {group.cityId ? (
              <Typography>
                Location: {group.address}, {group.city}
              </Typography>
            ) : null}
            <Typography>
              Starting at: {group.startTime.format("LLL")}
            </Typography>
            <Typography>
              Lasts{" "}
              {dayjs.duration(group.endTime.diff(group.startTime)).humanize()}
            </Typography>
          </Box>
        </Grid>
        <Grid item>
          <hr />
          <Box sx={{ my: 2 }}>
            <Typography sx={{ fontStyle: "italic" }}>
              {group.description}
            </Typography>
          </Box>
        </Grid>
      </Grid>
      <Grid
        item
        container
        direction="column"
        maxHeight="100vh"
        height="calc(100vh - 84px)"
        xs={3}>
        {hasTrivia && isMember ? (
          <Grid item container justifyContent="center">
            <Button
              sx={{ mt: 2 }}
              variant="contained"
              component={Link}
              to={`/games/trivia/${id}`}>
              Play Trivia
            </Button>
          </Grid>
        ) : null}
        <Grid item flexGrow={1}>
          <Box sx={{ mt: 2, mr: 2, maxHeight: 390 }}>
            <Typography>Games</Typography>
            <GameList gameData={group.games} />
          </Box>
        </Grid>
        {isMember ? (
          <Grid item flexGrow={3} sx={{ maxHeight: 480 }}>
            <GroupChat />
          </Grid>
        ) : null}
      </Grid>
    </Grid>
  );
}

export default GroupDetail;
