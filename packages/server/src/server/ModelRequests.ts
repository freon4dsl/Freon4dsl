import { issuestoString, LanguageRegistry, LionWebValidator } from "@lionweb/validation"
import type { LionWebJsonChunk } from "@lionweb/json"
import * as fs from "fs"
import type { RouterContext } from "@koa/router"
import * as path from "node:path"
import { FileUtil } from "./FileUtil.js"
import type { StoreCatalog } from "./StoreCatalog.js"
import { HttpClientErrors, HttpServerErrors, HttpSuccessCodes } from "./httpcodes.js"

const storeFolder = "./modelstore";

export class ModelRequests {
    public static validate = false

    // todo if the client calls saveModel with a new language or version, the catalog is not updated.
    public static async saveModel(modelname: string, language: string | undefined, version: string | undefined, ctx: RouterContext) {
        console.log(`ModelRequest.saveModel ${modelname} language ${language}, version ${version}`)
        try {
            this.checkStoreFolder()
            const catalog = ModelRequests.readStoreCatalog()
            let model = catalog.models.find((m) => m.name === modelname)
            if (model === undefined) {
                model = {
                    name: modelname,
                    folder: isIdentifier(modelname) ? modelname : "model-" + catalog.currentPostfix++,
                    language: language,
                    version: version,
                    units: [],
                }
                catalog.models.push(model)
                ModelRequests.writeStoreCatalog(catalog)
                if (!FileUtil.exists(path.join(`${storeFolder}`, model.folder))) {
                    fs.mkdirSync(path.join(`${storeFolder}`, model.folder))
                }
            } else {
                console.log(`ModelRequest.putModel: model; ${modelname} already exists, ignoring`)
            }
            ctx.status = HttpSuccessCodes.Ok
        } catch (e) {
            this.exposeError(ctx, e)
        }
    }

    private static exposeError(ctx: RouterContext, e: unknown): void {
        const message = e instanceof Error ? e.message : String(e)

        console.log(message)

        ctx.status = HttpServerErrors.InternalServerError
        ctx.body = message
    }

    /**
     * Store a unit
     * @param modelname The model to which the unit belongs.
     * @param unitname  The name of the unit to store
     * @param ctx       The `ctx.request.body` is the contents of the `unitname` to be stored.
     */
    public static async saveModelUnit(modelname: string, unitname: string, ctx: RouterContext) {
        console.log(`ModelRequest.saveModelUnit ${modelname}::${unitname}`)
        try {
            this.checkStoreFolder()
            const catalog = ModelRequests.readStoreCatalog()
            let model = catalog.models.find((m) => m.name === modelname)
            if (model === undefined) {
                // Error, save unit requires pre-existing model
                ctx.status = HttpClientErrors.PreconditionFailed
                ctx.body = `saveModelUnit failed because model '${modelname}' does not exist`
                return
            }
            let unit = model.units.find((u) => u.name === unitname)
            if (unit === undefined) {
                // create new
                unit = {
                    name: unitname,
                    file: `${isIdentifier(unitname) ? unitname : "unit-" + catalog.currentPostfix++}.json`,
                }
                model.units.push(unit)
                ModelRequests.writeStoreCatalog(catalog)
            }
            const body = this.requestBody(ctx)
            if (!FileUtil.exists(path.join(`${storeFolder}`, model.folder))) {
                fs.mkdirSync(path.join(`${storeFolder}`, model.folder))
            }
            fs.writeFileSync(path.join(`${storeFolder}`, model.folder, `${unit.file}`), JSON.stringify(body, null, 3))
            ctx.status = HttpSuccessCodes.Ok
        } catch (e) {
            this.exposeError(ctx, e)
        }
    }

    private static requestBody(ctx: RouterContext): unknown {
        return (ctx.request as RouterContext["request"] & { body: unknown }).body
    }

