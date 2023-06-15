import {
  commonAfterAll,
  commonAfterEach,
  commonBeforeAll,
  commonBeforeEach,
  groupIds,
} from "./_testCommon";
import User from "./user";
import { IUser } from "../types";
import db from "../db";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../helpers/expressError";
import bcrypt from "bcrypt";

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/********************************************** register */
describe("register", () => {
  it("works", async () => {
    const user = await User.register("new", "test");

    expect(user).toEqual({
      username: "new",
      bio: "",
      avatarUrl: null,
      triviaScore: null,
    });
    const result = await db.query(
      `SELECT username, password
       FROM users
       WHERE username = $1
      `,
      ["new"]
    );
    expect(result.rows[0].username).toEqual("new");
    expect(result.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  it("bad request if username taken", async () => {
    try {
      await User.register("u1", "test");
      fail();
    } catch (error) {
      expect(error instanceof BadRequestError).toBeTruthy();
    }
  });
});

/********************************************** authenticate */
describe("authenticate", () => {
  it("works", async () => {
    const user = await User.authenticate("u1", "12345");

    expect(user).toEqual({
      username: "u1",
      bio: "",
      avatarUrl: null,
      triviaScore: null,
    });
  });

  it("unauth if username wrong", async () => {
    try {
      await User.authenticate("wrong", "12345");
      fail();
    } catch (error) {
      expect(error instanceof UnauthorizedError).toBeTruthy();
    }
  });

  it("unauth if password wrong", async () => {
    try {
      await User.authenticate("u1", "wrong");
      fail();
    } catch (error) {
      expect(error instanceof UnauthorizedError).toBeTruthy();
    }
  });
});

/********************************************** getList */
describe("getList", () => {
  it("works", async () => {
    const users = await User.getList();

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
  });

  it("works filtered", async () => {
    const users = await User.getList({ username: "2" });

    expect(users).toEqual([
      {
        username: "u2",
        avatarUrl: null,
      },
    ]);
  });
});

/********************************************** getByUsername */
describe("getByUsername", () => {
  it("works", async () => {
    const user = await User.getByUsername("u1");

    expect(user).toEqual({
      username: "u1",
      bio: "",
      avatarUrl: null,
      triviaScore: null,
    });
  });

  it("not found if no user", async () => {
    try {
      await User.getByUsername("wrong");
      fail();
    } catch (error) {
      expect(error instanceof NotFoundError).toBeTruthy();
    }
  });
});

/********************************************** update */
describe("update", () => {
  it("works", async () => {
    const updateData: IUser = {
      username: "new",
      password: "pass",
      bio: "test",
      avatarUrl: "test.jpg",
    };

    const user = await User.update("u1", updateData);

    expect(user).toEqual({
      username: "new",
      bio: "test",
      avatarUrl: "test.jpg",
    });

    const res = await db.query(
      `SELECT password
       FROM users
       WHERE username = $1
      `,
      ["new"]
    );
    expect(res.rowCount).toBe(1);
    const isValid = await bcrypt.compare("pass", res.rows[0].password);
    expect(isValid).toBe(true);
  });

  it("not found if no user", async () => {
    try {
      await User.update("wrong", { username: "test" });
      fail();
    } catch (error) {
      expect(error instanceof NotFoundError).toBeTruthy();
    }
  });

  it("bad request if username taken", async () => {
    try {
      await User.update("u1", { username: "u2" });
      fail();
    } catch (error) {
      expect(error instanceof BadRequestError).toBeTruthy();
    }
  });
});

/********************************************** remove */
describe("remove", () => {
  it("works", async () => {
    await User.remove("u1");
    const res = await db.query(
      `SELECT username
       FROM users
       WHERE username = $1
      `,
      ["u1"]
    );
    expect(res.rowCount).toBe(0);
  });

  it("not found if no user", async () => {
    try {
      await User.remove("wrong");
      fail();
    } catch (error) {
      expect(error instanceof NotFoundError).toBeTruthy();
    }
  });
});
