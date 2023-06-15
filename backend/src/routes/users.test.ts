import request from "supertest";
import app from "../app";
import {
  commonAfterAll,
  commonAfterEach,
  commonBeforeAll,
  commonBeforeEach,
  groupIds,
  token1,
  token2,
  token3,
} from "./_testCommon";
import { IUser } from "../types";

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/****************************************** GET /api/users */
describe("GET /api/users", () => {
  it("works", async () => {
    const resp = await request(app).get("/api/users");

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
  });

  it("works filtered", async () => {
    const resp = await request(app).get("/api/users").query({ username: "2" });

    expect(resp.body).toEqual({
      users: [
        {
          username: "u2",
          avatarUrl: null,
        },
      ],
    });
  });

  it("bad request invalid data", async () => {
    const resp = await request(app).get("/api/users").query({
      username: "1",
      notAProperty: "",
    });

    expect(resp.statusCode).toEqual(400);
    const errs = JSON.parse(resp.body.error.message);
    expect(errs).toEqual([
      'instance is not allowed to have the additional property "notAProperty"',
    ]);
  });
});

/****************************************** GET /api/users/:username */
describe("GET /api/users/:username", () => {
  it("works", async () => {
    const resp = await request(app).get(`/api/users/u1`);

    expect(resp.body).toEqual({
      user: {
        username: "u1",
        bio: "",
        avatarUrl: null,
        triviaScore: null,
      },
    });
  });

  it("not found if no user", async () => {
    const resp = await request(app).get(`/api/users/wrong`);

    expect(resp.statusCode).toEqual(404);
  });
});

/****************************************** PATCH /api/users/:username */
describe("PATCH /api/users/:username", () => {
  it("works", async () => {
    const data: IUser = {
      username: "new",
      bio: "test",
      avatarUrl: "http://www.img.com/test.jpg",
    };

    const resp = await request(app)
      .patch(`/api/users/u1`)
      .send(data)
      .set("authorization", `Bearer ${token1}`);

    expect(resp.body).toEqual({
      user: {
        username: "new",
        bio: "test",
        avatarUrl: "http://www.img.com/test.jpg",
      },
    });
  });

  it("bad request if username taken", async () => {
    const resp = await request(app)
      .patch(`/api/users/u1`)
      .send({ username: "u2" })
      .set("authorization", `Bearer ${token1}`);

    expect(resp.statusCode).toEqual(400);
  });

  it("bad request with invalid data", async () => {
    const resp = await request(app)
      .patch(`/api/users/u1`)
      .send({
        username: "",
        password: 5,
        bio: [],
        avatarUrl: "not a url",
        notAProperty: "",
      })
      .set("authorization", `Bearer ${token1}`);

    expect(resp.statusCode).toEqual(400);
    const errs = JSON.parse(resp.body.error.message);
    expect(errs).toEqual([
      "instance.username does not meet minimum length of 1",
      "instance.password is not of a type(s) string",
      "instance.bio is not of a type(s) string",
      'instance.avatarUrl does not conform to the "uri" format',
      'instance is not allowed to have the additional property "notAProperty"',
    ]);
  });

  it("bad request with missing data", async () => {
    const resp = await request(app)
      .patch(`/api/users/u1`)
      .send({})
      .set("authorization", `Bearer ${token1}`);

    expect(resp.statusCode).toEqual(400);
  });

  it("unauth if no token", async () => {
    const resp = await request(app)
      .patch(`/api/users/u1`)
      .send({ bio: "test" });

    expect(resp.statusCode).toEqual(401);
  });

  it("unauth if wrong user", async () => {
    const resp = await request(app)
      .patch(`/api/users/u1`)
      .send({ bio: "test" })
      .set("authorization", `Bearer ${token2}`);

    expect(resp.statusCode).toEqual(401);
  });
});

/****************************************** DELETE /api/users/:username */
describe("DELETE /api/users/:username", () => {
  it("works", async () => {
    const resp = await request(app)
      .delete(`/api/users/u1`)
      .set("authorization", `Bearer ${token1}`);

    expect(resp.body).toEqual({ message: "User u1 removed" });
  });

  it("unauth if no token", async () => {
    const resp = await request(app).delete(`/api/users/u1`);

    expect(resp.statusCode).toEqual(401);
  });

  it("unauth if wrong user", async () => {
    const resp = await request(app)
      .delete(`/api/users/u1`)
      .set("authorization", `Bearer ${token2}`);

    expect(resp.statusCode).toEqual(401);
  });
});
