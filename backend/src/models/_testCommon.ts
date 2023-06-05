import bcrypt from "bcrypt";
import { BCRYPT_WORK_FACTOR } from "../config";
import db from "../db";

let groupIds: number[];

async function commonBeforeAll() {
  await db.query("DELETE FROM users");
  await db.query("DELETE FROM groups");
  await db.query("DELETE FROM games");
  await db.query("DELETE FROM groupsusers");
  await db.query("DELETE FROM favoritegames");
  await db.query("DELETE FROM groupsgames");

  await db.query(
    `INSERT INTO users (username, password)
     VALUES ('u1', $1),
            ('u2', $2),
            ('u3', $3)`,
    [
      await bcrypt.hash("12345", BCRYPT_WORK_FACTOR),
      await bcrypt.hash("54321", BCRYPT_WORK_FACTOR),
      await bcrypt.hash("67890", BCRYPT_WORK_FACTOR),
    ]
  );

  const res = await db.query(
    `INSERT INTO groups (title, start_time, end_time)
     VALUES ('g1', '2023-05-30T08:00:00.000Z', '2023-05-30T09:00:00.000Z'),
            ('g2', '2023-05-30T10:00:00.000Z', '2023-05-30T11:00:00.000Z'),
            ('g3', '2023-05-30T12:00:00.000Z', '2023-05-30T13:00:00.000Z')
     RETURNING id`
  );

  groupIds = res.rows.map((r) => r.id);

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

  await db.query(
    `INSERT INTO groupsusers (group_id, username, is_owner)
     VALUES ($1, 'u1', true),
            ($1, 'u2', false)`,
    [groupIds[0]]
  );
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

export {
  commonAfterAll,
  commonAfterEach,
  commonBeforeAll,
  commonBeforeEach,
  groupIds,
};