    /**
     * retrieve a model unit
     * @param modelname The model to which the unit to be retrieved belongs.
     * @param unitname  The name of the unit to retrieve.
     * @param ctx
     */
    public static async getModelUnit(modelname: string, unitname: string, ctx: RouterContext) {
        console.log(`ModelRequest.getModelUnit ${modelname}::${unitname}`)
        try {
            this.checkStoreFolder()
            const catalog = ModelRequests.readStoreCatalog()
            const model = catalog.models.find((m) => m.name === modelname)
            if (model === undefined) {
                ctx.status = HttpClientErrors.NotFound
                ctx.body = `Model '${modelname}' does not exist`
                return
            }
            const unit = model.units.find((u) => u.name === unitname)
            if (unit === undefined) {
                ctx.status = HttpClientErrors.NotFound
                ctx.body = `Unit '${unitname}' does not exist in model '${modelname}'`
                return
            }
            const result = fs.readFileSync(path.join(`${storeFolder}`, model.folder, `${unit.file}`))
            if (ModelRequests.validate) {
                const jsonObject = JSON.parse(result.toString())
                // LOGGER.log(`jsonObject ${JSON.stringify(jsonObject)}`);
                const chunk = jsonObject as LionWebJsonChunk
                const validator = new LionWebValidator(chunk, new LanguageRegistry())
                validator.validateSyntax()
                if (validator.validationResult.hasErrors()) {
                    console.error(issuestoString(validator.validationResult, unitname + ": lionweb-deserialize-syntax"))
                }
                validator.validateReferences()
                if (validator.validationResult.hasErrors()) {
                    console.error(issuestoString(validator.validationResult, unitname + ": lionweb-deserialize-references"))
                }
            }
            ctx.body = result
            ctx.status = HttpSuccessCodes.Ok
        } catch (e) {
            this.exposeError(ctx, e)
        }
    }

    /** Get a list of all unit names for a model.
     *
     * @param modelname The name of the model for which the unit names are requested.
     * @param ctx
     * @returns The list names of all units in the model with name `modelname`.
     */
    public static async getUnitList(modelname: string, ctx: RouterContext) {
        console.log(`ModelRequest.getUnitList ${modelname}`)
        try {
            this.checkStoreFolder()
            const catalog = ModelRequests.readStoreCatalog()
            const model = catalog.models.find((m) => m.name === modelname)
            if (model === undefined) {
                ctx.status = HttpClientErrors.NotFound
                ctx.body = `Model '${modelname}' does not exist`
                return
            }
            ctx.body = model.units.map((u) => u.name)
            ctx.status = HttpSuccessCodes.Ok
        } catch (e) {
            this.exposeError(ctx, e)
        }
    }

    /**
     * Get a list of all model names on the server, optionally filtered by `language`.
     * @param ctx
     * @param language The name of the language to filter on if it has a value.
     * @param version The version of the language to filter on if it has a value.
     * @returns The list of all model names on the server.
     *
     * If `language` is `undefined`  the list of models for `language`
     */
    // todo if model.language or model.version can be undefined, then “generic” models with undefined do not match a requested language/version.
    //  Is this only for migration?
    public static getModelList(ctx: RouterContext, language?: string, version?: string) {
        console.log(`ModelRequest.getModelList ${language}, version ${version}`)
        try {
            this.checkStoreFolder()
            const catalog = ModelRequests.readStoreCatalog()
            const models = catalog.models.filter((model) => {
                const languageMatches = language === undefined || model.language === language || model.language === ""

                const versionMatches = version === undefined || model.version === version || model.version === ""

                return languageMatches && versionMatches
            })
            ctx.body = models.map((model) => model.name)
            ctx.status = HttpSuccessCodes.Ok
        } catch (e) {
            this.exposeError(ctx, e)
        }
    }

    /**
     * Delete a model unit
     * @param modelname The model in which the unit is to be deleted.
     * @param unitname  The name of the unit to be deleted.
     * @param ctx
     */
    public static async deleteModelUnit(modelname: string, unitname: string, ctx: RouterContext) {
        console.log(`ModelRequest.deleteModelUnit ${modelname}::${unitname}`)
        try {
            this.checkStoreFolder()
            const catalog = ModelRequests.readStoreCatalog()
            const storedModel = catalog.models.find((m) => m.name === modelname)
            if (storedModel !== undefined) {
                const unitIndex = storedModel.units.findIndex((u) => u.name === unitname)
                if (unitIndex !== -1) {
                    const unitFilename = storedModel.units[unitIndex].file
                    storedModel.units.splice(unitIndex, 1)
                    ModelRequests.writeStoreCatalog(catalog)
                    const unitPath = path.join(storeFolder, storedModel.folder, unitFilename)

                    if (FileUtil.exists(unitPath)) {
                        fs.unlinkSync(unitPath)
                    }
                } else {
                    ctx.status = HttpClientErrors.NotFound
                    ctx.body = `Unit '${unitname}' does not exist in model '${modelname}'`
                    return
                }
            } else {
                ctx.status = HttpClientErrors.NotFound
                ctx.body = `Model '${modelname}' does not exist`
                return
            }
            ctx.status = HttpSuccessCodes.Ok
        } catch (e) {
            this.exposeError(ctx, e)
        }
    }

