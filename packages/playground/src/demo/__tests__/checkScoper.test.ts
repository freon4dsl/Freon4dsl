import { DemoScoper } from "../scoper/gen/DemoScoper";
import { DemoModel, DemoFunction } from "../language/gen";
import { DemoModelCreator } from "./DemoModelCreator";
import { DemoUnparser } from "../unparser/gen/DemoUnparser";

describe("testing Scoper", () => {
    describe("Scoper.getVisibleElements from DemoModel Instance", () => {
        let model: DemoModel = new DemoModelCreator().createCorrectModel();
        let scoper = new DemoScoper();
        let unparser = new DemoUnparser();

        beforeEach(done => {
            done();
        });

        test("visible elements in model", () => {
            let vi = scoper.getVisibleNames(model);
            //expect(vi.length).toBe(5);

            for (let e of model.entities) {
                expect(vi).toContain(e.name);
            }

            for (let f of model.functions) {
                expect(vi).toContain(f.name);
            }
        });

        test("visible elements in entities", () => {
            for (let ent of model.entities) {
                let vis = scoper.getVisibleNames(ent);

                for (let a of ent.attributes) {
                    expect(vis).toContain(a.name);
                }

                for (let f of ent.functions) {
                    expect(vis).toContain(f.name);
                }

                for (let e of model.entities) {
                    expect(vis).toContain(e.name);
                }
            }
        });

        for (let f1 of model.functions) {
            test("visible elements in model functions", () => {
                let vis = scoper.getVisibleNames(f1);
                expect(vis).toContain(f1.name);
                for (let e of model.entities) {
                    expect(vis).toContain(e.name);
                }
                for (let p of f1.parameters) {
                    expect(vis).toContain(p.name);
                }
                for (let f2 of model.functions) {
                    if (f2 !== f1) {
                        for (let p2 of f2.parameters) {
                            expect(vis).not.toContain(p2.name);
                        }
                    }
                }
            });
        }

        for (let ent of model.entities) {
            test("visible elements in entity functions", () => {
                for (let f1 of ent.functions) {
                    let vis = scoper.getVisibleNames(f1);
                    expect(vis).toContain(f1.name);
                    for (let e of model.entities) {
                        expect(vis).toContain(e.name);
                    }
                    for (let p of f1.parameters) {
                        expect(vis).toContain(p.name);
                    }
                    for (let f2 of model.functions) {
                        if (f2 !== f1) {
                            for (let p2 of f2.parameters) {
                                expect(vis).not.toContain(p2.name);
                            }
                        }
                    }
                }
            });
        }
    });

    describe("testing IsInScope", () => {
        let model: DemoModel = new DemoModelCreator().createCorrectModel();
        let scoper = new DemoScoper();

        beforeEach(done => {
            done();
        });

        test("isInscope 'DemoModel_1'", () => {
            let nameTotest: string = "DemoModel_1";
            expect(scoper.isInScope(model, nameTotest)).toBe(false);
            // test if nameTotest is known in model functions
            model.functions.forEach(fun => {
                expect(scoper.isInScope(fun, nameTotest)).toBe(false);
            });
            // test the same on entities and entity functions
            model.entities.forEach(ent => {
                expect(scoper.isInScope(ent, nameTotest)).toBe(false);
                ent.functions.forEach(fun => {
                    expect(scoper.isInScope(fun, nameTotest)).toBe(false);
                });
            });
        });

        test("isInscope 'Person'", () => {
            // Person is Entity in DemoModel_1
            let nameTotest: string = "Person";
            testEntity(scoper, model, nameTotest);
        });

        test("isInscope 'Company'", () => {
            // Company is Entity in DemoModel_1
            let nameTotest: string = "Company";
            testEntity(scoper, model, nameTotest);
        });

        test("isInscope 'name'", () => {
            // name is Attribute of Person and of Company in DemoModel_1
            let nameTotest: string = "name";
            expect(scoper.isInScope(model, nameTotest)).toBe(false);
            // test if nameTotest is known in model functions
            model.functions.forEach(fun => {
                expect(scoper.isInScope(fun, nameTotest)).toBe(false);
            });
            // test the same on entities and entity functions
            model.entities.forEach(ent => {
                let expected: boolean = false;
                if (ent.name === "Person" || ent.name === "Company") {
                    expected = true;
                }
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
            model.functions.forEach(fun => {
                expect(scoper.isInScope(fun, nameTotest)).toBe(false);
            });
            // test the same on entities and entity functions
            model.entities.forEach(ent => {
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
            model.functions.forEach(fun => {
                expect(scoper.isInScope(fun, nameTotest)).toBe(false);
            });
            // test the same on entities and entity functions
            model.entities.forEach(ent => {
                let expected: boolean = false;
                if (ent.name === "Company") {
                    expected = true;
                }
                expect(scoper.isInScope(ent, nameTotest)).toBe(expected);
                ent.functions.forEach(fun => {
                    expect(scoper.isInScope(fun, nameTotest)).toBe(expected);
                });
            });
        });

        test("isInscope 'length'", () => {
            // length is Function of DemoModel_1
            let nameTotest: string = "length";
            expect(scoper.isInScope(model, nameTotest)).toBe(true);
            // test if nameTotest is known in model functions
            model.functions.forEach(fun => {
                expect(scoper.isInScope(fun, nameTotest)).toBe(true);
            });
            // test the same on entities and entity functions
            model.entities.forEach(ent => {
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
            model.functions.forEach(fun => {
                expect(scoper.isInScope(fun, nameTotest)).toBe(false);
            });
            // test the same on entities and entity functions
            model.entities.forEach(ent => {
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
            model.functions.forEach(fun => {
                expect(scoper.isInScope(fun, nameTotest)).toBe(false);
            });
            // test the same on entities and entity functions
            model.entities.forEach(ent => {
                let expected: boolean = false;
                if (ent.name === "Company") {
                    expected = true;
                }
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
            model.functions.forEach(fun => {
                let expected: boolean = false;
                if (fun.name === "length") {
                    expected = true;
                }
                expect(scoper.isInScope(fun, nameTotest)).toBe(expected);
            });
            // test the same on entities and entity functions
            model.entities.forEach(ent => {
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
            model.functions.forEach(fun => {
                expect(scoper.isInScope(fun, nameTotest)).toBe(false);
            });
            // test the same on entities and entity functions
            model.entities.forEach(ent => {
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
    });
    // test the same on entities and entity functions
    model.entities.forEach(ent => {
        expect(scoper.isInScope(ent, nameTotest)).toBe(true);
        ent.functions.forEach(fun => {
            expect(scoper.isInScope(fun, nameTotest)).toBe(true);
        });
    });
}
