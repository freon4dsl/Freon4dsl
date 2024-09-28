import { FreNode } from "@freon4dsl/core";
import { DemoModel, DemoFunction, DemoEntity } from "../language/gen/index.js";
import { DemoModelCreator } from "./DemoModelCreator.js";
import { describe, test, expect } from "vitest";

describe("Demo Model", () => {
    describe("Checking DemoModel incorrect instance", () => {
        let model: DemoModel = new DemoModelCreator().createIncorrectModel().models[0];

        // beforeEach(done => {
        //     done();
        // });

        test("model name should be set", () => {
            expect(model.name).not.toBeNull();
        });

        test("model functions should be set correctly", () => {
            expect(model.functions.length).toBe(4);
            checkFunctionDef(model.functions[0], model);
            checkFunctionDef(model.functions[1], model);
            checkFunctionDef(model.functions[2], model);
            checkFunctionDef(model.functions[3], model);
        });

        test("model entities should be set correctly", () => {
            expect(model.entities.length).toBe(4);

            for (let i = 0; i < 4; i++) {
                const f1: DemoEntity = model.entities[i];
                expect(f1.freOwner()).toBe(model);
                expect(f1.name).not.toBeNull();
            }
        });

        test("entity functions should be set correctly", () => {
            for (let i of model.entities) {
                for (let f of i.functions) {
                    expect(f.freOwner()).toBe(i);
                    checkFunctionDef(f, i);
                }
            }
        });

        test("entity attributes should be set correctly", () => {
            for (let i of model.entities) {
                for (let a of i.attributes) {
                    expect(a.name).not.toBeNull();
                    expect(a.freOwner()).toBe(i);
                }
            }
        });
    });
});

function checkFunctionDef(f1: DemoFunction, owner: FreNode) {
    expect(f1.name).not.toBeNull();
    expect(f1.expression.freOwner()).toBe(f1);
    expect(f1.freOwner()).toBe(owner);
    expect((f1.expression as any).$$owner).toBeTruthy();
    expect(f1.expression.freOwnerDescriptor().owner).toBe(f1);
}
