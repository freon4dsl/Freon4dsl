import { DemoScoper } from "../scoper/gen/DemoScoper";
import { DemoModel, DemoFunction, DemoEntity } from "../language/gen";
import { DemoModelCreator } from "./DemoModelCreator";

describe("testing Scoper", () => {
    let modelCreator = new DemoModelCreator();
    let inheritanceModel: DemoModel = modelCreator.createInheritanceModel();
    let scoper = new DemoScoper();

    beforeEach(done => {
        done();
    });

    // TODO make this two separate tests, that each run every time
    function testInheritedPropsrecursive(ent: DemoEntity, vis: string[], done: DemoEntity[]) {
        // when the property is not a list:
        if (!done.includes(ent) && !!ent.baseEntity) {
            // extra props should be visible
            ent.baseEntity.referred.attributes.forEach(attr => {
                expect(vis).toContain(attr.name);
            });
            done.push(ent);
            testInheritedPropsrecursive(ent.baseEntity.referred, vis, done);
        }
        // when the property is a list
        // for (let ww of ent.baseEntity) {
        //     // extra props should be visible
        //     ww.referred.attributes.forEach(attr => {
        //         expect(vis).toContain(attr.name);
        //     });
        //     testInheritedPropsrecursive(ww.referred, vis);
        // }
    }

    test.skip("inheritance on loop", () => {
        modelCreator.createInheritanceWithLoop().entities.forEach(ent => {
            let vis = scoper.getVisibleNames(ent);
            expect(vis).toContain(ent.name);
            ent.attributes.forEach(attr => {
                expect(vis).toContain(attr.name);
            });
            let done: DemoEntity[] = [];
            done.push(ent);
            testInheritedPropsrecursive(ent, vis, done);
            // console.log("visible elements for " + ent.name + ":");
            // vis.forEach(n => {console.log(n);});
        });
    });

    test.skip("inheritance", () => {
        inheritanceModel.entities.forEach(ent => {
            let vis = scoper.getVisibleNames(ent);
            expect(vis).toContain(ent.name);
            ent.attributes.forEach(attr => {
                expect(vis).toContain(attr.name);
            });
            let done: DemoEntity[] = [];
            done.push(ent);
            testInheritedPropsrecursive(ent, vis, done);
            // console.log("visible elements for " + ent.name + ":");
            // vis.forEach(n => {console.log(n);});
        });
    });
});
