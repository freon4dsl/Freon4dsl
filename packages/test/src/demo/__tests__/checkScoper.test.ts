import { DemoEnvironment } from "../config/gen/DemoEnvironment.js";
import { DemoModel, Demo } from '../language/gen';
import { DemoModelCreator } from "./DemoModelCreator.js";
import { describe, test, expect, beforeEach } from "vitest";
import { FreCompositeScoper } from '@freon4dsl/core';
import { isInScope, getVisibleNames } from '../../utils/HelperFunctions.js';
import { initializeScoperDef } from '../scoper/gen';

describe("testing Scoper", () => {
    describe("Scoper.getVisibleNodes from DemoModel Instance", () => {
        let model: Demo = new DemoModelCreator().createIncorrectModel();
        let scoper = DemoEnvironment.getInstance().scoper;

        beforeEach(() => {
            DemoEnvironment.getInstance();
        });

        test("visible elements in model and unit", () => {
            for (let unit of model.models) {
                let innerVi = scoper.getVisibleNodes(unit);

                expect(innerVi.length).toBe(13);
                for (let e of unit.entities) {
                    expect(innerVi).toContain(e);
                }

                for (let f of unit.functions) {
                    expect(innerVi).toContain(f);
                }
            }
        });

        test("visible elements in entities", () => {
            for (let unit of model.models) {
                for (let ent of unit.entities) {
                    let vis = scoper.getVisibleNodes(ent);

                    for (let a of ent.attributes) {
                        expect(vis).toContain(a);
                    }

                    for (let f of ent.functions) {
                        expect(vis).toContain(f);
                    }

                    for (let e of unit.entities) {
                        expect(vis).toContain(e);
                    }
                }
            }
        });

        test("visible elements in model functions", () => {
            for (let unit of model.models) {
                for (let f1 of unit.functions) {
                    let vis = getVisibleNames(scoper, f1);
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
                        let vis = getVisibleNames(scoper, f1);
                        expect(vis).toContain(f1.name);
                        for (const e of unit.entities) {
                            expect(vis).toContain(e.name);
                        }
                        for (const p of f1.parameters) {
                            expect(vis).toContain(p.name);
                        }
                        for (const f2 of unit.functions) {
                            if (f2 !== f1) {
                                for (const p2 of f2.parameters) {
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
        let scoper = DemoEnvironment.getInstance().scoper;

        // beforeEach(done => {
        //     done();
        // });

        test("isInscope 'InCorrectModel'", () => {
            let nameTotest: string = "InCorrectModel";
            for (const unit of model.models) {
                expect(isInScope(scoper, model, nameTotest)).toBe(false);
                // test if nameTotest is known in model functions
                unit.functions.forEach((fun) => {
                    expect(isInScope(scoper, fun, nameTotest)).toBe(false);
                });
                // test the same on entities and entity functions
                unit.entities.forEach((ent) => {
                    expect(isInScope(scoper, ent, nameTotest)).toBe(false);
                    ent.functions.forEach((fun) => {
                        expect(isInScope(scoper, fun, nameTotest)).toBe(false);
                    });
                });
            }
        });

        test("isInscope 'DemoModel_1'", () => {
            let nameTotest: string = "DemoModel_1";
            for (const unit of model.models) {
                expect(isInScope(scoper, model, nameTotest)).toBe(true);
                // test if nameTotest is known in model functions
                unit.functions.forEach((fun) => {
                    expect(isInScope(scoper, fun.expression, nameTotest)).toBe(true);
                    expect(isInScope(scoper, fun, nameTotest)).toBe(true);
                });
                // test the same on entities and entity functions
                unit.entities.forEach((ent) => {
                    expect(isInScope(scoper, ent, nameTotest)).toBe(true);
                    ent.functions.forEach((fun) => {
                        expect(isInScope(scoper, fun, nameTotest)).toBe(true);
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
            expect(isInScope(scoper, model, nameTotest)).toBe(false);
            // test if nameTotest is known in model functions
            model.models[0].functions.forEach((fun) => {
                expect(isInScope(scoper, fun, nameTotest)).toBe(false);
            });
            // test the same on entities and entity functions
            model.models[0].entities.forEach((ent) => {
                let expected: boolean = false;
                if (
                    ent.name === "Person" ||
                    ent.name === "Company" ||
                    ent.name === "Company2" ||
                    ent.name === "School"
                ) {
                    expected = true;
                }
                // console.log(`name: ${ent.name}, expected: ${expected}`);
                expect(isInScope(scoper, ent, nameTotest, "DemoAttribute")).toBe(expected);
                ent.functions.forEach((fun) => {
                    expect(isInScope(scoper, fun, nameTotest, "DemoAttribute")).toBe(expected);
                });
            });
        });

        test("isInscope 'age'", () => {
            // name is Attribute of Person and of Company in DemoModel_1
            let nameTotest: string = "age";
            expect(isInScope(scoper, model, nameTotest)).toBe(false);
            // test if nameTotest is known in model functions
            model.models[0].functions.forEach((fun) => {
                expect(isInScope(scoper, fun, nameTotest)).toBe(false);
            });
            // test the same on entities and entity functions
            model.models[0].entities.forEach((ent) => {
                let expected: boolean = false;
                if (ent.name === "Person") {
                    expected = true;
                }
                expect(isInScope(scoper, ent, nameTotest)).toBe(expected);
                ent.functions.forEach((fun) => {
                    expect(isInScope(scoper, fun, nameTotest)).toBe(expected);
                });
            });
        });

        test("isInscope 'VAT_Number'", () => {
            // VAT_Number is Attribute of Company in DemoModel_1
            let nameTotest: string = "VAT_Number";
            expect(isInScope(scoper, model, nameTotest)).toBe(false);
            // test if nameTotest is known in model functions
            model.models[0].functions.forEach((fun) => {
                expect(isInScope(scoper, fun, nameTotest)).toBe(false);
            });
            // test the same on entities and entity functions
            model.models[0].entities.forEach((ent) => {
                let expected: boolean = false;
                if (ent.name === "Company" || ent.name === "Company2") {
                    expected = true;
                }
                // console.log(`name: ${ent.name}, expected: ${expected}, found: ${isInScope(scoper, ent, nameTotest)}`);
                expect(isInScope(scoper, ent, nameTotest)).toBe(expected);
                ent.functions.forEach((fun) => {
                    expect(isInScope(scoper, fun, nameTotest)).toBe(expected);
                });
            });
        });

        test("isInscope 'length'", () => {
            // length is Function of DemoModel_1
            let nameTotest: string = "length";
            expect(isInScope(scoper, model.models[0], nameTotest)).toBe(true);
            // test if nameTotest is known in model functions
            model.models[0].functions.forEach((fun) => {
                expect(isInScope(scoper, fun, nameTotest)).toBe(true);
            });
            // test the same on entities and entity functions
            model.models[0].entities.forEach((ent) => {
                expect(isInScope(scoper, ent, nameTotest)).toBe(true);
                ent.functions.forEach((fun) => {
                    expect(isInScope(scoper, fun, nameTotest)).toBe(true);
                });
            });
        });

        test("isInscope 'first'", () => {
            // first is Function of Person in DemoModel_1
            let nameTotest: string = "first";
            expect(isInScope(scoper, model, nameTotest, "DemoFunction")).toBe(false);
            // test if nameTotest is known in model functions
            model.models[0].functions.forEach((fun) => {
                expect(isInScope(scoper, fun, nameTotest)).toBe(false);
                expect(isInScope(scoper, fun.expression, nameTotest)).toBe(false);
            });
            // test the same on entities and entity functions
            model.models[0].entities.forEach((ent) => {
                let expected: boolean = false;
                if (ent.name === "Person") {
                    expected = true;
                }
                expect(isInScope(scoper, ent, nameTotest)).toBe(expected);
                ent.functions.forEach((fun) => {
                    expect(isInScope(scoper, fun, nameTotest)).toBe(expected);
                });
            });
        });

        test("isInscope 'another'", () => {
            // last is Function of DemoModel_1
            let nameTotest: string = "another";
            expect(isInScope(scoper, model, nameTotest)).toBe(false);
            // test if nameTotest is known in model functions
            model.models[0].functions.forEach((fun) => {
                expect(isInScope(scoper, fun, nameTotest)).toBe(false);
            });
            // test the same on entities and entity functions
            model.models[0].entities.forEach((ent) => {
                let expected: boolean = false;
                if (ent.name === "Company2") {
                    expected = true;
                }
                // console.log(`name: ${ent.name}, expected: ${expected}, found: ${isInScope(scoper, ent, nameTotest)}`);
                expect(isInScope(scoper, ent, nameTotest)).toBe(expected);
                ent.functions.forEach((fun) => {
                    expect(isInScope(scoper, fun, nameTotest)).toBe(expected);
                });
            });
        });

        test("isInscope 'Variable1'", () => {
            // Variable1 is VarDecl of length of DemoModel_1
            let nameTotest: string = "Variable1";
            expect(isInScope(scoper, model, nameTotest)).toBe(false);
            // test if nameTotest is known in model functions
            model.models[0].functions.forEach((fun) => {
                let expected: boolean = false;
                if (fun.name === "length") {
                    expected = true;
                }
                expect(isInScope(scoper, fun, nameTotest)).toBe(expected);
            });
            // test the same on entities and entity functions
            model.models[0].entities.forEach((ent) => {
                expect(isInScope(scoper, ent, nameTotest)).toBe(false);
                ent.functions.forEach((fun) => {
                    expect(isInScope(scoper, fun, nameTotest)).toBe(false);
                });
            });
        });

        test("isInscope 'Resultvar'", () => {
            // Resultvar is VarDecl of first of Person of DemoModel_1
            let nameTotest: string = "Resultvar";
            expect(isInScope(scoper, model, nameTotest)).toBe(false);
            // test if nameTotest is known in model functions
            model.models[0].functions.forEach((fun) => {
                expect(isInScope(scoper, fun, nameTotest)).toBe(false);
            });
            // test the same on entities and entity functions
            model.models[0].entities.forEach((ent) => {
                expect(isInScope(scoper, ent, nameTotest)).toBe(false);
                ent.functions.forEach((fun) => {
                    let expected: boolean = false;
                    if (ent.name === "Person" && fun.name === "first") {
                        expected = true;
                    }
                    expect(isInScope(scoper, fun, nameTotest)).toBe(expected);
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

function testEntity(scoper: FreCompositeScoper, model: DemoModel, nameTotest: string) {
    expect(isInScope(scoper, model, nameTotest, "DemoEntity")).toBe(true);
    // test if nameTotest is known in model functions
    model.functions.forEach((fun) => {
        expect(isInScope(scoper, fun, nameTotest, "DemoEntity")).toBe(true);
        expect(isInScope(scoper, fun, nameTotest, "DemoFunction")).toBe(false);
        expect(isInScope(scoper, fun.expression, nameTotest, "DemoEntity")).toBe(true);
        expect(isInScope(scoper, fun.expression, nameTotest, "DemoFunction")).toBe(false);
    });
    // test the same on entities and entity functions
    model.entities.forEach((ent) => {
        expect(isInScope(scoper, ent, nameTotest)).toBe(true);
        ent.functions.forEach((fun) => {
            expect(isInScope(scoper, fun, nameTotest)).toBe(true);
            expect(isInScope(scoper, fun.expression, nameTotest)).toBe(true);
        });
    });
}
