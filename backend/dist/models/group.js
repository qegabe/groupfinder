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
const expressError_1 = require("../helpers/expressError");
const sql_1 = require("../helpers/sql");
const expressError_2 = require("../helpers/expressError");
const expressError_3 = require("../helpers/expressError");
/** Related functions for groups */
class Group {
    /**
     * Creates a new group
     * @param {string} username user that created the group
     * @param {IGroup} data
     * @returns {Promise<IGroup>}
     */
    static create(username, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { colString, valString, values } = (0, sql_1.sqlForInserting)(data);
            const groupResult = yield db_1.default.query(`INSERT INTO groups ${colString}
      VALUES ${valString}
      RETURNING id,
                title,
                description,
                start_time AS "startTime",
                end_time AS "endTime",
                location,
                is_private AS "isPrivate",
                max_members AS "maxMembers"
      `, values);
            const group = groupResult.rows[0];
            yield db_1.default.query(`INSERT INTO groupsusers (group_id, username, is_owner)
      VALUES  ($1, $2, $3)
      `, [group.id, username, true]);
            group.users = [username];
            return group;
        });
    }
    /**
     * Gets a list of groups with optional filtering
     * @param {number} limit how many groups to list
     * @param {object} filter
     * @returns {Promise<IGroup>} { id, title, startTime, endTime }
     */
    static getList(limit = 100, filter = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const { matchers, values } = (0, sql_1.sqlForFiltering)(filter);
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
            const result = yield db_1.default.query(query, [...values, limit]);
            return result.rows;
        });
    }
    /**
     * Gets a group by id
     * @param {number} id group id
     * @returns {Promise<IGroup>}
     */
    static getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const groupResult = yield db_1.default.query(`SELECT id,
              title,
              description,
              start_time AS "startTime",
              end_time AS "endTime",
              location,
              is_private AS "isPrivate",
              max_members AS "maxMembers"
        FROM groups
        WHERE id = $1
      `, [id]);
            const group = groupResult.rows[0];
            if (!group)
                throw new expressError_1.NotFoundError(`No group with id: ${id}`);
            const userResult = yield db_1.default.query(`SELECT username
      FROM groupsusers
      WHERE group_id = $1
      `, [group.id]);
            const members = userResult.rows.map((u) => u.username);
            group.members = members;
            return group;
        });
    }
    /**
     * Updates a group
     * @param {number} id group id
     * @param {IGroup} data
     * @returns {Promise<IGroup>}
     */
    static update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { setCols, values } = (0, sql_1.sqlForPartialUpdate)(data);
            const idVarIdx = `$${values.length + 1}`;
            const result = yield db_1.default.query(`UPDATE groups
      SET ${setCols}
      WHERE id = ${idVarIdx}
      RETURNING id,
                title,
                description,
                start_time AS "startTime",
                end_time AS "endTime",
                location,
                is_private AS "isPrivate"
      `, [...values, id]);
            const group = result.rows[0];
            if (!group)
                throw new expressError_1.NotFoundError(`No group with id: ${id}`);
            return group;
        });
    }
    /**
     * Removes a group
     * @param id group id
     */
    static remove(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.default.query(`DELETE FROM groups
      WHERE id = $1
      RETURNING id
      `, [id]);
            const group = result.rows[0];
            if (!group)
                throw new expressError_1.NotFoundError(`No group with id: ${id}`);
        });
    }
    /**
     * Checks if a user is an owner of a group
     * @param {number} id group id
     * @param {string} username
     * @returns {Promise<boolean>}
     */
    static isOwner(id, username) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.default.query(`SELECT is_owner
      FROM groupsusers
      WHERE group_id = $1 AND username = $2
      `, [id, username]);
            const groupuser = result.rows[0];
            if (!groupuser)
                return false;
            return groupuser.is_owner;
        });
    }
    static isMember(id, username) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.default.query(`SELECT username
      FROM groupsusers
      WHERE group_id = $1 AND username = $2
      `, [id, username]);
            const groupuser = result.rows[0];
            return groupuser ? true : false;
        });
    }
    static join(username, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.default.query(`SELECT is_private, max_members, COUNT(*)
      FROM groups
      LEFT JOIN groupsusers ON groupsusers.group_id = groups.id
      WHERE id = $1
      GROUP BY id
      `, [id]);
            const group = result.rows[0];
            if (!group)
                throw new expressError_1.NotFoundError(`No group with id: ${id}`);
            if (group.is_private)
                throw new expressError_3.UnauthorizedError(`You must be invited to join private groups`);
            if (group.count === group.max_members) {
                throw new expressError_2.BadRequestError(`Group already full`);
            }
            yield db_1.default.query(`INSERT INTO groupsusers (group_id, username)
        VALUES ($1, $2)
        `, [id, username]);
        });
    }
    static leave(username, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.default.query(`DELETE FROM groupsusers
      WHERE group_id = $1 AND username = $2
      RETURNING group_id, username
      `, [id, username]);
            const groupuser = result.rows[0];
            if (!groupuser)
                throw new expressError_1.NotFoundError(`User ${username} was not in group with id: ${id}`);
        });
    }
}
exports.default = Group;
//# sourceMappingURL=group.js.map