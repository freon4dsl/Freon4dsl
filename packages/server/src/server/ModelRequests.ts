import { issuestoString, LanguageRegistry, LionWebJsonChunk, LionWebValidator } from "@lionweb/validation"
import * as fs from "fs";
import { IRouterContext } from "koa-router";
import * as path from "node:path"
import { FileUtil } from "./FileUtil.js"
import { StoreCatalog } from "./StoreCatalog.js"

const storeFolder = "./modelstore";

export class ModelRequests {
    public static validate = false;
    
    public static async saveModel(modelname: string, language: string, ctx: IRouterContext) {
        console.log(`ModelRequest2.saveModel ${modelname} language ${language}`)
        try {
            this.checkStoreFolder();
            const catalog = ModelRequests.readStoreCatalog()
            let model = catalog.models.find(m => m.name === modelname)
            if (model === undefined) {
                model = {
                    name: modelname,
                    folder: (isIdentifier(modelname) ? modelname : "model-" + catalog.currentPostfix++),
                    language: language,
                    version: "1",
                    units: []
                }
                catalog.models.push(model)
                ModelRequests.writeStoreCatalog(catalog)
                if (!FileUtil.exists(path.join(`${storeFolder}`, model.folder))) {
                    fs.mkdirSync(path.join(`${storeFolder}`, model.folder));
                }
            } else {
                console.log(`ModelRequest2.puModel: model; ${modelname} already exists, ignoring`,)
            }
        } catch (e) {
            const message = (e instanceof Error? e.message : e.toString())
            console.log(message);
            ctx.request.body = message;
        }
    }

    /**
     * Store a unit
     * @param modelname The model to which the unit belongs.
     * @param unitname  The name of the unit to store
     * @param ctx       The `ctx.request.body` is the contents of the `unitname` to be stored.
     */
    public static async saveModelUnit(modelname: string, unitname: string, ctx: IRouterContext) {
        console.log(`ModelRequest2.saveModelUnit ${modelname}::${unitname}`)
        try {
            this.checkStoreFolder();
            const catalog = ModelRequests.readStoreCatalog()
            let model = catalog.models.find(m => m.name === modelname)
            if (model === undefined) {
                // Error, model should be defined.
                ctx.response.body = `saveModelUnit failed because model '${modelname}' does not exist`;
                ctx.response.status = 412
                return
            }
            let unit = model.units.find(u => u.name === unitname)
            if (unit === undefined) {
                // create new
                unit = {
                    name: unitname,
                    file: `${(isIdentifier(unitname) ? unitname : "unit-" + catalog.currentPostfix++)}.json`
                }
                model.units.push(unit)
                ModelRequests.writeStoreCatalog(catalog)
            }
            const body = ctx.request.body;
            if (!FileUtil.exists(path.join(`${storeFolder}`, model.folder))) {
                fs.mkdirSync(path.join(`${storeFolder}`, model.folder));
            }
            fs.writeFileSync(path.join(`${storeFolder}`, model.folder, `${unit.file}`), JSON.stringify(body, null, 3));
        } catch (e) {
            const message = (e instanceof Error? e.message : e.toString())
            console.log(message);
            ctx.request.body = message;
        }
    }

