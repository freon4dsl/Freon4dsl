import { DemoModel, DemoAttributeType } from "../language";
import { DemoTyper } from "../typeIt/DemoTyper";
import { DemoModelCreator } from "./DemoModelCreator";

describe('Testing Typer', () => {
    describe('Typer.isType on DemoModel Instance', () => {
        let model : DemoModel = new DemoModelCreator().model;
        let typer = new DemoTyper();
     
        beforeEach(done => {
          done();
        });

        it("all entities should be types", () => {
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
    
        it("all attributes should have a valid type", () => {
            model.entities.forEach(ent => {
                ent.attributes.forEach(att => {
                    expect(att.type).not.toBeNull;
                    expect(typer.isType(att.type)).toBe(true);
                });
            });
        });
    
        // it("all functions should have a return type", () => {
        //     model.entities.forEach(ent => {
        //         ent.functions.forEach(fun => {
        //             expect(typer.isType(fun.type)).toBe(false);
        //         });
        //     });
        // });
    
        it("the type of every expresion can be inferred", () => {
            model.functions.forEach(fun => {
                if (fun.expression !== null) {
                    expect(typer.inferType(fun.expression)).not.toBeNull;
                }
            });
            model.entities.forEach(ent => {
                ent.functions.forEach(fun => {
                    if (fun.expression !== null) {
                        expect(typer.inferType(fun.expression)).not.toBeNull;
                    }
                });
            });
        });
  
        it("type conformance of the primitive types is not correct", () => {
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
  
        it("type conformance of model entity types is not correct", () => {
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