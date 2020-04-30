import { DemoScoper } from "../scoper/gen/DemoScoper";
import { DemoModel, DemoFunction, AppliedFeature } from "../language/gen";
import { DemoModelCreator } from "./DemoModelCreator";

describe("testing Alternative Scopes", () => {
    describe("testing IsInScope", () => {
        let model: DemoModel = new DemoModelCreator().createModelWithAppliedfeature();
        // in correctModel function length is changed into:
        // 'length (Variable1 : Person, VariableNumber2 : Boolean): String =
        //      Variable1.myfirstAppliedFeature.mysecondAppliedFeature
        // where 'Variable1.myfirstAppliedFeature' is of type Company
        let scoper = new DemoScoper();

        beforeEach(done => {
            done();
        });

        test("isInscope 'name' of 'Variable1.myfirstAppliedFeature', Variable1: Person", () => {
            let appliedFeature: AppliedFeature = model.functions[0].expression.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "name")).toBe(true);
        });

        test("isInscope 'Person' of 'Variable1.myfirstAppliedFeature', Variable1: Person", () => {
            let appliedFeature: AppliedFeature = model.functions[0].expression.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "Person")).toBe(false);
        });

        test("isInscope 'Company' of 'Variable1.myfirstAppliedFeature', Variable1: Person", () => {
            let appliedFeature: AppliedFeature = model.functions[0].expression.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "Company")).toBe(false);
        });

        test("isInscope 'VAT_Number' of 'Variable1.myfirstAppliedFeature', Variable1: Person", () => {
            let appliedFeature: AppliedFeature = model.functions[0].expression.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "VAT_Number")).toBe(false);
        });

        test("isInscope 'length' of 'Variable1.myfirstAppliedFeature', Variable1: Person", () => {
            let appliedFeature: AppliedFeature = model.functions[0].expression.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "length")).toBe(false);
        });

        test("isInscope 'first' of 'Variable1.myfirstAppliedFeature', Variable1: Person", () => {
            let appliedFeature: AppliedFeature = model.functions[0].expression.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "first")).toBe(true);
        });

        test("isInscope 'last' of 'Variable1.myfirstAppliedFeature', Variable1: Person", () => {
            let appliedFeature: AppliedFeature = model.functions[0].expression.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "last")).toBe(false);
        });

        test("isInscope 'determine' of 'Variable1.myfirstAppliedFeature', Variable1: Person", () => {
            let appliedFeature: AppliedFeature = model.functions[0].expression.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "determine")).toBe(false);
        });

        test("isInscope 'another' of 'Variable1.myfirstAppliedFeature', Variable1: Person", () => {
            let appliedFeature: AppliedFeature = model.functions[0].expression.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "another")).toBe(false);
        });

        test("isInscope 'Variable1' of 'Variable1.myfirstAppliedFeature', Variable1: Person", () => {
            let appliedFeature: AppliedFeature = model.functions[0].expression.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "Variable1")).toBe(false);
        });

        test("isInscope 'VariableNumber2' of 'Variable1.myfirstAppliedFeature', Variable1: Person", () => {
            let appliedFeature: AppliedFeature = model.functions[0].expression.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "VariableNumber2")).toBe(false);
        });

        test("isInscope 'AAP' of 'Variable1.myfirstAppliedFeature', Variable1: Person", () => {
            let appliedFeature: AppliedFeature = model.functions[0].expression.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "AAP")).toBe(false);
        });

        test("isInscope 'NOOT' of 'Variable1.myfirstAppliedFeature', Variable1: Person", () => {
            let appliedFeature: AppliedFeature = model.functions[0].expression.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "NOOT")).toBe(false);
        });

        // TODO the rest of the test do not work, because the scoper does not yet function with instances of limited concepts
        test.skip("isInscope 'name' of 'Variable1.myfirstAppliedFeature.mysecondAppliedFeature', myfirstAppliedFeature: Company", () => {
            let appliedFeature: AppliedFeature = model.functions[0].expression.appliedfeature.appliedfeature;
            expect(model.functions[0].expression.appliedfeature.type.referred.name).toBe("Company");
            expect(scoper.isInScope(appliedFeature, "name")).toBe(true);
        });

        test.skip("isInscope 'Person' of 'Variable1.myfirstAppliedFeature.mysecondAppliedFeature', myfirstAppliedFeature: Company", () => {
            let appliedFeature: AppliedFeature = model.functions[0].expression.appliedfeature.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "Person")).toBe(false);
        });

        test.skip("isInscope 'Company' of 'Variable1.myfirstAppliedFeature.mysecondAppliedFeature', myfirstAppliedFeature: Company", () => {
            let appliedFeature: AppliedFeature = model.functions[0].expression.appliedfeature.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "Company")).toBe(false);
        });

        test.skip("isInscope 'VAT_Number' of 'Variable1.myfirstAppliedFeature.mysecondAppliedFeature', myfirstAppliedFeature: Company", () => {
            let appliedFeature: AppliedFeature = model.functions[0].expression.appliedfeature.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "VAT_Number")).toBe(true);
        });

        test.skip("isInscope 'length' of 'Variable1.myfirstAppliedFeature.mysecondAppliedFeature', myfirstAppliedFeature: Company", () => {
            let appliedFeature: AppliedFeature = model.functions[0].expression.appliedfeature.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "length")).toBe(false);
        });

        test.skip("isInscope 'first' of 'Variable1.myfirstAppliedFeature.mysecondAppliedFeature', myfirstAppliedFeature: Company", () => {
            let appliedFeature: AppliedFeature = model.functions[0].expression.appliedfeature.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "first")).toBe(false);
        });

        test.skip("isInscope 'last' of 'Variable1.myfirstAppliedFeature.mysecondAppliedFeature', myfirstAppliedFeature: Company", () => {
            let appliedFeature: AppliedFeature = model.functions[0].expression.appliedfeature.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "last")).toBe(false);
        });

        test.skip("isInscope 'determine' of 'Variable1.myfirstAppliedFeature.mysecondAppliedFeature', myfirstAppliedFeature: Company", () => {
            let appliedFeature: AppliedFeature = model.functions[0].expression.appliedfeature.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "determine")).toBe(false);
        });

        test.skip("isInscope 'another' of 'Variable1.myfirstAppliedFeature.mysecondAppliedFeature', myfirstAppliedFeature: Company", () => {
            let appliedFeature: AppliedFeature = model.functions[0].expression.appliedfeature.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "another")).toBe(true);
        });

        test.skip("isInscope 'Variable1' of 'Variable1.myfirstAppliedFeature.mysecondAppliedFeature', myfirstAppliedFeature: Company", () => {
            let appliedFeature: AppliedFeature = model.functions[0].expression.appliedfeature.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "Variable1")).toBe(false);
        });

        test.skip("isInscope 'VariableNumber2' of 'Variable1.myfirstAppliedFeature.mysecondAppliedFeature', myfirstAppliedFeature: Company", () => {
            let appliedFeature: AppliedFeature = model.functions[0].expression.appliedfeature.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "VariableNumber2")).toBe(false);
        });

        test.skip("isInscope 'AAP' of 'Variable1.myfirstAppliedFeature.mysecondAppliedFeature', myfirstAppliedFeature: Company", () => {
            let appliedFeature: AppliedFeature = model.functions[0].expression.appliedfeature.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "AAP")).toBe(false);
        });

        test.skip("isInscope 'NOOT' of 'Variable1.myfirstAppliedFeature.mysecondAppliedFeature', myfirstAppliedFeature: Company", () => {
            let appliedFeature: AppliedFeature = model.functions[0].expression.appliedfeature.appliedfeature;
            expect(scoper.isInScope(appliedFeature, "NOOT")).toBe(false);
        });
    });
});
