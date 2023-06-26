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
import { Filter, IUser } from "../types";
import { sqlForPartialUpdate, sqlForFiltering } from "../helpers/sql";

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
      } else {
        console.error(error);
        throw new ExpressError("Something went wrong", 500);
      }
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
  static async getList(
    filter: Filter = {},
    limit: number = 100
  ): Promise<IUser[]> {
    const { matchers, values } = sqlForFiltering(filter);

    let where = "";
    if (matchers.length > 0) {
      where = `WHERE ${matchers.join(" AND ")}`;
    }

    const query = `SELECT username,
                           avatar_url AS "avatarUrl"
                   FROM users
                   ${where}
                   ORDER BY username
                   LIMIT $${values.length + 1}`;

    const result = await db.query(query, [...values, limit]);

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

    let result: QueryResult;

    try {
      result = await db.query(
        `UPDATE users
        SET ${setCols}
        WHERE username = ${usernameVarIdx}
        RETURNING username,
                  bio,
                  avatar_url AS "avatarUrl"
        `,
        [...values, username]
      );
    } catch (error) {
      if (error.code === "23505") {
        throw new BadRequestError(`Username ${data.username} already taken`);
      } else {
        console.error(error);
        throw new ExpressError("Something went wrong", 500);
      }
    }

    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    return user;
  }

  /**
   * Updates a user's trivia high score.
   * Won't update db if newScore < current score
   * @param {string} username user to update
   * @param {number} newScore
   * @returns {Promise<void>}
   */
  static async updateHighScore(
    username: string,
    newScore: number
  ): Promise<void> {
    await db.query(
      `UPDATE users
       SET trivia_score = $1
       WHERE username = $2 AND (trivia_score IS NULL OR trivia_score < $1)
      `,
      [newScore, username]
    );
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
