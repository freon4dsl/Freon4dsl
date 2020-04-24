import { DemoModel, DemoFunction, DemoEntity, DemoEveryConcept } from "../language/gen";
import { DemoModelCreator } from "./DemoModelCreator";

describe("Demo Model", () => {
    describe("Checking DemoModel instance", () => {
        let model: DemoModel = new DemoModelCreator().createCorrectModel();

        beforeEach(done => {
            done();
        });

        test("model name should be set", () => {
            expect(model.name).not.toBeNull;
        });

        test("model functions should be set correctly", () => {
            expect(model.functions.length).toBe(3);
            checkFunctionDef(model.functions[0], model);
            checkFunctionDef(model.functions[1], model);
            checkFunctionDef(model.functions[2], model);
        });

        test("model entities should be set correctly", () => {
            expect(model.entities.length).toBe(2);

            const f1: DemoEntity = model.entities[0];
            expect(f1.container).toBe(model);
            expect(f1.name).not.toBeNull;
        });

        test("entity functions should be set correctly", () => {
            for (let i of model.entities) {
                for (let f of i.functions) {
                    expect(f.container).toBe(i);
                    checkFunctionDef(f, i);
                }
            }
        });

        test("entity attributes should be set correctly", () => {
            for (let i of model.entities) {
                for (let a of i.attributes) {
                    expect(a.name).not.toBeNull;
                    expect(a.container).toBe(i);
                }
            }
        });
    });
});

function checkFunctionDef(f1: DemoFunction, owner: DemoEveryConcept) {
    expect(f1.name).not.toBeNull;
    expect(f1.expression.container).toBe(f1);
    expect(f1.container).toBe(owner);
    expect((f1.expression as any).container).toBeTruthy();
    expect(f1.expression.piContainer().container).toBe(f1);
}
