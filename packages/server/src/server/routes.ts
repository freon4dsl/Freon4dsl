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
        ModelRequests.getModelUnit(folder, name, ctx);
        ctx.status = 201;
    } else {
        ctx.status = 412; // Precondition failed
        ctx.message = "Missing query parameter 'unitName' or 'folder'";
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

router.get("/getUnitList", async (ctx: Router.IRouterContext) => {
    const folder = ctx.query["folder"];
    const subfolder = ctx.query["subfolder"];
    console.log("getUnitList: " + folder + "/" + subfolder);
    if (!!folder) {
        ModelRequests.getUnitList(folder, subfolder, ctx);
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
        ModelRequests.putModelUnit(folder, name, ctx);
        ctx.status = 201;
    } else {
        ctx.status = 412; // Precondition failed
        ctx.message = "Missing query parameter 'unitName' or 'folder'";
    }
    ctx.body = { massage: (ctx.request as any).body };
});

router.get("/deleteModel", async (ctx: Router.IRouterContext) => {
    const folder = ctx.query["folder"];
    const name = ctx.query["name"];
    console.log("DeleteModel: " + folder + "/" + name);
    if (!!name || !! folder) {
        ModelRequests.deleteModelUnit(folder, name, ctx);
        ctx.status = 201;
    } else {
        ctx.status = 412; // Precondition failed
        ctx.message = "Missing query parameter 'unitName' or 'folder'";
    }
    ctx.body = { massage: (ctx.request as any).body };
});

export const routes = router.routes();
