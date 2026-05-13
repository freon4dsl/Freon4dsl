import { HttpSuccessCodes } from "../server/httpcodes.js"

const SERVER_URL = "http://127.0.0.1:8001/";

import request from "supertest";
import { app } from "../server/server-def.js";
import { describe, test, expect } from "vitest";

const modelUnitInterfacePostfix: string = "Public";
const modelName: string = "__TEST__";
const contentHgUnit = {
    $typename: "ExampleUnit",
    name: "hg",
    entities: [],
    methods: [
        {
            $typename: "Method",
            name: "gfah",
            body: null,
            parameters: [],
            declaredType: null,
        },
    ],
};
const contentHgIntf = {
    $typename: "ExampleUnit",
    name: "hg",
    entities: [],
    methods: [
        {
            $typename: "Method",
            name: "gfah ",
        },
    ],
};
const emptyJson = {};

describe("Freon Model Server", () => {
    const serv = request(app.callback());

    test(" is responding", async () => {
        const response = await serv.get("/");
        expect(response.status).toBe(HttpSuccessCodes.Ok);
        expect(response.text).toBe("Freon Model Server");
    });

    test(" create a model with a non-identifier name, list it and delete it", async () => {
        const weirdModelName = "631(&$][:) 12!"
        const response1 = await serv.put(`/saveModel?model=${encodeURIComponent(`${weirdModelName}`)}&language=MyLang`);
        expect(response1.status).toBe(HttpSuccessCodes.Ok);

        const response2 = await serv.get("/getModelList");
        expect(response2.status).toBe(HttpSuccessCodes.Ok);
        // console.log(JSON.stringify(response2.text))
        expect(response2.text).toContain("__TEST__");
        expect(response2.text).toContain("631(&$][:) 12!");

        const response3 = await serv.get(`/deleteModel?model=${encodeURIComponent(`${weirdModelName}`)}`);
        expect(response3.status).toBe(HttpSuccessCodes.Ok);

        const response4 = await serv.get("/getModelList");
        expect(response4.status).toBe(HttpSuccessCodes.Ok);
        // console.log(JSON.stringify(response4.text))
        expect(response4.text).toContain("__TEST__");
        expect(response4.text).to.not.contain("631(&$][:) 12!");
    });

    test(" serves all model units", async () => {
        const response2 = await serv.get(`/getUnitList?model=${modelName}`);
        expect(response2.status).toBe(HttpSuccessCodes.Ok);
        expect(response2.text).toContain("hg");
        expect(response2.text).toContain("xng");
    });

    test(" is able to serve a unit", async () => {
        const unitName: string = "hg";
        const response1 = await serv.get(`/getModelUnit?model=${modelName}&unit=${unitName}`);
        expect(response1.status).toBe(HttpSuccessCodes.Ok);
        expect(JSON.parse(response1.body)).toEqual(contentHgUnit);
    });

    test(" is able to save a unit", async () => {
        const unitName: string = "NIEUW";
        const response1 = await serv.put(`/saveModelUnit?model=${modelName}&unit=${unitName}`);
        expect(response1.status).toBe(HttpSuccessCodes.Ok);
        const response3 = await serv.get(`/getModelUnit?model=${modelName}&unit=${unitName}`);
        expect(response3.status).toBe(HttpSuccessCodes.Ok);
        expect(JSON.parse(response3.body)).toEqual(emptyJson);
        expect(JSON.parse(response3.body)).toEqual(emptyJson);
    });

    test(" is able to delete a unit", async () => {
        const unitName: string = "NIEUW"
        // create a new unit
        await serv.put(`/saveModelUnit?model=${modelName}&unit=${unitName}`)
        // and delete it
        const response1 = await serv.get(`/deleteModelUnit?model=${modelName}&unit=${unitName}`)
        expect(response1.status).toBe(HttpSuccessCodes.Ok)
        const response3 = await serv.get(`/getUnitList?model=${modelName}`)
        expect(response3.status).toBe(HttpSuccessCodes.Ok)
        expect(response3.text).not.toContain(unitName)
    })

    test(" is able to delete a model, including all its units", async () => {
        const modelName2: string = "toBeDeleted"
        const unitName: string = "NIEUW"

        // create a new model and unit
        const response1 = await serv.put(`/saveModel?model=${modelName2}`)
        expect(response1.status).toBe(HttpSuccessCodes.Ok)

        const response2 = await serv.put(`/saveModelUnit?model=${modelName2}&unit=${unitName}`)
        expect(response2.status).toBe(HttpSuccessCodes.Ok)

        // and delete it
        const response3 = await serv.get(`/deleteModel?model=${modelName2}`)
        expect(response3.status).toBe(HttpSuccessCodes.Ok)

        // check whether it is no longer present
        const response4 = await serv.get("/getModelList")
        expect(response4.status).toBe(HttpSuccessCodes.Ok)
        expect(response4.text).not.toContain(modelName2)
    })
});
