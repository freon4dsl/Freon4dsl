import { ConceptWithPrimProps, ConceptWithAllProps, ConceptWithBasePrim, ConceptWithInheritanceTree1 } from "../language/gen";

describe("Checking primitive properties", () => {
    let concept1 = ConceptWithPrimProps.create({
        conceptProp1: "string",
        conceptProp2: ["string", "string2"],
        conceptProp3: 120117,
        conceptProp4: [151012, 260888],
        conceptProp5: true,
        conceptProp6: [true, false]
    });

    // let concept2 = ConceptWithBasePrim.create({
    //     conceptProp1: "string",
    //     conceptProp2: ["string", "string2"],
    //     conceptProp3: 120117,
    //     conceptProp4: [151012, 260888],
    //     conceptProp5: true,
    //     conceptProp6: [true, false]
    // });
    //
    // let concept3 = ConceptWithInheritanceTree1.create({
    //     conceptProp1: "string",
    //     conceptProp2: ["string", "string2"],
    //     conceptProp3: 120117,
    //     conceptProp4: [151012, 260888],
    //     conceptProp5: true,
    //     conceptProp6: [true, false]
    // });
    //
    // let concept4 = ConceptWithAllProps.create({
    //     conceptProp1: "string",
    //     conceptProp2: ["string", "string2"],
    //     conceptProp3: 120117,
    //     conceptProp4: [151012, 260888],
    //     conceptProp5: true,
    //     conceptProp6: [true, false]
    // });

    test("concepts of different type but with same props compared", () => {
        expect(concept1.conceptProp3).toBe(120117);
    });
});
