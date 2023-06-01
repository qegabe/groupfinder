import { Client } from "pg";
import { getDatabaseUri } from "./config";

let db: Client = new Client({
  connectionString: getDatabaseUri(),
});

db.connect();

export default db;
