import { Filter, IGroup } from "../types";
import db from "../db";
import {
  BadRequestError,
  ExpressError,
  NotFoundError,
  UnauthorizedError,
} from "../helpers/expressError";
import { sqlForFiltering, sqlForPartialUpdate } from "../helpers/sql";

/** Related functions for groups */
class Group {
  /**
   * Creates a new group
   * @param {string} username user that created the group
   * @param {IGroup} data
   * @returns {Promise<IGroup>}
   */
  static async create(
    username: string,
    { title, description, startTime, endTime, location }: IGroup
  ): Promise<IGroup> {
    const groupResult = await db.query(
      `INSERT INTO groups (title, description, start_time, end_time, location)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id,
                title,
                description,
                start_time AS "startTime",
                end_time AS "endTime",
                location
      `,
      [title, description, startTime, endTime, location]
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

    let where = "";
    if (matchers.length > 0) {
      where = `WHERE ${matchers.join(" AND ")}`;
    }

    const query = `SELECT id,
                          title,
                          start_time AS "startTime",
                          end_time AS "endTime"
                    FROM groups
                    ${where}
                    ORDER BY start_time
                    LIMIT $${values.length + 1}`;
    console.log(query);

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
              location
        FROM groups
        WHERE id = $1
      `,
      [id]
    );
    const group = groupResult.rows[0];

    if (!group) throw new NotFoundError(`No group with id: ${id}`);

    const userResult = await db.query(
      `SELECT username
      FROM groupsusers
      WHERE group_id = $1
      `,
      [group.id]
    );

    const users = userResult.rows.map((u) => u.username);
    group.users = users;
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
                location
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
}

export default Group;
