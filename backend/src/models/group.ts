import { Filter, IGroup } from "../types";
import db from "../db";
import {
  NotFoundError,
  BadRequestError,
  ExpressError,
} from "../helpers/expressError";
import {
  sqlForFiltering,
  sqlForInserting,
  sqlForPartialUpdate,
} from "../helpers/sql";

/** Related functions for groups */
class Group {
  /**
   * Creates a new group
   * @param {string} username user that created the group
   * @param {IGroup} data
   * @returns {Promise<IGroup>}
   */
  static async create(username: string, data: IGroup): Promise<IGroup> {
    const { colString, valString, values } = sqlForInserting(data);

    const groupResult = await db.query(
      `INSERT INTO groups ${colString}
      VALUES ${valString}
      RETURNING id,
                title,
                description,
                start_time AS "startTime",
                end_time AS "endTime",
                location,
                is_private AS "isPrivate",
                max_members AS "maxMembers"
      `,
      values
    );
    const group = groupResult.rows[0];

    await db.query(
      `INSERT INTO groupsusers (group_id, username, is_owner)
      VALUES  ($1, $2, $3)
      `,
      [group.id, username, true]
    );

    return group;
  }

  /**
   * Gets a list of groups with optional filtering
   * @param {number} limit how many groups to list
   * @param {object} filter
   * @returns {Promise<IGroup>} { id, title, startTime, endTime }
   */
  static async getList(
    limit: number = 100,
    filter: Filter = {}
  ): Promise<IGroup[]> {
    const { matchers, values } = sqlForFiltering(filter);

    let where = "WHERE is_private = false";
    if (matchers.length > 0) {
      where = `${where} AND ${matchers.join(" AND ")}`;
    }

    const query = `SELECT id,
                          title,
                          start_time AS "startTime",
                          end_time AS "endTime"
                    FROM groups
                    ${where}
                    ORDER BY start_time
                    LIMIT $${values.length + 1}`;

    const result = await db.query(query, [...values, limit]);

    return result.rows;
  }

  /**
   * Gets a group by id
   * @param {number} id group id
   * @returns {Promise<IGroup>}
   */
  static async getById(id: number): Promise<IGroup> {
    const groupResult = await db.query(
      `SELECT id,
              title,
              description,
              start_time AS "startTime",
              end_time AS "endTime",
              location,
              is_private AS "isPrivate",
              max_members AS "maxMembers"
        FROM groups
        WHERE id = $1
      `,
      [id]
    );
    const group: IGroup = groupResult.rows[0];

    if (!group) throw new NotFoundError(`No group with id: ${id}`);

    const userResult = await db.query(
      `SELECT users.username, is_owner, avatar_url
       FROM groupsusers
       LEFT JOIN users ON groupsusers.username = users.username
       WHERE group_id = $1
      `,
      [group.id]
    );

    let members: any = {};
    for (let m of userResult.rows) {
      members[m.username] = { isOwner: m.is_owner, avatarUrl: m.avatar_url };
    }
    group.members = members;

    const gameResult = await db.query(
      `SELECT games.id, title, cover_url AS "coverUrl"
       FROM groupsgames
       LEFT JOIN games ON games.id = groupsgames.game_id
       WHERE group_id = $1
      `,
      [group.id]
    );

    group.games = gameResult.rows;

    return group;
  }

