import { PiElementReferenceM } from "./PiElementReferenceM";
import { TestScoper } from "./TestScoper";
import { MobxTestElement, ModelContext, MobxTestRoot, MobxTestParts } from "./MobxModel";
import { observe, reaction } from "mobx";
import {} from "jasmine";

describe("Mobx Model", () => {
    describe("container settings", () => {
        const ctx: ModelContext = new ModelContext();
        let root: MobxTestRoot;
        let element: MobxTestParts;
        let part1: MobxTestElement;
        let part2: MobxTestElement;
        let part3: MobxTestElement;
        let reaktion: number = 0;
        let observedLeft: number = 0;

        beforeEach(done => {
            root = new MobxTestRoot("root");
            element = new MobxTestParts("partsContainer");
            part1 = new MobxTestElement("part1");
            part2 = new MobxTestElement("part2");
            part3 = new MobxTestElement("part3");

            root.element = element;
            element.manyPart.push(part1);
            element.manyPart.push(part2);
            element.singlePart = part3;

            // const observableRoot = observable(root);
            element.singleReference = PiElementReferenceM.create(part2, "tt");

            ctx.root = root;

            TestScoper.getInstance().root = root;
            observedLeft = 0;
            observe(ctx, "root", () => observedLeft++);
            // observe(observableRoot, "left", () => observedLeft++);
            reaction(
                () => {
                    return [root.element];
                },
                element => {
                    reaktion++;
                    // console.log("React " + reaktion + " on " + (!!element ? element["unitName"] : "element is null"));
                }
            );
            reaktion = 0;
            done();
        });
        it("references 1", () => {
            // unitName and reference should be to part2
            expect(element.singleReference.name).toBe("part2");
            expect(element.singleReference.referred).toBe(part2);
            checkUnchanged();

            element.singleReference.name = "part1";

            // unitName and reference should be changed
            expect(element.manyPart.length).toBe(2);
            expect(element.singleReference.referred).toBe(part1);
            expect(element.singleReference.name).toBe("part1");
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
            // referred part changes unitName, thus reference follows this change
            expect(element.singleReference.name).toBe("part1-newname");
            expect(element.singleReference.referred).toBe(part1);
            checkUnchanged();

            element.singleReference.name = "part1";

            // reference to part1 cannot be found anymore
            expect(element.singleReference.name).toBe("part1");
            expect(element.singleReference.referred).toBe(undefined);
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
            element.singleReference = PiElementReferenceM.create(part1, "tt");
            expect(element.singleReference.name).toBe("part1");
            expect(element.singleReference.referred).toBe(part1);
            expect(singleRef.piContainer() === null);
        });

        it("of children should be set at start", () => {
            expect(element.container).toBe(root);
            expect(element.propertyName).toBe("element");
            expect(root.element.propertyIndex).toBe(undefined);

            expect(part1.propertyIndex).toBe(0);
            expect(part1.container).toBe(element);
            expect(part1.propertyName).toBe("manyPart");

            expect(part2.propertyIndex).toBe(1);
            expect(part2.container).toBe(element);
            expect(part2.propertyName).toBe("manyPart");

            expect(element.singlePart).toBe(part3);
        });

        it("should be unset when assigned to null", () => {
            root.element = null;

            expect(root.element).toBe(null);
            expect(element.container).toBe(null);
            expect(element.propertyName).toBe("");
            expect(element.propertyIndex).toBe(undefined);
            expect(reaktion).toBe(1);

            root.element = element;
            expect(element.container).toBe(root);
            expect(element.propertyName).toBe("element");
            expect(root.element.propertyIndex).toBe(undefined);
        });

        it("should be changed when moved", () => {
            element.singlePart = part1;

            expect(part1.container).toBe(element);
            expect(part1.propertyName).toBe("singlePart");
            expect(part1.propertyIndex).toBe(undefined);

            expect(part2.container).toBe(element);
            expect(part2.propertyName).toBe("manyPart");
            expect(part2.propertyIndex).toBe(0);

            expect(part3.container).toBe(null);
            expect(part3.propertyName).toBe("");
            expect(part3.propertyIndex).toBe(undefined);
        });
        it("should be changed when element is assigned to array", () => {
            element.manyPart.splice(0, 0, part3);

            expect(element.singlePart).toBe(null);

            expect(part1.container).toBe(element);
            expect(part1.propertyName).toBe("manyPart");
            expect(part1.propertyIndex).toBe(1);

            expect(part2.container).toBe(element);
            expect(part2.propertyName).toBe("manyPart");
            expect(part2.propertyIndex).toBe(2);

            expect(part3.container).toBe(element);
            expect(part3.propertyName).toBe("manyPart");
            expect(part3.propertyIndex).toBe(0);
        });
        it("should be changed when array is cleared", () => {
            element.manyPart.splice(0, 2);

            expect(part1.container).toBe(null);
            expect(part1.propertyName).toBe("");
            expect(part1.propertyIndex).toBe(undefined);

            expect(part2.container).toBe(null);
            expect(part2.propertyName).toBe("");
            expect(part2.propertyIndex).toBe(undefined);

            expect(element.manyPart.length).toBe(0);
        });
        it("should be changed when array element assigned null", () => {
            element.manyPart[0] = null;

            expect(part1.container).toBe(null);
            expect(part1.propertyName).toBe("");
            expect(part1.propertyIndex).toBe(undefined);
            expect(element.manyPart[0]).toBe(null);

            expect(part2.container).toBe(element);
            expect(part2.propertyName).toBe("manyPart");
            expect(part2.propertyIndex).toBe(1);
            expect(element.manyPart[1]).toBe(part2);

            expect(element.manyPart.length).toBe(2);
            // expect(reaktion).toBe(1);
        });
        it("push null", () => {
            element.manyPart.push(null);

            expect(element.manyPart.length).toBe(3);
            expect(element.manyPart[2]).toBe(null);
        });
        it("splice null", () => {
            element.manyPart.splice(0, 0, null);

            expect(element.manyPart.length).toBe(3);
            expect(element.manyPart[0]).toBe(null);

            expect(part1.container).toBe(element);
            expect(part1.propertyName).toBe("manyPart");
            expect(part1.propertyIndex).toBe(1);

            expect(part2.container).toBe(element);
            expect(part2.propertyName).toBe("manyPart");
            expect(part2.propertyIndex).toBe(2);
        });
        it("should be changed when array element is removed", () => {
            element.manyPart.splice(0, 1);

            expect(part1.container).toBe(null);
            expect(part1.propertyName).toBe("");
            expect(part1.propertyIndex).toBe(undefined);

            expect(part2.container).toBe(element);
            expect(part2.propertyName).toBe("manyPart");
            expect(part2.propertyIndex).toBe(0);

            expect(element.manyPart.length).toBe(1);
        });

        function checkUnchanged() {
            expect(part1.propertyIndex).toBe(0);
            expect(part1.container).toBe(element);
            expect(part1.propertyName).toBe("manyPart");

            expect(part2.propertyIndex).toBe(1);
            expect(part2.container).toBe(element);
            expect(part2.propertyName).toBe("manyPart");
        }
    });
});
