import { DemoEnvironment } from "../config/gen/DemoEnvironment";
import { DemoScoper } from "../scoper/gen";
import { DemoEntity, Demo } from "../language/gen";
import { DemoModelCreator } from "./DemoModelCreator";
import { describe, it, test, expect, beforeEach } from "vitest";

describe("testing Scoper", () => {
    let modelCreator = new DemoModelCreator();
    let inheritanceModel: Demo = modelCreator.createInheritanceModel();
    let scoper = new DemoScoper();

    beforeEach(() => {
        DemoEnvironment.getInstance();
    });

    // TODO make this two separate tests, that each run every time
    function testInheritedPropsrecursive(ent: DemoEntity, vis: string[], done: DemoEntity[]) {
        // when the property is not a list:
        if (!done.includes(ent) && !!ent.baseEntity) {
            // extra props should be visible
            ent.baseEntity.referred.attributes.forEach((attr) => {
                expect(vis).toContain(attr.name);
            });
            done.push(ent);
            testInheritedPropsrecursive(ent.baseEntity.referred, vis, done);
        }
        // when the property is a list
        // for (let ww of ent.baseEntity) {
        //     // extra props should be visible
        //     ww.referred.attributes.forEach(attr => {
        //         expect(vis).toContain(attr.unitName);
        //     });
        //     testInheritedPropsrecursive(ww.referred, vis);
        // }
    }

    test("inheritance on loop", () => {
        modelCreator.createInheritanceWithLoop().models[0].entities.forEach((ent) => {
            let vis = scoper.getVisibleNames(ent);
            expect(vis).toContain(ent.name);
            ent.attributes.forEach((attr) => {
                expect(vis).toContain(attr.name);
            });
            let done: DemoEntity[] = [];
            done.push(ent);
            testInheritedPropsrecursive(ent, vis, done);
            // console.log("visible elements for " + ent.unitName + ":");
            // vis.forEach(n => {console.log(n);});
        });
    });

    test("inheritance", () => {
        inheritanceModel.models[0].entities.forEach((ent) => {
            let vis = scoper.getVisibleNames(ent);
            expect(vis).toContain(ent.name);
            ent.attributes.forEach((attr) => {
                expect(vis).toContain(attr.name);
            });
            if (!!ent.baseEntity) {
                ent.baseEntity.referred.attributes.forEach((attr) => {
                    expect(vis).toContain(attr.name);
                });
            }
            let done: DemoEntity[] = [];
            // done.push(ent);
            testInheritedPropsrecursive(ent, vis, done);
            // console.log("visible elements for " + ent.unitName + ":");
            // vis.forEach(n => {console.log(n);});
        });
    });
});
