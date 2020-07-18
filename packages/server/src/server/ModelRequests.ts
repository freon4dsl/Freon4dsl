import * as fs from "fs";
import { IRouterContext } from "koa-router";
var path = require("path");

const storeFolder = "./modelstore";

export class ModelRequests {
    public static async putModel(foldername: string, name: string, ctx: IRouterContext) {
        const body = ctx.request.body;
        if (!fs.existsSync(path.join(`${storeFolder}`, foldername))) {
            fs.mkdirSync(path.join(`${storeFolder}`, foldername));
        }
        fs.writeFileSync(path.join(`${storeFolder}`, foldername, `${name}.json`), JSON.stringify(body, null, 3));
    }

    public static async getModel(foldername: string, name: string, ctx: IRouterContext) {
        ctx.response.body = fs.readFileSync(path.join(`${storeFolder}`, foldername, `${name}.json` ));
    }

    public static async getUnitList(foldername: string, subfoldername: string, ctx: IRouterContext) {
        if (!fs.existsSync(path.join(`${storeFolder}`, foldername))) {
            fs.mkdirSync(path.join(`${storeFolder}`, foldername));
        }
        const dir = fs
            .readdirSync(path.join(`${storeFolder}`, foldername, subfoldername))
            .filter(f => f.endsWith(".json"))
            .map(f => f.substring(0, f.length - 5));
        ctx.response.body = dir;
    }

    public static async getModelList(foldername: string, ctx: IRouterContext) {
        if (!fs.existsSync(path.join(`${storeFolder}`, foldername))) {
            fs.mkdirSync(path.join(`${storeFolder}`, foldername));
        }
        const dir = fs
            .readdirSync(path.join(`${storeFolder}`, foldername));
        ctx.response.body = dir;
    }

    public static async deleteModel(foldername: string, name: string, ctx: IRouterContext) {
        ctx.request.body = fs.unlinkSync(path.join(`${storeFolder}`, foldername, `${name}.json` ));
    }
}
