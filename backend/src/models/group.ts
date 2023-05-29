import { Filter, IGroup } from "../types";
import db from "../db";
import { NotFoundError } from "../helpers/expressError";
import {
  sqlForFiltering,
  sqlForInserting,
  sqlForPartialUpdate,
} from "../helpers/sql";
import { BadRequestError } from "../helpers/expressError";
import { UnauthorizedError } from "../helpers/expressError";

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

    group.users = [username];
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
      `SELECT username
      FROM groupsusers
      WHERE group_id = $1
      `,
      [group.id]
    );

    const members = userResult.rows.map((u) => u.username);
    group.members = members;
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
                is_private AS "isPrivate"
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
      `SELECT is_owner
      FROM groupsusers
      WHERE group_id = $1 AND username = $2
      `,
      [id, username]
    );
    const groupuser = result.rows[0];

    if (!groupuser) return false;

    return groupuser.is_owner;
  }

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

  static async join(username: string, id: number): Promise<void> {
    const result = await db.query(
      `SELECT is_private, max_members, COUNT(*)
      FROM groups
      LEFT JOIN groupsusers ON groupsusers.group_id = groups.id
      WHERE id = $1
      GROUP BY id
      `,
      [id]
    );
    const group = result.rows[0];
    if (!group) throw new NotFoundError(`No group with id: ${id}`);

    if (group.is_private)
      throw new UnauthorizedError(`You must be invited to join private groups`);

    if (group.count === group.max_members) {
      throw new BadRequestError(`Group already full`);
    }

    await db.query(
      `INSERT INTO groupsusers (group_id, username)
        VALUES ($1, $2)
        `,
      [id, username]
    );
  }

  static async leave(username: string, id: number): Promise<void> {
    const result = await db.query(
      `DELETE FROM groupsusers
      WHERE group_id = $1 AND username = $2
      RETURNING group_id, username
      `,
      [id, username]
    );

    const groupuser = result.rows[0];

    if (!groupuser)
      throw new NotFoundError(
        `User ${username} was not in group with id: ${id}`
      );
  }
}

export default Group;
