import { Checker } from "../../utils/Checker";
import { PiLanguage, PiLangConceptReference } from "../../languagedef/metalanguage/PiLanguage";
import { ValidatorDef, EqualsTypeRule, TypeRule, ConformsTypeRule, NotEmptyRule } from "./ValidatorDefLang";

export class ValidatorChecker extends Checker<ValidatorDef> {
    
    constructor(language: PiLanguage) {
        super();
        this.language = language;
    }

    public check(definition: ValidatorDef): void {
        console.log("Checking Validation Definition " + definition.validatorName);
        this.nestedCheck(
            {
                check: true,
                error: "This error never happens"
            });
            definition.conceptRules.forEach(rule => {                
                this.checkConceptReference(rule.conceptRef)
               // console.log("FOUND conceptReference " + rule.conceptRef.name);
                rule.typeRules.forEach(tr => this.checkTypeRule(tr));
                rule.notEmptyRules.forEach(nr =>
                    console.log("NOTEMPTY("+ nr.property +")")
                );
            });
        }

    checkConceptReference(reference: PiLangConceptReference) {
        // note that the following statement is crucial, because the model we are testing is separate
        // from the model of the language
        // if it is not set, the conceptReference will not find the refered language concept
        reference.language = this.language;
        this.nestedCheck(
            {
                check: reference.name !== undefined,
                error: `Element reference ${"UNKNOWN"}.type should have a name, but doesn't`,
                whenOk: () => this.nestedCheck(
                    {
                        check: reference.concept() !== undefined,
                        error: `ElementReference to ${reference.name} cannot be resolved`
                    })
            })
    }
    
    checkTypeRule(tr: TypeRule) {
        // check references to types
        if (tr instanceof EqualsTypeRule)  {
            console.log("EQUALSTYPE("+ tr.type1 + ", " + tr.type2 +")");
        } else if (tr instanceof ConformsTypeRule) { 
            console.log("CONFORMSTO("+ tr.type1 + ", " + tr.type2 + ")");
        }
    }

}

