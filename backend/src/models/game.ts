import { IGame } from "../types";
import db from "../db";
import { requestIGDB } from "../helpers/igdb";
import {
  NotFoundError,
  BadRequestError,
  ExpressError,
} from "../helpers/expressError";

class Game {
  /**
   * Tries to find a game in the database if it can't find it
   * search IGDB and add it to the database
   * @param id game id
   * @returns {Promise<IGame>}
   */
  static async findOrAdd(id: number): Promise<IGame> {
    const dbQuery = await db.query(
      `SELECT id,
              title,
              cover_url AS "coverUrl"
       FROM games
       WHERE id = $1
      `,
      [id]
    );
    let game = dbQuery.rows[0];
    if (game) return game;

    [game] = await getGameData([id]);
    if (!game) throw new NotFoundError(`No game found with id: ${id}`);

    await db.query(
      `INSERT INTO games (id, title, cover_url)
       VALUES ($1, $2, $3)
      `,
      [game.id, game.title, game.coverUrl]
    );

    return game;
  }

  /**
   * Search IGDB for games with titles that match the term
   * @param term search term
   * @returns {Promise<IGame[]>}
   */
  static async search(term: string): Promise<IGame[]> {
    const data = await requestIGDB(
      "search",
      `fields game; search "${term}"; limit 20;`
    );
    if (data.length === 0) return [];

    const gameIds = data.reduce((acc: number[], g: any) => {
      if (g.game) {
        acc.push(g.game);
      }
      return acc;
    }, []);
    return getGameData(gameIds);
  }

  /**
   * Adds a game to the users favorites
   * adds game to db if it isn't already
   * @param username
   * @param id game id
   */
  static async addFavorite(username: string, id: number): Promise<void> {
    //add to db if it isn't there
    await this.findOrAdd(id);

    try {
      await db.query(
        `INSERT INTO favoritegames (username, game_id)
         VALUES ($1, $2)
        `,
        [username, id]
      );
    } catch (error) {
      if (error.code === "23503") {
        throw new NotFoundError(`No user: ${username}`);
      } else if (error.code === "23505") {
        throw new BadRequestError(`Game already favorited`);
      } else {
        console.error(error);
        throw new ExpressError("Something went wrong", 500);
      }
    }
  }

  /**
   * Removes a game from a users favorites
   * @param username
   * @param id game id
   */
  static async removeFavorite(username: string, id: number): Promise<void> {
    const result = await db.query(
      `DELETE FROM favoritegames
       WHERE game_id = $1 AND username = $2
       RETURNING game_id
      `,
      [id, username]
    );

    if (result.rowCount === 0)
      throw new NotFoundError(`Game with id ${id} not in favorites`);
  }

  /**
   * Adds a game to group's games
   * @param groupId
   * @param gameId
   */
  static async addToGroup(groupId: number, gameId: number): Promise<void> {
    //add to db if it isn't there
    await this.findOrAdd(gameId);

    try {
      await db.query(
        `INSERT INTO groupsgames (group_id, game_id)
         VALUES ($1, $2)
        `,
        [groupId, gameId]
      );
    } catch (error) {
      if (error.code === "23503") {
        throw new NotFoundError(`No group with id: ${groupId}`);
      } else if (error.code === "23505") {
        throw new BadRequestError(`Game already added`);
      } else {
        console.error(error);
        throw new ExpressError("Something went wrong", 500);
      }
    }
  }

  /**
   * Removes a game from group's games
   * @param groupId
   * @param gameId
   */
  static async removeFromGroup(groupId: number, gameId: number): Promise<void> {
    const result = await db.query(
      `DELETE FROM groupsgames
       WHERE group_id = $1 AND game_id = $2
       RETURNING game_id
      `,
      [groupId, gameId]
    );

    if (result.rowCount === 0)
      throw new NotFoundError(`Game with id ${gameId} not in group`);
  }
}

/**
 * Gets game data from an array of game ids
 * @param ids game ids
 * @returns {Promise<IGame[]>}
 */
async function getGameData(ids: number[]): Promise<IGame[]> {
  if (ids.length === 0)
    return new Promise<IGame[]>((resolve, reject) => {
      resolve([]);
    });
  let gameData: IGame[] = [];
  const data = await requestIGDB(
    "games",
    `fields name,cover,category; where id = (${ids.join(",")});`
  );
  if (data.length > 0) {
    const coverIds = data.reduce((acc: number[], g: any) => {
      if (g.cover && g.category === 0) {
        acc.push(g.cover);
      }
      return acc;
    }, []);
    let coverData = [];
    if (coverIds.length > 0) {
      coverData = await requestIGDB(
        "covers",
        `fields url; where id = (${coverIds.join(",")});`
      );
    }
    for (let g of data) {
      let coverUrl = "";
      for (let c of coverData) {
        if (c.id === g.cover) {
          coverUrl = `https:${c.url}`;
          break;
        }
      }
      if (g.category === 0) {
        gameData.push({
          id: g.id,
          title: g.name,
          coverUrl,
        });
      }
    }
  }
  return gameData;
}

export default Game;
