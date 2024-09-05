import { FreNodeReferenceTestScoper } from "./FreNodeReferenceTestScoper";
import { TestScoper } from "./TestScoper";
import { MobxTestElement, ModelContext, MobxTestRoot, MobxTestParts } from "./MobxModel";
import { observe, reaction } from "mobx";
import { describe, it, expect, beforeEach } from "vitest";

describe("Mobx Model", () => {
    const ctx: ModelContext = new ModelContext();
    let root: MobxTestRoot;
    let element: MobxTestParts;
    let part1: MobxTestElement;
    let part2: MobxTestElement;
    let part3: MobxTestElement;
    let ref1: FreNodeReferenceTestScoper<MobxTestElement>;
    let ref2: FreNodeReferenceTestScoper<MobxTestElement>;
    let ref3: FreNodeReferenceTestScoper<MobxTestElement>;
    let reaktion: number = 0;
    let observedLeft: number = 0;

    beforeEach(() => {
        root = new MobxTestRoot("root");
        element = new MobxTestParts("partsContainer");
        part1 = new MobxTestElement("part1");
        part2 = new MobxTestElement("part2");
        part3 = new MobxTestElement("part3");
        ref1 = FreNodeReferenceTestScoper.create(part1, "tt");
        ref2 = FreNodeReferenceTestScoper.create(part2, "tt");
        ref3 = FreNodeReferenceTestScoper.create(part3, "tt");

        root.element = element;
        element.manyPart.push(part1);
        element.manyPart.push(part2);
        // TODO make this work: element.manyPart = [part1, part2]; see MobxDecorators TODO
        element.singlePart = part3;

        element.singleReference = ref2;
        element.manyReference.push(ref1);
        element.manyReference.push(ref3);

        element.manyPrim.push(1912);
        element.manyPrim.push(1917);
        element.singlePrim = 1921;

        ctx.root = root;

        TestScoper.getInstance().root = root;
        observedLeft = 0;
        observe(ctx, "root", () => observedLeft++);
        // observe(observableRoot, "left", () => observedLeft++);
        reaction(
            () => {
                return [root.element];
            },
            // @ts-ignore
            // todo check whether this ts-ignore is correct
            (innerElement) => {
                reaktion++;
                // console.log("React " + reaktion + " on " + (!!innerElement ? innerElement["name"] : "innerElement is null"));
            },
        );
        reaktion = 0;
    });
    it("single references", () => {
        // name and reference should be to part2
        expect(element.singleReference.name).toBe("part2");
        expect(element.singleReference.referred).toBe(part2);
        checkUnchanged();

        element.singleReference.name = "part1";

        // name and reference should be changed
        expect(element.singleReference.name).toBe("part1");
        expect(element.singleReference.referred).toBe(part1);
        checkUnchanged();

        element.singleReference.name = "part44";
        // old reference is gone, new one cannot be found
        expect(element.singleReference.name).toBe("part44");
        expect(element.singleReference.referred).toBe(undefined);

        element.singleReference.name = "part1";
        // back to part1
        expect(element.singleReference.name).toBe("part1");
        expect(element.singleReference.referred).toBe(part1);
        checkUnchanged();

        part1.name = "part1-newname";
        // referred part changes name, but reference does not follow this change
        expect(element.singleReference.name).toBe("part1");
        expect(element.singleReference.referred).toBeUndefined();
        checkUnchanged();

        element.singleReference.name = "part1";

        // reference to part1 cannot be found anymore
        expect(element.singleReference.name).toBe("part1");
        expect(element.singleReference.referred).toBeUndefined();
        checkUnchanged();

        part1.name = "part1";
        // reference to part1 can be found again
        expect(element.singleReference.name).toBe("part1");
        expect(element.singleReference.referred).toBe(part1);
        checkUnchanged();

        element.singleReference.referred = part2;
        expect(element.singleReference.name).toBe("part2");
        expect(element.singleReference.referred).toBe(part2);
        checkUnchanged();

        const singleRef = element.singleReference;
        element.singleReference = FreNodeReferenceTestScoper.create(part1, "tt");
        expect(element.singleReference.name).toBe("part1");
        expect(element.singleReference.referred).toBe(part1);
        expect(singleRef.freOwnerDescriptor() === null);
    });

    it("update element of list of references", () => {
        expect(element.manyReference[0].name).toBe("part1");
        expect(element.manyReference[0].referred).toBe(part1);
        expect(element.manyReference[1].name).toBe("part3");
        expect(element.manyReference[1].referred).toBe(part3);

        element.manyReference[0] = ref2;
        expect(element.manyReference[0].name).toBe("part2");
        expect(element.manyReference[0].referred).toBe(part2);
        expect(element.manyReference[1].name).toBe("part3");
        expect(element.manyReference[1].referred).toBe(part3);
        expect(element.manyReference.length).toBe(2);

        element.manyReference[0] = null;
        expect(element.manyReference[0].name).toBe("part3");
        expect(element.manyReference[0].referred).toBe(part3);
        expect(element.manyReference.length).toBe(1);
    });

    it("add element to list of references", () => {
        expect(element.manyReference[0].name).toBe("part1");
        expect(element.manyReference[0].referred).toBe(part1);
        expect(element.manyReference[1].name).toBe("part3");
        expect(element.manyReference[1].referred).toBe(part3);

        element.manyReference.push(ref2);
        expect(element.manyReference[0].name).toBe("part1");
        expect(element.manyReference[0].referred).toBe(part1);
        expect(element.manyReference[1].name).toBe("part3");
        expect(element.manyReference[1].referred).toBe(part3);
        expect(element.manyReference[2].name).toBe("part2");
        expect(element.manyReference[2].referred).toBe(part2);
        expect(element.manyReference.length).toBe(3);

        element.manyReference.splice(1, 1);
        expect(element.manyReference[0].name).toBe("part1");
        expect(element.manyReference[0].referred).toBe(part1);
        expect(element.manyReference[1].name).toBe("part2");
        expect(element.manyReference[1].referred).toBe(part2);
        expect(element.manyReference.length).toBe(2);
    });

    it("single primitives", () => {
        expect(element.singlePrim).toBe(1921);

        element.singlePrim = 1929;
        expect(element.singlePrim).toBe(1929);
    });

    it("list of primitives", () => {
        expect(element.manyPrim).toContain(1912);

        element.manyPrim[1] = 1945;
        expect(element.manyPrim).not.toContain(1917);
        expect(element.manyPrim).toContain(1945);
    });
    it("assigned null to element of list of primitives", () => {
        element.manyPrim[1] = null;
        expect(element.manyPrim).not.toContain(1917);
        expect(element.manyPrim).toContain(1912);
        expect(element.manyPrim.length).toBe(1);
    });
    it("adding null to list of primitives", () => {
        element.manyPrim.push(null);
        expect(element.manyPrim).toContain(1917);
        expect(element.manyPrim).toContain(1912);
        expect(element.manyPrim.length).toBe(2);
    });
    it("owner of children should be set at start", () => {
        expect(element.$$owner).toBe(root);
        expect(element.$$propertyName).toBe("element");
        expect(root.element.$$propertyIndex).toBe(undefined);

        expect(part1.$$propertyIndex).toBe(0);
        expect(part1.$$owner).toBe(element);
        expect(part1.$$propertyName).toBe("manyPart");

        expect(part2.$$propertyIndex).toBe(1);
        expect(part2.$$owner).toBe(element);
        expect(part2.$$propertyName).toBe("manyPart");

        expect(element.singlePart).toBe(part3);
    });
    it("owner should be unset when assigned to null", () => {
        root.element = null;

        expect(root.element).toBe(null);
        expect(element.$$owner).toBe(null);
        expect(element.$$propertyName).toBe("");
        expect(element.$$propertyIndex).toBe(undefined);
        expect(reaktion).toBe(1);

        root.element = element;
        expect(element.$$owner).toBe(root);
        expect(element.$$propertyName).toBe("element");
        expect(root.element.$$propertyIndex).toBe(undefined);
    });
    it("owner should be changed when moved", () => {
        element.singlePart = part1;

        expect(part1.$$owner).toBe(element);
        expect(part1.$$propertyName).toBe("singlePart");
        expect(part1.$$propertyIndex).toBe(undefined);

        expect(part2.$$owner).toBe(element);
        expect(part2.$$propertyName).toBe("manyPart");
        expect(part2.$$propertyIndex).toBe(0);

        expect(part3.$$owner).toBe(null);
        expect(part3.$$propertyName).toBe("");
        expect(part3.$$propertyIndex).toBe(undefined);
    });
    it("owner should be changed when element is assigned to array", () => {
        element.manyPart.splice(0, 0, part3);

        expect(element.singlePart).toBe(null);

        expect(part1.$$owner).toBe(element);
        expect(part1.$$propertyName).toBe("manyPart");
        expect(part1.$$propertyIndex).toBe(1);

        expect(part2.$$owner).toBe(element);
        expect(part2.$$propertyName).toBe("manyPart");
        expect(part2.$$propertyIndex).toBe(2);

        expect(part3.$$owner).toBe(element);
        expect(part3.$$propertyName).toBe("manyPart");
        expect(part3.$$propertyIndex).toBe(0);
    });
    it("owner should be changed when array is cleared", () => {
        element.manyPart.splice(0, 2);

        expect(part1.$$owner).toBe(null);
        expect(part1.$$propertyName).toBe("");
        expect(part1.$$propertyIndex).toBe(undefined);

        expect(part2.$$owner).toBe(null);
        expect(part2.$$propertyName).toBe("");
        expect(part2.$$propertyIndex).toBe(undefined);

        expect(element.manyPart.length).toBe(0);
    });
    it("array element should be removed when assigned to null", () => {
        element.manyPart[0] = null;

        expect(part1.$$owner).toBe(null);
        expect(part1.$$propertyName).toBe("");
        expect(part1.$$propertyIndex).toBe(undefined);
        // expect(element.manyPart[0]).toBe(null);

        expect(part2.$$owner).toBe(element);
        expect(part2.$$propertyName).toBe("manyPart");
        expect(part2.$$propertyIndex).toBe(0);
        expect(element.manyPart[0]).toBe(part2);

        expect(element.manyPart.length).toBe(1);
        // expect(reaktion).toBe(1);
    });
    it("push null", () => {
        element.manyPart.push(null);

        expect(element.manyPart.length).toBe(2);
    });
    it("add null to array", () => {
        element.manyPart.splice(0, 0, null);

        expect(element.manyPart.length).toBe(2);
        element.manyPart.forEach((p, index) => {
            expect(p).not.toBeNull();
            expect(p.$$owner).toBe(element);
            expect(p.$$propertyName).toBe("manyPart");
            expect(p.$$propertyIndex).toBe(index);
        });

        expect(part1.$$owner).toBe(element);
        expect(part1.$$propertyName).toBe("manyPart");
        expect(part1.$$propertyIndex).toBe(0);

        expect(part2.$$owner).toBe(element);
        expect(part2.$$propertyName).toBe("manyPart");
        expect(part2.$$propertyIndex).toBe(1);
    });
    it("owner should be changed when array element is removed", () => {
        element.manyPart.splice(0, 1);

        expect(part1.$$owner).toBe(null);
        expect(part1.$$propertyName).toBe("");
        expect(part1.$$propertyIndex).toBe(undefined);

        expect(part2.$$owner).toBe(element);
        expect(part2.$$propertyName).toBe("manyPart");
        expect(part2.$$propertyIndex).toBe(0);

        expect(element.manyPart.length).toBe(1);
    });

    function checkUnchanged() {
        expect(part1.$$propertyIndex).toBe(0);
        expect(part1.$$owner).toBe(element);
        expect(part1.$$propertyName).toBe("manyPart");

        expect(part2.$$propertyIndex).toBe(1);
        expect(part2.$$owner).toBe(element);
        expect(part2.$$propertyName).toBe("manyPart");
    }
});
