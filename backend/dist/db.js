"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const config_1 = require("./config");
let db = new pg_1.Client({
    connectionString: (0, config_1.getDatabaseUri)(),
});
db.connect();
exports.default = db;
//# sourceMappingURL=db.js.map