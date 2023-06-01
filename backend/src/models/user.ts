import db from "../db";
import bcrypt from "bcrypt";
import { BCRYPT_WORK_FACTOR } from "../config";
import {
  BadRequestError,
  ExpressError,
  NotFoundError,
  UnauthorizedError,
} from "../helpers/expressError";
import { QueryResult } from "pg";
import { IUser } from "../types";
import { sqlForPartialUpdate } from "../helpers/sql";

/** Related functions for users */
class User {
  /**
   * Register user
   * @param {string} username username must be unique
   * @param {string} password
   * @returns {Promise<IUser>} { username, password, bio, avatarUrl, triviaScore }
   */
  static async register(username: string, password: string): Promise<IUser> {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    let result: QueryResult;

    try {
      result = await db.query(
        `INSERT INTO users (username, password)
              VALUES ($1, $2)
              RETURNING username,
                        password,
                        bio,
                        avatar_url AS "avatarUrl",
                        trivia_score AS "triviaScore"
              `,
        [username, hashedPassword]
      );
    } catch (error) {
      if (error.code === "23505") {
        throw new BadRequestError(
          `User already exists with username: ${username}`
        );
      } else throw new ExpressError("Something went wrong", 500);
    }
    const user = result.rows[0];

    delete user.password;
    return user;
  }

  /**
   * Authenticate user
   * @param {string} username
   * @param {string} password
   * @returns {Promise<IUser>} { username, password, bio, avatarUrl, triviaScore }
   */
  static async authenticate(
    username: string,
    password: string
  ): Promise<IUser> {
    const result = await db.query(
      `SELECT username,
              password,
              bio,
              avatar_url AS "avatarUrl",
              trivia_score AS "triviaScore"
        FROM users
        WHERE username = $1
        `,
      [username]
    );

    const user = result.rows[0];
    if (user) {
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid) {
        delete user.password;
        return user;
      }
    }
    throw new UnauthorizedError("Invalid username/password");
  }

  /**
   * Get a list of users
   * @param {number} [limit=100] how many users to get
   * @returns {Promise<IUser[]>} [{ username, avatarUrl }]
   */
  static async getList(limit: number = 100): Promise<IUser[]> {
    const result = await db.query(
      ` SELECT username,
               avatar_url AS "avatarUrl"
       FROM users
       ORDER BY username
       LIMIT $1
      `,
      [limit]
    );

    return result.rows;
  }

  /**
   * Get a user by username
   * @param {string} username user to get
   * @returns {Promise<IUser>} { username, bio, avatarUrl, triviaScore }
   */
  static async getByUsername(username: string): Promise<IUser> {
    const result = await db.query(
      `SELECT username,
              bio,
              avatar_url AS "avatarUrl",
              trivia_score AS "triviaScore"
      FROM users
      WHERE username = $1
      `,
      [username]
    );

    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    return user;
  }

  /**
   * Updates a user
   * @param {string} username user to update
   * @param {UserUpdate} data
   * @returns {Promise<IUser>} { username, bio, avatarUrl }
   */
  static async update(username: string, data: IUser): Promise<IUser> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }

    const { setCols, values } = sqlForPartialUpdate(data);
    const usernameVarIdx = `$${values.length + 1}`;

    const result = await db.query(
      `UPDATE users
      SET ${setCols}
      WHERE username = ${usernameVarIdx}
      RETURNING username,
                bio,
                avatar_url AS "avatarUrl"
      `,
      [...values, username]
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    return user;
  }

  /**
   * Removes a user
   * @param {string} username user to remove
   */
  static async remove(username: string): Promise<void> {
    const result = await db.query(
      `DELETE FROM users
      WHERE username = $1
      RETURNING username
      `,
      [username]
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);
  }
}

export default User;