    /**
     * Delete a model.
     * @param modelname The name of the model to delete.
     * @param ctx
     */
    public static async deleteModel(modelname: string, ctx: RouterContext) {
        console.log(`ModelRequest.deleteModel ${modelname}`)
        try {
            this.checkStoreFolder()
            const catalog = ModelRequests.readStoreCatalog()
            const storedModelIndex = catalog.models.findIndex((m) => m.name === modelname)
            console.log(`ModelRequest.deleteModel index ${storedModelIndex}`)
            if (storedModelIndex !== -1) {
                const storedModel = catalog.models[storedModelIndex]
                catalog.models.splice(storedModelIndex, 1)
                ModelRequests.writeStoreCatalog(catalog)
                console.log("Unlink: " + path.join(`${storeFolder}`, storedModel.folder))
                fs.rmSync(path.join(storeFolder, storedModel.folder), { recursive: true, force: true })
                ctx.status = HttpSuccessCodes.Ok
                return
            } else {
                ctx.status = HttpClientErrors.NotFound
                ctx.body = `Nothing to delete, '${modelname}' does not exist`
                return
            }
        } catch (e) {
            this.exposeError(ctx, e)
        }
    }

    /**
     * Rename a model, from 'oldName' to 'newName'
     * @param oldName
     * @param newName
     * @param ctx
     */
    public static async renameModel(oldName: string, newName: string, ctx: RouterContext) {
        console.log(`ModelRequest.renameModel ${oldName}`)
        try {
            const catalog = ModelRequests.readStoreCatalog()
            const storedModel = catalog.models.find((m) => m.name === oldName)
            if (storedModel === undefined) {
                ctx.status = HttpClientErrors.NotFound
                ctx.body = `Cannot rename model, because '${oldName}' does not exist`
                return
            }
            console.log(`ModelRequest.renameModel  ${storedModel?.name}`)
            const conflictingModel = catalog.models.find((m) => m.name === newName)
            if (conflictingModel !== undefined) {
                // Error, model with 'newName' should not exist.
                ctx.status = HttpClientErrors.PreconditionFailed
                ctx.body = `Cannot rename model, because '${newName}' already exists`
                return
            }
            storedModel.name = newName
            ModelRequests.writeStoreCatalog(catalog)
            ctx.status = HttpSuccessCodes.Ok
        } catch (e) {
            this.exposeError(ctx, e)
        }
    }

    private static checkStoreFolder() {
        try {
            if (!FileUtil.exists(`${storeFolder}`)) {
                fs.mkdirSync(`${storeFolder}`)
            }
        } catch (e) {
            const message = e instanceof Error ? e.message : String(e)
            console.log(message)
            throw e
        }
    }

    /**
     * Read the modelstore catalog.
     * @returns The modelstore catalog.
     */
    public static readStoreCatalog(): StoreCatalog {
        try {
            this.checkStoreFolder()
            const text = fs.readFileSync(path.join(`${storeFolder}`, `store.json`))
            const catalog = JSON.parse(text.toString()) as StoreCatalog
            return catalog
        } catch (e) {
            const message = e instanceof Error ? e.message : String(e)
            console.log(message)
            throw e
        }
    }

    /**
     * Write the modelstore catalog to file.
     * @param catalog The catalog to store.
     */
    public static writeStoreCatalog(catalog: StoreCatalog): void {
        try {
            this.checkStoreFolder()
            fs.writeFileSync(path.join(`${storeFolder}`, `store.json`), JSON.stringify(catalog, null, 4))
        } catch (e) {
            const message = e instanceof Error ? e.message : String(e)
            console.log(message)
            throw e
        }
    }
}

/**
 * Check whether a string is an identifier, used to see whether the name can be used as a file or folder name.
 * @param str The string to check.
 */
export function isIdentifier(str: string | null | undefined): boolean {
    return typeof str === "string" && /^[a-zA-Z][a-zA-Z0-9_.-]*$/.test(str)
}
