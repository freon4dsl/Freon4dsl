import { FREON, CoreConfig } from "@freon4dsl/core";
import { LiteralsModelEnvironment } from "../freon/config/LiteralsModelEnvironment.js";
import { Literals, LiteralsModel } from "../freon/language/index.js";
import { describe, test, expect, beforeEach } from "vitest";

// The language declares `boolean [YES | NO]`, so booleans must be written and read with those
// keywords; strings must survive quotes, backslashes, and newlines.
describe("Reading back what the writer wrote", () => {
    CoreConfig.initialize(LiteralsModelEnvironment.getInstance(), null);
    const reader = FREON.environment.reader;
    const writer = FREON.environment.writer;

    beforeEach(() => {
        FREON.idProvider.reset();
    });

    function roundTrip(unit: Literals): { text: string; back: Literals } {
        const text: string = writer.writeToString(unit);
        const back = reader.readFromString(text, "Literals", new LiteralsModel()) as Literals;
        return { text, back };
    }

    function literals(values: Partial<Literals>): Literals {
        return Literals.create({ name: "lit", flag: false, other: false, flags: [], text: "", texts: [], count: 0, counts: [], ...values });
    }

    test("booleans are written with the language's keywords and read back as the same values", () => {
        const { text, back } = roundTrip(literals({ flag: true, other: false, flags: [true, false, true] }));
        expect(text).toContain("flag YES");
        expect(text).toContain("other NO");
        expect(back.flag).toBe(true);
        expect(back.other).toBe(false);
        // Freon lists are MobX observable arrays; compare plain copies.
        expect(Array.from(back.flags)).toEqual([true, false, true]);
    });

    test("strings with quotes, backslashes, and newlines are read back unchanged", () => {
        const text = 'She said "yes" \\ then\nleft';
        const json = '{"siteIds":["a","b"],"path":"C:\\\\temp"}';
        const { back } = roundTrip(literals({ text, texts: [json, 'plain', 'a "b" c'] }));
        expect(back.text).toBe(text);
        expect(Array.from(back.texts)).toEqual([json, "plain", 'a "b" c']);
    });

    test("negative numbers, and lists holding them, are read back unchanged", () => {
        const { text, back } = roundTrip(literals({ count: -28, counts: [-1, 0, 7, -365] }));
        expect(text).toContain("count -28");
        expect(back.count).toBe(-28);
        expect(Array.from(back.counts)).toEqual([-1, 0, 7, -365]);
    });

    test("a minus sign separated from its digits is read as part of the number", () => {
        const { text } = roundTrip(literals({ count: -28 }));
        const back = reader.readFromString(text.replace("count -28", "count - 28"), "Literals", new LiteralsModel()) as Literals;
        expect(back.count).toBe(-28);
    });

    test("strings without special characters are unchanged by escaping", () => {
        const { back } = roundTrip(literals({ text: "nothing special", texts: ["one", "two"] }));
        expect(back.text).toBe("nothing special");
        expect(Array.from(back.texts)).toEqual(["one", "two"]);
    });
});
