"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db"));
const igdb_1 = require("../helpers/igdb");
const expressError_1 = require("../helpers/expressError");
class Game {
    /**
     * Tries to find a game in the database if it can't find it
     * search IGDB and add it to the database
     * @param id game id
     * @returns {Promise<IGame>}
     */
    static findOrAdd(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const dbQuery = yield db_1.default.query(`SELECT id,
              title,
              cover_url AS "coverUrl"
       FROM games
       WHERE id = $1
      `, [id]);
            let game = dbQuery.rows[0];
            if (game)
                return game;
            const data = yield (0, igdb_1.requestIGDB)("games", `fields name,cover; where id = ${id};`);
            [game] = yield addCovers(data);
            if (!game)
                throw new expressError_1.NotFoundError(`No game found with id: ${id}`);
            yield db_1.default.query(`INSERT INTO games (id, title, cover_url)
       VALUES ($1, $2, $3)
      `, [game.id, game.title, game.coverUrl]);
            return game;
        });
    }
    /**
     * Search IGDB for games with titles that match the term
     * @param term search term
     * @returns {Promise<IGame[]>}
     */
    static search(term) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield (0, igdb_1.requestIGDB)("games", `fields name,cover; search "${term}"; where category = 0; limit 20;`);
            const gameData = yield addCovers(data);
            if (gameData.length > 0) {
                const gameIds = data.map((g) => g.id);
                const params = gameIds.map((g, i) => `$${i + 1}`);
                const result = yield db_1.default.query(`SELECT id, title, cover_url AS "coverUrl"
       FROM games
       WHERE id NOT IN (${params.join(",")})
             AND title ILIKE $${params.length + 1}
      `, [...gameIds, `%${term}%`]);
                gameData.push(...result.rows);
            }
            gameData.sort((a, b) => a.id - b.id);
            return gameData;
        });
    }
    /**
     * Adds a game to the users favorites
     * adds game to db if it isn't already
     * @param username
     * @param id game id
     */
    static addFavorite(username, id) {
        return __awaiter(this, void 0, void 0, function* () {
            //add to db if it isn't there
            yield this.findOrAdd(id);
            try {
                yield db_1.default.query(`INSERT INTO favoritegames (username, game_id)
         VALUES ($1, $2)
        `, [username, id]);
            }
            catch (error) {
                if (error.code === "23503") {
                    throw new expressError_1.NotFoundError(`No user: ${username}`);
                }
                else if (error.code === "23505") {
                    throw new expressError_1.BadRequestError(`Game already favorited`);
                }
                else {
                    console.error(error);
                    throw new expressError_1.ExpressError("Something went wrong", 500);
                }
            }
        });
    }
    /**
     * Removes a game from a users favorites
     * @param username
     * @param id game id
     */
    static removeFavorite(username, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.default.query(`DELETE FROM favoritegames
       WHERE game_id = $1 AND username = $2
       RETURNING game_id
      `, [id, username]);
            if (result.rowCount === 0)
                throw new expressError_1.NotFoundError(`Game with id ${id} not in favorites`);
        });
    }
    /**
     * Adds a game to group's games
     * @param groupId
     * @param gameId
     */
    static addToGroup(groupId, gameId) {
        return __awaiter(this, void 0, void 0, function* () {
            //add to db if it isn't there
            yield this.findOrAdd(gameId);
            try {
                yield db_1.default.query(`INSERT INTO groupsgames (group_id, game_id)
         VALUES ($1, $2)
        `, [groupId, gameId]);
            }
            catch (error) {
                if (error.code === "23503") {
                    throw new expressError_1.NotFoundError(`No group with id: ${groupId}`);
                }
                else if (error.code === "23505") {
                    throw new expressError_1.BadRequestError(`Game already added`);
                }
                else {
                    console.error(error);
                    throw new expressError_1.ExpressError("Something went wrong", 500);
                }
            }
        });
    }
    /**
     * Removes a game from group's games
     * @param groupId
     * @param gameId
     */
    static removeFromGroup(groupId, gameId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.default.query(`DELETE FROM groupsgames
       WHERE group_id = $1 AND game_id = $2
       RETURNING game_id
      `, [groupId, gameId]);
            if (result.rowCount === 0)
                throw new expressError_1.NotFoundError(`Game with id ${gameId} not in group`);
        });
    }
}
/**
 * Adds cover urls to results from IGDB
 * @param data games
 * @returns {Promise<IGame[]>}
 */
function addCovers(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const gameData = [];
        if (data.length > 0) {
            const coverIds = data.reduce((acc, g) => {
                if (g.cover) {
                    acc.push(g.cover);
                }
                return acc;
            }, []);
            let coverData = [];
            if (coverIds.length > 0) {
                coverData = yield (0, igdb_1.requestIGDB)("covers", `fields url; where id = (${coverIds.join(",")});`);
            }
            for (let g of data) {
                let coverUrl = "";
                for (let c of coverData) {
                    if (c.id === g.cover) {
                        coverUrl = `https:${c.url}`;
                        break;
                    }
                }
                gameData.push({
                    id: g.id,
                    title: g.name,
                    coverUrl,
                });
            }
        }
        return gameData;
    });
}
exports.default = Game;
//# sourceMappingURL=game.js.map