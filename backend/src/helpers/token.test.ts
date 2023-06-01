import createToken from "./token";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../config";

describe("createToken", () => {
  it("creates a token", () => {
    const token = createToken({ username: "test" });
    const payload = jwt.verify(token, SECRET_KEY);

    expect(payload).toEqual({
      iat: expect.any(Number),
      username: "test",
    });
  });
});
