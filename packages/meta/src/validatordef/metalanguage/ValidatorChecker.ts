import { Checker, FreErrorSeverity, MetaLogger, ParseLocationUtil, CheckRunner } from "../../utils";
import {
    FreClassifier,
    FreConcept,
    FreLangAppliedFeatureExp,
    FreLangSelfExp,
    FreLangSimpleExp,
    FreLanguage,
    FrePrimitiveProperty,
    FreProperty
} from "../../languagedef/metalanguage";
import {
    CheckConformsRule,
    CheckEqualsTypeRule,
    ConceptRuleSet,
    ExpressionRule,
    IsuniqueRule,
    NotEmptyRule,
    ValidatorDef,
    ValidationMessage,
    ValidationMessageReference,
    ValidationRule,
    ValidationSeverity,
    ValidNameRule
} from "./ValidatorDefLang";
import { FrePrimitiveType } from "../../languagedef/metalanguage";
import { CommonChecker, FreLangExpressionChecker } from "../../languagedef/checking";

const LOGGER = new MetaLogger("ValidatorChecker").mute();
const equalsTypeName = "equalsType";
const conformsToName = "conformsTo";

// 'severityLevels' should mirror the levels in FreValidator/FreErrorSeverity, but
// all names should be in lowercase
const severityLevels = ["error", "improvement", "todo", "info"];

export class ValidatorChecker extends Checker<ValidatorDef> {
    myExpressionChecker: FreLangExpressionChecker;
    runner = new CheckRunner(this.errors, this.warnings);

    constructor(language: FreLanguage) {
        super(language);
        this.myExpressionChecker = new FreLangExpressionChecker(this.language);
    }

    public check(definition: ValidatorDef): void {
        LOGGER.log("Checking validator Definition '" + definition.validatorName + "'");

        if ( this.language === null || this.language === undefined ) {
            throw new Error(`Validator definition checker does not known the language ${ParseLocationUtil.location(definition)}.`);
        }

        this.runner.nestedCheck(
            {
                check: this.language.name === definition.languageName,
                error: `Language reference ('${definition.languageName}') in ` +
                    `validator definition '${definition.validatorName}' does not match language '${this.language.name}' ` +
                    `${ParseLocationUtil.location(definition)}.`,
                whenOk: () => {
                    definition.conceptRules.forEach(rule => {
                        this.checkConceptRule(rule);
                    });
                }
            });
        this.errors = this.errors.concat(this.myExpressionChecker.errors);
    }

    private checkConceptRule(rule: ConceptRuleSet) {
        CommonChecker.checkClassifierReference(rule.conceptRef, this.runner);

        const enclosingConcept = rule.conceptRef.referred;
        if (enclosingConcept) {
            rule.rules.forEach(tr => {
                this.checkRule(tr, enclosingConcept);
            });
        }
    }

    checkRule(tr: ValidationRule, enclosingConcept: FreConcept) {
        if ( tr instanceof CheckEqualsTypeRule) { this.checkEqualsTypeRule(tr, enclosingConcept); }
        if ( tr instanceof CheckConformsRule) { this.checkConformsTypeRule(tr, enclosingConcept); }
        if ( tr instanceof NotEmptyRule) { this.checkNotEmptyRule(tr, enclosingConcept); }
        if ( tr instanceof ValidNameRule) { this.checkValidNameRule(tr, enclosingConcept); }
        if ( tr instanceof ExpressionRule) { this.checkExpressionRule(tr, enclosingConcept); }
        if ( tr instanceof IsuniqueRule) { this.checkIsuniqueRule(tr, enclosingConcept); }
        if (!!tr.severity) {
            this.checkAndFindSeverity(tr.severity);
        } else {
            // set default
            tr.severity = new ValidationSeverity();
            tr.severity.severity = FreErrorSeverity.ToDo;
        }
        if (!!tr.message) {
            this.checkValidationMessage(tr.message, enclosingConcept);
        }
    }

