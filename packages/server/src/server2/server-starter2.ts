import { app } from "./server-def2.js";
import { config } from "./config.js";

app.listen(config.port);

console.log(`Server running on port ${config.port}`);
