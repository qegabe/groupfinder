import db from "../db";
import User from "../models/user";
import Group from "../models/group";
import createToken from "../helpers/token";

let groupIds: number[];

async function commonBeforeAll() {
  await db.query("DELETE FROM users");
  await db.query("DELETE FROM groups");
  await db.query("DELETE FROM games");
  await db.query("DELETE FROM groupsusers");
  await db.query("DELETE FROM favoritegames");
  await db.query("DELETE FROM groupsgames");

  await User.register("u1", "12345");
  await User.register("u2", "12345");
  await User.register("u3", "12345");

  const g1 = await Group.create("u1", {
    title: "g1",
    startTime: new Date("2023-05-31T08:00:00.000-04:00"),
    endTime: new Date("2023-05-31T09:00:00.000-04:00"),
  });
  const g2 = await Group.create("u1", {
    title: "g2",
    startTime: new Date("2023-05-31T07:00:00.000-04:00"),
    endTime: new Date("2023-05-31T08:00:00.000-04:00"),
    isPrivate: true,
  });
  const g3 = await Group.create("u1", {
    title: "g3",
    startTime: new Date("2023-05-31T10:00:00.000-04:00"),
    endTime: new Date("2023-05-31T11:00:00.000-04:00"),
    maxMembers: 1,
  });

  groupIds = [g1.id, g2.id, g3.id];

  await db.query(
    `INSERT INTO games (id, title, cover_url)
     VALUES (1, 'game1', ''),
            (2, 'game2', '')
    `
  );

  await db.query(
    `INSERT INTO favoritegames (username, game_id)
     VALUES ('u1', 1)
    `
  );

  await db.query(
    `INSERT INTO groupsgames (group_id, game_id)
     VALUES ($1, 1)
    `,
    [groupIds[0]]
  );

  await Group.join("u2", g1.id);
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

const token1 = createToken({ username: "u1" });
const token2 = createToken({ username: "u2" });
const token3 = createToken({ username: "u3" });

export {
  commonAfterAll,
  commonAfterEach,
  commonBeforeAll,
  commonBeforeEach,
  groupIds,
  token1,
  token2,
  token3,
};