    checkValidNameRule(tr: ValidNameRule, enclosingConcept: FreConcept) {
        // check whether tr.property (if set) is a property of enclosingConcept
        // if not set, set tr.property to the 'self.unitName' property of the enclosingConcept
        if (!!tr.property) {
            this.myExpressionChecker.checkLangExp(tr.property, enclosingConcept);
        } else {
            let myProp: FreProperty;
            for (const i of enclosingConcept.allProperties()) {
                if (i.name === "name") {
                    myProp = i;
                }
            }
            this.runner.nestedCheck({
                check: !!myProp,
                error: `Cannot find property 'name' in ${enclosingConcept.name} ${ParseLocationUtil.location(tr)}.`,
                whenOk: () => {
                    tr.property = FreLangSelfExp.create(enclosingConcept);
                    tr.property.appliedfeature = FreLangAppliedFeatureExp.create(tr.property, "name", myProp);
                    // tr.property.appliedfeature.sourceName = "unitName";
                    // tr.property.appliedfeature.referredElement = MetaElementReference.create<FreProperty>(myProp, "FreProperty");
                    tr.property.location = tr.location;
                    tr.property.language = this.language;
                  }
            });
        }
        // check if found property is of type 'identifier'
        if (!!tr.property) {
            const myProp = tr.property.findRefOfLastAppliedFeature();
            this.runner.simpleCheck((myProp instanceof FrePrimitiveProperty) && myProp.type === FrePrimitiveType.identifier,
                `Validname rule expression '${tr.property.toFreString()}' should have type 'identifier' ${ParseLocationUtil.location(tr.property)}.`);
        }
    }

    checkEqualsTypeRule(tr: CheckEqualsTypeRule, enclosingConcept: FreConcept) {
        // check references to types
        this.runner.nestedCheck(
            {
                check: tr.type1 !== null && tr.type2 !== null,
                error: `Typecheck '${equalsTypeName}' should have two types to compare ${ParseLocationUtil.location(tr)}.`,
                whenOk: () => {
                    // LOGGER.log("Checking EqualsTo ( " + tr.type1.makeString() + ", " + tr.type2.makeString() +" )");
                    this.myExpressionChecker.checkLangExp(tr.type1, enclosingConcept);
                    this.myExpressionChecker.checkLangExp(tr.type2, enclosingConcept);
                }
            });
    }

    checkConformsTypeRule(tr: CheckConformsRule, enclosingConcept: FreConcept) {
        // check references to types
        this.runner.nestedCheck(
            {
                check: tr.type1 !== null || tr.type2 !== null,
                error: `Typecheck "${conformsToName}" should have two types to compare ${ParseLocationUtil.location(tr)}.`,
                whenOk: () => {
                    this.myExpressionChecker.checkLangExp(tr.type1, enclosingConcept);
                    this.myExpressionChecker.checkLangExp(tr.type2, enclosingConcept);
                }
            });
    }

    checkNotEmptyRule(nr: NotEmptyRule, enclosingConcept: FreConcept) {
        // check whether nr.property is a property of enclosingConcept
        // and whether it is a list
        if (nr.property !== null) {
            this.myExpressionChecker.checkLangExp(nr.property, enclosingConcept);
            this.runner.simpleCheck(nr.property.findRefOfLastAppliedFeature().isList,
                `NotEmpty rule '${nr.property.toFreString()}' should refer to a list ${ParseLocationUtil.location(nr)}.`);
        }
    }

