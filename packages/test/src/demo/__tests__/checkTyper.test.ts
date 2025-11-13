import { DemoEnvironment } from "../freon/config/gen/DemoEnvironment.js";
import { DemoModel, DemoAttributeType } from "../freon/language/gen/index.js";
import { DemoModelCreator } from "./DemoModelCreator.js";
import { describe, test, expect } from "vitest";

describe("Testing Typer", () => {
    describe("Typer.isType on DemoModel Instance", () => {
        let typer = DemoEnvironment.getInstance().typer;
        let model: DemoModel = new DemoModelCreator().createIncorrectModel().models[0];

        test("all entities should be types", () => {
            expect(typer.isType(model)).toBe(false);
            model.functions.forEach((fun) => {
                expect(typer.isType(fun)).toBe(false);
            });
            model.entities.forEach((ent) => {
                expect(typer.isType(ent)).toBe(true);
                ent.functions.forEach((fun) => {
                    expect(typer.isType(fun)).toBe(false);
                });
                ent.attributes.forEach((fun) => {
                    expect(typer.isType(fun)).toBe(false);
                });
            });
        });

        test("all attributes should have a valid type", () => {
            model.entities.forEach((ent) => {
                ent.attributes.forEach((att) => {
                    expect(att.declaredType).not.toBeNull();
                    expect(att.declaredType).not.toBeUndefined();
                    expect(att.declaredType.referred).not.toBeNull();
                    expect(att.declaredType.referred).not.toBeUndefined();
                    expect(typer.isType(att.declaredType.referred)).toBe(true);
                });
            });
        });

        test("all functions should have a return type", () => {
            model.functions.forEach((fun) => {
                expect(fun.declaredType).not.toBeNull();
                expect(typer.isType(fun.declaredType.referred)).toBe(true);
            });
            model.entities.forEach((ent) => {
                ent.functions.forEach((fun) => {
                    expect(fun.declaredType).not.toBeNull();
                    expect(typer.isType(fun.declaredType.referred)).toBe(true);
                });
            });
        });

        test("the type of every expresion can be inferred and equals the declared type of its function", () => {
            model.functions.forEach((fun) => {
                if (fun.expression !== null) {
                    let expressionType = typer.inferType(fun.expression);
                    expect(expressionType).not.toBeNull();
                    // expect(typer.conforms(fun.declaredType, expressionType)).toBe(true)
                }
            });
            model.entities.forEach((ent) => {
                ent.functions.forEach((fun) => {
                    if (fun.expression !== null) {
                        let expressionType = typer.inferType(fun.expression);
                        expect(expressionType).not.toBeNull();
                        // expect(typer.conforms(fun.declaredType, expressionType)).toBe(true)
                    }
                });
            });
        });

        test("type conformance of the primitive types should be correct", () => {
            expect(typer.conformsType(DemoAttributeType.Integer, DemoAttributeType.String)).toBe(false);
            expect(typer.conformsType(DemoAttributeType.Integer, DemoAttributeType.Integer)).toBe(true);
            expect(typer.conformsType(DemoAttributeType.Integer, DemoAttributeType.Boolean)).toBe(false);

            expect(typer.conformsType(DemoAttributeType.String, DemoAttributeType.String)).toBe(true);
            expect(typer.conformsType(DemoAttributeType.String, DemoAttributeType.Integer)).toBe(false);
            expect(typer.conformsType(DemoAttributeType.String, DemoAttributeType.Boolean)).toBe(false);

            expect(typer.conformsType(DemoAttributeType.Boolean, DemoAttributeType.String)).toBe(false);
            expect(typer.conformsType(DemoAttributeType.Boolean, DemoAttributeType.Integer)).toBe(false);
            expect(typer.conformsType(DemoAttributeType.Boolean, DemoAttributeType.Boolean)).toBe(true);
        });

        test("type conformance of model entity types should be correct", () => {
            model.entities.forEach((ent) => {
                expect(typer.conformsType(ent, DemoAttributeType.String)).toBe(false);
                expect(typer.conformsType(ent, DemoAttributeType.Integer)).toBe(false);
                expect(typer.conformsType(ent, DemoAttributeType.Boolean)).toBe(false);
                model.entities.forEach((ent2) => {
                    if (ent !== ent2) {
                        expect(typer.conformsType(ent, ent2)).toBe(false);
                    }
                });
            });
        });

        test("type conformance of function parameters should be using custom implementation", () => {
            // find function named 'manyParams'
            const func = model.functions.find((f) => f.name === "manyParams");
            const res = typer.conformsListType(
                func.parameters.map((p) => p.declaredType.referred),
                func.parameters.map((p) => p.declaredType.referred),
            );
            expect(res).toBe(false);
        });

        test("type conformance of a model with inheritance (baseEntities)", () => {
            let inheritanceModel: DemoModel = new DemoModelCreator().createInheritanceModel().models[0];
            inheritanceModel.entities.forEach((ent) => {
                if (!!ent.baseEntity) {
                    // console.log("trying " + ent.name + " found base entity: " + ent.baseEntity?.referred.name);
                    expect(typer.conformsType(ent.baseEntity.referred, ent));
                }
            });
        });
    });
});
