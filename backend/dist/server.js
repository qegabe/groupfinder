"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
if (process.env.NODE_ENV !== "test") {
    setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
        if (!(yield (0, igdb_1.validateToken)())) {
            console.log(`Failed to validate twitch token. Hourly check`);
        }
    }), 3600000);
}
//# sourceMappingURL=server.js.map