    private checkExpressionRule(tr: ExpressionRule, enclosingConcept: FreConcept) {
        this.runner.nestedCheck(
            {
                check: tr.exp1 !== null && tr.exp2 !== null,
                error: `Expression rule '${tr.toFreString()}' should have two types to compare ${ParseLocationUtil.location(tr)}.`,
                whenOk: () => {
                    // exp1 and exp2 should refer to valid properties or be simple expressions
                    this.myExpressionChecker.checkLangExp(tr.exp1, enclosingConcept);
                    this.myExpressionChecker.checkLangExp(tr.exp2, enclosingConcept);
                    // types of exp1 and exp2 should be equal
                    if (tr.exp1 instanceof FreLangSimpleExp) {
                        // test if type2 is a number
                    } else if (tr.exp2 instanceof FreLangSimpleExp) {
                        // test if type1 is a number
                    } else {
                        // compare both types
                        const type1 = tr.exp1.findRefOfLastAppliedFeature()?.type;
                        this.runner.simpleCheck(type1 !== null, `Cannot find the type of ${tr.exp1.toFreString()} ${ParseLocationUtil.location(tr)}.`);
                        const type2 = tr.exp2.findRefOfLastAppliedFeature()?.type;
                        this.runner.simpleCheck(type2 !== null, `Cannot find the type of ${tr.exp2.toFreString()} ${ParseLocationUtil.location(tr)}.`);
                        if (type1 !== null && type2 !== null) {
                            this.runner.simpleCheck(type1 === type2, `Types of expression rule '${tr.toFreString()}' should be equal ${ParseLocationUtil.location(tr)}.`);
                        }
                    }
                }
            });
    }

    private checkIsuniqueRule(tr: IsuniqueRule, enclosingConcept: FreConcept) {
        this.runner.nestedCheck(
            {
                check: tr.list !== null && tr.listproperty !== null,
                error: `Isunique rule '${tr.toFreString()}' should have a list and a property of that list to compare the elements ${ParseLocationUtil.location(tr)}.`,
                whenOk: () => {
                    // list should refer to a valid property of enclosingConcept
                    this.myExpressionChecker.checkLangExp(tr.list, enclosingConcept);
                    const myProp = tr.list.findRefOfLastAppliedFeature();
                    if (!!myProp) { // error message provided by checkLangExp
                        this.runner.nestedCheck(
                            {
                                check: myProp.isList,
                                error: `Isunique rule cannot be applied to a property that is not a list (${myProp.name}) ${ParseLocationUtil.location(tr.list)}.`,
                                whenOk: () => {
                                    const myType = myProp.type;
                                    this.runner.nestedCheck(
                                        {
                                            check: !!myType,
                                            error: `List ${myProp.name} does not have a valid type ${ParseLocationUtil.location(tr.list)}.`,
                                            whenOk: () => {
                                                // now check the property of the list against the type of the elements in the list
                                                this.myExpressionChecker.checkLangExp(tr.listproperty, myType);
                                            }
                                        });
                                }
                            });
                    }
                }
            });
    }

    private checkAndFindSeverity(severity: ValidationSeverity) {
        const myValue = severity.value.toLowerCase();
        this.runner.nestedCheck(
            {
                check: severityLevels.includes(myValue),
                error: `Severity '${severity.value}' should equal (disregarding case) one of the values ` +
                            `(${severityLevels.map(elem => `${elem}`).join(", ")}) ${ParseLocationUtil.location(severity)}.`,
                whenOk: () => {
                    switch (myValue) {
                        case "error": {
                            severity.severity = FreErrorSeverity.Error;
                            break;
                        }
                        case "info": {
                            severity.severity = FreErrorSeverity.Info;
                            break;
                        }
                        case "todo": {
                            severity.severity = FreErrorSeverity.ToDo;
                            break;
                        }
                        case "improvement": {
                            severity.severity = FreErrorSeverity.Improvement;
                            break;
                        }
                        default: {
                            severity.severity = FreErrorSeverity.ToDo;
                        }
                    }
                }
        });
        if (!!!severity.severity) {
            severity.severity = FreErrorSeverity.ToDo;
        }
    }

    private checkValidationMessage(message: ValidationMessage, enclosingConcept: FreClassifier) {
        this.runner.nestedCheck({check: !!message.content && !!message.content[0],
            error: `User defined error message should have a value ${ParseLocationUtil.location(message)}.`,
            whenOk: () => {
                message.content.forEach(part => {
                    // console.log("found " + part.toFreString());
                    if (part instanceof ValidationMessageReference) {
                        this.myExpressionChecker.checkLangExp(part.expression, enclosingConcept);
                    }
                });
            }
        });
    }
}
