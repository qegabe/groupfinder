import "dotenv/config";

const SECRET_KEY: string = process.env.SECRET_KEY || "secret";
const PORT: number = +process.env.PORT || 5000;

function getDatabaseUri() {
  if (process.env.NODE_ENV === "test") {
    return "groupfinder_test";
  } else {
    return process.env.DATABASE_URL || "groupfinder";
  }
}

const BCRYPT_WORK_FACTOR: number = process.env.NODE_ENV === "test" ? 1 : 12;

export { SECRET_KEY, PORT, getDatabaseUri, BCRYPT_WORK_FACTOR };
