import { Checker } from "../../utils";
import {
    PiConcept,
    PiLangAppliedFeatureExp,
    PiLangExpressionChecker,
    PiLangSelfExp,
    PiLangSimpleExp,
    PiLanguage,
    PiPrimitiveProperty,
    PiProperty
} from "../../languagedef/metalanguage";
import { PiErrorSeverity } from "../../utils/PiErrorSeverity";
import {
    CheckConformsRule,
    CheckEqualsTypeRule,
    ConceptRuleSet,
    ExpressionRule,
    IsuniqueRule,
    NotEmptyRule,
    PiValidatorDef, ValidationMessage,
    ValidationRule,
    ValidationSeverity,
    ValidNameRule
} from "./ValidatorDefLang";
// TODO note that the following imports cannot be from "@projectit/core", because
// this leads to a load error
import { MetaLogger } from "../../utils/MetaLogger";
// import { PiErrorSeverity } from "@projectit/core";
// import { PiErrorSeverity } from "../../../../core/src/validator/PiValidator";

const LOGGER = new MetaLogger("ValidatorChecker"); // .mute();
const equalsTypeName = "equalsType";
const conformsToName = "conformsTo";

// 'severityLevels' should mirror the levels in PiValidator/PiErrorSeverity, but
// all names should be in lowercase
const severityLevels = ["error", "improvement", "todo", "info"];

export class ValidatorChecker extends Checker<PiValidatorDef> {
    myExpressionChecker: PiLangExpressionChecker;

    constructor(language: PiLanguage) {
        super(language);
        this.myExpressionChecker = new PiLangExpressionChecker(this.language);
    }

    public check(definition: PiValidatorDef): void {
        LOGGER.log("Checking validator Definition '" + definition.validatorName + "'");

        if ( this.language === null || this.language === undefined ) {
            throw new Error(`Validator definition checker does not known the language ${this.location(definition)}.`);
        }

        this.nestedCheck(
            {
                check: this.language.name === definition.languageName,
                error: `Language reference ('${definition.languageName}') in ` +
                    `validator definition '${definition.validatorName}' does not match language '${this.language.name}' ` +
                    `${this.location(definition)}.`,
                whenOk: () => {
                    definition.conceptRules.forEach(rule => {
                        this.checkConceptRule(rule);
                    });
                }
            });
        this.errors = this.errors.concat(this.myExpressionChecker.errors);
    }

    private checkConceptRule(rule: ConceptRuleSet) {
        this.myExpressionChecker.checkClassifierReference(rule.conceptRef);

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
        if ( tr instanceof IsuniqueRule) { this.checkIsuniqueRule(tr, enclosingConcept); }
        if (!!tr.severity) {
            this.checkAndFindSeverity(tr.severity); }
        else {
            // set default
            tr.severity = new ValidationSeverity();
            tr.severity.severity = PiErrorSeverity.ToDo;
        }
        if (!!tr.message) {
            this.checkValidationMessage(tr.message);
        }
    }

    checkValidNameRule(tr: ValidNameRule, enclosingConcept: PiConcept) {
        // check whether tr.property (if set) is a property of enclosingConcept
        // if not set, set tr.property to the 'self.unitName' property of the enclosingConcept
        if (!!tr.property) {
            this.myExpressionChecker.checkLangExp(tr.property, enclosingConcept);
        } else {
            let myProp: PiProperty;
            for (const i of enclosingConcept.allProperties()) {
                if (i.name === "name") {
                    myProp = i;
                }
            }
            this.nestedCheck({
                check: !!myProp,
                error: `Cannot find property 'name' in ${enclosingConcept.name} ${this.location(tr)}.`,
                whenOk: () => {
                    tr.property = PiLangSelfExp.create(enclosingConcept);
                    tr.property.appliedfeature = PiLangAppliedFeatureExp.create(tr.property, "name", myProp);
                    // tr.property.appliedfeature.sourceName = "unitName";
                    // tr.property.appliedfeature.referredElement = PiElementReference.create<PiProperty>(myProp, "PiProperty");
                    tr.property.location = tr.location;
                  }
            });
        }
        // check if found property is of type 'string'
        if (!!tr.property) {
            const myProp = tr.property.findRefOfLastAppliedFeature();
            this.simpleCheck((myProp instanceof PiPrimitiveProperty) && myProp.primType === "string",
                `Validname rule expression '${tr.property.toPiString()}' should have type 'string' ${this.location(tr.property)}.`);
        }
    }

