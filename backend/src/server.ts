import { PORT } from "./config";
import app from "./app";

/** Start server uses PORT env variable defaults to 5000 */
app.listen(PORT, () => {
  console.log(`Started on http://localhost:${PORT}`);
});
