import React, { useEffect, useState } from "react";
import { Box, Grid, Button, Typography } from "@mui/material";
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

  const chatButton = (
    <Button variant="contained" component={Link} to={`/groups/${id}/chat`}>
      Chat
    </Button>
  );

  const isMember = Boolean(group.members[user?.username as keyof object]);
  const isOwner = Boolean(
    group.members[user?.username as keyof object]?.isOwner
  );

  let buttons = null;
  if (group.members && user) {
    if (isOwner) {
      buttons = (
        <>
          {chatButton}
          <Button
            variant="contained"
            component={Link}
            to={`/groups/${id}/edit`}>
            Edit
          </Button>
        </>
      );
    } else if (isMember) {
      buttons = (
        <>
          {chatButton}
          <Button variant="contained" onClick={leaveGroup}>
            Leave
          </Button>
        </>
      );
    } else {
      buttons = (
        <Button variant="contained" onClick={joinGroup}>
          Join
        </Button>
      );
    }
  }

  const hasTrivia = group.games.some((g) => g.id === -1);

  return (
    <Box sx={{ display: "grid", justifyItems: "center" }}>
      <Typography variant="h3" sx={{ my: 2, textTransform: "capitalize" }}>
        {group.title}
      </Typography>
      <Box sx={{ my: 2 }}>
        <Typography sx={{ fontStyle: "italic" }}>
          {group.description}
        </Typography>
      </Box>
      <Typography>Starting at: {group.startTime.format("LLL")}</Typography>
      <Typography>
        Lasts {dayjs.duration(group.endTime.diff(group.startTime)).humanize()}
      </Typography>
      {group.cityId ? (
        <Typography>
          Location: {group.address}, {group.city}
        </Typography>
      ) : null}
      <Grid container spacing={2}>
        <Grid item sx={{ display: "grid", justifyContent: "center" }} xs={6}>
          <Box sx={{ my: 2 }}>
            <Typography>Users</Typography>
            <UserList userData={group.members} />
          </Box>
        </Grid>
        <Grid item sx={{ display: "grid", justifyContent: "center" }} xs={6}>
          <Box sx={{ my: 2 }}>
            <Typography>Games</Typography>
            <GameList gameData={group.games} />
          </Box>
        </Grid>
      </Grid>

      {hasTrivia && isMember ? (
        <Button
          sx={{ mb: 4 }}
          variant="contained"
          component={Link}
          to={`/games/trivia/${id}`}>
          Play Trivia
        </Button>
      ) : null}

      <Grid container spacing={2} direction="row" justifyContent="center">
        {buttons}
      </Grid>
    </Box>
  );
}

export default GroupDetail;
