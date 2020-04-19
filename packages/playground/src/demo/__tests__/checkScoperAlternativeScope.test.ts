import { DemoScoper } from "../scoper/gen/DemoScoper";
import { DemoModel, DemoFunction } from "../language/gen";
import { DemoModelCreator } from "./DemoModelCreator";

describe("testing Alternative Scopes", () => {

  describe("testing IsInScope", () => {
    let model : DemoModel = new DemoModelCreator().createModelWithAppliedfeature();
    let scoper = new DemoScoper();
 
    beforeEach(done => {
      done();
    });

    test("isInscope 'DemoModel_1' in applied expression", () => {
      // let nameTotest : string = "DemoModel_1";
      // expect(scoper.isInScope(model, nameTotest)).toBe(false);
      // // test if nameTotest is known in model functions
      // model.functions.forEach(fun => {
      //   expect(scoper.isInScope(fun, nameTotest)).toBe(false);
      // });
      // // test the same on entities and entity functions
      // model.entities.forEach(ent => {
      //   expect(scoper.isInScope(ent, nameTotest)).toBe(false);
      //   ent.functions.forEach(fun => {
      //     expect(scoper.isInScope(fun, nameTotest)).toBe(false);
      //   });
      // });
    });  

  });
});

function testEntity(scoper: DemoScoper, model: DemoModel, nameTotest: string) {
  expect(scoper.isInScope(model, nameTotest, "DemoEntity")).toBe(true);
  // test if nameTotest is known in model functions
  model.functions.forEach(fun => {
    expect(scoper.isInScope(fun, nameTotest, "DemoEntity")).toBe(true);
    expect(scoper.isInScope(fun, nameTotest, "DemoFunction")).toBe(false);
  });
  // test the same on entities and entity functions
  model.entities.forEach(ent => {
    expect(scoper.isInScope(ent, nameTotest)).toBe(true);
    ent.functions.forEach(fun => {
      expect(scoper.isInScope(fun, nameTotest)).toBe(true);
    });
  });
}
