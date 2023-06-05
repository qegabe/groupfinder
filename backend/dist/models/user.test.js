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
const user_1 = __importDefault(require("./user"));
const db_1 = __importDefault(require("../db"));
const expressError_1 = require("../helpers/expressError");
const bcrypt_1 = __importDefault(require("bcrypt"));
beforeAll(_testCommon_1.commonBeforeAll);
beforeEach(_testCommon_1.commonBeforeEach);
afterEach(_testCommon_1.commonAfterEach);
afterAll(_testCommon_1.commonAfterAll);
/********************************************** register */
describe("register", () => {
    it("works", () => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield user_1.default.register("new", "test");
        expect(user).toEqual({
            username: "new",
            bio: "",
            avatarUrl: null,
            triviaScore: null,
        });
        const result = yield db_1.default.query(`SELECT username, password
       FROM users
       WHERE username = $1
      `, ["new"]);
        expect(result.rows[0].username).toEqual("new");
        expect(result.rows[0].password.startsWith("$2b$")).toEqual(true);
    }));
    it("bad request if username taken", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield user_1.default.register("u1", "test");
            fail();
        }
        catch (error) {
            expect(error instanceof expressError_1.BadRequestError).toBeTruthy();
        }
    }));
});
/********************************************** authenticate */
describe("authenticate", () => {
    it("works", () => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield user_1.default.authenticate("u1", "12345");
        expect(user).toEqual({
            username: "u1",
            bio: "",
            avatarUrl: null,
            triviaScore: null,
        });
    }));
    it("unauth if username wrong", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield user_1.default.authenticate("wrong", "12345");
            fail();
        }
        catch (error) {
            expect(error instanceof expressError_1.UnauthorizedError).toBeTruthy();
        }
    }));
    it("unauth if password wrong", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield user_1.default.authenticate("u1", "wrong");
            fail();
        }
        catch (error) {
            expect(error instanceof expressError_1.UnauthorizedError).toBeTruthy();
        }
    }));
});
/********************************************** getList */
describe("getList", () => {
    it("works", () => __awaiter(void 0, void 0, void 0, function* () {
        const users = yield user_1.default.getList();
        expect(users).toEqual([
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
        ]);
    }));
});
/********************************************** getByUsername */
describe("getByUsername", () => {
    it("works", () => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield user_1.default.getByUsername("u1");
        expect(user).toEqual({
            username: "u1",
            bio: "",
            avatarUrl: null,
            triviaScore: null,
        });
    }));
    it("not found if no user", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield user_1.default.getByUsername("wrong");
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
        const updateData = {
            username: "new",
            password: "pass",
            bio: "test",
            avatarUrl: "test.jpg",
        };
        const user = yield user_1.default.update("u1", updateData);
        expect(user).toEqual({
            username: "new",
            bio: "test",
            avatarUrl: "test.jpg",
        });
        const res = yield db_1.default.query(`SELECT password
       FROM users
       WHERE username = $1
      `, ["new"]);
        expect(res.rowCount).toBe(1);
        const isValid = yield bcrypt_1.default.compare("pass", res.rows[0].password);
        expect(isValid).toBe(true);
    }));
    it("not found if no user", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield user_1.default.update("wrong", { username: "test" });
            fail();
        }
        catch (error) {
            expect(error instanceof expressError_1.NotFoundError).toBeTruthy();
        }
    }));
    it("bad request if username taken", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield user_1.default.update("u1", { username: "u2" });
            fail();
        }
        catch (error) {
            expect(error instanceof expressError_1.BadRequestError).toBeTruthy();
        }
    }));
});
/********************************************** remove */
describe("remove", () => {
    it("works", () => __awaiter(void 0, void 0, void 0, function* () {
        yield user_1.default.remove("u1");
        const res = yield db_1.default.query(`SELECT username
       FROM users
       WHERE username = $1
      `, ["u1"]);
        expect(res.rowCount).toBe(0);
    }));
    it("not found if no user", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield user_1.default.remove("wrong");
            fail();
        }
        catch (error) {
            expect(error instanceof expressError_1.NotFoundError).toBeTruthy();
        }
    }));
});
//# sourceMappingURL=user.test.js.map