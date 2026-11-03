import { FREON, CoreConfig } from "@freon4dsl/core";
import { LiteralsModelEnvironment } from "../freon/config/LiteralsModelEnvironment.js";
import { FreNodeReference } from "@freon4dsl/core";
import { Item, Literals, LiteralsModel } from "../freon/language/index.js";
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
        return Literals.create({ name: "lit", flag: false, other: false, flags: [], text: "", texts: [], ids: [], ...values });
    }

    // Names a designer may type: other scripts, accents, a backtick, a backslash, dots, spaces at the ends, a newline.
    const NAMES = [
        "Café Visit",
        "Müller–Lüdenscheid",
        "診察 1",
        "Visit 1.5",
        "a `quoted` word",
        "C:\\temp\\file",
        "trailing\\",
        " padded ",
        "two\nlines",
        "emoji 🧪",
        "`",
    ];

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

    test.each(NAMES)("the name %j is read back unchanged", (name) => {
        const { back } = roundTrip(literals({ name }));
        expect(back.name).toBe(name);
    });

    test("a list of identifiers is read back unchanged", () => {
        const { back } = roundTrip(literals({ ids: NAMES }));
        expect(Array.from(back.ids)).toEqual(NAMES);
    });

    test("parts and a reference to a part keep their names, in any script and with escapes", () => {
        const items = NAMES.map((name) => Item.create({ name }));
        const unit = literals({ items });
        unit.chosen = FreNodeReference.create<Item>(items[4], "Item");
        const { back } = roundTrip(unit);
        expect(back.items.map((i) => i.name)).toEqual(NAMES);
        expect(back.chosen?.name).toBe("a `quoted` word");
    });

    test("plain names are written between backticks, unescaped", () => {
        const { text } = roundTrip(literals({ name: "Visit 1", ids: ["A", "B"] }));
        expect(text).toContain("Literals `Visit 1`");
        expect(text).toMatch(/ids\s+`A`,\s*`B`/);
    });

    test("strings without special characters are unchanged by escaping", () => {
        const { back } = roundTrip(literals({ text: "nothing special", texts: ["one", "two"] }));
        expect(back.text).toBe("nothing special");
        expect(Array.from(back.texts)).toEqual(["one", "two"]);
    });
});
