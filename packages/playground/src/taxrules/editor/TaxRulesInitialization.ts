import { RevenueService } from "../language/gen";
import { TestTaxRulesCreator } from "../__tests__/TestTaxRulesCreator";

export class TaxRulesInitialization {
    initialize(): RevenueService {
        return new TestTaxRulesCreator().model;
    }
}
