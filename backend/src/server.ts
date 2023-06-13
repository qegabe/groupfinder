import { PORT } from "./config";
import { validateToken } from "./helpers/igdb";
import app from "./app";

/** Start server uses PORT env variable defaults to 5000 */
const server = app.listen(PORT, () => {
  console.log(`Started on http://localhost:${PORT}`);
});

if (process.env.NODE_ENV !== "test") {
  setInterval(() => {
    if (!validateToken()) {
      console.log(`Failed to validate twitch token. Hourly check`);
    }
  }, 3600000);
}
