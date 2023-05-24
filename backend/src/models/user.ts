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

/** Related functions for users */
class User {
  /**
   * Register user
   * @param {string} username username must be unique
   * @param {string} password
   * @returns {Promise<Object>}
   */
  static async register(username: string, password: string): Promise<Object> {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    let result: QueryResult;

    try {
      result = await db.query(
        `INSERT INTO users (username, password)
              VALUES ($1, $2)
              RETURNING username, password, bio, avatar_url, trivia_score
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

    return result.rows[0];
  }

  /**
   * Authenticate user
   * @param {string} username
   * @param {string} password
   * @returns {Promise<Object>}
   */
  static async authenticate(
    username: string,
    password: string
  ): Promise<Object> {
    const result = await db.query(
      `SELECT username, password
        FROM users
        WHERE username = $1
        `,
      [username]
    );

    const user = result.rows[0];
    if (user) {
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid) {
        return user;
      }
    }
    throw new UnauthorizedError("Invalid username/password");
  }

  static async getList(limit = 100): Promise<Object[]> {
    const result = await db.query(
      ` SELECT username, avatar_url
      FROM users
      ORDER BY username
      LIMIT $1
      `,
      [limit]
    );

    return result.rows;
  }

  static async getByUsername(username: string): Promise<Object> {
    const result = await db.query(
      `SELECT username, bio, avatar_url, trivia_score
      FROM users
      WHERE username = $1
      `,
      [username]
    );

    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    return user;
  }
}

export default User;
