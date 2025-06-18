import Router from "koa-router";
import { ModelRequests } from "./ModelRequests.js";

const router = new Router();

/**
 * Define all endpoints of the model server.
 * 
 */

router.get("/", async (ctx: Router.IRouterContext) => {
    ctx.body = "Freon Model Server";
});

router.get("/getModelUnit", async (ctx: Router.IRouterContext) => {
    const modelname = ctx.query["model"];
    const unitname = ctx.query["unit"];
    console.log("GetModelUnit: " + modelname + "/" + unitname);
    if ((!!unitname || modelname) && typeof unitname === "string" && typeof modelname === "string") {
        ModelRequests.getModelUnit(modelname, unitname, ctx);
        ctx.status = 201;
    } else {
        ctx.status = 412; // Precondition failed
        ctx.message = "Missing query parameter 'unit' or 'model'";
    }
});

router.get("/getModelList", async (ctx: Router.IRouterContext) => {
    const language = ctx.query["language"];
    console.log(`getModelList for language '${language}'`);
    ModelRequests.getModelList(ctx, language);
    ctx.status = 201;
});

router.get("/getUnitList", async (ctx: Router.IRouterContext) => {
    const folder = ctx.query["model"];
    console.log("getUnitList: " + folder);
    if (!!folder && typeof folder === "string") {
        ModelRequests.getUnitList(folder, ctx);
        ctx.status = 201;
    } else {
        ctx.status = 412; // Precondition failed
        ctx.message = "Missing query parameter 'folder'";
    }
});
router.put("/putModel", async (ctx: Router.IRouterContext) => {
    const model = ctx.query["model"];
    const language = ctx.query["language"];
    console.log("PutModel: " + model + ` language: ${language}`);
    if ((!!model) && typeof model === "string") {
        ModelRequests.putModel(model, language, ctx);
        ctx.status = 201;
    } else {
        ctx.status = 412; // Precondition failed
        ctx.message = "Missing query parameter 'model' or 'language'";
    }
    ctx.body = { massage: (ctx.request as any).body };
});
router.put("/putModelUnit", async (ctx: Router.IRouterContext) => {
    const model = ctx.query["model"];
    const unit = ctx.query["unit"];
    console.log("PutModelUnit: " + model + "/" + unit);
    if ((!!unit || !!model) && typeof unit === "string" && typeof model === "string") {
        ModelRequests.putModelUnit(model, unit, ctx);
        ctx.status = 201;
    } else {
        ctx.status = 412; // Precondition failed
        ctx.message = "Missing query parameter 'unitName' or 'folder'";
    }
    ctx.body = { message: (ctx.request as any).body };
});

router.get("/deleteModelUnit", async (ctx: Router.IRouterContext) => {
    const model = ctx.query["model"];
    const name = ctx.query["unit"];
    console.log("DeleteModelUnit: " + model + "/" + name);
    if ((!!name || !!model) && typeof name === "string" && typeof model === "string") {
        ModelRequests.deleteModelUnit(model, name, ctx);
        ctx.status = 201;
    } else {
        ctx.status = 412; // Precondition failed
        ctx.message = "Missing query parameter 'unitName' or 'folder'";
    }
    ctx.body = { massage: (ctx.request as any).body };
});

router.get("/deleteModel", async (ctx: Router.IRouterContext) => {
    const model = ctx.query["model"];
    console.log("DeleteModel: " + model);
    if (!!model && typeof model === "string") {
        ModelRequests.deleteModel(model, ctx);
        ctx.status = 201;
    } else {
        ctx.status = 412; // Precondition failed
        ctx.message = "Missing query parameter 'folder'";
    }
    ctx.body = { massage: (ctx.request as any).body };
});

export const routes = router.routes();