  /**
   * Updates a group
   * @param {number} id group id
   * @param {IGroup} data
   * @returns {Promise<IGroup>}
   */
  static async update(id: number, data: IGroup): Promise<IGroup> {
    const { setCols, values } = sqlForPartialUpdate(data);
    const idVarIdx = `$${values.length + 1}`;

    if ("maxMembers" in data) {
      const res = await db.query(
        `SELECT COUNT(*)
         FROM groups
         LEFT JOIN groupsusers ON groupsusers.group_id = groups.id
         WHERE id = $1
         GROUP BY id
        `,
        [id]
      );

      if (res.rowCount > 0) {
        const count = res.rows[0].count;
        if (+count > data.maxMembers)
          throw new BadRequestError(
            "maxMembers cannot be set lower than current member count"
          );
      } else {
        throw new NotFoundError(`No group with id: ${id}`);
      }
    }

    const result = await db.query(
      `UPDATE groups
      SET ${setCols}
      WHERE id = ${idVarIdx}
      RETURNING id,
                title,
                description,
                start_time AS "startTime",
                end_time AS "endTime",
                location,
                is_private AS "isPrivate",
                max_members AS "maxMembers"
      `,
      [...values, id]
    );

    const group = result.rows[0];

    if (!group) throw new NotFoundError(`No group with id: ${id}`);

    return group;
  }

  /**
   * Removes a group
   * @param id group id
   */
  static async remove(id: number): Promise<void> {
    const result = await db.query(
      `DELETE FROM groups
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );
    const group = result.rows[0];

    if (!group) throw new NotFoundError(`No group with id: ${id}`);
  }

  /**
   * Checks if a user is an owner of a group
   * @param {number} id group id
   * @param {string} username
   * @returns {Promise<boolean>}
   */
  static async isOwner(id: number, username: string): Promise<boolean> {
    const result = await db.query(
      `SELECT id, username, is_owner 
       FROM groupsusers 
       RIGHT JOIN groups ON groupsusers.group_id = groups.id
       WHERE id = $1
      `,
      [id]
    );
    if (result.rowCount < 1) throw new NotFoundError(`No group with id: ${id}`);

    const users = result.rows.filter((r) => r.username === username);

    if (users.length === 0) return false;

    return users[0].is_owner;
  }

  /**
   * Checks if a user is a member of a group
   * @param id group id
   * @param username
   * @returns {Promise<boolean>}
   */
  static async isMember(id: number, username: string): Promise<boolean> {
    const result = await db.query(
      `SELECT username
      FROM groupsusers
      WHERE group_id = $1 AND username = $2
      `,
      [id, username]
    );
    const groupuser = result.rows[0];

    return groupuser ? true : false;
  }

  /**
   * Adds a user to a group
   * @param username
   * @param id
   * @param setOwner set the user as an owner
   */
  static async join(
    username: string,
    id: number,
    setOwner: boolean = false
  ): Promise<void> {
    const result = await db.query(
      `SELECT max_members, COUNT(*)
      FROM groups
      LEFT JOIN groupsusers ON groupsusers.group_id = groups.id
      WHERE id = $1
      GROUP BY id
      `,
      [id]
    );
    const group = result.rows[0];
    if (!group) throw new NotFoundError(`No group with id: ${id}`);

    if (+group.count === group.max_members) {
      throw new BadRequestError(`Group already full`);
    }

    try {
      await db.query(
        `INSERT INTO groupsusers (group_id, username, is_owner)
          VALUES ($1, $2, $3)
          `,
        [id, username, setOwner]
      );
    } catch (error) {
      if (error.code === "23503") {
        throw new NotFoundError(`No user: ${username}`);
      } else if (error.code === "23505") {
        throw new BadRequestError(`User ${username} already in group`);
      } else {
        console.error(error);
        throw new ExpressError("Something went wrong", 500);
      }
    }
  }

  /**
   * Removes a user from a group
   * @param username
   * @param id
   */
  static async leave(username: string, id: number): Promise<void> {
    const userResult = await db.query(
      `SELECT group_id, username, is_owner
       FROM groupsusers
       WHERE group_id = $1 AND username = $2
      `,
      [id, username]
    );

    const groupuser = userResult.rows[0];

    if (!groupuser)
      throw new NotFoundError(
        `User ${username} was not in group with id: ${id}`
      );

    if (groupuser.is_owner)
      throw new BadRequestError(`Owners can't leave groups`);

    await db.query(
      `DELETE FROM groupsusers
      WHERE group_id = $1 AND username = $2
      `,
      [id, username]
    );
  }
}

export default Group;
