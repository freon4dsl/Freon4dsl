import { app } from "./server-def";
import { config } from "./config";

app.listen(config.port);

console.log(`Server running on port ${config.port}`);
