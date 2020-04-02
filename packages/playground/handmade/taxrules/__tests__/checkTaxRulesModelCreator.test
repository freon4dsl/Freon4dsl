import { TestTaxRulesCreator } from "./TestTaxRulesCreator";
import { RevenueService, IfExpression } from "../language/index"


describe("Tax Rules Model", () => {
    describe("Checking Revenue instance", () => {
      let model: RevenueService = new TestTaxRulesCreator().model;
  
      beforeEach(done => {
        done();
      });
  
      test("rules apply to year 2020", () => {
        expect(model.rules.year).toBe(2020);
      });

      test("there are two tax payers", () => {
        expect(model.payers.length).toBe(2);
      });

      test("there are four tax rules", () => {
        expect(model.rules.taxrules.length).toBe(4);
      });

      test("there is a tax rule for NGOs", () => {
        let found : boolean = false;
        for( let x of model.rules.taxrules) {
          if (/NGO/.test( x.name ) ) found = true;
        }
        expect(found).toBe(true);
      });

    });
});