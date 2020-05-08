import * as Router from "koa-router";

import { ModelRequests } from "./ModelRequests";

const router = new Router();

router.get("/", async (ctx: Router.IRouterContext) => {
    ctx.body = "ProjectIt Model Server";
});

router.get("/getModel", async (ctx: Router.IRouterContext) => {
    const name = ctx.query["name"];
    console.log("GetModel: " + name);
    if (!!name) {
        ModelRequests.getModel(name, ctx);
        ctx.status = 201;
    } else {
        ctx.status = 412; // Precondition failed
        ctx.message = "Missing query parameter 'name'";
    }
});

router.get("/getModelList", async (ctx: Router.IRouterContext) => {
    ModelRequests.getModelList(ctx);
    ctx.status = 201;
});

router.put("/putModel", async (ctx: Router.IRouterContext) => {
    const name = ctx.query["name"];
    console.log("PutModel: " + name);
    if (!!name) {
        ModelRequests.putModel(name, ctx);
        ctx.status = 201;
    } else {
        ctx.status = 412; // Precondition failed
        ctx.message = "Missing query parameter 'name'";
    }
    ctx.body = { massage: (ctx.request as any).body };
});

router.get("/deleteModel", async (ctx: Router.IRouterContext) => {
    const name = ctx.query["name"];
    console.log("DeleteModel: " + name);
    if (!!name) {
        ModelRequests.deleteModel(name, ctx);
        ctx.status = 201;
    } else {
        ctx.status = 412; // Precondition failed
        ctx.message = "Missing query parameter 'name'";
    }
    ctx.body = { massage: (ctx.request as any).body };
});

export const routes = router.routes();
