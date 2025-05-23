import { DemoEnvironment } from "../config/gen/DemoEnvironment.js";
import { AppliedFeature, DemoAttributeRef, Demo } from "../language/gen/index.js";
import { DemoModelCreator } from "./DemoModelCreator.js";
import { describe,  test, expect, beforeEach } from "vitest";
import { isInScope, } from '../../utils/HelperFunctions.js';

describe("testing Alternative Scopes", () => {
    describe("testing IsInScope", () => {
        let model: Demo = new DemoModelCreator().createModelWithAppliedfeature();
        // in correctModel function length is changed into:
        // 'length (Variable1 : Person, VariableNumber2 : Boolean): String =
        //      Variable1.attrFromPerson.attrFromCompany
        // where 'Variable1.attrFromPerson' is of type Company
        let scoper = DemoEnvironment.getInstance().scoper;

        beforeEach(() => {
            DemoEnvironment.getInstance();
        });

        test("isInscope 'name' of 'Variable1.attrFromPerson', Variable1: Person", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature;
            expect(isInScope(scoper, appliedFeature, "name")).toBe(true);
        });

        test("isInscope 'Person' of 'Variable1.attrFromPerson', Variable1: Person", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature;
            expect(isInScope(scoper, appliedFeature, "Person")).toBe(false);
        });

        test("isInscope 'Company' of 'Variable1.attrFromPerson', Variable1: Person", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature;
            expect(isInScope(scoper, appliedFeature, "Company")).toBe(false);
        });

        test("isInscope 'VAT_Number' of 'Variable1.attrFromPerson', Variable1: Person", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature;
            expect(isInScope(scoper, appliedFeature, "VAT_Number")).toBe(false);
        });

        test("isInscope 'length' of 'Variable1.attrFromPerson', Variable1: Person", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature;
            expect(isInScope(scoper, appliedFeature, "length")).toBe(false);
        });

        test("isInscope 'first' of 'Variable1.attrFromPerson', Variable1: Person", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature;
            expect(isInScope(scoper, appliedFeature, "first")).toBe(true);
        });

        test("isInscope 'last' of 'Variable1.attrFromPerson', Variable1: Person", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature;
            expect(isInScope(scoper, appliedFeature, "last")).toBe(false);
        });

        test("isInscope 'determine' of 'Variable1.attrFromPerson', Variable1: Person", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature;
            expect(isInScope(scoper, appliedFeature, "determine")).toBe(false);
        });

        test("isInscope 'another' of 'Variable1.attrFromPerson', Variable1: Person", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature;
            expect(isInScope(scoper, appliedFeature, "another")).toBe(false);
        });

        test("isInscope 'Variable1' of 'Variable1.attrFromPerson', Variable1: Person", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature;
            expect(isInScope(scoper, appliedFeature, "Variable1")).toBe(false);
        });

        test("isInscope 'VariableNumber2' of 'Variable1.attrFromPerson', Variable1: Person", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature;
            expect(isInScope(scoper, appliedFeature, "VariableNumber2")).toBe(false);
        });

        test("isInscope 'AAP' of 'Variable1.attrFromPerson', Variable1: Person", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature;
            expect(isInScope(scoper, appliedFeature, "AAP")).toBe(false);
        });

        test("isInscope 'NOOT' of 'Variable1.attrFromPerson', Variable1: Person", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature;
            // let names: string = "";
            // for (let name of scoper.getVisibleNodes(appliedFeature)) {
            //     names = names.concat(name.name + ", ");
            // }
            // console.log("In Scope: " + names);
            expect(isInScope(scoper, appliedFeature, "NOOT")).toBe(false);
        });

        test("isInscope 'name' of 'Variable1.attrFromPerson.attrFromCompany', attrFromPerson: Company", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature.appliedfeature;
            expect(model.models[0].functions[0].name).toBe("length");
            expect((model.models[0].functions[0].expression.appliedfeature as DemoAttributeRef).attribute.name).toBe(
                "attrFromPerson",
            );
            expect(
                (model.models[0].functions[0].expression.appliedfeature.appliedfeature as DemoAttributeRef).attribute
                    .name,
            ).toBe("attrFromCompany");
            // let testfeat = model.models[0].functions[0].expression.appliedfeature;
            // let type = DemoEnvironment.getInstance().typer.inferType(testfeat);
            // let names: string = "";
            // for (let name of scoper.getVisibleNodes(appliedFeature)) {
            //     names = names.concat(name.name + ", ");
            // }
            // console.log("In Scope: " + names + " type: " + (type as FreNamedElement).name);
            expect(isInScope(scoper, appliedFeature, "name")).toBe(true);
        });

        test("isInscope 'Person' of 'Variable1.attrFromPerson.attrFromCompany', attrFromPerson: Company", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature.appliedfeature;
            expect(isInScope(scoper, appliedFeature, "Person")).toBe(false);
        });

        test("isInscope 'Company' of 'Variable1.attrFromPerson.attrFromCompany', attrFromPerson: Company", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature.appliedfeature;
            expect(isInScope(scoper, appliedFeature, "Company")).toBe(false);
        });

        test("isInscope 'VAT_Number' of 'Variable1.attrFromPerson.attrFromCompany', attrFromPerson: Company2", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature.appliedfeature;
            expect(isInScope(scoper, appliedFeature, "VAT_Number")).toBe(true);
        });

        test("isInscope 'length' of 'Variable1.attrFromPerson.attrFromCompany', attrFromPerson: Company", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature.appliedfeature;
            expect(isInScope(scoper, appliedFeature, "length")).toBe(false);
        });

        test("isInscope 'first' of 'Variable1.attrFromPerson.attrFromCompany', attrFromPerson: Company", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature.appliedfeature;
            expect(isInScope(scoper, appliedFeature, "first")).toBe(false);
        });

        test("isInscope 'last' of 'Variable1.attrFromPerson.attrFromCompany', attrFromPerson: Company", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature.appliedfeature;
            expect(isInScope(scoper, appliedFeature, "last")).toBe(false);
        });

        test("isInscope 'determine' of 'Variable1.attrFromPerson.attrFromCompany', attrFromPerson: Company", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature.appliedfeature;
            expect(isInScope(scoper, appliedFeature, "determine")).toBe(false);
        });

        test("isInscope 'another' of 'Variable1.attrFromPerson.attrFromCompany', attrFromPerson: Company", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature.appliedfeature;
            expect(isInScope(scoper, appliedFeature, "another")).toBe(true);
        });

        test("isInscope 'Variable1' of 'Variable1.attrFromPerson.attrFromCompany', attrFromPerson: Company", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature.appliedfeature;
            expect(isInScope(scoper, appliedFeature, "Variable1")).toBe(false);
        });

        test("isInscope 'VariableNumber2' of 'Variable1.attrFromPerson.attrFromCompany', attrFromPerson: Company", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature.appliedfeature;
            expect(isInScope(scoper, appliedFeature, "VariableNumber2")).toBe(false);
        });

        test("isInscope 'AAP' of 'Variable1.attrFromPerson.attrFromCompany', attrFromPerson: Company", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature.appliedfeature;
            expect(isInScope(scoper, appliedFeature, "AAP")).toBe(false);
        });

        test("isInscope 'NOOT' of 'Variable1.attrFromPerson.attrFromCompany', attrFromPerson: Company", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature.appliedfeature;
            expect(isInScope(scoper, appliedFeature, "NOOT")).toBe(false);
        });
    });
});
