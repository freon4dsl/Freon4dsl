import { Checker } from "../../utils/Checker";
import { PiLanguageUnit, PiLangProperty, PiLangConcept, PiLangPrimitiveProperty } from "../../languagedef/metalanguage/PiLanguage";
import { ConceptRuleSet, PiValidatorDef, CheckEqualsTypeRule, ValidationRule, CheckConformsRule, NotEmptyRule, ValidNameRule } from "./ValidatorDefLang";
import { nameForSelf } from "../../languagedef/parser/ExpressionCreators";
import { PiLangAppliedFeatureExp, PiLangSelfExp } from "../../languagedef/metalanguage/PiLangExpressions";
import { PiLogger } from "../../../../core/src/util/PiLogging";
import { PiLanguageExpressionChecker } from "../../languagedef/metalanguage/PiLanguageExpressionChecker";

const LOGGER = new PiLogger("ValidatorChecker").mute();
const equalsTypeName = "equalsType";
const conformsToName = "conformsTo";

export class ValidatorChecker extends Checker<PiValidatorDef> {
    myExpressionChecker: PiLanguageExpressionChecker;
    
    constructor(language: PiLanguageUnit) {
        super(language);
        this.myExpressionChecker = new PiLanguageExpressionChecker(this.language);
    }

    public check(definition: PiValidatorDef): void {
        LOGGER.log("Checking validator Definition '" + definition.validatorName + "'");

        if ( this.language === null || this.language === undefined ) {
            throw new Error(`Validator definition checker does not known the language.`);
        }

        this.nestedCheck(
            {
                check: this.language.name === definition.languageName,
                error: `Language reference ('${definition.languageName}') in `+
                    `validator definition '${definition.validatorName}' does not match language '${this.language.name}' `+
                    `[line: ${definition.location?.start.line}, column: ${definition.location?.start.column}].`,
                whenOk: () => {
                    definition.conceptRules.forEach(rule => {
                        this.checkConceptRule(rule);
                    });
                }
            });
        this.errors = this.errors.concat(this.myExpressionChecker.errors);
    }

    private checkConceptRule(rule: ConceptRuleSet) {
        this.myExpressionChecker.checkConceptReference(rule.conceptRef);

        const enclosingConcept = rule.conceptRef.referedElement();
        if (enclosingConcept) {
            rule.rules.forEach(tr => {
                this.checkRule(tr, enclosingConcept);
            });
        }
    }

    checkRule(tr: ValidationRule, enclosingConcept: PiLangConcept) {
        if ( tr instanceof CheckEqualsTypeRule) { this.checkEqualsTypeRule(tr, enclosingConcept); }
        if ( tr instanceof CheckConformsRule) { this.checkConformsTypeRule(tr, enclosingConcept); }
        if ( tr instanceof NotEmptyRule) { this.checkNotEmptyRule(tr, enclosingConcept); }
        if ( tr instanceof ValidNameRule) { this.checkValidNameRule(tr, enclosingConcept); }
    }

    checkValidNameRule(tr: ValidNameRule, enclosingConcept: PiLangConcept) {
        // check whether tr.property (if set) is a property of enclosingConcept
        // if not set, set tr.property to the 'self.name' property of the enclosingConcept
        if (!!tr.property) {
            this.myExpressionChecker.checkLangExp(tr.property, enclosingConcept);
        } else {
            let myProp: PiLangProperty;
            for (let i of enclosingConcept.allProperties()) {
                if (i.name === "name") {
                    myProp = i;
                }
            }
            this.nestedCheck({
                check:!!myProp,
                error: `Cannot find property 'name' in ${enclosingConcept.name} [line: ${tr.location?.start.line}, column: ${tr.location?.start.column}].`,
                whenOk: () => {
                    tr.property = new PiLangSelfExp();
                    tr.property.sourceName = nameForSelf;
                    tr.property.referedElement = enclosingConcept;
                    tr.property.appliedfeature = new PiLangAppliedFeatureExp();
                    tr.property.appliedfeature.sourceName = "name";
                    tr.property.appliedfeature.referedElement = myProp;
                    tr.property.location = tr.location;
                  }
            });
        }
        // check if found property is of type 'string'
        if (!!tr.property) {
            let myProp = tr.property.findRefOfLastAppliedFeature();
            this.simpleCheck((myProp instanceof PiLangPrimitiveProperty) && myProp.primType === "string",
                `Validname rule expression '${tr.property.toPiString()}' should have type 'string' [line: ${tr.property.location?.start.line}, column: ${tr.property.location?.start.column}].`);
        }
    }

    checkEqualsTypeRule(tr: CheckEqualsTypeRule, enclosingConcept: PiLangConcept) {
        // check references to types
        this.nestedCheck(
            {
                check: tr.type1 != null || tr.type2 != null,
                error: `Typecheck '${equalsTypeName}' should have two types to compare [line: ${tr.location?.start.line}, column: ${tr.location?.start.column}].`,
                whenOk: () => {
                    // LOGGER.log("Checking EqualsTo ( " + tr.type1.makeString() + ", " + tr.type2.makeString() +" )");
                    this.myExpressionChecker.checkLangExp(tr.type1, enclosingConcept),
                    this.myExpressionChecker.checkLangExp(tr.type2, enclosingConcept)  
                }
            })
    }

    checkConformsTypeRule(tr: CheckConformsRule, enclosingConcept: PiLangConcept) {
        // check references to types
        this.nestedCheck(
            {
                check: tr.type1 != null || tr.type2 != null,
                error: `Typecheck "${conformsToName}" should have two types to compare [line: ${tr.location?.start.line}, column: ${tr.location?.start.column}].`,
                whenOk: () => {
                    this.myExpressionChecker.checkLangExp(tr.type1, enclosingConcept);
                    this.myExpressionChecker.checkLangExp(tr.type2, enclosingConcept)  
                }
            })
    }

    checkNotEmptyRule(nr: NotEmptyRule, enclosingConcept: PiLangConcept) {
        // check whether nr.property is a property of enclosingConcept
        // and whether it is a list
        let myProp : PiLangProperty;
        if( nr.property != null ) {
            this.myExpressionChecker.checkLangExp(nr.property, enclosingConcept);
            this.simpleCheck(nr.property.findRefOfLastAppliedFeature().isList,
                `NotEmpty rule '${nr.property.toPiString()}' should refer to a list [line: ${nr.location?.start.line}, column: ${nr.location?.start.column}].`)
        }
    }
}

