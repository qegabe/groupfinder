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
exports.token3 = exports.token2 = exports.token1 = exports.groupIds = exports.commonBeforeEach = exports.commonBeforeAll = exports.commonAfterEach = exports.commonAfterAll = void 0;
const db_1 = __importDefault(require("../db"));
const user_1 = __importDefault(require("../models/user"));
const group_1 = __importDefault(require("../models/group"));
const token_1 = __importDefault(require("../helpers/token"));
let groupIds;
exports.groupIds = groupIds;
function commonBeforeAll() {
    return __awaiter(this, void 0, void 0, function* () {
        yield db_1.default.query("DELETE FROM users");
        yield db_1.default.query("DELETE FROM groups");
        yield db_1.default.query("DELETE FROM groupsusers");
        yield user_1.default.register("u1", "12345");
        yield user_1.default.register("u2", "12345");
        yield user_1.default.register("u3", "12345");
        const g1 = yield group_1.default.create("u1", {
            title: "g1",
            startTime: new Date("2023-05-31T08:00:00.000-04:00"),
            endTime: new Date("2023-05-31T09:00:00.000-04:00"),
        });
        const g2 = yield group_1.default.create("u1", {
            title: "g2",
            startTime: new Date("2023-05-31T07:00:00.000-04:00"),
            endTime: new Date("2023-05-31T08:00:00.000-04:00"),
            isPrivate: true,
        });
        const g3 = yield group_1.default.create("u1", {
            title: "g3",
            startTime: new Date("2023-05-31T10:00:00.000-04:00"),
            endTime: new Date("2023-05-31T11:00:00.000-04:00"),
            maxMembers: 1,
        });
        exports.groupIds = groupIds = [g1.id, g2.id, g3.id];
        yield group_1.default.join("u2", g1.id);
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
const token1 = (0, token_1.default)({ username: "u1" });
exports.token1 = token1;
const token2 = (0, token_1.default)({ username: "u2" });
exports.token2 = token2;
const token3 = (0, token_1.default)({ username: "u3" });
exports.token3 = token3;
//# sourceMappingURL=_testCommon.js.map