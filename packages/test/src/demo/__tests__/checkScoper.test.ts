import { DemoEnvironment } from "../config/gen/DemoEnvironment";
import { DemoScoper } from "../scoper/gen/DemoScoper";
import { DemoModel, DemoFunction, Demo } from "../language/gen";
import { DemoModelCreator } from "./DemoModelCreator";


describe("testing Scoper", () => {
    describe("Scoper.getVisibleElements from DemoModel Instance", () => {
        let model: Demo = new DemoModelCreator().createIncorrectModel();
        let scoper = new DemoScoper();

        beforeEach(done => {
            DemoEnvironment.getInstance();
            done();
        });

        test("visible elements in model and unit", () => {
            let vi = scoper.getVisibleNames(model);
            // console.log("VI: " + vi);
            // expect(vi.length).toBe(5);
            for (let unit of model.models) {
                let vi = scoper.getVisibleNames(unit);
                // console.log(vi);
                expect(vi.length).toBe(13);
                for (let e of unit.entities) {
                    expect(vi).toContain(e.name);
                }

                for (let f of unit.functions) {
                    expect(vi).toContain(f.name);
                }
            }
        });

        test("visible elements in entities", () => {
            for (let unit of model.models) {
                for (let ent of unit.entities) {
                    let vis = scoper.getVisibleNames(ent);

                    for (let a of ent.attributes) {
                        expect(vis).toContain(a.name);
                    }

                    for (let f of ent.functions) {
                        expect(vis).toContain(f.name);
                    }

                    for (let e of unit.entities) {
                        expect(vis).toContain(e.name);
                    }
                }
            }
        });

        test("visible elements in model functions", () => {
            for (let unit of model.models) {
                for (let f1 of unit.functions) {
                    let vis = scoper.getVisibleNames(f1);
                    expect(vis).toContain(f1.name);
                    for (let e of unit.entities) {
                        expect(vis).toContain(e.name);
                    }
                    for (let p of f1.parameters) {
                        expect(vis).toContain(p.name);
                    }
                    for (let f2 of unit.functions) {
                        if (f2 !== f1) {
                            for (let p2 of f2.parameters) {
                                expect(vis).not.toContain(p2.name);
                            }
                        }
                    }
                }
            }
        });

        test("visible elements in entity functions", () => {
            for (let unit of model.models) {
                for (let ent of unit.entities) {

                    for (let f1 of ent.functions) {
                        let vis = scoper.getVisibleNames(f1);
                        expect(vis).toContain(f1.name);
                        for (let e of unit.entities) {
                            expect(vis).toContain(e.name);
                        }
                        for (let p of f1.parameters) {
                            expect(vis).toContain(p.name);
                        }
                        for (let f2 of unit.functions) {
                            if (f2 !== f1) {
                                for (let p2 of f2.parameters) {
                                    expect(vis).not.toContain(p2.name);
                                }
                            }
                        }
                    }
                }
            }
        });
    });

    describe("testing IsInScope", () => {
        let model: Demo = new DemoModelCreator().createIncorrectModel();
        let scoper = new DemoScoper();

        // beforeEach(done => {
        //     done();
        // });

        test("isInscope 'InCorrectModel'", () => {
            let nameTotest: string = "InCorrectModel";
            for (let unit of model.models) {
                expect(scoper.isInScope(model, nameTotest)).toBe(false);
                // test if nameTotest is known in model functions
                unit.functions.forEach(fun => {
                    expect(scoper.isInScope(fun, nameTotest)).toBe(false);
                });
                // test the same on entities and entity functions
                unit.entities.forEach(ent => {
                    expect(scoper.isInScope(ent, nameTotest)).toBe(false);
                    ent.functions.forEach(fun => {
                        expect(scoper.isInScope(fun, nameTotest)).toBe(false);
                    });
                });
            }
        });

        test("isInscope 'DemoModel_1'", () => {
            let nameTotest: string = "DemoModel_1";
            for (let unit of model.models) {
                expect(scoper.isInScope(model, nameTotest)).toBe(true);
                // test if nameTotest is known in model functions
                unit.functions.forEach(fun => {
                    expect(scoper.isInScope(fun.expression, nameTotest)).toBe(true);
                    expect(scoper.isInScope(fun, nameTotest)).toBe(true);
                });
                // test the same on entities and entity functions
                unit.entities.forEach(ent => {
                    expect(scoper.isInScope(ent, nameTotest)).toBe(true);
                    ent.functions.forEach(fun => {
                        expect(scoper.isInScope(fun, nameTotest)).toBe(true);
                    });
                });
            }
        });

        test("isInscope 'Person'", () => {
            // Person is Entity in DemoModel_1
            let nameTotest: string = "Person";
            testEntity(scoper, model.models[0], nameTotest);
        });

        test("isInscope 'Company'", () => {
            // Company is Entity in DemoModel_1
            let nameTotest: string = "Company";
            testEntity(scoper, model.models[0], nameTotest);
        });

        test("isInscope 'name'", () => {
            // name is Attribute of Person and of Company in DemoModel_1
            let nameTotest: string = "name";
            expect(scoper.isInScope(model, nameTotest)).toBe(false);
            // test if nameTotest is known in model functions
            model.models[0].functions.forEach(fun => {
                expect(scoper.isInScope(fun, nameTotest)).toBe(false);
            });
            // test the same on entities and entity functions
            model.models[0].entities.forEach(ent => {
                let expected: boolean = false;
                if (ent.name === "Person" || ent.name === "Company" || ent.name === "Company2" || ent.name === "School") {
                    expected = true;
                }
                // console.log(`name: ${ent.name}, expected: ${expected}`);
                expect(scoper.isInScope(ent, nameTotest, "DemoAttribute")).toBe(expected);
                ent.functions.forEach(fun => {
                    expect(scoper.isInScope(fun, nameTotest, "DemoAttribute", true)).toBe(false);
                    expect(scoper.isInScope(fun, nameTotest, "DemoAttribute", false)).toBe(expected);
                });
            });
        });

        test("isInscope 'age'", () => {
            // name is Attribute of Person and of Company in DemoModel_1
            let nameTotest: string = "age";
            expect(scoper.isInScope(model, nameTotest)).toBe(false);
            // test if nameTotest is known in model functions
            model.models[0].functions.forEach(fun => {
                expect(scoper.isInScope(fun, nameTotest)).toBe(false);
            });
            // test the same on entities and entity functions
            model.models[0].entities.forEach(ent => {
                let expected: boolean = false;
                if (ent.name === "Person") {
                    expected = true;
                }
                expect(scoper.isInScope(ent, nameTotest)).toBe(expected);
                ent.functions.forEach(fun => {
                    expect(scoper.isInScope(fun, nameTotest)).toBe(expected);
                });
            });
        });

        test("isInscope 'VAT_Number'", () => {
            // VAT_Number is Attribute of Company in DemoModel_1
            let nameTotest: string = "VAT_Number";
            expect(scoper.isInScope(model, nameTotest)).toBe(false);
            // test if nameTotest is known in model functions
            model.models[0].functions.forEach(fun => {
                expect(scoper.isInScope(fun, nameTotest)).toBe(false);
            });
            // test the same on entities and entity functions
            model.models[0].entities.forEach(ent => {
                let expected: boolean = false;
                if (ent.name === "Company" || ent.name === "Company2") {
                    expected = true;
                }
                // console.log(`name: ${ent.name}, expected: ${expected}, found: ${scoper.isInScope(ent, nameTotest)}`);
                expect(scoper.isInScope(ent, nameTotest)).toBe(expected);
                ent.functions.forEach(fun => {
                    expect(scoper.isInScope(fun, nameTotest)).toBe(expected);
                });
            });
        });

        test("isInscope 'length'", () => {
            // length is Function of DemoModel_1
            let nameTotest: string = "length";
            expect(scoper.isInScope(model.models[0], nameTotest)).toBe(true);
            // test if nameTotest is known in model functions
            model.models[0].functions.forEach(fun => {
                expect(scoper.isInScope(fun, nameTotest)).toBe(true);
            });
            // test the same on entities and entity functions
            model.models[0].entities.forEach(ent => {
                expect(scoper.isInScope(ent, nameTotest)).toBe(true);
                ent.functions.forEach(fun => {
                    expect(scoper.isInScope(fun, nameTotest)).toBe(true);
                });
            });
        });

        test("isInscope 'first'", () => {
            // first is Function of Person in DemoModel_1
            let nameTotest: string = "first";
            expect(scoper.isInScope(model, nameTotest, "DemoFunction")).toBe(false);
            // test if nameTotest is known in model functions
            model.models[0].functions.forEach(fun => {
                expect(scoper.isInScope(fun, nameTotest)).toBe(false);
                expect(scoper.isInScope(fun.expression, nameTotest)).toBe(false);
            });
            // test the same on entities and entity functions
            model.models[0].entities.forEach(ent => {
                let expected: boolean = false;
                if (ent.name === "Person") {
                    expected = true;
                }
                expect(scoper.isInScope(ent, nameTotest)).toBe(expected);
                ent.functions.forEach(fun => {
                    expect(scoper.isInScope(fun, nameTotest)).toBe(expected);
                });
            });
        });

        test("isInscope 'another'", () => {
            // last is Function of DemoModel_1
            let nameTotest: string = "another";
            expect(scoper.isInScope(model, nameTotest)).toBe(false);
            // test if nameTotest is known in model functions
            model.models[0].functions.forEach(fun => {
                expect(scoper.isInScope(fun, nameTotest)).toBe(false);
            });
            // test the same on entities and entity functions
            model.models[0].entities.forEach(ent => {
                let expected: boolean = false;
                if (ent.name === "Company2") {
                    expected = true;
                }
                // console.log(`name: ${ent.name}, expected: ${expected}, found: ${scoper.isInScope(ent, nameTotest)}`);
                expect(scoper.isInScope(ent, nameTotest)).toBe(expected);
                ent.functions.forEach(fun => {
                    expect(scoper.isInScope(fun, nameTotest)).toBe(expected);
                });
            });
        });

        test("isInscope 'Variable1'", () => {
            // Variable1 is VarDecl of length of DemoModel_1
            let nameTotest: string = "Variable1";
            expect(scoper.isInScope(model, nameTotest)).toBe(false);
            // test if nameTotest is known in model functions
            model.models[0].functions.forEach(fun => {
                let expected: boolean = false;
                if (fun.name === "length") {
                    expected = true;
                }
                expect(scoper.isInScope(fun, nameTotest)).toBe(expected);
            });
            // test the same on entities and entity functions
            model.models[0].entities.forEach(ent => {
                expect(scoper.isInScope(ent, nameTotest)).toBe(false);
                ent.functions.forEach(fun => {
                    expect(scoper.isInScope(fun, nameTotest)).toBe(false);
                });
            });
        });

        test("isInscope 'Resultvar'", () => {
            // Resultvar is VarDecl of first of Person of DemoModel_1
            let nameTotest: string = "Resultvar";
            expect(scoper.isInScope(model, nameTotest)).toBe(false);
            // test if nameTotest is known in model functions
            model.models[0].functions.forEach(fun => {
                expect(scoper.isInScope(fun, nameTotest)).toBe(false);
            });
            // test the same on entities and entity functions
            model.models[0].entities.forEach(ent => {
                expect(scoper.isInScope(ent, nameTotest)).toBe(false);
                ent.functions.forEach(fun => {
                    let expected: boolean = false;
                    if (ent.name === "Person" && fun.name === "first") {
                        expected = true;
                    }
                    expect(scoper.isInScope(fun, nameTotest)).toBe(expected);
                });
            });
        });

        // testName(scoper, model, "determine");
        // testName(scoper, model, "another");
        // testName(scoper, model, "VariableNumber2");
        // testName(scoper, model, "Resultvar");
        // testName(scoper, model, "AAP");
        // testName(scoper, model, "NOOT");
    });
});

function testEntity(scoper: DemoScoper, model: DemoModel, nameTotest: string) {
    expect(scoper.isInScope(model, nameTotest, "DemoEntity")).toBe(true);
    // test if nameTotest is known in model functions
    model.functions.forEach(fun => {
        expect(scoper.isInScope(fun, nameTotest, "DemoEntity")).toBe(true);
        expect(scoper.isInScope(fun, nameTotest, "DemoFunction")).toBe(false);
        expect(scoper.isInScope(fun.expression, nameTotest, "DemoEntity")).toBe(true);
        expect(scoper.isInScope(fun.expression, nameTotest, "DemoFunction")).toBe(false);
    });
    // test the same on entities and entity functions
    model.entities.forEach(ent => {
        expect(scoper.isInScope(ent, nameTotest)).toBe(true);
        ent.functions.forEach(fun => {
            expect(scoper.isInScope(fun, nameTotest)).toBe(true);
            expect(scoper.isInScope(fun.expression, nameTotest)).toBe(true);
        });
    });
}