    /**
     * retrieve a model unit
     * @param modelname The model to which the unit to be retrieved belongs.
     * @param unitname  The name of the unit to retrieve.
     * @param ctx
     */
    public static async getModelUnit(modelname: string, unitname: string, ctx: IRouterContext) {
        console.log(`ModelRequest2.getModelUnit ${modelname}::${unitname}`)
        try {
            this.checkStoreFolder();
            const catalog = ModelRequests.readStoreCatalog()
            const model = catalog.models.find(m => m.name === modelname)
            const unit = model.units.find(u => u.name === unitname)
            const result = fs.readFileSync(path.join(`${storeFolder}`, model.folder, `${unit.file}`))
            if (ModelRequests.validate) {
                const jsonObject = JSON.parse(result.toString())
                // LOGGER.log(`jsonObject ${JSON.stringify(jsonObject)}`);
                const chunk = jsonObject as LionWebJsonChunk;
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
            ctx.response.body = result;
        } catch (e) {
            const message = (e instanceof Error? e.message : e.toString())
            console.log(message);
            ctx.request.body = message;
        }
    }

    /** Get a list of all unit names for a model.
     * 
     * @param modelname The name of the model for which the unit names are requested.
     * @param ctx
     * @returns The list names of all units in the model with name `modelname`. 
     */
    public static async getUnitList(modelname: string, ctx: IRouterContext) {
        console.log(`ModelRequest2.getUnitList ${modelname}`)
        try {
            this.checkStoreFolder();
            const catalog = ModelRequests.readStoreCatalog()
            const model = catalog.models.find(m => m.name === modelname)
            const dir = model.units.map(u => u.name)
            ctx.response.body = dir;
        } catch (e) {
            const message = (e instanceof Error? e.message : e.toString())
            console.log(message);
            ctx.request.body = message;
        }
    }

    /**
     * Get a list of all model names on the server, optionally filtered by `language`.
     * @param ctx
     * @param language The name of the language to filter on if it has a value.
     * @returns The list of all model names on the server.
     * 
     * If `language` is `undefined`  the list of models for `language`
     */
    public static getModelList(ctx: IRouterContext, language?: string) {
        console.log(`ModelRequest2.getModelList ${language}`)
        try {
            this.checkStoreFolder();
            const catalog = ModelRequests.readStoreCatalog()
            const modelnames = (
                language === undefined ?
                    catalog.models :
                    catalog.models.filter(m => m?.language === language  || m?.language === "")
            ).map(model => model.name)
            ctx.response.body = modelnames;
        } catch (e) {
            const message = (e instanceof Error? e.message : e.toString())
            console.log(message);
            ctx.request.body = message;
        }
    }

    /**
     * Delete a m odel unit
     * @param modelname The model in which the unit is to be delete.
     * @param unitname  The name of the unit to be deleted.
     * @param ctx
     */
    public static async deleteModelUnit(modelname: string, unitname: string, ctx: IRouterContext) {
        console.log(`ModelRequest2.deleteModelUnit ${modelname}::${unitname}`)
        try {
            this.checkStoreFolder();
            const catalog = ModelRequests.readStoreCatalog()
            const storedModel = catalog.models.find(m => m.name === modelname)
            if (storedModel !== undefined) {
                const unitIndex = storedModel.units.findIndex(u => u.name === unitname)
                if (unitIndex !== -1) {
                    const unitFilename = storedModel.units[unitIndex].file
                    storedModel.units.splice(unitIndex, 1) 
                    ModelRequests.writeStoreCatalog(catalog)
                    fs.unlinkSync(path.join(`${storeFolder}`, storedModel.folder, `${unitFilename}`));
                }
            }
        } catch (e) {
            const message = (e instanceof Error? e.message : e.toString())
            console.log(message);
            ctx.request.body = message;
        }
    }

    /**
     * Delete a model.
     * @param modelname The name of the model to delete.
     * @param ctx
     */
    public static async deleteModel(modelname: string, ctx: IRouterContext) {
        console.log(`ModelRequest2.deleteModel ${modelname}`)
        try {
            this.checkStoreFolder();
            const catalog = ModelRequests.readStoreCatalog()
            const storedModelIndex = catalog.models.findIndex(m => m.name === modelname)
            console.log(`ModelRequest2.deleteModel index ${storedModelIndex}`)
            if (storedModelIndex !== -1) {
                const storedModel = catalog.models[storedModelIndex]
                catalog.models.splice(storedModelIndex, 1)
                ModelRequests.writeStoreCatalog(catalog)
                console.log("Unlink: " + path.join(`${storeFolder}`, storedModel.folder));
                fs.rmSync(path.join(`${storeFolder}`, storedModel.folder), { recursive: true });
            }
        } catch (e) {
            const message = (e instanceof Error? e.message : e.toString())
            console.log(message);
            ctx.request.body = message;
        }
    }

    private static checkStoreFolder() {
        try {
            if (!FileUtil.exists(`${storeFolder}`)) {
                fs.mkdirSync(`${storeFolder}`);
            }
        } catch (e) {
            const message = (e instanceof Error? e.message : e.toString())
            console.log(message);
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
            const message = (e instanceof Error? e.message : e.toString())
            console.log(message);
            throw e
        }
        return undefined
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
            const message = (e instanceof Error? e.message : e.toString())
            console.log(message);
        }
    }

}

/**
 * Check whether a string is an identifier, used to see whether the name can be used as a file or folder name.
 * @param str The string to check.
 */
export function isIdentifier(str: string): boolean {
    if (!(str === null || str === undefined)) {
        const match = str.match(/^[a-z,A-Z][a-z,A-Z0-9_\-\.]*$/)
        return match !== null && match.length > 0
    } else {
        return false
    }
}
