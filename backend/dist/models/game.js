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
const axios_1 = __importDefault(require("axios"));
const expressError_1 = require("../helpers/expressError");
const IGDB_URL = "https://api.igdb.com/v4";
class Game {
    static findOrAdd(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const dbQuery = yield db_1.default.query(`SELECT id
       FROM games
       WHERE id = $1
      `, [id]);
            let game = dbQuery.rows[0];
            if (game)
                return game;
            [game] = yield getGameData([id]);
            if (!game)
                throw new expressError_1.NotFoundError(`No game found with id: ${id}`);
            yield db_1.default.query(`INSERT INTO games (id, title, cover_url)
       VALUES ($1, $2, $3)
      `, [game.id, game.title, game.coverUrl]);
            return game;
        });
    }
    static search(term) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield requestIGDB("search", `fields game; search "${term}"; limit 20;`);
            if (data.length === 0)
                return [];
            const gameIds = data.reduce((acc, g) => {
                if (g.game) {
                    acc.push(g.game);
                }
                return acc;
            }, []);
            return getGameData(gameIds);
        });
    }
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
function requestIGDB(endpoint, data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const resp = yield (0, axios_1.default)({
                url: `${IGDB_URL}/${endpoint}`,
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.TWITCH_TOKEN}`,
                    "Client-ID": process.env.TWITCH_CLIENT_ID,
                },
                data,
            });
            return resp.data;
        }
        catch (error) {
            //console.error(error);
            console.error(error.code);
        }
    });
}
function getGameData(ids) {
    return __awaiter(this, void 0, void 0, function* () {
        let gameData = [];
        const data = yield requestIGDB("games", `fields name,cover; where id = (${ids.join(",")});`);
        if (data.length > 0) {
            const coverIds = data.reduce((acc, g) => {
                if (g.cover) {
                    acc.push(g.cover);
                }
                return acc;
            }, []);
            let coverData = [];
            if (coverIds.length > 0) {
                coverData = yield requestIGDB("covers", `fields url; where id = (${coverIds.join(",")});`);
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