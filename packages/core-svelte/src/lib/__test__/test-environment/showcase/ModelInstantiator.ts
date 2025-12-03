import { ShowCasePart } from "./ShowCasePart.js";
import { ShowCaseUnit } from "./ShowCaseUnit.js";
import { ShowCaseModel } from "./ShowCaseModel.js";

export class ModelInstantiator {
    createModel(): ShowCaseModel {
        // create a simple model to be shown on the ShowCase page
        let part1: ShowCasePart = ShowCasePart.create({ name: "part1" });
        let part2: ShowCasePart = ShowCasePart.create({ name: "part2" });
        let part3: ShowCasePart = ShowCasePart.create({ name: "part3" });
        let part4: ShowCasePart = ShowCasePart.create({ name: "part4" });
        let part5: ShowCasePart = ShowCasePart.create({ name: "part5" });
        let part6: ShowCasePart = ShowCasePart.create({ name: "part6" });
        let unit: ShowCaseUnit = ShowCaseUnit.create({
            name: "firstUnit",
            prim: "myPrimText",
            numlist: [100, 200, 300],
            part: part1,
            partlist: [part2, part3, part4, part5, part6],
        });
        let model: ShowCaseModel = ShowCaseModel.create({ name: "ShowCaseModel", unit: unit });
        return model;
    }
}
