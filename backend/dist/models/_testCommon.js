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
exports.groupIds = exports.commonBeforeEach = exports.commonBeforeAll = exports.commonAfterEach = exports.commonAfterAll = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = require("../config");
const db_1 = __importDefault(require("../db"));
let groupIds;
exports.groupIds = groupIds;
function commonBeforeAll() {
    return __awaiter(this, void 0, void 0, function* () {
        yield db_1.default.query("DELETE FROM users");
        yield db_1.default.query("DELETE FROM groups");
        yield db_1.default.query("DELETE FROM groupsusers");
        yield db_1.default.query(`INSERT INTO users (username, password)
     VALUES ('u1', $1),
            ('u2', $2),
            ('u3', $3)`, [
            yield bcrypt_1.default.hash("12345", config_1.BCRYPT_WORK_FACTOR),
            yield bcrypt_1.default.hash("54321", config_1.BCRYPT_WORK_FACTOR),
            yield bcrypt_1.default.hash("67890", config_1.BCRYPT_WORK_FACTOR),
        ]);
        const res = yield db_1.default.query(`INSERT INTO groups (title, start_time, end_time)
     VALUES ('g1', '2023-05-30T08:00:00.000Z', '2023-05-30T09:00:00.000Z'),
            ('g2', '2023-05-30T10:00:00.000Z', '2023-05-30T11:00:00.000Z'),
            ('g3', '2023-05-30T12:00:00.000Z', '2023-05-30T13:00:00.000Z')
     RETURNING id`);
        exports.groupIds = groupIds = res.rows.map((r) => r.id);
        yield db_1.default.query(`INSERT INTO groupsusers (group_id, username, is_owner)
     VALUES ($1, 'u1', true),
            ($1, 'u2', false)`, [groupIds[0]]);
    });
}
exports.commonBeforeAll = commonBeforeAll;
function commonBeforeEach() {
    return __awaiter(this, void 0, void 0, function* () {
        yield db_1.default.query("BEGIN");
    });
}
exports.commonBeforeEach = commonBeforeEach;
function commonAfterEach() {
    return __awaiter(this, void 0, void 0, function* () {
        yield db_1.default.query("ROLLBACK");
    });
}
exports.commonAfterEach = commonAfterEach;
function commonAfterAll() {
    return __awaiter(this, void 0, void 0, function* () {
        yield db_1.default.end();
    });
}
exports.commonAfterAll = commonAfterAll;
//# sourceMappingURL=_testCommon.js.map