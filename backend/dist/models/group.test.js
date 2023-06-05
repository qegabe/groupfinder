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
const _testCommon_1 = require("./_testCommon");
const group_1 = __importDefault(require("./group"));
const db_1 = __importDefault(require("../db"));
const expressError_1 = require("../helpers/expressError");
beforeAll(_testCommon_1.commonBeforeAll);
beforeEach(_testCommon_1.commonBeforeEach);
afterEach(_testCommon_1.commonAfterEach);
afterAll(_testCommon_1.commonAfterAll);
/********************************************** create */
describe("create", () => {
    it("works: minimum data", () => __awaiter(void 0, void 0, void 0, function* () {
        const group = yield group_1.default.create("u1", {
            title: "test",
            startTime: new Date(),
            endTime: new Date(),
        });
        expect(group).toEqual({
            id: expect.any(Number),
            title: "test",
            description: "",
            startTime: expect.any(Date),
            endTime: expect.any(Date),
            location: null,
            isPrivate: false,
            maxMembers: null,
            members: ["u1"],
        });
    }));
    it("works: all data", () => __awaiter(void 0, void 0, void 0, function* () {
        const group = yield group_1.default.create("u1", {
            title: "test",
            description: "desc",
            startTime: new Date(),
            endTime: new Date(),
            location: "place",
            isPrivate: true,
            maxMembers: 10,
        });
        expect(group).toEqual({
            id: expect.any(Number),
            title: "test",
            description: "desc",
            startTime: expect.any(Date),
            endTime: expect.any(Date),
            location: "place",
            isPrivate: true,
            maxMembers: 10,
            members: ["u1"],
        });
    }));
});
/********************************************** getList */
describe("getList", () => {
    it("works: no filter", () => __awaiter(void 0, void 0, void 0, function* () {
        const groups = yield group_1.default.getList();
        expect(groups).toEqual([
            {
                id: expect.any(Number),
                title: "g1",
                startTime: expect.any(Date),
                endTime: expect.any(Date),
            },
            {
                id: expect.any(Number),
                title: "g2",
                startTime: expect.any(Date),
                endTime: expect.any(Date),
            },
            {
                id: expect.any(Number),
                title: "g3",
                startTime: expect.any(Date),
                endTime: expect.any(Date),
            },
        ]);
    }));
    it("works: filtered", () => __awaiter(void 0, void 0, void 0, function* () {
        const groups = yield group_1.default.getList(100, { title: "g", maxSize: 1 });
        expect(groups).toEqual([
            {
                id: expect.any(Number),
                title: "g2",
                startTime: expect.any(Date),
                endTime: expect.any(Date),
            },
            {
                id: expect.any(Number),
                title: "g3",
                startTime: expect.any(Date),
                endTime: expect.any(Date),
            },
        ]);
    }));
});
/********************************************** getById */
describe("getById", () => {
    it("works", () => __awaiter(void 0, void 0, void 0, function* () {
        const group = yield group_1.default.getById(_testCommon_1.groupIds[0]);
        expect(group).toEqual({
            id: _testCommon_1.groupIds[0],
            title: "g1",
            description: "",
            startTime: expect.any(Date),
            endTime: expect.any(Date),
            location: null,
            isPrivate: false,
            maxMembers: null,
            members: ["u1", "u2"],
        });
    }));
    it("not found if no group", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield group_1.default.getById(0);
            fail();
        }
        catch (error) {
            expect(error instanceof expressError_1.NotFoundError).toBeTruthy();
        }
    }));
});
/********************************************** update */
describe("update", () => {
    it("works", () => __awaiter(void 0, void 0, void 0, function* () {
        const date = new Date();
        const updateData = {
            title: "new",
            description: "test",
            startTime: date,
            endTime: date,
            location: "place",
            isPrivate: true,
            maxMembers: 10,
        };
        const group = yield group_1.default.update(_testCommon_1.groupIds[0], updateData);
        expect(group).toEqual({
            id: _testCommon_1.groupIds[0],
            title: "new",
            description: "test",
            startTime: date,
            endTime: date,
            location: "place",
            isPrivate: true,
            maxMembers: 10,
        });
    }));
    it("bad request if setting max members below current member count", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield group_1.default.update(_testCommon_1.groupIds[0], { maxMembers: 1 });
            fail();
        }
        catch (error) {
            expect(error instanceof expressError_1.BadRequestError).toBeTruthy();
        }
    }));
    it("not found if no group", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield group_1.default.update(0, { title: "test" });
            fail();
        }
        catch (error) {
            expect(error instanceof expressError_1.NotFoundError).toBeTruthy();
        }
    }));
});
/********************************************** remove */
describe("remove", () => {
    it("works", () => __awaiter(void 0, void 0, void 0, function* () {
        yield group_1.default.remove(_testCommon_1.groupIds[0]);
        const result = yield db_1.default.query(`SELECT title
       FROM groups
       WHERE id = $1
      `, [_testCommon_1.groupIds[0]]);
        expect(result.rowCount).toEqual(0);
    }));
    it("not found if no group", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield group_1.default.remove(0);
            fail();
        }
        catch (error) {
            expect(error instanceof expressError_1.NotFoundError).toBeTruthy();
        }
    }));
});
/********************************************** isOwner */
describe("isOwner", () => {
    it("works: is owner", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield group_1.default.isOwner(_testCommon_1.groupIds[0], "u1");
        expect(result).toBe(true);
    }));
    it("works: not owner", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield group_1.default.isOwner(_testCommon_1.groupIds[0], "u2");
        expect(result).toBe(false);
    }));
    it("works: not member", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield group_1.default.isOwner(_testCommon_1.groupIds[0], "u3");
        expect(result).toBe(false);
    }));
    it("not found if no group", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield group_1.default.isOwner(0, "u1");
            fail();
        }
        catch (error) {
            expect(error instanceof expressError_1.NotFoundError).toBeTruthy();
        }
    }));
});
/********************************************** isMember */
describe("isMember", () => {
    it("works", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield group_1.default.isMember(_testCommon_1.groupIds[0], "u1");
        expect(result).toBe(true);
    }));
    it("false if not in group", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield group_1.default.isMember(_testCommon_1.groupIds[0], "u3");
        expect(result).toBe(false);
    }));
    it("false if no group", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield group_1.default.isMember(0, "u1");
        expect(result).toBe(false);
    }));
});
/********************************************** join */
describe("join", () => {
    it("works", () => __awaiter(void 0, void 0, void 0, function* () {
        yield group_1.default.join("u3", _testCommon_1.groupIds[0]);
        const result = yield db_1.default.query(`SELECT username
       FROM groupsusers
       WHERE group_id = $1 AND username = $2
      `, [_testCommon_1.groupIds[0], "u3"]);
        expect(result.rowCount).toEqual(1);
    }));
    it("bad request if already member", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield group_1.default.join("u1", _testCommon_1.groupIds[0]);
            fail();
        }
        catch (error) {
            expect(error instanceof expressError_1.BadRequestError).toBeTruthy();
        }
    }));
    it("bad request if full", () => __awaiter(void 0, void 0, void 0, function* () {
        yield db_1.default.query(`UPDATE groups
       SET max_members = $1
       WHERE id = $2
      `, [2, _testCommon_1.groupIds[0]]);
        try {
            yield group_1.default.join("u3", _testCommon_1.groupIds[0]);
            fail();
        }
        catch (error) {
            expect(error instanceof expressError_1.BadRequestError).toBeTruthy();
        }
    }));
    it("not found if no group", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield group_1.default.join("u3", 0);
            fail();
        }
        catch (error) {
            expect(error instanceof expressError_1.NotFoundError).toBeTruthy();
        }
    }));
    it("not found if no user", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield group_1.default.join("fake", _testCommon_1.groupIds[0]);
            fail();
        }
        catch (error) {
            expect(error instanceof expressError_1.NotFoundError).toBeTruthy();
        }
    }));
});
/********************************************** leave */
describe("leave", () => {
    it("works", () => __awaiter(void 0, void 0, void 0, function* () {
        yield group_1.default.leave("u2", _testCommon_1.groupIds[0]);
        const result = yield db_1.default.query(`SELECT username
       FROM groupsusers
       WHERE group_id = $1 AND username = $2
      `, [_testCommon_1.groupIds[0], "u2"]);
        expect(result.rowCount).toEqual(0);
    }));
    it("bad request if owner tries to leave group", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield group_1.default.leave("u1", _testCommon_1.groupIds[0]);
            fail();
        }
        catch (error) {
            expect(error instanceof expressError_1.BadRequestError).toBeTruthy();
        }
    }));
    it("not found if no group", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield group_1.default.leave("u2", 0);
            fail();
        }
        catch (error) {
            expect(error instanceof expressError_1.NotFoundError).toBeTruthy();
        }
    }));
    it("not found if no user", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield group_1.default.join("fake", _testCommon_1.groupIds[0]);
            fail();
        }
        catch (error) {
            expect(error instanceof expressError_1.NotFoundError).toBeTruthy();
        }
    }));
});
//# sourceMappingURL=group.test.js.map