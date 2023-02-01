import { BB } from "../language/gen";

describe("Checking generation of primitive properties", () => {

    test("initial values in def files should be preserved", () => {
        const concept1: BB = new BB();
        expect(concept1.BBprop1).toBe("prop1Value");
        // unfortunately, we cannot use 'toStrictEqual' because 'concept.BBprop2' is a mobx array
        // 'toStrictEqual' checks the types besides the structure.
        // expect(concept1.BBprop2).toStrictEqual(["prop2Index1", "prop2Index2", "prop2Index3"]);
        expect(concept1.BBprop2.length).toBe(3);
        expect(concept1.BBprop2[0]).toBe("prop2Index1");
        expect(concept1.BBprop2[1]).toBe("prop2Index2");
        expect(concept1.BBprop2[2]).toBe("prop2Index3");

        expect(concept1.BBprop3).toBe(24);

        // expect(concept1.BBprop4).toStrictEqual([2, 24, 61, 11, 6, 58]);
        expect(concept1.BBprop4.length).toBe(6);
        expect(concept1.BBprop4[0]).toBe(2);
        expect(concept1.BBprop4[1]).toBe(24);
        expect(concept1.BBprop4[2]).toBe(61);
        expect(concept1.BBprop4[3]).toBe(11);
        expect(concept1.BBprop4[4]).toBe(6);
        expect(concept1.BBprop4[5]).toBe(58);

        expect(concept1.BBprop5).toBe(true);

        // expect(concept1.BBprop6).toStrictEqual([true, false, true, false, false]);
        expect(concept1.BBprop6.length).toBe(5);
        expect(concept1.BBprop6[0]).toBe(true);
        expect(concept1.BBprop6[1]).toBe(false);
        expect(concept1.BBprop6[2]).toBe(true);
        expect(concept1.BBprop6[3]).toBe(false);
        expect(concept1.BBprop6[4]).toBe(false);

        expect(concept1.BBprop7).toBe("myName");
        // expect(concept1.BBprop8).toStrictEqual(["prop8Name1", "prop8Name2", "prop8Name3"]);
        expect(concept1.BBprop8.length).toBe(3);
        expect(concept1.BBprop8[0]).toBe("prop8Name1");
        expect(concept1.BBprop8[1]).toBe("prop8Name2");
        expect(concept1.BBprop8[2]).toBe("prop8Name3");
        // BBprop1: string = "prop1Value";
        // BBprop2: string[] = ["prop2Index1", "prop2Index2", "prop2Index3"];
        // BBprop3: number = 24;
        // BBprop4: number[] = [2, 24, 61, 11, 6, 58];
        // BBprop5: boolean = true;
        // BBprop6: boolean[] = [true, false, true, false, false];
        // BBprop7: identifier = "myName";
        // BBprop8: identifier[] = ["prop8Name1", "prop8Name2", "prop8Name3"];
    });
});
