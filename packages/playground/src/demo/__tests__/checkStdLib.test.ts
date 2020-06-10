import { DemoAttributeType, TestLimited } from "../language/gen";
import { DemoEnvironment } from "../environment/gen/DemoEnvironment";

// limited DemoAttributeType implements Type {
//     name: string;
//     extra: number;
//     String = { name: "String", "extra": "199"}
//     Integer = { "name": "Integer", "extra": "240261"}
//     Boolean = { "name": "Boolean", "extra": "5479"}
//     ANY = { "name": "ANY", "extra": "456"}
// }
//
// limited TestLimited {
//     name: string;
//     something: boolean;
//     Object1 = { name: "ONWAAR", something: "false" }
//     Object2 = { name: "WAAR",  something: "true" }
// }

describe("Checking stdlib for Demo", () => {
    let stdlib = DemoEnvironment.getInstance().stdlib;

    test("all predefined instances of limited concepts should be found", () => {
        expect(stdlib.find("String")).toBe(DemoAttributeType.String);
        expect(stdlib.find("Integer")).toBe(DemoAttributeType.Integer);
        expect(stdlib.find("Boolean")).toBe(DemoAttributeType.Boolean);
        expect(stdlib.find("ANY")).toBe(DemoAttributeType.ANY);
        expect(stdlib.find("ONWAAR")).toBe(TestLimited.Object1);
        expect(stdlib.find("WAAR")).toBe(TestLimited.Object2);
    });

    test("find predefined instances on metatype", () => {
        expect(stdlib.find("String", "DemoAttributeType")).toBe(DemoAttributeType.String);
        expect(stdlib.find("Integer", "DemoAttributeType")).toBe(DemoAttributeType.Integer);
        expect(stdlib.find("Boolean", "DemoAttributeType")).toBe(DemoAttributeType.Boolean);
        expect(stdlib.find("ANY", "DemoAttributeType")).toBe(DemoAttributeType.ANY);
        expect(stdlib.find("ONWAAR", "TestLimited")).toBe(TestLimited.Object1);
        expect(stdlib.find("WAAR", "TestLimited")).toBe(TestLimited.Object2);
        expect(stdlib.find("String", "TestLimited")).toBeNull();
        expect(stdlib.find("Integer", "TestLimited")).toBeNull();
        expect(stdlib.find("Boolean", "TestLimited")).toBeNull();
        expect(stdlib.find("ANY", "TestLimited")).toBeNull();
        expect(stdlib.find("ONWAAR", "DemoAttributeType")).toBeNull();
        expect(stdlib.find("WAAR", "DemoAttributeType")).toBeNull();
    });
});
