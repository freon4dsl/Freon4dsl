import { app } from "./server-def.js";
import { config } from "./config.js";

/**
 * Start tye model server.
 */
app.listen(config.port);

console.log(`Freon Model Server running on port ${config.port}`);
