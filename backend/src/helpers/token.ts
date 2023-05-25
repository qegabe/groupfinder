import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../config";
import { IUser } from "../types";

function createToken(user: IUser) {
  const payload = {
    username: user.username,
  };

  return jwt.sign(payload, SECRET_KEY);
}

export default createToken;
