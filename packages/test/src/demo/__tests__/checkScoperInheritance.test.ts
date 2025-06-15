import { DemoEnvironment } from "../config/gen/DemoEnvironment.js";
import { DemoEntity, Demo } from "../language/gen/index.js";
import { DemoModelCreator } from "./DemoModelCreator.js";
import { getVisibleNames } from '../../utils/HelperFunctions.js';
import { describe, test, expect, beforeEach } from "vitest";

describe("testing Scoper", () => {
    let modelCreator = new DemoModelCreator();
    let inheritanceModel: Demo = modelCreator.createInheritanceModel();
    let scoper = DemoEnvironment.getInstance().scoper;

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
        // TODO make the following into a separate test, that runs every time
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
            let vis = getVisibleNames(scoper.getVisibleNodes(ent));
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
            let vis = getVisibleNames(scoper.getVisibleNodes(ent));
            expect(vis).toContain(ent.name);
            ent.attributes.forEach((attr) => {
                expect(vis).toContain(attr.name);
            });
            if (!!ent.baseEntity) {
                // console.log(vis, 'ent.name: ', ent.name)
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
