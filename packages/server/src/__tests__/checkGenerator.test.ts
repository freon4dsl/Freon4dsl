import * as fs from "fs";
import request from "supertest";

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
            declaredType: null
        }
    ]
};
const contentHgIntf = {
    $typename: "ExampleUnit",
    name: "hg",
    entities: [],
    methods: [
        {
            $typename: "Method",
            name: "gfah "
        }
    ]
};
const emptyJson = {};
const storeFolder = "./modelstore";
var path = require("path");

describe("Generate Study Site", () => {

    test(" is able to generate a file from a model", async () => {
        console.log("Generate Study Site");
        var name = "hg";
        var modelAsJson:string = fs.readFileSync(path.join(`${storeFolder}`, modelName, `${name}.json`)).toString();
        let parsedModel = JSON.parse(modelAsJson);
        parsedModel.
        expect(parsedModel).toEqual(contentHgUnit);
    });

});
