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
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = require("../config");
const expressError_1 = require("../helpers/expressError");
/** Related functions for users */
class User {
    /**
     * Register user
     * @param {string} username username must be unique
     * @param {string} password
     * @returns {Promise<Object>}
     */
    static register(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashedPassword = yield bcrypt_1.default.hash(password, config_1.BCRYPT_WORK_FACTOR);
            let result;
            try {
                result = yield db_1.default.query(`INSERT INTO users (username, password)
              VALUES ($1, $2)
              RETURNING username, password, bio, avatar_url, trivia_score
              `, [username, hashedPassword]);
            }
            catch (error) {
                if (error.code === "23505") {
                    throw new expressError_1.BadRequestError(`User already exists with username: ${username}`);
                }
                else
                    throw new expressError_1.ExpressError("Something went wrong", 500);
            }
            return result.rows[0];
        });
    }
    /**
     * Authenticate user
     * @param {string} username
     * @param {string} password
     * @returns {Promise<Object>}
     */
    static authenticate(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.default.query(`SELECT username, password
        FROM users
        WHERE username = $1
        `, [username]);
            const user = result.rows[0];
            if (user) {
                const isValid = yield bcrypt_1.default.compare(password, user.password);
                if (isValid) {
                    return user;
                }
            }
            throw new expressError_1.UnauthorizedError("Invalid username/password");
        });
    }
    static getList(limit = 100) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.default.query(` SELECT username, avatar_url
      FROM users
      ORDER BY username
      LIMIT $1
      `, [limit]);
            return result.rows;
        });
    }
    static getByUsername(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.default.query(`SELECT username, bio, avatar_url, trivia_score
      FROM users
      WHERE username = $1
      `, [username]);
            const user = result.rows[0];
            if (!user)
                throw new expressError_1.NotFoundError(`No user: ${username}`);
            return user;
        });
    }
}
exports.default = User;
//# sourceMappingURL=user.js.map