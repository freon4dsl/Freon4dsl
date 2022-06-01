import { GenericModelSerializer, PiModelUnit } from "@projectit/core";
import { FileHandler } from "../../utils/FileHandler";
import { DocuProjectEnvironment } from "../config/gen/DocuProjectEnvironment";
import { InsuranceModel, Part, Product } from "../language/gen";

const writer = DocuProjectEnvironment.getInstance().writer;
const reader = DocuProjectEnvironment.getInstance().reader;
const scoper = DocuProjectEnvironment.getInstance().scoper;
const validator = DocuProjectEnvironment.getInstance().validator;
const handler = new FileHandler();

function addPartToModel(model: InsuranceModel, filepath: string) {
    try {
        const langSpec: string = handler.stringFromFile(filepath);
        const unit1 = reader.readFromString(langSpec, "Part", model) as Part;
        unit1.name = filepath.split("/").pop().split(".").shift();
    } catch (e) {
        console.log(e.message + e.stack);
        expect(e).toBeNull();
    }
}

function addProductToModel(model: InsuranceModel, filepath: string) {
    try {
        const langSpec: string = handler.stringFromFile(filepath);
        const unit1 = reader.readFromString(langSpec, "Product", model) as PiModelUnit;
        unit1.name = filepath.split("/").pop().split(".").shift();
    } catch (e) {
        console.log(e.message + e.stack);
        expect(e).toBeNull();
    }
}

describe("Testing DocuProject", () => {
    const model: InsuranceModel = new InsuranceModel();
    model.name = "TEST_MODEL";

    test("add health base", () => {
        addPartToModel(model, "src/docu-project/__inputs__/base/Health.base");
    });

    test("add home base", () => {
        addPartToModel(model, "src/docu-project/__inputs__/base/Home.base");
    });

    test("add legal base", () => {
        addPartToModel(model, "src/docu-project/__inputs__/base/Legal.base");
    });

    test("add HealthAll product", () => {
        addProductToModel(model, "src/docu-project/__inputs__/products/HealthAll.prod");
    });

    test("add HomeAll product", () => {
        addProductToModel(model, "src/docu-project/__inputs__/products/HomeAll.prod");
    });

    test("add HomeAndHealth product", () => {
        addProductToModel(model, "src/docu-project/__inputs__/products/HomeAndHealth.prod");
    });

    test("add HomeCheap product", () => {
        addProductToModel(model, "src/docu-project/__inputs__/products/HomeCheap.prod");

    });

    test("add HomeExtra product", () => {
        addProductToModel(model, "src/docu-project/__inputs__/products/HomeExtra.prod");
    });

    test("add LegalAll product", () => {
        addProductToModel(model, "src/docu-project/__inputs__/products/LegalAll.prod");
        // console.log(model.getUnits().map(u => u instanceof Part ? u.part.name : u instanceof Product ? u.product.name : "no unit").join(", "));
        model.getUnits().forEach(u => {
            const names: string[] = scoper.getVisibleNames(u);
            console.log("Visible names in unit: " + u.name + "\n" + names.map(n => n).join(", "));
        });

        // const errors = validator.validate(model);
        // console.log("Errors found (" + errors.length + ")\n" + errors.map(e => e.message + ' in [' + e.locationdescription + ']').join("\n"));
    });

});
