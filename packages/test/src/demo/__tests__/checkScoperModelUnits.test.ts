import { DemoScoper } from "../scoper/gen";
import { DemoModel, Demo } from "../language/gen";
import { initializeScoperDef } from "../scoper/gen";
import { DemoModelCreator } from "./DemoModelCreator";
import { DemoStdlib } from "../stdlib/gen/DemoStdlib";
import { DemoUnitCreator } from "./DemoUnitCreator";
import { DemoEnvironment } from "../config/gen/DemoEnvironment";

describe("testing Scoper on model units", () => {

    describe("Scoper.getVisibleElements from DemoModel with Units", () => {
        let model: Demo = new DemoModelCreator().createModelWithMultipleUnits();
        let scoper = DemoEnvironment.getInstance().scoper;
        let stdlib = DemoStdlib.getInstance();

        beforeEach(done => {
            DemoEnvironment.getInstance();
            done();
        });

        test("visible elements in model", () => {
            let vi = scoper.getVisibleNames(model);
            expect(vi.length).toBe(6);
            expect(vi).not.toContain("ModelWithUnits");
            expect(vi).toContain("DemoModel_with_inheritance");
            expect(vi).toContain("CorrectUnit");
            for (let e of stdlib.elements) {
                expect(vi). toContain(e.name);
            }
        });

        test("visible elements in units", () => {
            const unit1 = model.models[0];
            const unit2 = model.models[1];

            let vi = scoper.getVisibleNames(unit1);
            // expect(vi).toContain("Anneke");
            // expect(vi.length).toBe(9);
            for (let e of unit2.entities) {
                expect(vi).not.toContain(e.name);
            }

            for (let f of unit2.functions) {
                expect(vi).not.toContain(f.name);
            }

            vi = scoper.getVisibleNames(unit2);
            // expect(vi).toContain("Anneke");
            // expect(vi.length).toBe(9);
            for (let e of unit1.entities) {
                expect(vi).not.toContain(e.name);
            }

            for (let f of unit1.functions) {
                expect(vi).not.toContain(f.name);
            }
        });

        test("visible elements in JSON model", () => {
            let readModel = new DemoUnitCreator().modelToJsonToModel();
            let vi = scoper.getVisibleNames(readModel);
            expect(vi.length).toBe(6);
            expect(vi).not.toContain("ReadFromJson");
            expect(vi).toContain("DemoModel_with_inheritance");
            expect(vi).toContain("CorrectUnit");
            for (let e of stdlib.elements) {
                expect(vi). toContain(e.name);
            }
        });

        test("visible elements in units in JSON model", () => {
            initializeScoperDef(DemoEnvironment.getInstance().scoper);
            let readModel = new DemoUnitCreator().modelToJsonToModel();
            const unit1 = readModel.models[0];      // a 'complete' unit
            const unit2 = readModel.models[1];      // a 'unit interface'
            expect(unit2.entities.length).toBe(0);  // entities are not public

            let vi = scoper.getVisibleNames(unit1);

            expect(vi.length).toBe(11);
            for (let e of unit2.entities) {
                expect(vi).not.toContain(e.name);
            }

            for (let f of unit2.functions) {
                expect(vi).not.toContain(f.name);
            }

            vi = scoper.getVisibleNames(unit2);
            // expect(vi).toContain("Anneke");
            // expect(vi.length).toBe(9);

            for (let e of unit1.entities) {
                expect(vi).not.toContain(e.name);
            }

            for (let f of unit1.functions) {
                expect(vi).not.toContain(f.name);
            }
        });

        test("visible elements in entities", () => {
            const unit1 = model.models[0];
            const unit2 = model.models[1];

            for (let ent of unit1.entities) {
                let vis = scoper.getVisibleNames(ent);
                // expect(vis).toContain("Anneke");

                for (let ent2 of unit2.entities) {
                    for (let a of ent2.attributes) {
                        expect(vis).not.toContain(a.name);
                    }

                    for (let f of ent2.functions) {
                        expect(vis).not.toContain(f.name);
                    }

                    expect(vis).not.toContain(ent2.name);
                }
            }
        });

    //     test("visible elements in model functions", () => {
    //         for (let unit of model.models) {
    //             for (let f1 of unit.functions) {
    //                 let vis = scoper.getVisibleNames(f1);
    //                 expect(vis).toContain(f1.name);
    //                 for (let e of unit.entities) {
    //                     expect(vis).toContain(e.name);
    //                 }
    //                 for (let p of f1.parameters) {
    //                     expect(vis).toContain(p.name);
    //                 }
    //                 for (let f2 of unit.functions) {
    //                     if (f2 !== f1) {
    //                         for (let p2 of f2.parameters) {
    //                             expect(vis).not.toContain(p2.name);
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //     });
    //
    //     test("visible elements in entity functions", () => {
    //         for (let unit of model.models) {
    //             for (let ent of unit.entities) {
    //
    //                 for (let f1 of ent.functions) {
    //                     let vis = scoper.getVisibleNames(f1);
    //                     expect(vis).toContain(f1.name);
    //                     for (let e of unit.entities) {
    //                         expect(vis).toContain(e.name);
    //                     }
    //                     for (let p of f1.parameters) {
    //                         expect(vis).toContain(p.name);
    //                     }
    //                     for (let f2 of unit.functions) {
    //                         if (f2 !== f1) {
    //                             for (let p2 of f2.parameters) {
    //                                 expect(vis).not.toContain(p2.name);
    //                             }
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //     });
    // });
    //
    // describe("testing IsInScope", () => {
    //     let model: Demo = new DemoModelCreator().createIncorrectModel();
    //     let scoper = new DemoScoper();
    //
    //     beforeEach(done => {
    //         done();
    //     });
    //
    //     test("isInscope 'DemoModel_1'", () => {
    //         let nameTotest: string = "DemoModel_1";
    //         for (let unit of model.models) {
    //             expect(scoper.isInScope(model, nameTotest)).toBe(false);
    //             // test if nameTotest is known in model functions
    //             unit.functions.forEach(fun => {
    //                 expect(scoper.isInScope(fun, nameTotest)).toBe(false);
    //             });
    //             // test the same on entities and entity functions
    //             unit.entities.forEach(ent => {
    //                 expect(scoper.isInScope(ent, nameTotest)).toBe(false);
    //                 ent.functions.forEach(fun => {
    //                     expect(scoper.isInScope(fun, nameTotest)).toBe(false);
    //                 });
    //             });
    //         }
    //     });
    //
    //     test("isInscope 'Person'", () => {
    //         // Person is Entity in DemoModel_1
    //         let nameTotest: string = "Person";
    //         testEntity(scoper, model.models[0], nameTotest);
    //     });
    //
    //     test("isInscope 'Company'", () => {
    //         // Company is Entity in DemoModel_1
    //         let nameTotest: string = "Company";
    //         testEntity(scoper, model.models[0], nameTotest);
    //     });
    //
    //     test("isInscope 'name'", () => {
    //         // name is Attribute of Person and of Company in DemoModel_1
    //         let nameTotest: string = "name";
    //         expect(scoper.isInScope(model, nameTotest)).toBe(false);
    //         // test if nameTotest is known in model functions
    //         model.models[0].functions.forEach(fun => {
    //             expect(scoper.isInScope(fun, nameTotest)).toBe(false);
    //         });
    //         // test the same on entities and entity functions
    //         model.models[0].entities.forEach(ent => {
    //             let expected: boolean = false;
    //             if (ent.name === "Person" || ent.name === "Company") {
    //                 expected = true;
    //             }
    //             expect(scoper.isInScope(ent, nameTotest, "DemoAttribute")).toBe(expected);
    //             ent.functions.forEach(fun => {
    //                 expect(scoper.isInScope(fun, nameTotest, "DemoAttribute", true)).toBe(false);
    //                 expect(scoper.isInScope(fun, nameTotest, "DemoAttribute", false)).toBe(expected);
    //             });
    //         });
    //     });
    //
    //     test("isInscope 'age'", () => {
    //         // name is Attribute of Person and of Company in DemoModel_1
    //         let nameTotest: string = "age";
    //         expect(scoper.isInScope(model, nameTotest)).toBe(false);
    //         // test if nameTotest is known in model functions
    //         model.models[0].functions.forEach(fun => {
    //             expect(scoper.isInScope(fun, nameTotest)).toBe(false);
    //         });
    //         // test the same on entities and entity functions
    //         model.models[0].entities.forEach(ent => {
    //             let expected: boolean = false;
    //             if (ent.name === "Person") {
    //                 expected = true;
    //             }
    //             expect(scoper.isInScope(ent, nameTotest)).toBe(expected);
    //             ent.functions.forEach(fun => {
    //                 expect(scoper.isInScope(fun, nameTotest)).toBe(expected);
    //             });
    //         });
    //     });
    //
    //     test("isInscope 'VAT_Number'", () => {
    //         // VAT_Number is Attribute of Company in DemoModel_1
    //         let nameTotest: string = "VAT_Number";
    //         expect(scoper.isInScope(model, nameTotest)).toBe(false);
    //         // test if nameTotest is known in model functions
    //         model.models[0].functions.forEach(fun => {
    //             expect(scoper.isInScope(fun, nameTotest)).toBe(false);
    //         });
    //         // test the same on entities and entity functions
    //         model.models[0].entities.forEach(ent => {
    //             let expected: boolean = false;
    //             if (ent.name === "Company") {
    //                 expected = true;
    //             }
    //             expect(scoper.isInScope(ent, nameTotest)).toBe(expected);
    //             ent.functions.forEach(fun => {
    //                 expect(scoper.isInScope(fun, nameTotest)).toBe(expected);
    //             });
    //         });
    //     });
    //
    //     test("isInscope 'length'", () => {
    //         // length is Function of DemoModel_1
    //         let nameTotest: string = "length";
    //         expect(scoper.isInScope(model.models[0], nameTotest)).toBe(true);
    //         // test if nameTotest is known in model functions
    //         model.models[0].functions.forEach(fun => {
    //             expect(scoper.isInScope(fun, nameTotest)).toBe(true);
    //         });
    //         // test the same on entities and entity functions
    //         model.models[0].entities.forEach(ent => {
    //             expect(scoper.isInScope(ent, nameTotest)).toBe(true);
    //             ent.functions.forEach(fun => {
    //                 expect(scoper.isInScope(fun, nameTotest)).toBe(true);
    //             });
    //         });
    //     });
    //
    //     test("isInscope 'first'", () => {
    //         // first is Function of Person in DemoModel_1
    //         let nameTotest: string = "first";
    //         expect(scoper.isInScope(model, nameTotest, "DemoFunction")).toBe(false);
    //         // test if nameTotest is known in model functions
    //         model.models[0].functions.forEach(fun => {
    //             expect(scoper.isInScope(fun, nameTotest)).toBe(false);
    //         });
    //         // test the same on entities and entity functions
    //         model.models[0].entities.forEach(ent => {
    //             let expected: boolean = false;
    //             if (ent.name === "Person") {
    //                 expected = true;
    //             }
    //             expect(scoper.isInScope(ent, nameTotest)).toBe(expected);
    //             ent.functions.forEach(fun => {
    //                 expect(scoper.isInScope(fun, nameTotest)).toBe(expected);
    //             });
    //         });
    //     });
    //
    //     test("isInscope 'another'", () => {
    //         // last is Function of DemoModel_1
    //         let nameTotest: string = "another";
    //         expect(scoper.isInScope(model, nameTotest)).toBe(false);
    //         // test if nameTotest is known in model functions
    //         model.models[0].functions.forEach(fun => {
    //             expect(scoper.isInScope(fun, nameTotest)).toBe(false);
    //         });
    //         // test the same on entities and entity functions
    //         model.models[0].entities.forEach(ent => {
    //             let expected: boolean = false;
    //             if (ent.name === "Company") {
    //                 expected = true;
    //             }
    //             expect(scoper.isInScope(ent, nameTotest)).toBe(expected);
    //             ent.functions.forEach(fun => {
    //                 expect(scoper.isInScope(fun, nameTotest)).toBe(expected);
    //             });
    //         });
    //     });
    //
    //     test("isInscope 'Variable1'", () => {
    //         // Variable1 is VarDecl of length of DemoModel_1
    //         let nameTotest: string = "Variable1";
    //         expect(scoper.isInScope(model, nameTotest)).toBe(false);
    //         // test if nameTotest is known in model functions
    //         model.models[0].functions.forEach(fun => {
    //             let expected: boolean = false;
    //             if (fun.name === "length") {
    //                 expected = true;
    //             }
    //             expect(scoper.isInScope(fun, nameTotest)).toBe(expected);
    //         });
    //         // test the same on entities and entity functions
    //         model.models[0].entities.forEach(ent => {
    //             expect(scoper.isInScope(ent, nameTotest)).toBe(false);
    //             ent.functions.forEach(fun => {
    //                 expect(scoper.isInScope(fun, nameTotest)).toBe(false);
    //             });
    //         });
    //     });
    //
    //     test("isInscope 'Resultvar'", () => {
    //         // Resultvar is VarDecl of first of Person of DemoModel_1
    //         let nameTotest: string = "Resultvar";
    //         expect(scoper.isInScope(model, nameTotest)).toBe(false);
    //         // test if nameTotest is known in model functions
    //         model.models[0].functions.forEach(fun => {
    //             expect(scoper.isInScope(fun, nameTotest)).toBe(false);
    //         });
    //         // test the same on entities and entity functions
    //         model.models[0].entities.forEach(ent => {
    //             expect(scoper.isInScope(ent, nameTotest)).toBe(false);
    //             ent.functions.forEach(fun => {
    //                 let expected: boolean = false;
    //                 if (ent.name === "Person" && fun.name === "first") {
    //                     expected = true;
    //                 }
    //                 expect(scoper.isInScope(fun, nameTotest)).toBe(expected);
    //             });
    //         });
    //     });
    //
    //     // testName(scoper, model, "determine");
    //     // testName(scoper, model, "another");
    //     // testName(scoper, model, "VariableNumber2");
    //     // testName(scoper, model, "Resultvar");
    //     // testName(scoper, model, "AAP");
    //     // testName(scoper, model, "NOOT");
    });
});

function testEntity(scoper: DemoScoper, model: DemoModel, nameTotest: string) {
    expect(scoper.isInScope(model, nameTotest, "DemoEntity")).toBe(true);
    // test if nameTotest is known in model functions
    model.functions.forEach(fun => {
        expect(scoper.isInScope(fun, nameTotest, "DemoEntity")).toBe(true);
        expect(scoper.isInScope(fun, nameTotest, "DemoFunction")).toBe(false);
    });
    // test the same on entities and entity functions
    model.entities.forEach(ent => {
        expect(scoper.isInScope(ent, nameTotest)).toBe(true);
        ent.functions.forEach(fun => {
            expect(scoper.isInScope(fun, nameTotest)).toBe(true);
        });
    });
}
