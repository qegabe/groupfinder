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

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/****************************************** POST /auth/register */
describe("POST /auth/register", () => {
  it("works", async () => {
    const resp = await request(app).post("/auth/register").send({
      username: "test",
      password: "12345",
    });
    expect(resp.body).toEqual({
      token: expect.any(String),
    });
  });

  it("bad request if username taken", async () => {
    const resp = await request(app).post("/auth/register").send({
      username: "u1",
      password: "12345",
    });
    expect(resp.statusCode).toEqual(400);
  });

  it("bad request with bad data", async () => {
    const resp = await request(app).post("/auth/register").send({
      username: "test",
      password: "1",
    });
    expect(resp.statusCode).toEqual(400);
  });

  it("bad request if missing data", async () => {
    const resp = await request(app).post("/auth/register");
    expect(resp.statusCode).toEqual(400);
  });
});

/****************************************** POST /auth/login */
describe("POST /auth/login", () => {
  it("works", async () => {
    const resp = await request(app).post("/auth/login").send({
      username: "u1",
      password: "12345",
    });
    expect(resp.body).toEqual({
      token: expect.any(String),
    });
  });

  it("unauth if noone with username", async () => {
    const resp = await request(app).post("/auth/login").send({
      username: "wrong",
      password: "12345",
    });
    expect(resp.statusCode).toEqual(401);
  });

  it("unauth if wrong password", async () => {
    const resp = await request(app).post("/auth/login").send({
      username: "u1",
      password: "bad",
    });
    expect(resp.statusCode).toEqual(401);
  });

  it("bad request if missing data", async () => {
    const resp = await request(app).post("/auth/login");
    expect(resp.statusCode).toEqual(400);
  });
});
