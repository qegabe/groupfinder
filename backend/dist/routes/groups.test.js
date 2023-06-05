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
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const _testCommon_1 = require("./_testCommon");
beforeAll(_testCommon_1.commonBeforeAll);
beforeEach(_testCommon_1.commonBeforeEach);
afterEach(_testCommon_1.commonAfterEach);
afterAll(_testCommon_1.commonAfterAll);
/****************************************** POST /api/groups */
describe("POST /api/groups", () => {
    it("works", () => __awaiter(void 0, void 0, void 0, function* () {
        const time = new Date();
        const data = {
            title: "test",
            startTime: time,
            endTime: time,
        };
        const resp = yield (0, supertest_1.default)(app_1.default)
            .post("/api/groups")
            .send(data)
            .set("authorization", `Bearer ${_testCommon_1.token1}`);
        expect(resp.body).toEqual({
            group: {
                id: expect.any(Number),
                title: "test",
                description: "",
                startTime: expect.any(String),
                endTime: expect.any(String),
                location: null,
                isPrivate: false,
                maxMembers: null,
                members: ["u1"],
            },
        });
    }));
    it("bad request with invalid data", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .post("/api/groups")
            .send({
            title: 5,
            startTime: true,
            endTime: "not a time",
            notAProperty: "",
        })
            .set("authorization", `Bearer ${_testCommon_1.token1}`);
        expect(resp.statusCode).toEqual(400);
        const errs = JSON.parse(resp.body.error.message);
        expect(errs).toEqual([
            "instance.title is not of a type(s) string",
            "instance.startTime is not of a type(s) string",
            'instance.endTime does not conform to the "date-time" format',
            'instance is not allowed to have the additional property "notAProperty"',
        ]);
    }));
    it("bad request with missing data", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .post("/api/groups")
            .send({})
            .set("authorization", `Bearer ${_testCommon_1.token1}`);
        expect(resp.statusCode).toEqual(400);
    }));
    it("unauth if no token", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default).post("/api/groups").send({
            title: "test",
            startTime: new Date(),
            endTime: new Date(),
        });
        expect(resp.statusCode).toEqual(401);
    }));
});
/****************************************** GET /api/groups */
describe("GET /api/groups", () => {
    it("works: no filter", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default).get("/api/groups");
        expect(resp.body).toEqual({
            groups: [
                {
                    id: expect.any(Number),
                    title: "g1",
                    startTime: expect.any(String),
                    endTime: expect.any(String),
                },
                {
                    id: expect.any(Number),
                    title: "g3",
                    startTime: expect.any(String),
                    endTime: expect.any(String),
                },
            ],
        });
    }));
    it("works: filter", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default).get("/api/groups").query({
            title: "g",
            startTimeAfter: "2023-05-31T09:00:00.000-04:00",
            startTimeBefore: "2023-05-31T11:00:00.000-04:00",
            maxSize: 1,
        });
        expect(resp.body).toEqual({
            groups: [
                {
                    id: expect.any(Number),
                    title: "g3",
                    startTime: expect.any(String),
                    endTime: expect.any(String),
                },
            ],
        });
    }));
    it("bad request invalid data", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default).get("/api/groups").query({
            startTimeAfter: "not a time",
            maxSize: "a",
            notAProperty: "",
        });
        expect(resp.statusCode).toEqual(400);
        const errs = JSON.parse(resp.body.error.message);
        expect(errs).toEqual([
            'instance.startTimeAfter does not conform to the "date-time" format',
            'instance.maxSize does not match pattern "^[1-9][0-9]*$"',
            'instance is not allowed to have the additional property "notAProperty"',
        ]);
    }));
});
/****************************************** GET /api/groups/:id */
describe("GET /api/groups/:id", () => {
    it("works", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default).get(`/api/groups/${_testCommon_1.groupIds[0]}`);
        expect(resp.body).toEqual({
            group: {
                id: _testCommon_1.groupIds[0],
                title: "g1",
                description: "",
                startTime: expect.any(String),
                endTime: expect.any(String),
                location: null,
                isPrivate: false,
                maxMembers: null,
                members: ["u1", "u2"],
            },
        });
    }));
    it("works: members in private group", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .get(`/api/groups/${_testCommon_1.groupIds[1]}`)
            .set("authorization", `Bearer ${_testCommon_1.token1}`);
        expect(resp.body).toEqual({
            group: {
                id: _testCommon_1.groupIds[1],
                title: "g2",
                description: "",
                startTime: expect.any(String),
                endTime: expect.any(String),
                location: null,
                isPrivate: true,
                maxMembers: null,
                members: ["u1"],
            },
        });
    }));
    it("unauth if no token and private group", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default).get(`/api/groups/${_testCommon_1.groupIds[1]}`);
        expect(resp.statusCode).toEqual(401);
    }));
    it("unauth if not in private group", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .get(`/api/groups/${_testCommon_1.groupIds[1]}`)
            .set("authorization", `Bearer ${_testCommon_1.token2}`);
        expect(resp.statusCode).toEqual(401);
    }));
    it("not found if no group", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default).get(`/api/groups/0`);
        expect(resp.statusCode).toEqual(404);
    }));
});
/****************************************** PATCH /api/groups/:id */
describe("PATCH /api/groups/:id", () => {
    it("works", () => __awaiter(void 0, void 0, void 0, function* () {
        const time = new Date("2023-05-31T08:30:00.000-04:00");
        const data = {
            title: "new",
            description: "test",
            startTime: time,
        };
        const resp = yield (0, supertest_1.default)(app_1.default)
            .patch(`/api/groups/${_testCommon_1.groupIds[0]}`)
            .send(data)
            .set("authorization", `Bearer ${_testCommon_1.token1}`);
        expect(resp.body).toEqual({
            group: {
                id: _testCommon_1.groupIds[0],
                title: "new",
                description: "test",
                startTime: expect.any(String),
                endTime: expect.any(String),
                location: null,
                isPrivate: false,
                maxMembers: null,
            },
        });
        const newTime = new Date(resp.body.group.startTime);
        expect(newTime.valueOf()).toEqual(time.valueOf());
    }));
    it("bad request when setting max members below current member count", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .patch(`/api/groups/${_testCommon_1.groupIds[0]}`)
            .send({ maxMembers: 1 })
            .set("authorization", `Bearer ${_testCommon_1.token1}`);
        expect(resp.statusCode).toEqual(400);
    }));
    it("bad request with invalid data", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .patch(`/api/groups/${_testCommon_1.groupIds[0]}`)
            .send({
            title: true,
            description: {},
            startTime: "not a time",
            notAProperty: "",
        })
            .set("authorization", `Bearer ${_testCommon_1.token1}`);
        expect(resp.statusCode).toEqual(400);
        const errs = JSON.parse(resp.body.error.message);
        expect(errs).toEqual([
            "instance.title is not of a type(s) string",
            "instance.description is not of a type(s) string",
            'instance.startTime does not conform to the "date-time" format',
            'instance is not allowed to have the additional property "notAProperty"',
        ]);
    }));
    it("bad request with missing data", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .patch(`/api/groups/${_testCommon_1.groupIds[0]}`)
            .send({})
            .set("authorization", `Bearer ${_testCommon_1.token1}`);
        expect(resp.statusCode).toEqual(400);
    }));
    it("unauth if no token", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .patch(`/api/groups/${_testCommon_1.groupIds[1]}`)
            .send({ title: "new" });
        expect(resp.statusCode).toEqual(401);
    }));
    it("unauth if not owner", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .patch(`/api/groups/${_testCommon_1.groupIds[1]}`)
            .send({ title: "new" })
            .set("authorization", `Bearer ${_testCommon_1.token2}`);
        expect(resp.statusCode).toEqual(401);
    }));
    it("not found if no group", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .patch(`/api/groups/0`)
            .send({ title: "new" })
            .set("authorization", `Bearer ${_testCommon_1.token1}`);
        expect(resp.statusCode).toEqual(404);
    }));
});
/****************************************** DELETE /api/groups/:id */
describe("DELETE /api/groups/:id", () => {
    it("works", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .delete(`/api/groups/${_testCommon_1.groupIds[0]}`)
            .set("authorization", `Bearer ${_testCommon_1.token1}`);
        expect(resp.body).toEqual({
            message: `Group with id: ${_testCommon_1.groupIds[0]} removed`,
        });
    }));
    it("unauth if no token", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default).delete(`/api/groups/${_testCommon_1.groupIds[0]}`);
        expect(resp.statusCode).toEqual(401);
    }));
    it("unauth if not owner", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .delete(`/api/groups/${_testCommon_1.groupIds[0]}`)
            .set("authorization", `Bearer ${_testCommon_1.token2}`);
        expect(resp.statusCode).toEqual(401);
    }));
    it("not found if no group", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .delete(`/api/groups/0`)
            .set("authorization", `Bearer ${_testCommon_1.token1}`);
        expect(resp.statusCode).toEqual(404);
    }));
});
/****************************************** POST /api/groups/:id/join */
describe("POST /api/groups/:id/join", () => {
    it("works", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .post(`/api/groups/${_testCommon_1.groupIds[1]}/join`)
            .set("authorization", `Bearer ${_testCommon_1.token2}`);
        expect(resp.body).toEqual({
            message: `User u2 joined group with id: ${_testCommon_1.groupIds[1]}`,
        });
    }));
    it("unauth if no token", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default).post(`/api/groups/${_testCommon_1.groupIds[1]}/join`);
        expect(resp.statusCode).toEqual(401);
    }));
    it("bad request if already member", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .post(`/api/groups/${_testCommon_1.groupIds[0]}/join`)
            .set("authorization", `Bearer ${_testCommon_1.token1}`);
        expect(resp.statusCode).toEqual(400);
    }));
    it("bad request if full", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .post(`/api/groups/${_testCommon_1.groupIds[2]}/join`)
            .set("authorization", `Bearer ${_testCommon_1.token2}`);
        expect(resp.statusCode).toEqual(400);
    }));
    it("not found if no group", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .post(`/api/groups/0/join`)
            .set("authorization", `Bearer ${_testCommon_1.token1}`);
        expect(resp.statusCode).toEqual(404);
    }));
});
/****************************************** POST /api/groups/:id/leave */
describe("POST /api/groups/:id/leave", () => {
    it("works", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .post(`/api/groups/${_testCommon_1.groupIds[0]}/leave`)
            .set("authorization", `Bearer ${_testCommon_1.token2}`);
        expect(resp.body).toEqual({
            message: `User u2 left group with id: ${_testCommon_1.groupIds[0]}`,
        });
    }));
    it("bad request if owner tries to leave group", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .post(`/api/groups/${_testCommon_1.groupIds[0]}/leave`)
            .set("authorization", `Bearer ${_testCommon_1.token1}`);
        expect(resp.statusCode).toEqual(400);
    }));
    it("unauth if no token", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default).post(`/api/groups/${_testCommon_1.groupIds[0]}/leave`);
        expect(resp.statusCode).toEqual(401);
    }));
    it("not found if not in group", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .post(`/api/groups/${_testCommon_1.groupIds[1]}/leave`)
            .set("authorization", `Bearer ${_testCommon_1.token3}`);
        expect(resp.statusCode).toEqual(404);
    }));
    it("not found if no group", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .post(`/api/groups/0/leave`)
            .set("authorization", `Bearer ${_testCommon_1.token1}`);
        expect(resp.statusCode).toEqual(404);
    }));
});
/****************************************** POST /api/groups/:id/add/:username */
describe("POST /api/groups/:id/add/:username", () => {
    it("works", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .post(`/api/groups/${_testCommon_1.groupIds[1]}/add/u2`)
            .set("authorization", `Bearer ${_testCommon_1.token1}`);
        expect(resp.body).toEqual({
            message: `User u2 was added to group with id: ${_testCommon_1.groupIds[1]}`,
        });
    }));
    it("unauth if no token", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default).post(`/api/groups/${_testCommon_1.groupIds[1]}/add/u2`);
        expect(resp.statusCode).toEqual(401);
    }));
    it("unauth if not owner", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .post(`/api/groups/${_testCommon_1.groupIds[1]}/add/u2`)
            .set("authorization", `Bearer ${_testCommon_1.token2}`);
        expect(resp.statusCode).toEqual(401);
    }));
    it("bad request if already member", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .post(`/api/groups/${_testCommon_1.groupIds[0]}/add/u2`)
            .set("authorization", `Bearer ${_testCommon_1.token1}`);
        expect(resp.statusCode).toEqual(400);
    }));
    it("bad request if full", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .post(`/api/groups/${_testCommon_1.groupIds[2]}/add/u2`)
            .set("authorization", `Bearer ${_testCommon_1.token1}`);
        expect(resp.statusCode).toEqual(400);
    }));
    it("not found if no group", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .post(`/api/groups/0/add/u2`)
            .set("authorization", `Bearer ${_testCommon_1.token1}`);
        expect(resp.statusCode).toEqual(404);
    }));
});
/****************************************** POST /api/groups/:id/remove/:username */
describe("POST /api/groups/:id/remove/:username", () => {
    it("works", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .post(`/api/groups/${_testCommon_1.groupIds[0]}/remove/u2`)
            .set("authorization", `Bearer ${_testCommon_1.token1}`);
        expect(resp.body).toEqual({
            message: `User u2 was removed from group with id: ${_testCommon_1.groupIds[0]}`,
        });
    }));
    it("unauth if no token", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default).post(`/api/groups/${_testCommon_1.groupIds[0]}/remove/u2`);
        expect(resp.statusCode).toEqual(401);
    }));
    it("unauth if not owner", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .post(`/api/groups/${_testCommon_1.groupIds[0]}/remove/u1`)
            .set("authorization", `Bearer ${_testCommon_1.token2}`);
        expect(resp.statusCode).toEqual(401);
    }));
    it("bad request if remove owner", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .post(`/api/groups/${_testCommon_1.groupIds[0]}/remove/u1`)
            .set("authorization", `Bearer ${_testCommon_1.token1}`);
        expect(resp.statusCode).toEqual(400);
    }));
    it("not found if no group", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .post(`/api/groups/0/remove/u2`)
            .set("authorization", `Bearer ${_testCommon_1.token1}`);
        expect(resp.statusCode).toEqual(404);
    }));
});
//# sourceMappingURL=groups.test.js.map