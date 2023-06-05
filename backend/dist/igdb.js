"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateToken = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * Checks if the twitch token is valid
 * @returns {boolean}
 */
function validateToken() {
    (0, axios_1.default)({
        method: "GET",
        url: `https://id.twitch.tv/oauth2/validate`,
        headers: {
            Authorization: `Bearer ${process.env.TWITCH_TOKEN}`,
        },
    })
        .then((res) => {
        console.log(`Twitch validated with ${res.status}`);
        if (res.status === 401) {
            return false;
        }
    })
        .catch((e) => {
        console.error(e);
    });
    return true;
}
exports.validateToken = validateToken;
//# sourceMappingURL=igdb.js.map