import { AA, BB, CC, PiElementReference, ZZ } from "../language/gen";
import { TestprojectScoper } from "../scoper/gen";
import { TestprojectEnvironment } from "../environment/gen/TestprojectEnvironment";

describe("Checking scoper for testproject", () => {
    let model: BB;
    let super1: AA;
    let super2: AA;
    let ZZinstance1: ZZ = TestprojectEnvironment.getInstance().stdlib.find("ZZinstance1", "ZZ") as ZZ;

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
