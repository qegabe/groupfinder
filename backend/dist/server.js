"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const app_1 = __importDefault(require("./app"));
/** Start server uses PORT env variable defaults to 5000 */
app_1.default.listen(config_1.PORT, () => {
    console.log(`Started on http://localhost:${config_1.PORT}`);
});
//# sourceMappingURL=server.js.map