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
/****************************************** GET /api/users */
describe("GET /api/users", () => {
    it("works", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default).get("/api/users");
        expect(resp.body).toEqual({
            users: [
                {
                    username: "u1",
                    avatarUrl: null,
                },
                {
                    username: "u2",
                    avatarUrl: null,
                },
                {
                    username: "u3",
                    avatarUrl: null,
                },
            ],
        });
    }));
});
/****************************************** GET /api/users/:username */
describe("GET /api/users/:username", () => {
    it("works", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default).get(`/api/users/u1`);
        expect(resp.body).toEqual({
            user: {
                username: "u1",
                bio: "",
                avatarUrl: null,
                triviaScore: null,
            },
        });
    }));
    it("not found if no user", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default).get(`/api/users/wrong`);
        expect(resp.statusCode).toEqual(404);
    }));
});
/****************************************** PATCH /api/users/:username */
describe("PATCH /api/users/:username", () => {
    it("works", () => __awaiter(void 0, void 0, void 0, function* () {
        const data = {
            username: "new",
            bio: "test",
            avatarUrl: "http://www.img.com/test.jpg",
        };
        const resp = yield (0, supertest_1.default)(app_1.default)
            .patch(`/api/users/u1`)
            .send(data)
            .set("authorization", `Bearer ${_testCommon_1.token1}`);
        expect(resp.body).toEqual({
            user: {
                username: "new",
                bio: "test",
                avatarUrl: "http://www.img.com/test.jpg",
            },
        });
    }));
    it("bad request if username taken", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .patch(`/api/users/u1`)
            .send({ username: "u2" })
            .set("authorization", `Bearer ${_testCommon_1.token1}`);
        expect(resp.statusCode).toEqual(400);
    }));
    it("bad request with invalid data", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .patch(`/api/users/u1`)
            .send({
            username: "",
            password: 5,
            bio: [],
            avatarUrl: "not a url",
            notAProperty: "",
        })
            .set("authorization", `Bearer ${_testCommon_1.token1}`);
        expect(resp.statusCode).toEqual(400);
        const errs = JSON.parse(resp.body.error.message);
        expect(errs).toEqual([
            "instance.username does not meet minimum length of 1",
            "instance.password is not of a type(s) string",
            "instance.bio is not of a type(s) string",
            'instance.avatarUrl does not conform to the "uri" format',
            'instance is not allowed to have the additional property "notAProperty"',
        ]);
    }));
    it("bad request with missing data", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .patch(`/api/users/u1`)
            .send({})
            .set("authorization", `Bearer ${_testCommon_1.token1}`);
        expect(resp.statusCode).toEqual(400);
    }));
    it("unauth if no token", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .patch(`/api/users/u1`)
            .send({ bio: "test" });
        expect(resp.statusCode).toEqual(401);
    }));
    it("unauth if wrong user", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .patch(`/api/users/u1`)
            .send({ bio: "test" })
            .set("authorization", `Bearer ${_testCommon_1.token2}`);
        expect(resp.statusCode).toEqual(401);
    }));
});
/****************************************** DELETE /api/users/:username */
describe("DELETE /api/users/:username", () => {
    it("works", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .delete(`/api/users/u1`)
            .set("authorization", `Bearer ${_testCommon_1.token1}`);
        expect(resp.body).toEqual({ message: "User u1 removed" });
    }));
    it("unauth if no token", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default).delete(`/api/users/u1`);
        expect(resp.statusCode).toEqual(401);
    }));
    it("unauth if wrong user", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .delete(`/api/users/u1`)
            .set("authorization", `Bearer ${_testCommon_1.token2}`);
        expect(resp.statusCode).toEqual(401);
    }));
});
//# sourceMappingURL=users.test.js.map