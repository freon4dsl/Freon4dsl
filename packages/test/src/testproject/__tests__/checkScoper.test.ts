import { AA, BB, CC, KK, TestLimited, XX, ZZ } from "../language/gen";
import { TestprojectScoper } from "../scoper/gen";
import { TestprojectEnvironment } from "../config/gen/TestprojectEnvironment";
import { TestprojectStdlib } from "../stdlib/gen/TestprojectStdlib";

describe("Checking stdlib for Demo", () => {
    let stdlib: TestprojectStdlib = TestprojectEnvironment.getInstance().stdlib as TestprojectStdlib;
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

describe("Checking scoper for testproject", () => {
    let model: BB;
    let super1: AA;
    let super2: AA;
    let ZZinstance1: ZZ = (TestprojectEnvironment.getInstance().stdlib as TestprojectStdlib).find("ZZinstance1", "ZZ") as ZZ;

    beforeEach( ()=> {

        model = new BB();

        super1 = new AA();
        super1.name = "super1";
        let myCC1 = new CC();
        myCC1.name = "myCC1";
        super1.AAprop21 = myCC1;

        let myCC2 = new CC();
        myCC2.name = "myCC2";
        super2 = new AA();
        super2.name = "super2";
        super2.AAprop21 = myCC2;
    });

    test("all names in both super1 and super2 should be found", () => {
        model.supers.push(super1);
        model.supers.push(super2);
        let scoper = new TestprojectScoper();
        let vi = scoper.getVisibleNames(model);
        expect(vi).toContain("super1");
        expect(vi).toContain("super2");
        expect(vi).toContain("myCC1");
        expect(vi).toContain("myCC2");
        expect(vi).toContain("ZZinstance1");
    });

    test("all names only from super2 should be found", () => {
        model.supers.push(super2);
        let scoper = new TestprojectScoper();
        let vi = scoper.getVisibleNames(model);
        // expect(vi).toContain("super1");
        expect(vi).toContain("super2");
        // expect(vi).toContain("myCC1");
        expect(vi).toContain("myCC2");
        expect(vi).toContain("ZZinstance1");
    });

    test("all names only from super1 should be found", () => {
        model.supers.push(super1);
        let scoper = new TestprojectScoper();
        let vi = scoper.getVisibleNames(model);
        expect(vi).toContain("super1");
        // expect(vi).toContain("super2");
        expect(vi).toContain("myCC1");
        // expect(vi).toContain("myCC2");
        expect(vi).toContain("ZZinstance1");
    });

    test("all elements in both super1 and super2 should be found", () => {
        model.supers.push(super1);
        model.supers.push(super2);
        let scoper = new TestprojectScoper();
        let vi = scoper.getVisibleElements(model);
        expect(vi).toContain(super1);
        expect(vi).toContain(super2);
        expect(vi).toContain(super1.AAprop21); // myCC1
        expect(vi).toContain(super2.AAprop21); // myCC2
        expect(vi).toContain(ZZinstance1);
    });

    test("all elements only from super2 should be found", () => {
        model.supers.push(super2);
        let scoper = new TestprojectScoper();
        let vi = scoper.getVisibleElements(model);
        expect(vi).not.toContain(super1);
        expect(vi).toContain(super2);
        expect(vi).not.toContain(super1.AAprop21); // myCC1
        expect(vi).toContain(super2.AAprop21); // myCC2
        expect(vi).toContain(ZZinstance1);
    });

    test("all elements only from super1 should be found", () => {
        model.supers.push(super1);
        let scoper = new TestprojectScoper();
        let vi = scoper.getVisibleElements(model);
        expect(vi).toContain(super1);
        expect(vi).not.toContain(super2);
        expect(vi).toContain(super1.AAprop21); // myCC1
        expect(vi).not.toContain(super2.AAprop21); // myCC2
        expect(vi).toContain(ZZinstance1);
    });

});
