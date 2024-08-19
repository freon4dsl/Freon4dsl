import { ConceptA } from "../language/gen/internal";
import { describe, test, expect } from "vitest";

describe("Checking circular imports", () => {
    let concept1 = ConceptA.create({
        conceptProp1: "string",
        conceptProp2: ["string", "string2"],
        conceptProp3: 120117,
        conceptProp4: [151012, 260888],
        conceptProp5: true,
        conceptProp6: [true, false],
    });

    test("does not matter what we test, it fails when imports are circular", () => {
        expect(concept1.conceptProp3).toBe(120117);
    });
});
