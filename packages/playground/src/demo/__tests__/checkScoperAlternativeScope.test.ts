import { DemoScoper } from "../scoper/gen/DemoScoper";
import { DemoModel, DemoFunction, AppliedFeature, DemoAttributeRef, Demo } from "../language/gen";
import { DemoModelCreator } from "./DemoModelCreator";
import { DemoEnvironment } from "../environment/gen/DemoEnvironment";
import { PiNamedElement } from "@projectit/core";

describe("testing Alternative Scopes", () => {
    describe("testing IsInScope", () => {
        let model: Demo = new DemoModelCreator().createModelWithAppliedfeature();
        // in correctModel function length is changed into:
        // 'length (Variable1 : Person, VariableNumber2 : Boolean): String =
        //      Variable1.attrFromPerson.attrFromCompany
        // where 'Variable1.attrFromPerson' is of type Company
        let scoper = new DemoScoper();

        beforeEach(done => {
            done();
        });

        test("isInscope 'name' of 'Variable1.attrFromPerson', Variable1: Person", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "name")).toBe(true);
        });

        test("isInscope 'Person' of 'Variable1.attrFromPerson', Variable1: Person", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "Person")).toBe(false);
        });

        test("isInscope 'Company' of 'Variable1.attrFromPerson', Variable1: Person", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "Company")).toBe(false);
        });

        test("isInscope 'VAT_Number' of 'Variable1.attrFromPerson', Variable1: Person", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "VAT_Number")).toBe(false);
        });

        test("isInscope 'length' of 'Variable1.attrFromPerson', Variable1: Person", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "length")).toBe(false);
        });

        test("isInscope 'first' of 'Variable1.attrFromPerson', Variable1: Person", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "first")).toBe(true);
        });

        test("isInscope 'last' of 'Variable1.attrFromPerson', Variable1: Person", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "last")).toBe(false);
        });

        test("isInscope 'determine' of 'Variable1.attrFromPerson', Variable1: Person", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "determine")).toBe(false);
        });

        test("isInscope 'another' of 'Variable1.attrFromPerson', Variable1: Person", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "another")).toBe(false);
        });

        test("isInscope 'Variable1' of 'Variable1.attrFromPerson', Variable1: Person", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "Variable1")).toBe(false);
        });

        test("isInscope 'VariableNumber2' of 'Variable1.attrFromPerson', Variable1: Person", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "VariableNumber2")).toBe(false);
        });

        test("isInscope 'AAP' of 'Variable1.attrFromPerson', Variable1: Person", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "AAP")).toBe(false);
        });

        test("isInscope 'NOOT' of 'Variable1.attrFromPerson', Variable1: Person", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature;
            // let names: string = "";
            // for (let name of scoper.getVisibleElements(appliedFeature)) {
            //     names = names.concat(name.name + ", ");
            // }
            // console.log("In Scope: " + names);
            expect(scoper.isInScope(appliedFeature, "NOOT")).toBe(false);
        });

        test("isInscope 'name' of 'Variable1.attrFromPerson.attrFromCompany', attrFromPerson: Company", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature.appliedfeature;
            expect(model.models[0].functions[0].name).toBe("length");
            expect((model.models[0].functions[0].expression.appliedfeature as DemoAttributeRef).attribute.name).toBe("attrFromPerson");
            expect((model.models[0].functions[0].expression.appliedfeature.appliedfeature as DemoAttributeRef).attribute.name).toBe("attrFromCompany");
            // let testfeat = model.models[0].functions[0].expression.appliedfeature;
            // let type = DemoEnvironment.getInstance().typer.inferType(testfeat);
            // let names: string = "";
            // for (let name of scoper.getVisibleElements(appliedFeature)) {
            //     names = names.concat(name.name + ", ");
            // }
            // console.log("In Scope: " + names + " type: " + (type as PiNamedElement).name);
            expect(scoper.isInScope(appliedFeature, "name")).toBe(true);
        });

        test("isInscope 'Person' of 'Variable1.attrFromPerson.attrFromCompany', attrFromPerson: Company", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "Person")).toBe(false);
        });

        test("isInscope 'Company' of 'Variable1.attrFromPerson.attrFromCompany', attrFromPerson: Company", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature.appliedfeature;
            let vi = scoper.getVisibleNames(appliedFeature);
            expect(scoper.isInScope(appliedFeature, "Company")).toBe(false);
        });

        test("isInscope 'VAT_Number' of 'Variable1.attrFromPerson.attrFromCompany', attrFromPerson: Company", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "VAT_Number")).toBe(true);
        });

        test("isInscope 'length' of 'Variable1.attrFromPerson.attrFromCompany', attrFromPerson: Company", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "length")).toBe(false);
        });

        test("isInscope 'first' of 'Variable1.attrFromPerson.attrFromCompany', attrFromPerson: Company", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "first")).toBe(false);
        });

        test("isInscope 'last' of 'Variable1.attrFromPerson.attrFromCompany', attrFromPerson: Company", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "last")).toBe(false);
        });

        test("isInscope 'determine' of 'Variable1.attrFromPerson.attrFromCompany', attrFromPerson: Company", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "determine")).toBe(false);
        });

        test("isInscope 'another' of 'Variable1.attrFromPerson.attrFromCompany', attrFromPerson: Company", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "another")).toBe(true);
        });

        test("isInscope 'Variable1' of 'Variable1.attrFromPerson.attrFromCompany', attrFromPerson: Company", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "Variable1")).toBe(false);
        });

        test("isInscope 'VariableNumber2' of 'Variable1.attrFromPerson.attrFromCompany', attrFromPerson: Company", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "VariableNumber2")).toBe(false);
        });

        test("isInscope 'AAP' of 'Variable1.attrFromPerson.attrFromCompany', attrFromPerson: Company", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "AAP")).toBe(false);
        });

        test("isInscope 'NOOT' of 'Variable1.attrFromPerson.attrFromCompany', attrFromPerson: Company", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "NOOT")).toBe(false);
        });
    });
});
