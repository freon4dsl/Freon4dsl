import { TestLimited } from "../language/gen";
import { TestprojectEnvironment } from "../environment/gen/TestprojectEnvironment";


describe("Checking stdlib for Demo", () => {
    let stdlib = TestprojectEnvironment.getInstance().stdlib;

    test("all predefined instances of limited concepts should be found", () => {
        expect(stdlib.find("ONWAAR")).toBe(TestLimited.Object1);
        expect(stdlib.find("WAAR")).toBe(TestLimited.Object2);
    });

    test("find predefined instances on metatype", () => {
        expect(stdlib.find("ONWAAR", "TestLimited")).toBe(TestLimited.Object1);
        expect(stdlib.find("WAAR", "TestLimited")).toBe(TestLimited.Object2);
        expect(stdlib.find("String", "TestLimited")).toBeNull();
        expect(stdlib.find("Integer", "TestLimited")).toBeNull();
        expect(stdlib.find("Boolean", "TestLimited")).toBeNull();
        expect(stdlib.find("ANY", "TestLimited")).toBeNull();
    });
});
