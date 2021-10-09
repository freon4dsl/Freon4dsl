import Koa from "koa";
import bodyParser from "koa-bodyparser";
import cors from "koa2-cors";

import { config } from "./config";
import { logger } from "./logging";
import { routes } from "./routes";

const app = new Koa();

// Allow access,
// ERROR Access to XMLHttpRequest from origin has been blocked by CORS policy:
// Response to preflight request doesn't pass access control check:
// No 'Access-Control-Allow-Origin' header is present on the requ
app.use(
    cors({
        origin: "*"
    })
);
// Ensure access to the body of the request.
app.use(bodyParser());

// app.use(logger);
app.use(routes);

app.listen(config.port);

console.log(`Server running on port ${config.port}`);
