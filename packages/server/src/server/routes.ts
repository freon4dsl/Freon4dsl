import Router, { type RouterContext } from "@koa/router"
import { ModelRequests } from "./ModelRequests.js";

const router = new Router();

/**
 * Define all endpoints of the model server.
 * 
 */

router.get("/", (ctx: RouterContext) => {
    ctx.body = "Freon Model Server";
});

router.get("/getModelUnit", async (ctx: RouterContext) => {
    const modelname = requireQueryParam(ctx, "model")
    if (modelname === undefined) return

    const unitname = requireQueryParam(ctx, "unit")
    if (unitname === undefined) return

    console.log(`GetModelUnit: ${modelname}/${unitname}`)
    await ModelRequests.getModelUnit(modelname, unitname, ctx)
});

router.get("/getModelList", async (ctx: RouterContext) => {
    const language = queryParam(ctx, "language")
    const version = queryParam(ctx, "version")
    console.log(`getModelList for language '${language}'`);
    await ModelRequests.getModelList(ctx, language, version)
});

router.get("/getUnitList", async (ctx: RouterContext) => {
    const model = requireQueryParam(ctx, "model")
    if (model === undefined) return
    console.log(`getUnitList: ${model}`)
    await ModelRequests.getUnitList(model, ctx)
});
router.put("/saveModel", async (ctx: RouterContext) => {
    const model = requireQueryParam(ctx, "model")
    if (model === undefined) return

    const language = queryParam(ctx, "language")
    const version = queryParam(ctx, "version")
    console.log(`saveModel: ${model} language: ${language}`)
    await ModelRequests.saveModel(model, language, version, ctx)
});
router.put("/saveModelUnit", async (ctx: RouterContext) => {
    const model = requireQueryParam(ctx, "model")
    if (model === undefined) return

    const unit = requireQueryParam(ctx, "unit")
    if (unit === undefined) return

    console.log(`saveModelUnit: ${model}/${unit}`)
    await ModelRequests.saveModelUnit(model, unit, ctx)
});

// todo: should be 'router.delete("/deleteModelUnit", ...)', but this may require changing the client too
router.get("/deleteModelUnit", async (ctx: RouterContext) => {
    const model = requireQueryParam(ctx, "model")
    if (model === undefined) return

    const name = requireQueryParam(ctx, "unit")
    if (name === undefined) return

    console.log(`DeleteModelUnit: ${model}/${name}`)
    await ModelRequests.deleteModelUnit(model, name, ctx)
});

// todo: should be 'router.delete("/deleteModel", ...)', but this may require changing the client too
router.get("/deleteModel", async (ctx: RouterContext) => {
    const model = requireQueryParam(ctx, "model")
    if (model === undefined) return

    console.log(`DeleteModel: ${model}`)
    await ModelRequests.deleteModel(model, ctx)
})

router.put("/renameModel", async (ctx: RouterContext) => {
    const oldName = requireQueryParam(ctx, "oldName")
    if (oldName === undefined) return

    const newName = requireQueryParam(ctx, "newName")
    if (newName === undefined) return

    console.log(`RenameModel: ${oldName} => ${newName}`)

    await ModelRequests.renameModel(oldName, newName, ctx)
})

/**
 * Makes sure that the parameter, when present, is of type string.
 * @param ctx
 * @param name
 */
function queryParam(ctx: RouterContext, name: string): string | undefined {
    const value = ctx.query[name]

    if (Array.isArray(value)) {
        return value[0]
    }

    return value
}

/**
 * Checks whether a required parameter is present and ensures that its result is of type string.
 * @param ctx
 * @param name
 */
function requireQueryParam(ctx: RouterContext, name: string): string | undefined {
    const value = queryParam(ctx, name)

    if (value === undefined || value.length === 0) {
        ctx.status = 400
        ctx.body = `Missing query parameter '${name}'`
        return undefined
    }

    return value
}

export const routes = router.routes();
