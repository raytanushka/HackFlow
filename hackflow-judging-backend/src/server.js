import { app } from "./app.js";
import { initializeDatabase } from "./db/database.js";
import { config } from "./config/config.js";

initializeDatabase();

app.listen(config.port, config.host, () => {
  console.log(`HackFlow judging backend listening on http://${config.host}:${config.port}`);
});
