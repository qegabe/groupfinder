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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = require("./auth");
const expressError_1 = require("../helpers/expressError");
const config_1 = require("../config");
const db_1 = __importDefault(require("../db"));
const testJwt = jsonwebtoken_1.default.sign({ username: "test" }, config_1.SECRET_KEY);
const badJwt = jsonwebtoken_1.default.sign({ username: "test" }, "badkey");
let req;
let res;
let next;
let groupId;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.query("DELETE FROM users");
    yield db_1.default.query("DELETE FROM groups");
    yield db_1.default.query("DELETE FROM groupsusers");
    yield db_1.default.query(`INSERT INTO users (username, password)
     VALUES ('u1', '12345'),
            ('u2', '12345'),
            ('u3', '12345')`);
    const res = yield db_1.default.query(`INSERT INTO groups (title, start_time, end_time)
     VALUES ('g', '2023-05-30T00:00:00.000Z', '2023-05-30T00:00:00.000Z')
     RETURNING id`);
    groupId = res.rows[0].id;
    yield db_1.default.query(`INSERT INTO groupsusers (group_id, username, is_owner)
     VALUES ($1, 'u1', true),
            ($1, 'u2', false)`, [groupId]);
}));
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    req = {};
    res = { locals: {} };
    next = (err) => {
        expect(err).toBeFalsy();
    };
    yield db_1.default.query("BEGIN");
}));
afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.query("ROLLBACK");
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.end();
}));
describe("authenticateJWT", () => {
    it("works: auth header", () => {
        expect.assertions(2);
        req = {
            headers: { authorization: `Bearer ${testJwt}` },
        };
        (0, auth_1.authenticateJWT)(req, res, next);
        expect(res.locals).toEqual({
            user: {
                iat: expect.any(Number),
                username: "test",
            },
        });
    });
    it("works: no header", () => {
        expect.assertions(2);
        (0, auth_1.authenticateJWT)(req, res, next);
        expect(res.locals).toEqual({});
    });
    it("works: bad token", () => {
        expect.assertions(2);
        req = {
            headers: { authorization: `Bearer ${badJwt}` },
        };
        (0, auth_1.authenticateJWT)(req, res, next);
        expect(res.locals).toEqual({});
    });
});
describe("ensureLoggedIn", () => {
    it("works", () => {
        expect.assertions(1);
        res = { locals: { user: { username: "test" } } };
        (0, auth_1.ensureLoggedIn)(req, res, next);
    });
    it("unauth if not logged in", () => {
        expect.assertions(1);
        next = (err) => {
            expect(err instanceof expressError_1.UnauthorizedError).toBeTruthy();
        };
        (0, auth_1.ensureLoggedIn)(req, res, next);
    });
});
describe("ensureCorrectUser", () => {
    it("works", () => {
        expect.assertions(1);
        req = { params: { username: "test" } };
        res = { locals: { user: { username: "test" } } };
        (0, auth_1.ensureCorrectUser)(req, res, next);
    });
    it("unauth if not logged in", () => {
        expect.assertions(1);
        req = { params: { username: "test" } };
        next = (err) => {
            expect(err instanceof expressError_1.UnauthorizedError).toBeTruthy();
        };
        (0, auth_1.ensureCorrectUser)(req, res, next);
    });
    it("unauth if wrong user", () => {
        expect.assertions(1);
        req = { params: { username: "test" } };
        res = { locals: { user: { username: "user" } } };
        next = (err) => {
            expect(err instanceof expressError_1.UnauthorizedError).toBeTruthy();
        };
        (0, auth_1.ensureCorrectUser)(req, res, next);
    });
});
describe("ensureIsOwner", () => {
    it("works", () => {
        expect.assertions(1);
        req = { params: { id: `${groupId}` } };
        res = { locals: { user: { username: "u1" } } };
        (0, auth_1.ensureIsOwner)(req, res, next);
    });
    it("unauth if not logged in", () => {
        expect.assertions(1);
        req = { params: { id: `${groupId}` } };
        next = (err) => {
            expect(err instanceof expressError_1.UnauthorizedError).toBeTruthy();
        };
        (0, auth_1.ensureIsOwner)(req, res, next);
    });
    it("unauth if not owner in group", () => {
        expect.assertions(1);
        req = { params: { id: `${groupId}` } };
        res = { locals: { user: { username: "u2" } } };
        next = (err) => {
            expect(err instanceof expressError_1.UnauthorizedError).toBeTruthy();
        };
        (0, auth_1.ensureIsOwner)(req, res, next);
    });
    it("unauth if not owner not in group", () => {
        expect.assertions(1);
        req = { params: { id: `${groupId}` } };
        res = { locals: { user: { username: "u3" } } };
        next = (err) => {
            expect(err instanceof expressError_1.UnauthorizedError).toBeTruthy();
        };
        (0, auth_1.ensureIsOwner)(req, res, next);
    });
});
//# sourceMappingURL=auth.test.js.map