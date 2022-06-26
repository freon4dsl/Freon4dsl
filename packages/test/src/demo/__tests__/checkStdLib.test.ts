import { DemoAttributeType } from "../language/gen";
import { DemoEnvironment } from "../config/gen/DemoEnvironment";
import { DemoStdlib } from "../stdlib/gen/DemoStdlib";

// limited DemoAttributeType implements Type {
//     name: string;
//     extra: number;
//     String = { name: "String", "extra": "199"}
//     Integer = { "name": "Integer", "extra": "240261"}
//     Boolean = { "name": "Boolean", "extra": "5479"}
//     ANY = { "name": "ANY", "extra": "456"}
// }
//


describe("Checking stdlib for Demo", () => {
    let stdlib: DemoStdlib = DemoEnvironment.getInstance().stdlib as DemoStdlib;
    beforeEach(done => {
        DemoEnvironment.getInstance();
        done();
    });

    test("all predefined instances of limited concepts should be found", () => {
        expect(stdlib.find("String")).toBe(DemoAttributeType.String);
        expect(stdlib.find("Integer")).toBe(DemoAttributeType.Integer);
        expect(stdlib.find("Boolean")).toBe(DemoAttributeType.Boolean);
        expect(stdlib.find("ANY")).toBe(DemoAttributeType.ANY);
    });

    test("find predefined instances on metatype", () => {
        expect(stdlib.find("String", "DemoAttributeType")).toBe(DemoAttributeType.String);
        expect(stdlib.find("Integer", "DemoAttributeType")).toBe(DemoAttributeType.Integer);
        expect(stdlib.find("Boolean", "DemoAttributeType")).toBe(DemoAttributeType.Boolean);
        expect(stdlib.find("ANY", "DemoAttributeType")).toBe(DemoAttributeType.ANY);
        expect(stdlib.find("ONWAAR", "DemoAttributeType")).toBeNull();
        expect(stdlib.find("WAAR", "DemoAttributeType")).toBeNull();
    });
});
