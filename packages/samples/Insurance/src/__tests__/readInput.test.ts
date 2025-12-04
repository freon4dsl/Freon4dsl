import { InsuranceModelEnvironment } from "../freon/config/InsuranceModelEnvironment.js";
import { BaseProduct, InsuranceModel, Part, Product } from "../freon/language/index.js";
import { FreReader, FreValidator } from "@freon4dsl/core";
import { FileUtil } from '@freon4dsl/test-helpers';
import { describe, test, expect } from "vitest";


// const writer = InsuranceModelEnvironment.getInstance().writer;
const reader: FreReader = InsuranceModelEnvironment.getInstance().reader;
// const scoper = InsuranceModelEnvironment.getInstance().scoper;
const validator: FreValidator = InsuranceModelEnvironment.getInstance().validator;

function addPartToModel(model: InsuranceModel, filepath: string) {
    try {
        const langSpec: string = FileUtil.stringFromFile('./packages/samples/Insurance/src/__inputs__/' + filepath);
        const unit1 = reader.readFromString(langSpec, "Part", model) as Part;
        // use last name of filepath as name of the unit
        unit1.name = filepath.split("/").pop().split(".").shift();
    } catch (e) {
        console.log(e.message + e.stack);
        expect(e).toBeNull();
    }
}

function addProductToModel(model: InsuranceModel, filepath: string) {
    try {
        const langSpec: string = FileUtil.stringFromFile('./packages/samples/Insurance/src/__inputs__/' + filepath);
        const unit1 = reader.readFromString(langSpec, "Product", model) as Product;
        // use last name of filepath as name of the unit
        unit1.name = filepath.split("/").pop().split(".").shift();
    } catch (e) {
        console.log(e.message + e.stack);
        expect(e).toBeNull();
    }
}

describe("Testing InsuranceModel", () => {
    const model: InsuranceModel = new InsuranceModel();
    model.name = "TEST_MODEL";

    test("add health base", () => {
        addPartToModel(model, "base/Health.base");
    });

    test("add home base", () => {
        addPartToModel(model, "base/Home.base");
    });

    test("add legal base", () => {
        addPartToModel(model, "base/Legal.base");
    });

    test("add HealthAll product", () => {
        addProductToModel(model, "products/HealthAll.prod");
    });

    test("add HomeAll product", () => {
        addProductToModel(model, "products/HomeAll.prod");
    });

    test("add HomeAndHealth product", () => {
        addProductToModel(model, "products/HomeAndHealth.prod");
    });

    test("add HomeCheap product", () => {
        addProductToModel(model, "products/HomeCheap.prod");

    });

    test("add HomeExtra product", () => {
        addProductToModel(model, "/products/HomeExtra.prod");
    });

    test("add LegalAll product", () => {
        addProductToModel(model, "products/LegalAll.prod");
    });

    test("check resulting model", () => {
        // console.log(model.getUnits().map(u => u.name).join(", "));
        // console.log(model.getUnits().map(u => u instanceof Part ? u.part.name : u instanceof Product ? u.product.name : "no unit").join(", "));
        // model.getUnits().forEach(u => {
        //     const names: string[] = scoper.getVisibleNames(u);
        //     console.log("Visible names in unit: " + u.name + "\n" + names.map(n => n).join(", "));
        // });

        //
        const hUnit: Part = model.getUnits().find(u => u.name === 'Health') as Part;
        const hBase: BaseProduct = hUnit.part;
        expect (hBase.name).toBe('health1');
        const hospitalPart = hBase.parts.find(p => p.name === 'hospitalization');
        expect (hospitalPart).not.toBeNull();
        expect (hospitalPart).not.toBeUndefined();
        //
        const usingRef: Product = model.getUnits().find(u => u.name === 'HealthAll') as Product;
        expect(usingRef).not.toBeNull();
        // expect(usingRef).not.toBeUndefined();
        // const parts: FreNodeReference<InsurancePart>[] = usingRef?.product.parts;
        // console.log( parts.map(ref => ref.pathnameToString('&&')).join('\n'))
        // const names: string[] = scoper.getVisibleNames(usingRef?.product);
        // expect (names).toContain('Health');
        // expect (names).toContain('health1');
        // expect (names).not.toContain('hospitalization');

        const errors = validator.validate(model);
        console.log("Errors found (" + errors.length + ")\n" + errors.map(e => e.message + ' in ['
            + e.locationdescription + ']').join("\n"));
            // + writer.writeToString((e.reportedOn as PiElement).piOwner()) + ']').join("\n"));
    });

});
