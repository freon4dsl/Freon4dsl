import { DemoModel, DemoAttributeType } from "../language";
import { DemoTyper } from "../typer/DemoTyper";
import { DemoModelCreator } from "./DemoModelCreator";

describe('Testing Typer', () => {
    describe('Typer.isType on DemoModel Instance', () => {
        let model : DemoModel = new DemoModelCreator().model;
        let typer = new DemoTyper();
     
        beforeEach(done => {
          done();
        });

        test.skip("all entities should be types", () => {
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
    
        test.skip("all attributes should have a valid type", () => {
            model.entities.forEach(ent => {
                ent.attributes.forEach(att => {
                    expect(att.declaredType).not.toBeNull;
                    expect(att.declaredType).not.toBeUndefined;
                    expect(typer.isType(att.declaredType)).toBe(true);
                });
            });
        });
    
        test.skip("all functions should have a return type", () => {
            model.functions.forEach(fun => {
                expect(typer.isType(fun.declaredType)).toBe(true);
            });
            model.entities.forEach(ent => {
                ent.functions.forEach(fun => {
                    expect(typer.isType(fun.declaredType)).toBe(true);
                });
            });
        });
    
        test.skip("the type of every expresion can be inferred and equals the declared type of its function", () => {
            model.functions.forEach(fun => {
                if (fun.expression !== null) {
                    let expressionType = typer.inferType(fun.expression);
                    expect(expressionType).not.toBeNull;
                    // expect(typer.conform(fun.declaredType, expressionType)).toBe(true)
                }
            });
            model.entities.forEach(ent => {
                ent.functions.forEach(fun => {
                    if (fun.expression !== null) {
                        let expressionType = typer.inferType(fun.expression);
                        expect(expressionType).not.toBeNull;
                        // expect(typer.conform(fun.declaredType, expressionType)).toBe(true)
                    }
                });
            });
        });
  
        test.skip("type conformance of the primitive types should be correct", () => {
            expect(typer.conform(DemoAttributeType.Integer, DemoAttributeType.String)).toBe(false);
            expect(typer.conform(DemoAttributeType.Integer, DemoAttributeType.Integer)).toBe(true);
            expect(typer.conform(DemoAttributeType.Integer, DemoAttributeType.Boolean)).toBe(false);

            expect(typer.conform(DemoAttributeType.String, DemoAttributeType.String)).toBe(true);
            expect(typer.conform(DemoAttributeType.String, DemoAttributeType.Integer)).toBe(false);
            expect(typer.conform(DemoAttributeType.String, DemoAttributeType.Boolean)).toBe(false);

            expect(typer.conform(DemoAttributeType.Boolean, DemoAttributeType.String)).toBe(false);
            expect(typer.conform(DemoAttributeType.Boolean, DemoAttributeType.Integer)).toBe(false);
            expect(typer.conform(DemoAttributeType.Boolean, DemoAttributeType.Boolean)).toBe(true);
  
        });
  
        test.skip("type conformance of model entity types should be correct", () => {
            model.entities.forEach(ent => {
                expect(typer.conform(ent, DemoAttributeType.String)).toBe(false);
                expect(typer.conform(ent, DemoAttributeType.Integer)).toBe(false);
                expect(typer.conform(ent, DemoAttributeType.Boolean)).toBe(false);  
                model.entities.forEach(ent2 => {
                    if (ent !== ent2) {
                        expect(typer.conform(ent, ent2)).toBe(false);
                    }
                });  
            });  
        });
    });
});