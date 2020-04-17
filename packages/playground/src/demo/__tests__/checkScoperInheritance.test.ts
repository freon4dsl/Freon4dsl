import { DemoScoper } from "../scoper/gen/DemoScoper";
import { DemoModel, DemoFunction, DemoEntity } from "../language/gen";
import { DemoModelCreator } from "./DemoModelCreator";

describe("testing Scoper", () => {
    let modelCreator = new DemoModelCreator();
    let inheritanceModel : DemoModel = modelCreator.createInheritanceModel();
    let scoper = new DemoScoper();

    beforeEach(done => {
        done();
    });

    // TODO make this two separate tests, that each run every time
    function testInheritedPropsrecursive(ent: DemoEntity, vis: string[]) {
        // when the property is not a list:
        if (!!ent.baseEntity) {
            // extra props should be visible
            ent.baseEntity.referred.attributes.forEach(attr => {
                expect(vis).toContain(attr.name);
            });
            testInheritedPropsrecursive(ent.baseEntity.referred, vis);
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

    test("inheritance", () => {
        inheritanceModel.entities.forEach(ent => {
            let vis = scoper.getVisibleNames(ent);
            expect(vis).toContain(ent.name);
            ent.attributes.forEach(attr => {
                expect(vis).toContain(attr.name);
            });
            testInheritedPropsrecursive(ent, vis);
            // console.log("visible elements for " + ent.name + ":");
            // vis.forEach(n => {console.log(n);});
        });

    });
});
