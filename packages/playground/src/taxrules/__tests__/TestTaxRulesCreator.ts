import {
    Expression,
    IncomePart,
    TaxPayer,
    TaxRuleSet,
    RevenueService,
    TaxPayerType,
    IncomeType
} from "../language";
import { TaxRulesCreator } from "../../taxrules/utils/gen/TaxRulesCreator";

// examples
// Rule NGO_income_tax_free : 0 WHEN (incomePart.source.payerType = TaxPayerType.NGO)
// Rule Company_tax_high    : 40% * incomePart.amount WHEN (incomePart.source.payerType = TaxPayerType.Company) 
// Rule Royalties_tax_low   : 10% * incomePart.amount WHEN (incomePart.incomeType = IncomeType.Royalties)
// Rule Gift_tax_high       : 20% * incomePart.amount - incomePart.deduction WHEN (incomePart.incomeType = IncomeType.Gift) 

// TaxPayer 4444 ("USA Goverment") address "Washington" type Company
// TaxPayer 987654321 ("Donald Trump") address "Mar-a-Lago" type Person

// Income 987654321 ("Donald Trump") hasIncome $5000000 from 4444 deduction $0

// Rule total_taxes = SUM( allRules over tp.incomeParts ) - generalDeduction
// Rule total_revenues = SUM( total_taxes over allTaxPayers )

export class TestTaxRulesCreator extends TaxRulesCreator {
    model : RevenueService;

    constructor(){
        super();
        this.model = this.buildModel();
    }

    private buildModel() : RevenueService{


        let condition = this.createEqualsExpression(
            this.createStringLiteralExpression("incomePart.souceType"),
            this.createStringLiteralExpression("SouceType.NGO")
        );
        let exp : Expression = this.createMoneyLiteralExp("0");
        let whenexp = this.createIfExpression(condition, exp, null);
        let companyTax = this.createTaxRule( "NGO_income_tax_free", whenexp);
        let ruleset : TaxRuleSet = this.createTaxRuleSet(2020, companyTax);
        this.addRulesToSet(ruleset);

        let usGov : TaxPayer = this.createTaxPayer("USA Goverment", "Washington", TaxPayerType.Goverment, this.createTaxID(4444), null , null, null);

        let income : IncomePart = this.createIncomePart(IncomeType.Salary, this.createMoney(0),this.createMoney(5000000), usGov);
        let trump : TaxPayer = this.createTaxPayer("Donald Trump", "Mar-a-Lago", TaxPayerType.Person, this.createTaxID(987654321), income , null, null);

        let rs = this.createRevenueService(ruleset, trump);
        rs.payers.push(usGov);
        return rs;
    }

    private addRulesToSet(ruleset: TaxRuleSet) {
        let condition = this.createEqualsExpression(
            this.createStringLiteralExpression("incomePart.souceType"), 
            this.createStringLiteralExpression("SouceType.Company"));
        let exp = this.createMultiplyExpression(
            this.createPercentageExpression(this.createNumberLiteralExpression("40")), 
            this.createNumberLiteralExpression("35")); // should be a variableRef
        let whenexp = this.createIfExpression(condition, exp, null);
        let ngoTax = this.createTaxRule("Company_tax_high", whenexp);
        ruleset.taxrules.push(ngoTax);

        condition = this.createEqualsExpression(
            this.createStringLiteralExpression("incomePart.souceType"), 
            this.createStringLiteralExpression("SouceType.Royalties"));
        exp = this.createMultiplyExpression(
            this.createPercentageExpression(this.createNumberLiteralExpression("10")), 
            this.createNumberLiteralExpression("35")); // should be a variableRef
        whenexp = this.createIfExpression(condition, exp, null);
        let royaltiesTax = this.createTaxRule("Royalties_tax_low", whenexp);
        ruleset.taxrules.push(royaltiesTax);

        condition = this.createEqualsExpression(
            this.createStringLiteralExpression("incomePart.souceType"), 
            this.createStringLiteralExpression("SouceType.Royalties"));
        exp = this.createMultiplyExpression(
            this.createPercentageExpression(this.createNumberLiteralExpression("20")), 
            this.createNumberLiteralExpression("35")); // should be a variableRef
        whenexp = this.createIfExpression(condition, exp, null);
        let giftTax = this.createTaxRule("Gift_tax_high", whenexp);
        ruleset.taxrules.push(giftTax);
    }

}
