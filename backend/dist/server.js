"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const igdb_1 = require("./helpers/igdb");
const app_1 = __importDefault(require("./app"));
/** Start server uses PORT env variable defaults to 5000 */
const server = app_1.default.listen(config_1.PORT, () => {
    console.log(`Started on http://localhost:${config_1.PORT}`);
});
if (process.env.NODE_ENV !== "test" && !(0, igdb_1.validateToken)()) {
    console.log(`Failed to validate twitch token, closing server...`);
    server.close();
}
setInterval(() => {
    if (!(0, igdb_1.validateToken)()) {
        console.log(`Failed to validate twitch token, closing server...`);
        server.close();
    }
}, 3600000);
//# sourceMappingURL=server.js.map