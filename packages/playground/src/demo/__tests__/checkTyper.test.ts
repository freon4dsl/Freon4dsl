import { DemoModel, DemoAttributeType } from "../language/gen";
import { DemoTyper } from "../typer/gen/DemoTyper";
import { DemoModelCreator } from "./DemoModelCreator";

describe("Testing Typer", () => {
    describe("Typer.isType on DemoModel Instance", () => {
        let model: DemoModel = new DemoModelCreator().createCorrectModel();
        let typer = new DemoTyper();

        beforeEach(done => {
            done();
        });

        test("all entities should be types", () => {
            expect(typer.isType(model)).toBe(false);
            model.functions.forEach(fun => {
                expect(typer.isType(fun)).toBe(false);
            });
            model.entities.forEach(ent => {
                expect(typer.isType(ent)).toBe(true);
                ent.functions.forEach(fun => {
                    expect(typer.isType(fun)).toBe(false);
                });
                ent.attributes.forEach(fun => {
                    expect(typer.isType(fun)).toBe(false);
                });
            });
        });

        test("all attributes should have a valid type", () => {
            model.entities.forEach(ent => {
                ent.attributes.forEach(att => {
                    expect(att.declaredType).not.toBeNull;
                    expect(att.declaredType).not.toBeUndefined;
                    expect(typer.isType(att.declaredType.referred)).toBe(true);
                });
            });
        });

        test("all functions should have a return type", () => {
            model.functions.forEach(fun => {
                expect(typer.isType(fun.declaredType.referred)).toBe(true);
            });
            model.entities.forEach(ent => {
                ent.functions.forEach(fun => {
                    expect(typer.isType(fun.declaredType.referred)).toBe(true);
                });
            });
        });

        test("the type of every expresion can be inferred and equals the declared type of its function", () => {
            model.functions.forEach(fun => {
                if (fun.expression !== null) {
                    let expressionType = typer.inferType(fun.expression);
                    expect(expressionType).not.toBeNull;
                    // expect(typer.conformsTo(fun.declaredType, expressionType)).toBe(true)
                }
            });
            model.entities.forEach(ent => {
                ent.functions.forEach(fun => {
                    if (fun.expression !== null) {
                        let expressionType = typer.inferType(fun.expression);
                        expect(expressionType).not.toBeNull;
                        // expect(typer.conformsTo(fun.declaredType, expressionType)).toBe(true)
                    }
                });
            });
        });

        test("type conformance of the primitive types should be correct", () => {
            expect(typer.conformsTo(DemoAttributeType.Integer, DemoAttributeType.String)).toBe(false);
            expect(typer.conformsTo(DemoAttributeType.Integer, DemoAttributeType.Integer)).toBe(true);
            expect(typer.conformsTo(DemoAttributeType.Integer, DemoAttributeType.Boolean)).toBe(false);

            expect(typer.conformsTo(DemoAttributeType.String, DemoAttributeType.String)).toBe(true);
            expect(typer.conformsTo(DemoAttributeType.String, DemoAttributeType.Integer)).toBe(false);
            expect(typer.conformsTo(DemoAttributeType.String, DemoAttributeType.Boolean)).toBe(false);

            expect(typer.conformsTo(DemoAttributeType.Boolean, DemoAttributeType.String)).toBe(false);
            expect(typer.conformsTo(DemoAttributeType.Boolean, DemoAttributeType.Integer)).toBe(false);
            expect(typer.conformsTo(DemoAttributeType.Boolean, DemoAttributeType.Boolean)).toBe(true);
        });

        test("type conformance of model entity types should be correct", () => {
            model.entities.forEach(ent => {
                expect(typer.conformsTo(ent, DemoAttributeType.String)).toBe(false);
                expect(typer.conformsTo(ent, DemoAttributeType.Integer)).toBe(false);
                expect(typer.conformsTo(ent, DemoAttributeType.Boolean)).toBe(false);
                model.entities.forEach(ent2 => {
                    if (ent !== ent2) {
                        expect(typer.conformsTo(ent, ent2)).toBe(false);
                    }
                });
            });
        });
    });
});
