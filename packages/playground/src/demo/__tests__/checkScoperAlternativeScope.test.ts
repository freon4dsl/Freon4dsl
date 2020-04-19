import { DemoScoper } from "../scoper/gen/DemoScoper";
import { DemoModel, DemoFunction, AppliedFeature } from "../language/gen";
import { DemoModelCreator } from "./DemoModelCreator";

describe("testing Alternative Scopes", () => {

  describe("testing IsInScope", () => {
    let model : DemoModel = new DemoModelCreator().createModelWithAppliedfeature();
    let scoper = new DemoScoper();
 
    beforeEach(done => {
      done();
    });

    test("isInscope of applied expression 'myfirstAppliedFeature'", () => {
      let modelAttr : string = "Person";
      let companyAttr : string = "VAT_Number";
      let personAttr : string = "age";
      let appliedFeature: AppliedFeature = model.functions[0].expression.appliedfeature;
      expect(scoper.isInScope(appliedFeature, modelAttr)).toBe(false);
      expect(scoper.isInScope(appliedFeature, companyAttr)).toBe(false);
      expect(scoper.isInScope(appliedFeature, personAttr)).toBe(true);
    });

    test("isInscope of applied expression 'mysecondAppliedFeature'", () => {
      let modelAttr : string = "Person";
      let companyAttr : string = "VAT_Number";
      let personAttr : string = "age";
      let appliedFeature: AppliedFeature = model.functions[0].expression.appliedfeature.appliedfeature;
      expect(scoper.isInScope(appliedFeature, modelAttr)).toBe(false);
      expect(scoper.isInScope(appliedFeature, companyAttr)).toBe(false);
      expect(scoper.isInScope(appliedFeature, personAttr)).toBe(false);
    });

  });
});

