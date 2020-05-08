import * as Router from "koa-router";

import { ModelRequests } from "./ModelRequests";

const router = new Router();

router.get("/", async (ctx: Router.IRouterContext) => {
    ctx.body = "ProjectIt Model Server";
});

router.get("/getModel", async (ctx: Router.IRouterContext) => {
    const folder = ctx.query["folder"];
    const name = ctx.query["name"];
    console.log("GetModel: " + folder + "/" + name);
    if (!!name || folder) {
        ModelRequests.getModel(folder, name, ctx);
        ctx.status = 201;
    } else {
        ctx.status = 412; // Precondition failed
        ctx.message = "Missing query parameter 'name' or 'folder'";
    }
});

router.get("/getModelList", async (ctx: Router.IRouterContext) => {
    const folder = ctx.query["folder"];
    console.log("getModelList: " + folder);
    if (!!folder) {
        ModelRequests.getModelList(folder, ctx);
        ctx.status = 201;
    } else {
        ctx.status = 412; // Precondition failed
        ctx.message = "Missing query parameter 'folder'";
    }
});

router.put("/putModel", async (ctx: Router.IRouterContext) => {
    const folder = ctx.query["folder"];
    const name = ctx.query["name"];
    console.log("PutModel: " + folder + "/" + name);
    if (!!name || !!folder) {
        ModelRequests.putModel(folder, name, ctx);
        ctx.status = 201;
    } else {
        ctx.status = 412; // Precondition failed
        ctx.message = "Missing query parameter 'name' or 'folder'";
    }
    ctx.body = { massage: (ctx.request as any).body };
});

router.get("/deleteModel", async (ctx: Router.IRouterContext) => {
    const folder = ctx.query["folder"];
    const name = ctx.query["name"];
    console.log("DeleteModel: " + folder + "/" + name);
    if (!!name || !! folder) {
        ModelRequests.deleteModel(folder, name, ctx);
        ctx.status = 201;
    } else {
        ctx.status = 412; // Precondition failed
        ctx.message = "Missing query parameter 'name' or 'folder'";
    }
    ctx.body = { massage: (ctx.request as any).body };
});

export const routes = router.routes();
