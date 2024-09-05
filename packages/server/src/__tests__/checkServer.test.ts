const SERVER_URL = "http://127.0.0.1:8001/";

import request from "supertest";
import { app } from "../server/server-def";
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
            name: "gfah ",
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
        expect(response.status).toBe(200);
        expect(response.text).toBe("Freon Model Server");
    });

    test(" serves all models", async () => {
        const response2 = await serv.get("/getModelList");
        expect(response2.status).toBe(201);
        expect(response2.text).toContain("__TEST__");
    });

    test(" serves all model units", async () => {
        const response2 = await serv.get(`/getUnitList?folder=${modelName}`);
        expect(response2.status).toBe(201);
        expect(response2.text).toContain("hg");
        expect(response2.text).toContain(`hg${modelUnitInterfacePostfix}`);
        expect(response2.text).toContain("xng");
        expect(response2.text).toContain(`xng${modelUnitInterfacePostfix}`);
    });

    test(" is able to serve a unit, including its interface", async () => {
        const unitName: string = "hg";
        const response1 = await serv.get(`/getModelUnit?folder=${modelName}&name=${unitName}`);
        expect(response1.status).toBe(201);
        expect(JSON.parse(response1.body)).toEqual(contentHgUnit);
        const response2 = await serv.get(
            `/getModelUnit?folder=${modelName}&name=${unitName}${modelUnitInterfacePostfix}`,
        );
        expect(response2.status).toBe(201);
        expect(JSON.parse(response2.body)).toEqual(contentHgIntf);
    });

    test(" is able to save a unit, including its interface", async () => {
        const unitName: string = "NIEUW";
        const response1 = await serv.put(`/putModelUnit?folder=${modelName}&name=${unitName}`);
        expect(response1.status).toBe(201);
        const response2 = await serv.put(
            `/putModelUnit?folder=${modelName}&name=${unitName}${modelUnitInterfacePostfix}`,
        );
        expect(response2.status).toBe(201);
        const response3 = await serv.get(`/getModelUnit?folder=${modelName}&name=${unitName}`);
        expect(response3.status).toBe(201);
        expect(JSON.parse(response3.body)).toEqual(emptyJson);
        const response4 = await serv.get(
            `/getModelUnit?folder=${modelName}&name=${unitName}${modelUnitInterfacePostfix}`,
        );
        expect(response4.status).toBe(201);
        expect(JSON.parse(response3.body)).toEqual(emptyJson);
    });

    test(" is able to delete a unit, including its interface", async () => {
        const unitName: string = "NIEUW";
        // create a new unit
        await serv.put(`/putModelUnit?folder=${modelName}&name=${unitName}`);
        await serv.put(`/putModelUnit?folder=${modelName}&name=${unitName}${modelUnitInterfacePostfix}`);
        // and delete it
        const response1 = await serv.get(`/deleteModelUnit?folder=${modelName}&name=${unitName}`);
        expect(response1.status).toBe(201);
        const response2 = await serv.get(
            `/deleteModelUnit?folder=${modelName}&name=${unitName}${modelUnitInterfacePostfix}`,
        );
        expect(response2.status).toBe(201);
        // check whether it is no longer present
        const response3 = await serv.get(`/getUnitList?folder=${modelName}`);
        expect(response3.status).toBe(201);
        expect(response3.text).not.toContain(unitName);
    });

    test(" is able to delete a model, including all its units", async () => {
        const modelName2: string = "toBeDeleted";
        const unitName: string = "NIEUW";
        // create a new model and unit
        await serv.put(`/putModelUnit?folder=${modelName2}&name=${unitName}`);
        await serv.put(`/putModelUnit?folder=${modelName2}&name=${unitName}${modelUnitInterfacePostfix}`);
        // and delete it
        const response1 = await serv.get(`/deleteModel?folder=${modelName2}`);
        expect(response1.status).toBe(201);
        // check whether it is no longer present
        const response3 = await serv.get(`/getModelList`);
        expect(response3.status).toBe(201);
        expect(response3.text).not.toContain(modelName2);
    });
});