    checkEqualsTypeRule(tr: CheckEqualsTypeRule, enclosingConcept: PiConcept) {
        // check references to types
        this.nestedCheck(
            {
                check: tr.type1 !== null && tr.type2 !== null,
                error: `Typecheck '${equalsTypeName}' should have two types to compare ${this.location(tr)}.`,
                whenOk: () => {
                    // LOGGER.log("Checking EqualsTo ( " + tr.type1.makeString() + ", " + tr.type2.makeString() +" )");
                    this.myExpressionChecker.checkLangExp(tr.type1, enclosingConcept);
                    this.myExpressionChecker.checkLangExp(tr.type2, enclosingConcept);
                }
            });
    }

    checkConformsTypeRule(tr: CheckConformsRule, enclosingConcept: PiConcept) {
        // check references to types
        this.nestedCheck(
            {
                check: tr.type1 !== null || tr.type2 !== null,
                error: `Typecheck "${conformsToName}" should have two types to compare ${this.location(tr)}.`,
                whenOk: () => {
                    this.myExpressionChecker.checkLangExp(tr.type1, enclosingConcept);
                    this.myExpressionChecker.checkLangExp(tr.type2, enclosingConcept);
                }
            });
    }

    checkNotEmptyRule(nr: NotEmptyRule, enclosingConcept: PiConcept) {
        // check whether nr.property is a property of enclosingConcept
        // and whether it is a list
        if (nr.property !== null) {
            this.myExpressionChecker.checkLangExp(nr.property, enclosingConcept);
            this.simpleCheck(nr.property.findRefOfLastAppliedFeature().isList,
                `NotEmpty rule '${nr.property.toPiString()}' should refer to a list ${this.location(nr)}.`);
        }
    }

    private checkExpressionRule(tr: ExpressionRule, enclosingConcept: PiConcept) {
        this.nestedCheck(
            {
                check: tr.exp1 !== null && tr.exp2 !== null,
                error: `Expression rule '${tr.toPiString()}' should have two types to compare ${this.location(tr)}.`,
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
                        const type1 = tr.exp1.findRefOfLastAppliedFeature()?.type.referred;
                        this.simpleCheck(type1 !== null, `Cannot find the type of ${tr.exp1.toPiString()} ${this.location(tr)}.`);
                        const type2 = tr.exp2.findRefOfLastAppliedFeature()?.type.referred;
                        this.simpleCheck(type2 !== null, `Cannot find the type of ${tr.exp2.toPiString()} ${this.location(tr)}.`);
                        if (type1 !== null && type2 !== null) {
                            this.simpleCheck(type1 === type2, `Types of expression rule '${tr.toPiString()}' should be equal ${this.location(tr)}.`);
                        }
                    }
                }
            });
    }

    private checkIsuniqueRule(tr: IsuniqueRule, enclosingConcept: PiConcept) {
        this.nestedCheck(
            {
                check: tr.list !== null && tr.listproperty !== null,
                error: `Isunique rule '${tr.toPiString()}' should have a list and a property of that list to compare the elements ${this.location(tr)}.`,
                whenOk: () => {
                    // list should refer to a valid property of enclosingConcept
                    this.myExpressionChecker.checkLangExp(tr.list, enclosingConcept);
                    const myProp = tr.list.findRefOfLastAppliedFeature();
                    if (!!myProp) { // error message provided by checkLangExp
                        this.nestedCheck(
                            {
                                check: myProp.isList,
                                error: `Isunique rule cannot be applied to a property that is not a list (${myProp.name}) ${this.location(tr.list)}.`,
                                whenOk: () => {
                                    const myType = myProp.type?.referred;
                                    this.nestedCheck(
                                        {
                                            check: !!myType,
                                            error: `List ${myProp.name} does not have a valid type ${this.location(tr.list)}.`,
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
        this.nestedCheck(
            {
                check: severityLevels.includes(myValue),
                error:`Severity '${severity.value}' should equal (disregarding case) one of the values (${severityLevels.map(elem => `${elem}`).join(", ")}) ` +
                            `${this.location(severity)}.`,
                whenOk: () => {
                    switch (myValue) {
                        case "error": {
                            severity.severity = PiErrorSeverity.Error;
                            break;
                        }
                        case "info": {
                            severity.severity = PiErrorSeverity.Info;
                            break;
                        }
                        case "todo": {
                            severity.severity = PiErrorSeverity.ToDo;
                            break;
                        }
                        case "improvement": {
                            severity.severity = PiErrorSeverity.Improvement;
                            break;
                        }
                        default: {
                            severity.severity = PiErrorSeverity.ToDo;
                        }
                    }
                }
        });
        if (!!!severity.severity) {
            severity.severity = PiErrorSeverity.ToDo;
        }
    }

    private checkValidationMessage(message: ValidationMessage) {
        this.simpleCheck(!!message.content && !!message.content[0],
            `User defined error message should have a value ${this.location(message)}.`);
    }
}
