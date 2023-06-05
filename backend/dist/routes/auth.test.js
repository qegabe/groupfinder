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
/****************************************** POST /auth/register */
describe("POST /auth/register", () => {
    it("works", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default).post("/auth/register").send({
            username: "test",
            password: "12345",
        });
        expect(resp.body).toEqual({
            token: expect.any(String),
        });
    }));
    it("bad request if username taken", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default).post("/auth/register").send({
            username: "u1",
            password: "12345",
        });
        expect(resp.statusCode).toEqual(400);
    }));
    it("bad request with invalid data", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default).post("/auth/register").send({
            username: "thisusernameiswaytoolongaaaaaa",
            password: "1",
            notAProperty: "",
        });
        expect(resp.statusCode).toEqual(400);
        const errs = JSON.parse(resp.body.error.message);
        expect(errs).toEqual([
            "instance.username does not meet maximum length of 25",
            "instance.password does not meet minimum length of 5",
            'instance is not allowed to have the additional property "notAProperty"',
        ]);
    }));
    it("bad request if missing data", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default).post("/auth/register");
        expect(resp.statusCode).toEqual(400);
    }));
});
/****************************************** POST /auth/login */
describe("POST /auth/login", () => {
    it("works", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default).post("/auth/login").send({
            username: "u1",
            password: "12345",
        });
        expect(resp.body).toEqual({
            token: expect.any(String),
        });
    }));
    it("unauth if noone with username", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default).post("/auth/login").send({
            username: "wrong",
            password: "12345",
        });
        expect(resp.statusCode).toEqual(401);
    }));
    it("unauth if wrong password", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default).post("/auth/login").send({
            username: "u1",
            password: "bad",
        });
        expect(resp.statusCode).toEqual(401);
    }));
    it("bad request if invalid data", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default).post("/auth/login").send({
            username: 5,
            password: {},
            notAProperty: "",
        });
        expect(resp.statusCode).toEqual(400);
        const errs = JSON.parse(resp.body.error.message);
        expect(errs).toEqual([
            "instance.username is not of a type(s) string",
            "instance.password is not of a type(s) string",
            'instance is not allowed to have the additional property "notAProperty"',
        ]);
    }));
    it("bad request if missing data", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default).post("/auth/login");
        expect(resp.statusCode).toEqual(400);
    }));
});
//# sourceMappingURL=auth.test.js.map