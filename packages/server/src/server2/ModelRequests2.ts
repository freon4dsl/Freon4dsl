import { issuestoString, LanguageRegistry, LionWebJsonChunk, LionWebValidator } from "@lionweb/validation"
import * as fs from "fs";
import { IRouterContext } from "koa-router";
import * as path from "node:path"
import { StoreCatalog } from "./StoreCatalog.js"
// var path = require("path");

const storeFolder = "./modelstore";

export class ModelRequests2 {
    public static validate = false;
    
    public static async putModel(modelname: string, language: string, ctx: IRouterContext) {
        try {
            this.checkStoreFolder();
            const catalog = ModelRequests2.readStoreCatalog()
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
                ModelRequests2.writeStoreCatalog(catalog)
                if (!fs.existsSync(path.join(`${storeFolder}`, model.folder))) {
                    fs.mkdirSync(path.join(`${storeFolder}`, model.folder));
                }
            } else {
                console.log(`ModelRequest2.puModel: model; ${modelname} already exists, ignoring`,)
            }
        } catch (e) {
            console.log(`ModelRequest2.putModelUnit: ${e.message}`);
            console.log(e.stack)
            ctx.response.body = e.message
        }
    }
    
    public static async putModelUnit(modelname: string, unitname: string, ctx: IRouterContext) {
        try {
            this.checkStoreFolder();
            const catalog = ModelRequests2.readStoreCatalog()
            let model = catalog.models.find(m => m.name === modelname)
            if (model === undefined) {
                // Error, model should be defined.
                ctx.response.body = `putModelUnit failed because model '${modelname}' does not exist`;
                ctx.response.status = 412
                return
            }
            let unit = model.units.find(u => u.name === unitname)
            if (unit === undefined) {
                // create new
                unit = {
                    name: unitname,
                    file: (isIdentifier(unitname) ? unitname : "unit-" + catalog.currentPostfix++)
                }
                model.units.push(unit)
                ModelRequests2.writeStoreCatalog(catalog)
            }
            const body = ctx.request.body;
            if (!fs.existsSync(path.join(`${storeFolder}`, model.folder))) {
                fs.mkdirSync(path.join(`${storeFolder}`, model.folder));
            }
            fs.writeFileSync(path.join(`${storeFolder}`, modelname, `${unit.file}.json`), JSON.stringify(body, null, 3));
        } catch (e) {
            console.log(`ModelRequest2.putModelUnit: ${e.message}`);
            console.log(e.stack)
            ctx.response.body = e.message
        }
    }

    public static async getModelUnit(modelname: string, unitname: string, ctx: IRouterContext) {
        try {
            this.checkStoreFolder();
            const catalog = ModelRequests2.readStoreCatalog()
            const model = catalog.models.find(m => m.name === modelname)
            const unit = model.units.find(u => u.name === unitname)
            const result = fs.readFileSync(path.join(`${storeFolder}`, model.folder, `${unit.file}.json`))
            if (ModelRequests2.validate) {
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
            console.log(e.message);
            ctx.response.body = e.message
        }
    }

    public static async getUnitList(modelname: string, ctx: IRouterContext) {
        try {
            this.checkStoreFolder();
            const catalog = ModelRequests2.readStoreCatalog()
            const model = catalog.models.find(m => m.name === modelname)
            const dir = model.units.map(u => u.name)
            ctx.response.body = dir;
        } catch (e) {
            console.log(e.message);
            ctx.response.body = e.message
        }
    }

    public static async getModelList(ctx: IRouterContext, language: string) {
        try {
            this.checkStoreFolder();
            const catalog = ModelRequests2.readStoreCatalog()
            const modelnames = catalog.models.filter(m => m?.language === language).map(model => model.name);
            ctx.response.body = modelnames;
        } catch (e) {
            console.log(e.message);
            ctx.response.body = e.message
        }
    }

    public static async deleteModelUnit(modelname: string, unitname: string, ctx: IRouterContext) {
        try {
            this.checkStoreFolder();
            const catalog = ModelRequests2.readStoreCatalog()
            const storedModel = catalog.models.find(m => m.name === modelname)
            if (storedModel !== undefined) {
                const unitIndex = storedModel.units.findIndex(u => u.name === unitname)
                if (unitIndex !== -1) {
                    const unitFilename = storedModel.units[unitIndex].file
                    storedModel.units.splice(unitIndex, 1) 
                    ModelRequests2.writeStoreCatalog(catalog)
                    fs.unlinkSync(path.join(`${storeFolder}`, storedModel.folder, `${unitFilename}.json`));
                }
            }
        } catch (e) {
            console.log(e.message);
            ctx.request.body = e.message;
        }
    }

    public static async deleteModel(modelname: string, ctx: IRouterContext) {
        try {
            this.checkStoreFolder();
            const catalog = ModelRequests2.readStoreCatalog()
            const storedModelIndex = catalog.models.findIndex(m => m.name === modelname)
            if (storedModelIndex !== -1) {
                const storedModel = catalog.models[storedModelIndex]
                catalog.models.splice(storedModelIndex, 1)
                ModelRequests2.writeStoreCatalog(catalog)
                console.log("Unlink: " + path.join(`${storeFolder}`, storedModel.folder));
                fs.rmdirSync(path.join(`${storeFolder}`, storedModel.folder), { recursive: true });
            }
        } catch (e) {
            console.log(e.message);
            ctx.request.body = e.message;
        }
    }

    private static checkStoreFolder() {
        try {
            if (!fs.existsSync(`${storeFolder}`)) {
                fs.mkdirSync(`${storeFolder}`);
            }
        } catch (e) {
            console.log(e.message);
        }
    }

    public static readStoreCatalog(): StoreCatalog {
        try {
            this.checkStoreFolder()
            const text = fs.readFileSync(path.join(`${storeFolder}`, `store.json`))
            const catalog = JSON.parse(text.toString()) as StoreCatalog
            return catalog
        } catch (e) {
            console.log(e.message);
            throw e
        }
        return undefined
    }

    public static writeStoreCatalog(catalog: StoreCatalog): void {
        try {
            this.checkStoreFolder()
            fs.writeFileSync(path.join(`${storeFolder}`, `store.json`), JSON.stringify(catalog, null, 4))
        } catch (e) {
            console.log(e.message);
            throw e
        }
    }

}

export function isIdentifier(str: string): boolean {
    if (!(str === null || str === undefined)) {
        const match = str.match(/^[a-z,A-Z][a-z,A-Z0-9_\-\.]*$/)
        return match !== null && match.length > 0
    } else {
        return false
    }
}
