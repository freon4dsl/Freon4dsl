import * as fs from "fs";
import { IRouterContext } from "koa-router";
var path = require("path");

const modelfolder = "./modelstore";

export class ModelRequests {
    public static async putModel(foldername: string, name: string, ctx: IRouterContext) {
        const body = ctx.request.body;
        if (!fs.existsSync(path.join(`${modelfolder}`, foldername))) {
            fs.mkdirSync(path.join(`${modelfolder}`, foldername));
        }
        fs.writeFileSync(path.join(`${modelfolder}`, foldername, `${name}.json`), JSON.stringify(body, null, 3));
    }

    public static async getModel(foldername: string, name: string, ctx: IRouterContext) {
        ctx.response.body = fs.readFileSync(path.join(`${modelfolder}`, foldername, `${name}.json` ));
    }

    public static async getModelList(foldername: string, ctx: IRouterContext) {
        const dir = fs
            .readdirSync(path.join(`${modelfolder}`, foldername))
            .filter(f => f.endsWith(".json"))
            .map(f => f.substring(0, f.length - 5));
        ctx.response.body = dir;
    }

    public static async deleteModel(foldername: string, name: string, ctx: IRouterContext) {
        ctx.request.body = fs.unlinkSync(path.join(`${modelfolder}`, foldername, `${name}.json` ));
    }
}
