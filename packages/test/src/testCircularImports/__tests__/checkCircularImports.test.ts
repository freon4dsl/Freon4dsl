import { FREON, CoreConfig } from "@freon4dsl/core"
import { XEnvironment } from "../freon/config/XEnvironment.js"
import { ConceptA } from "../freon/language/index.js";
import { describe, test, expect } from "vitest";

describe("Checking circular imports", () => {
    CoreConfig.initialize(XEnvironment.getInstance(), null)
    let concept1
    FREON.astChanger.change( () => {
        concept1 = ConceptA.create({
            conceptProp1: "string",
            conceptProp2: ["string", "string2"],
            conceptProp3: 120117,
            conceptProp4: [151012, 260888],
            conceptProp5: true,
            conceptProp6: [true, false],
        });
    })

    test("does not matter what we test, it fails when imports are circular", () => {
        expect(concept1.conceptProp3).toBe(120117);
    });
});
