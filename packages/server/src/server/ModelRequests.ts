import * as fs from "fs";
import { IRouterContext } from "koa-router";

const modelfolder = "./modelstore";

export class ModelRequests {
    public static async putModel(name: string, ctx: IRouterContext) {
        const body = ctx.request.body;
        fs.writeFileSync(`${modelfolder}/${name}.json`, JSON.stringify(body, null, 3));
    }

    public static async getModel(name: string, ctx: IRouterContext) {
        ctx.response.body = fs.readFileSync(`${modelfolder}/${name}.json`);
    }

    public static async getModelList(ctx: IRouterContext) {
        const dir = fs
            .readdirSync(`${modelfolder}`)
            .filter(f => f.endsWith(".json"))
            .map(f => f.substring(0, f.length - 5));
        ctx.response.body = dir;
    }
}
