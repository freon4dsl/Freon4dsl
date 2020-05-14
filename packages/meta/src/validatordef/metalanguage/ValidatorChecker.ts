import { Checker } from "../../utils/Checker";
import { PiLanguageUnit, PiProperty, PiConcept, PiPrimitiveProperty, PiClassifier } from "../../languagedef/metalanguage/PiLanguage";
import {
    ConceptRuleSet,
    PiValidatorDef,
    CheckEqualsTypeRule,
    ValidationRule,
    CheckConformsRule,
    NotEmptyRule,
    ValidNameRule,
    ExpressionRule
} from "./ValidatorDefLang";
import { PiLangAppliedFeatureExp, PiLangSelfExp, PiLangSimpleExp } from "../../languagedef/metalanguage/PiLangExpressions";
import { PiLogger } from "../../../../core/src/util/PiLogging";
import { PiLanguageExpressionChecker } from "../../languagedef/metalanguage/PiLanguageExpressionChecker";
// The next import should be separate and the last of the imports.
// Otherwise, the run-time error 'Cannot read property 'create' of undefined' occurs.
// See: https://stackoverflow.com/questions/48123645/error-when-accessing-static-properties-when-services-include-each-other
// and: https://stackoverflow.com/questions/45986547/property-undefined-typescript
import { PiElementReference} from "../../languagedef/metalanguage/PiElementReference";

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

        const enclosingConcept = rule.conceptRef.referred;
        if (enclosingConcept) {
            rule.rules.forEach(tr => {
                this.checkRule(tr, enclosingConcept);
            });
        }
    }

    checkRule(tr: ValidationRule, enclosingConcept: PiConcept) {
        if ( tr instanceof CheckEqualsTypeRule) { this.checkEqualsTypeRule(tr, enclosingConcept); }
        if ( tr instanceof CheckConformsRule) { this.checkConformsTypeRule(tr, enclosingConcept); }
        if ( tr instanceof NotEmptyRule) { this.checkNotEmptyRule(tr, enclosingConcept); }
        if ( tr instanceof ValidNameRule) { this.checkValidNameRule(tr, enclosingConcept); }
        if ( tr instanceof ExpressionRule) { this.checkExpressionRule(tr, enclosingConcept); }
    }

    checkValidNameRule(tr: ValidNameRule, enclosingConcept: PiConcept) {
        // check whether tr.property (if set) is a property of enclosingConcept
        // if not set, set tr.property to the 'self.name' property of the enclosingConcept
        if (!!tr.property) {
            this.myExpressionChecker.checkLangExp(tr.property, enclosingConcept);
        } else {
            let myProp: PiProperty;
            for (let i of enclosingConcept.allProperties()) {
                if (i.name === "name") {
                    myProp = i;
                }
            }
            this.nestedCheck({
                check:!!myProp,
                error: `Cannot find property 'name' in ${enclosingConcept.name} [line: ${tr.location?.start.line}, column: ${tr.location?.start.column}].`,
                whenOk: () => {
                    tr.property = PiLangSelfExp.create(enclosingConcept);
                    tr.property.appliedfeature = PiLangAppliedFeatureExp.create(tr.property,"name", myProp);
                    // tr.property.appliedfeature.sourceName = "name";
                    // tr.property.appliedfeature.referedElement = PiElementReference.create<PiProperty>(myProp, "PiProperty");
                    tr.property.location = tr.location;
                  }
            });
        }
        // check if found property is of type 'string'
        if (!!tr.property) {
            let myProp = tr.property.findRefOfLastAppliedFeature();
            this.simpleCheck((myProp instanceof PiPrimitiveProperty) && myProp.primType === "string",
                `Validname rule expression '${tr.property.toPiString()}' should have type 'string' [line: ${tr.property.location?.start.line}, column: ${tr.property.location?.start.column}].`);
        }
    }

    checkEqualsTypeRule(tr: CheckEqualsTypeRule, enclosingConcept: PiConcept) {
        // check references to types
        this.nestedCheck(
            {
                check: tr.type1 != null && tr.type2 != null,
                error: `Typecheck '${equalsTypeName}' should have two types to compare [line: ${tr.location?.start.line}, column: ${tr.location?.start.column}].`,
                whenOk: () => {
                    // LOGGER.log("Checking EqualsTo ( " + tr.type1.makeString() + ", " + tr.type2.makeString() +" )");
                    this.myExpressionChecker.checkLangExp(tr.type1, enclosingConcept),
                    this.myExpressionChecker.checkLangExp(tr.type2, enclosingConcept)  
                }
            })
    }

    checkConformsTypeRule(tr: CheckConformsRule, enclosingConcept: PiConcept) {
        // check references to types
        this.nestedCheck(
            {
                check: tr.type1 != null || tr.type2 != null,
                error: `Typecheck "${conformsToName}" should have two types to compare [line: ${tr.location?.start.line}, column: ${tr.location?.start.column}].`,
                whenOk: () => {
                    this.myExpressionChecker.checkLangExp(tr.type1, enclosingConcept);
                    this.myExpressionChecker.checkLangExp(tr.type2, enclosingConcept);
                }
            })
    }

    checkNotEmptyRule(nr: NotEmptyRule, enclosingConcept: PiConcept) {
        // check whether nr.property is a property of enclosingConcept
        // and whether it is a list
        let myProp : PiProperty;
        if( nr.property != null ) {
            this.myExpressionChecker.checkLangExp(nr.property, enclosingConcept);
            this.simpleCheck(nr.property.findRefOfLastAppliedFeature().isList,
                `NotEmpty rule '${nr.property.toPiString()}' should refer to a list [line: ${nr.location?.start.line}, column: ${nr.location?.start.column}].`)
        }
    }

    private checkExpressionRule(tr: ExpressionRule, enclosingConcept: PiConcept) {

        this.nestedCheck(
            {
                check: tr.exp1 != null && tr.exp2 != null,
                error: `Expression rule '${tr.toPiString()}' should have two types to compare [line: ${tr.location?.start.line}, column: ${tr.location?.start.column}].`,
                whenOk: () => {
                    // exp1 and exp2 should refer to valid properties or be simple expressions
                    this.myExpressionChecker.checkLangExp(tr.exp1, enclosingConcept);
                    this.myExpressionChecker.checkLangExp(tr.exp2, enclosingConcept);
                    // types of exp1 and exp2 should be equal
                    if (tr.exp1 instanceof PiLangSimpleExp) {
                        // test if type2 is a number
                    } else if (tr.exp2 instanceof PiLangSimpleExp) {
                        // test if type1 is a number
                    } else {
                        // compare both types
                        let type1 = tr.exp1.findRefOfLastAppliedFeature()?.type.referred;
                        this.simpleCheck(type1 != null, `Cannot find the type of ${tr.exp1.toPiString()} [line: ${tr.exp1.location?.start.line}, column: ${tr.exp1.location?.start.column}].`)
                        let type2 = tr.exp2.findRefOfLastAppliedFeature()?.type.referred;
                        this.simpleCheck(type2 != null, `Cannot find the type of ${tr.exp2.toPiString()} [line: ${tr.exp2.location?.start.line}, column: ${tr.exp2.location?.start.column}].`)
                        if (type1 != null && type2 != null) {
                            this.simpleCheck(type1 === type2, `Types of expression rule '${tr.toPiString()}' should be equal [line: ${tr.location?.start.line}, column: ${tr.location?.start.column}].`)
                        }
                    }
                }
            });
    }
}

