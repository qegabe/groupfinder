import { GroupCreate, IGroup } from "../types";
import db from "../db";
import {
  BadRequestError,
  ExpressError,
  NotFoundError,
  UnauthorizedError,
} from "../helpers/expressError";

/** Related functions for groups */
class Group {
  static async create(
    username: string,
    { title, description, startTime, endTime, location }: GroupCreate
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
}

export default Group;
