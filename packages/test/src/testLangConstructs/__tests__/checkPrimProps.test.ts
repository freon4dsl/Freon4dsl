import { AST } from "@freon4dsl/core";
import {
    ConceptWithPrimProps,
    ConceptWithAllProps,
    ConceptWithBasePrim,
    ConceptWithInheritanceTree1,
} from "../language/gen";
import { describe, test, expect } from "vitest";

describe("Checking primitive properties", () => {
    let concept1
    let concept2
    let concept3
    let concept4
    AST.change( () => {
        concept1 = ConceptWithPrimProps.create({
            conceptProp1: "string",
            conceptProp2: ["string", "string2"],
            conceptProp3: 120117,
            conceptProp4: [151012, 260888],
            conceptProp5: true,
            conceptProp6: [true, false],
        });

        concept2 = ConceptWithBasePrim.create({
            conceptProp1: "string",
            conceptProp2: ["string", "string2"],
            conceptProp3: 120117,
            conceptProp4: [151012, 260888],
            conceptProp5: true,
            conceptProp6: [true, false],
        });

        concept3 = ConceptWithInheritanceTree1.create({
            conceptProp1: "string",
            conceptProp2: ["string", "string2"],
            conceptProp3: 120117,
            conceptProp4: [151012, 260888],
            conceptProp5: true,
            conceptProp6: [true, false],
        });
        concept4 = ConceptWithAllProps.create({
            conceptProp1: "string",
            conceptProp2: ["string", "string2"],
            conceptProp3: 120117,
            conceptProp4: [151012, 260888],
            conceptProp5: true,
            conceptProp6: [true, false],
        });
    })

    test("concepts of different type but with same props compared", () => {
        expect(concept1.conceptProp3).toBe(120117);
        expect(concept2.conceptProp3).toBe(120117);
        expect(concept3.conceptProp3).toBe(120117);
        expect(concept4.conceptProp3).toBe(120117);
        expect(concept1.conceptProp3 === concept2.conceptProp3).toBeTruthy();
        expect(concept1.conceptProp3 === concept3.conceptProp3).toBeTruthy();
        expect(concept1.conceptProp3 === concept4.conceptProp3).toBeTruthy();
        // TODO compile error
        // expect(concept1.conceptProp2[0]).not.toBe(concept4.conceptProp6[1]);
    });
});
