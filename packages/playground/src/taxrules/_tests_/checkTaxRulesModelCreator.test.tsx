import { TaxRulesCreator } from "./TaxRulesCreator.TaxRulesCreator";
import { RevenueService } from "../language"


describe("Tax Rules Model", () => {
    describe("Checking Revenue instance", () => {
      let model: RevenueService = new TaxRulesCreator().model;
  
      beforeEach(done => {
        done();
      });
  
      test("rules apply to year 2020", () => {
        expect(model.rules.year).toBe(2020);
      });
    });
});