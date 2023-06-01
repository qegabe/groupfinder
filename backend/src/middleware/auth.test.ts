import jwt from "jsonwebtoken";
import {
  authenticateJWT,
  ensureCorrectUser,
  ensureIsOwner,
  ensureLoggedIn,
} from "./auth";
import { UnauthorizedError } from "../helpers/expressError";
import { SECRET_KEY } from "../config";
import { Request, Response, NextFunction } from "express";
import db from "../db";

const testJwt = jwt.sign({ username: "test" }, SECRET_KEY);
const badJwt = jwt.sign({ username: "test" }, "badkey");

let req: Partial<Request>;
let res: Partial<Response>;
let next: NextFunction;
let groupId: number;

beforeAll(async () => {
  await db.query("DELETE FROM users");
  await db.query("DELETE FROM groups");
  await db.query("DELETE FROM groupsusers");

  await db.query(
    `INSERT INTO users (username, password)
     VALUES ('u1', '12345'),
            ('u2', '12345'),
            ('u3', '12345')`
  );

  const res = await db.query(
    `INSERT INTO groups (title, start_time, end_time)
     VALUES ('g', '2023-05-30T00:00:00.000Z', '2023-05-30T00:00:00.000Z')
     RETURNING id`
  );

  groupId = res.rows[0].id;

  await db.query(
    `INSERT INTO groupsusers (group_id, username, is_owner)
     VALUES ($1, 'u1', true),
            ($1, 'u2', false)`,
    [groupId]
  );
});

beforeEach(async () => {
  req = {};
  res = { locals: {} };
  next = (err: any) => {
    expect(err).toBeFalsy();
  };

  await db.query("BEGIN");
});

afterEach(async () => {
  await db.query("ROLLBACK");
});

afterAll(async () => {
  await db.end();
});

describe("authenticateJWT", () => {
  it("works: auth header", () => {
    expect.assertions(2);
    req = {
      headers: { authorization: `Bearer ${testJwt}` },
    };

    authenticateJWT(req as Request, res as Response, next);
    expect(res.locals).toEqual({
      user: {
        iat: expect.any(Number),
        username: "test",
      },
    });
  });

  it("works: no header", () => {
    expect.assertions(2);
    authenticateJWT(req as Request, res as Response, next);
    expect(res.locals).toEqual({});
  });

  it("works: bad token", () => {
    expect.assertions(2);
    req = {
      headers: { authorization: `Bearer ${badJwt}` },
    };
    authenticateJWT(req as Request, res as Response, next);
    expect(res.locals).toEqual({});
  });
});

describe("ensureLoggedIn", () => {
  it("works", () => {
    expect.assertions(1);
    res = { locals: { user: { username: "test" } } };
    ensureLoggedIn(req as Request, res as Response, next);
  });

  it("unauth if not logged in", () => {
    expect.assertions(1);
    next = (err) => {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureLoggedIn(req as Request, res as Response, next);
  });
});

describe("ensureCorrectUser", () => {
  it("works", () => {
    expect.assertions(1);
    req = { params: { username: "test" } };
    res = { locals: { user: { username: "test" } } };
    ensureCorrectUser(req as Request, res as Response, next);
  });

  it("unauth if not logged in", () => {
    expect.assertions(1);
    req = { params: { username: "test" } };
    next = (err) => {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureCorrectUser(req as Request, res as Response, next);
  });

  it("unauth if wrong user", () => {
    expect.assertions(1);
    req = { params: { username: "test" } };
    res = { locals: { user: { username: "user" } } };
    next = (err) => {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureCorrectUser(req as Request, res as Response, next);
  });
});

describe("ensureIsOwner", () => {
  it("works", () => {
    expect.assertions(1);
    req = { params: { id: `${groupId}` } };
    res = { locals: { user: { username: "u1" } } };
    ensureIsOwner(req as Request, res as Response, next);
  });

  it("unauth if not logged in", () => {
    expect.assertions(1);
    req = { params: { id: `${groupId}` } };
    next = (err) => {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureIsOwner(req as Request, res as Response, next);
  });

  it("unauth if not owner in group", () => {
    expect.assertions(1);
    req = { params: { id: `${groupId}` } };
    res = { locals: { user: { username: "u2" } } };
    next = (err) => {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureIsOwner(req as Request, res as Response, next);
  });

  it("unauth if not owner not in group", () => {
    expect.assertions(1);
    req = { params: { id: `${groupId}` } };
    res = { locals: { user: { username: "u3" } } };
    next = (err) => {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureIsOwner(req as Request, res as Response, next);
  });
});
