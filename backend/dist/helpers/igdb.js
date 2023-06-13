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
exports.requestIGDB = exports.validateToken = void 0;
const axios_1 = __importDefault(require("axios"));
const IGDB_URL = "https://api.igdb.com/v4";
/**
 * Checks if the twitch token is valid
 * @returns {Promise<boolean>}
 */
function validateToken() {
    return __awaiter(this, void 0, void 0, function* () {
        if (process.env.TWITCH_TOKEN !== undefined) {
            try {
                const res = yield (0, axios_1.default)({
                    method: "GET",
                    url: `https://id.twitch.tv/oauth2/validate`,
                    headers: {
                        Authorization: `Bearer ${process.env.TWITCH_TOKEN}`,
                    },
                });
                console.log(`Twitch validated with ${res.status}`);
                return true;
            }
            catch (error) {
                console.error(error);
                return false;
            }
        }
        return false;
    });
}
exports.validateToken = validateToken;
/**
 * Send a request to IGDB
 * @param endpoint endpoint for request
 * @param data
 * @returns {Promise<any[]>}
 */
function requestIGDB(endpoint, data) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Sending request to IGDB...");
        try {
            const resp = yield (0, axios_1.default)({
                url: `${IGDB_URL}/${endpoint}`,
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.TWITCH_TOKEN}`,
                    "Client-ID": process.env.TWITCH_CLIENT_ID,
                },
                data,
            });
            return resp.data;
        }
        catch (error) {
            //console.error(error);
            console.error(`IGDB Request failed with: ${error.code}`);
        }
    });
}
exports.requestIGDB = requestIGDB;
//# sourceMappingURL=igdb.js.map