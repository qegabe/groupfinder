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
/** Related functions for groups */
class Group {
    static create(username, { title, description, startTime, endTime, location }) {
        return __awaiter(this, void 0, void 0, function* () {
            const groupResult = yield db_1.default.query(`INSERT INTO groups (title, description, start_time, end_time, location)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id,
                title,
                description,
                start_time AS "startTime",
                end_time AS "endTime",
                location
      `, [title, description, startTime, endTime, location]);
            const group = groupResult.rows[0];
            yield db_1.default.query(`INSERT INTO groupsusers (group_id, username, is_owner)
      VALUES  ($1, $2, $3)
      `, [group.id, username, true]);
            group.users = [username];
            return group;
        });
    }
}
exports.default = Group;
//# sourceMappingURL=group.js.map