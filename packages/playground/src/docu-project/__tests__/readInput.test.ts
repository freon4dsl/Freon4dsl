import { GenericModelSerializer, PiModelUnit } from "@projectit/core";
import { FileHandler } from "../../utils/FileHandler";
import { DocuProjectEnvironment } from "../config/gen/DocuProjectEnvironment";
import { InsuranceModel } from "../language/gen";

const writer = DocuProjectEnvironment.getInstance().writer;
const reader = DocuProjectEnvironment.getInstance().reader;
const validator = DocuProjectEnvironment.getInstance().validator;
const serial: GenericModelSerializer = new GenericModelSerializer();
const handler = new FileHandler();

function addPartToModel(model: InsuranceModel, filepath: string) {
    try {
        const langSpec: string = handler.stringFromFile(filepath);
        const unit1 = reader.readFromString(langSpec, "Part", model) as PiModelUnit;
    } catch (e) {
        console.log(e.message + e.stack);
        // expect(e).toBeNaN();
    }
}

function addProductToModel(model: InsuranceModel, filepath: string) {
    try {
        const langSpec: string = handler.stringFromFile(filepath);
        const unit1 = reader.readFromString(langSpec, "Product", model) as PiModelUnit;
        unit1.name = "unit1";
    } catch (e) {
        console.log(e.message + e.stack);
        // expect(e).toBeNaN();
    }
}

describe("Testing DocuProject", () => {
    const model: InsuranceModel = new InsuranceModel();

    test("add first part", () => {
        addPartToModel(model, "src/docu-project/__inputs__/Part1.part");
    });

    test("add second part", () => {
        addPartToModel(model, "src/docu-project/__inputs__/Part2.part");
    });

    test("add first base product", () => {
        addProductToModel(model, "src/docu-project/__inputs__/Base1.prod");
        console.log(model.getUnits().map(u => u.name).join("\n\n"));
        const errors = validator.validate(model);
        console.log(errors.map(e => e.message + ' in [' + e.locationdescription + ']').join("\n"));
    });

});
