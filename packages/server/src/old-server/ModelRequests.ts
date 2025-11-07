import { issuestoString, LanguageRegistry, LionWebJsonChunk, LionWebValidator } from "@lionweb/validation"
import * as fs from "fs";
import { IRouterContext } from "@koa/router";
import * as path from "node:path"
import { FileUtil } from "../server/FileUtil.js"
// var path = require("path");

const storeFolder = "./modelstore";

export class ModelRequests {
    public static validate = false;
    
    public static async saveModelUnit(foldername: string, name: string, ctx: IRouterContext) {
        try {
            this.checkStoreFolder();
            const body = ctx.request.body;
            if (!FileUtil.exists(path.join(`${storeFolder}`, foldername))) {
                fs.mkdirSync(path.join(`${storeFolder}`, foldername));
            }
            fs.writeFileSync(path.join(`${storeFolder}`, foldername, `${name}.json`), JSON.stringify(body, null, 3));
        } catch (e) {
            const message = (e instanceof Error? e.message : e.toString())
            console.log(message);
        }
    }

    public static async getModelUnit(foldername: string, name: string, ctx: IRouterContext) {
        try {
            this.checkStoreFolder();
            const result = fs.readFileSync(path.join(`${storeFolder}`, foldername, `${name}.json`))
            if (ModelRequests.validate) {
                const jsonObject = JSON.parse(result.toString())
                // LOGGER.log(`jsonObject ${JSON.stringify(jsonObject)}`);
                const chunk = jsonObject as LionWebJsonChunk;
                const validator = new LionWebValidator(chunk, new LanguageRegistry())
                validator.validateSyntax()
                if (validator.validationResult.hasErrors()) {
                    console.error(issuestoString(validator.validationResult, name + ": lionweb-deserialize-syntax"))
                }
                validator.validateReferences()
                if (validator.validationResult.hasErrors()) {
                    console.error(issuestoString(validator.validationResult, name + ": lionweb-deserialize-references"))
                }
            }
            ctx.response.body = result;
        } catch (e) {
            const message = (e instanceof Error? e.message : e.toString())
            console.log(message);
            ctx.request.body = message;
        }
    }

    public static async getUnitList(foldername: string, ctx: IRouterContext) {
        try {
            this.checkStoreFolder();
            if (!FileUtil.exists(path.join(`${storeFolder}`, foldername))) {
                fs.mkdirSync(path.join(`${storeFolder}`, foldername));
            }
            const dir = fs
                .readdirSync(path.join(`${storeFolder}`, foldername))
                .filter((f) => f.endsWith(".json"))
                .map((f) => f.substring(0, f.length - 5));
            // FIXME A hack to return a specific unit as the ffirst, only for Education demo!!
            const tmp = dir.findIndex((s) => s === "Fractions10");
            if (tmp !== -1) {
                dir.splice(tmp, 1);
                dir.splice(0, 0, "Fractions10");
            }
            // FIXME End
            ctx.response.body = dir;
        } catch (e) {
            const message = (e instanceof Error? e.message : e.toString())
            console.log(message);
            ctx.request.body = message;
        }
    }

    public static async getModelList(ctx: IRouterContext) {
        try {
            this.checkStoreFolder();
            const dir = fs.readdirSync(`${storeFolder}`);
            ctx.response.body = dir;
        } catch (e) {
            const message = (e instanceof Error? e.message : e.toString())
            console.log(message);
            ctx.request.body = message;
        }
    }

    public static async deleteModelUnit(foldername: string, name: string, ctx: IRouterContext) {
        try {
            this.checkStoreFolder();
            fs.unlinkSync(path.join(`${storeFolder}`, foldername, `${name}.json`));
        } catch (e) {
            const message = (e instanceof Error? e.message : e.toString())
            console.log(message);
            ctx.request.body = message;
        }
    }

    public static async deleteModel(foldername: string, ctx: IRouterContext) {
        try {
            this.checkStoreFolder();
            console.log("Unlink: " + path.join(`${storeFolder}`, foldername));
            fs.rmSync(path.join(`${storeFolder}`, foldername), { recursive: true });
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
}
