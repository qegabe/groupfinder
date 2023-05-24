import { Client } from "pg";

let db: Client;

if (process.env.NODE_ENV === "test") {
  db = new Client({
    connectionString: "postgresql:///groupfinder_test",
  });
} else {
  db = new Client({
    connectionString: "postgresql:///groupfinder",
  });
}

db.connect();

export default db;
