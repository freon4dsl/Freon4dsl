import { KK, TestLimited, XX, ZZ } from "../language/gen";
import { TestprojectEnvironment } from "../environment/gen/TestprojectEnvironment";

describe("Checking stdlib for Demo", () => {
    let stdlib = TestprojectEnvironment.getInstance().stdlib;
    // The stdlib contains the following elements
    // ZZ.ZZinstance1
    // XX.XXinstance1
    // XX.XXinstance2
    // XX.XXinstance3
    // TestLimited.Object1
    // TestLimited.Object2
    // KK.CC1
    // KK.CC2

    test("all predefined instances of limited concepts should be found", () => {
        expect(stdlib.find("ONWAAR")).toBe(TestLimited.Object1);
        expect(stdlib.find("WAAR")).toBe(TestLimited.Object2);
        expect(stdlib.find("ZZinstance1")).toBe(ZZ.ZZinstance1);
        expect(stdlib.find("XXinstance1")).toBe(XX.XXinstance1);
        expect(stdlib.find("XXinstance2")).toBe(XX.XXinstance2);
        expect(stdlib.find("XXinstance3")).toBe(XX.XXinstance3);
        expect(stdlib.find("CC1")).toBe(KK.CC1);
        expect(stdlib.find("CC2")).toBe(KK.CC2);
        expect(stdlib.find("String")).toBeNull();
        expect(stdlib.find("Integer")).toBeNull();
        expect(stdlib.find("Boolean")).toBeNull();
        expect(stdlib.find("ANY")).toBeNull();
    });

    test("all predefined instances can be found including check on metatype", () => {
        expect(stdlib.find("ONWAAR", "TestLimited")).toBe(TestLimited.Object1);
        expect(stdlib.find("WAAR", "TestLimited")).toBe(TestLimited.Object2);
        expect(stdlib.find("ZZinstance1", "ZZ")).toBe(ZZ.ZZinstance1);
        expect(stdlib.find("XXinstance1", "XX")).toBe(XX.XXinstance1);
        expect(stdlib.find("XXinstance2", "XX")).toBe(XX.XXinstance2);
        expect(stdlib.find("XXinstance3", "XX")).toBe(XX.XXinstance3);
        expect(stdlib.find("CC1", "KK")).toBe(KK.CC1);
        expect(stdlib.find("CC2", "KK")).toBe(KK.CC2);
        expect(stdlib.find("String", "TestLimited")).toBeNull();
        expect(stdlib.find("Integer", "TestLimited")).toBeNull();
        expect(stdlib.find("Boolean", "TestLimited")).toBeNull();
        expect(stdlib.find("ANY", "TestLimited")).toBeNull();
        expect(stdlib.find("ONWAAR", "ZZ")).toBeNull();
        expect(stdlib.find("WAAR", "XX")).toBeNull();
        expect(stdlib.find("ZZinstance1", "KK")).toBeNull();
        expect(stdlib.find("XXinstance1", "TestLimited")).toBeNull();
        expect(stdlib.find("XXinstance2", "ZZ")).toBeNull();
        expect(stdlib.find("XXinstance3", "KK")).toBeNull();
        expect(stdlib.find("CC1", "XX")).toBeNull();
        expect(stdlib.find("CC2", "TestLimited")).toBeNull();
    });
});
