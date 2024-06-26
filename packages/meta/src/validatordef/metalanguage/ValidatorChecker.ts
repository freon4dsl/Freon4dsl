import { Checker, FreErrorSeverity, MetaLogger, ParseLocationUtil, CheckRunner } from "../../utils";
import {
    FreMetaClassifier,
    FreMetaConcept,
    FreLangAppliedFeatureExp,
    FreLangSelfExp,
    FreLangSimpleExp,
    FreMetaLanguage,
    FreMetaPrimitiveProperty,
    FreMetaProperty
} from "../../languagedef/metalanguage";
import {
    CheckConformsRule,
    CheckEqualsTypeRule,
    ConceptRuleSet,
    ExpressionRule,
    IsUniqueRule,
    NotEmptyRule,
    ValidatorDef,
    ValidationMessage,
    ValidationMessageReference,
    ValidationRule,
    ValidationSeverity,
    ValidNameRule
} from "./ValidatorDefLang";
import { FreMetaPrimitiveType } from "../../languagedef/metalanguage";
import { CommonChecker, FreLangExpressionChecker } from "../../languagedef/checking";

const LOGGER: MetaLogger = new MetaLogger("ValidatorChecker");
const equalsTypeName: string = "equalsType";
const conformsToName: string = "conformsTo";

// 'severityLevels' should mirror the levels in FreValidator/FreErrorSeverity, but
// all names should be in lowercase
const severityLevels: string[] = ["error", "improvement", "todo", "info"];

export class ValidatorChecker extends Checker<ValidatorDef> {
    myExpressionChecker: FreLangExpressionChecker | undefined;
    runner: CheckRunner = new CheckRunner(this.errors, this.warnings);

    constructor(language: FreMetaLanguage | undefined) {
        super(language);
        LOGGER.log("Created validator checker");
        if ( this.language !== null || this.language !== undefined ) {
            this.myExpressionChecker = new FreLangExpressionChecker(this.language);
        }
    }

    public check(definition: ValidatorDef): void {
        LOGGER.log("Checking validator Definition '" + definition.validatorName + "'");

        if ( this.language === null || this.language === undefined ) {
            throw new Error(`Validator definition checker does not known the language ${ParseLocationUtil.location(definition)}.`);
        } else {
            this.myExpressionChecker = new FreLangExpressionChecker(this.language);
            // in all private methods that are called by method 'check' we can assume that 'this.myExpressionChecker !== undefined'
        }

        definition.conceptRules.forEach(rule => {
            this.checkConceptRule(rule);
        });
        this.errors = this.errors.concat(this.myExpressionChecker.errors);
    }

    private checkConceptRule(rule: ConceptRuleSet): void {
        LOGGER.log("Check concept rule");
        if (!!rule.conceptRef) { // todo check whether this option needs to throw an error
            CommonChecker.checkClassifierReference(rule.conceptRef, this.runner);

            const enclosingConcept: FreMetaConcept = rule.conceptRef.referred;
            if (enclosingConcept) {
                rule.rules.forEach(tr => {
                    this.checkRule(tr, enclosingConcept);
                });
            }
        }
    }

    private checkRule(tr: ValidationRule, enclosingConcept: FreMetaConcept) {
        if ( tr instanceof CheckEqualsTypeRule) { this.checkEqualsTypeRule(tr, enclosingConcept); }
        if ( tr instanceof CheckConformsRule) { this.checkConformsTypeRule(tr, enclosingConcept); }
        if ( tr instanceof NotEmptyRule) { this.checkNotEmptyRule(tr, enclosingConcept); }
        if ( tr instanceof ValidNameRule) { this.checkValidNameRule(tr, enclosingConcept); }
        if ( tr instanceof ExpressionRule) { this.checkExpressionRule(tr, enclosingConcept); }
        if ( tr instanceof IsUniqueRule) { this.checkIsuniqueRule(tr, enclosingConcept); }
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

    private checkValidNameRule(tr: ValidNameRule, enclosingConcept: FreMetaConcept) {
        LOGGER.log("checkValidNameRule");
        // check whether tr.property (if set) is a property of enclosingConcept
        // if not set, set tr.property to the 'self.unitName' property of the enclosingConcept
        if (!!tr.property) {
            this.myExpressionChecker!.checkLangExp(tr.property, enclosingConcept);
        } else {
            let myProp: FreMetaProperty | undefined = undefined;
            for (const i of enclosingConcept.allProperties()) {
                if (i.name === "name") {
                    myProp = i;
                }
            }
            this.runner.nestedCheck({
                check: !!myProp,
                error: `Cannot find property 'name' in ${enclosingConcept.name} ${ParseLocationUtil.location(tr)}.`,
                whenOk: () => {
                    let testedProp: FreMetaProperty = myProp!; // here we can use the non-null assertion operator
                    tr.property = FreLangSelfExp.create(enclosingConcept);
                    tr.property.appliedfeature = FreLangAppliedFeatureExp.create(tr.property, "name", testedProp);
                    // tr.property.appliedfeature.sourceName = "unitName";
                    // tr.property.appliedfeature.referredElement = MetaElementReference.create<FreProperty>(myProp, "FreProperty");
                    tr.property.location = tr.location;
                    tr.property.language = this.language!;
                  }
            });
        }
        // check if found property is of type 'identifier'
        if (!!tr.property) {
            const myProp = tr.property.findRefOfLastAppliedFeature();
            this.runner.simpleCheck((myProp instanceof FreMetaPrimitiveProperty) && myProp.type === FreMetaPrimitiveType.identifier,
                `Validname rule expression '${tr.property.toFreString()}' should have type 'identifier' ${ParseLocationUtil.location(tr.property)}.`);
        }
    }

    private checkEqualsTypeRule(tr: CheckEqualsTypeRule, enclosingConcept: FreMetaConcept) {
        LOGGER.log("checkEqualsTypeRule");
        // check references to types
        this.runner.nestedCheck(
            {
                check: !!tr.type1 && !!tr.type2,
                error: `Typecheck '${equalsTypeName}' should have two types to compare ${ParseLocationUtil.location(tr)}.`,
                whenOk: () => {
                    // LOGGER.log("Checking EqualsTo ( " + tr.type1.makeString() + ", " + tr.type2.makeString() +" )");
                    this.myExpressionChecker!.checkLangExp(tr.type1!, enclosingConcept);
                    this.myExpressionChecker!.checkLangExp(tr.type2!, enclosingConcept);
                }
            });
    }

    private checkConformsTypeRule(tr: CheckConformsRule, enclosingConcept: FreMetaConcept) {
        // check references to types
        this.runner.nestedCheck(
            {
                check: !!tr.type1 && !!tr.type2,
                error: `Typecheck "${conformsToName}" should have two types to compare ${ParseLocationUtil.location(tr)}.`,
                whenOk: () => {
                    this.myExpressionChecker!.checkLangExp(tr.type1!, enclosingConcept);
                    this.myExpressionChecker!.checkLangExp(tr.type2!, enclosingConcept);
                }
            });
    }

    private checkNotEmptyRule(nr: NotEmptyRule, enclosingConcept: FreMetaConcept) {
        // check whether nr.property is a property of enclosingConcept
        // and whether it is a list
        if (nr.property !== null && nr.property !== undefined) {
            this.myExpressionChecker!.checkLangExp(nr.property, enclosingConcept);
            const xx: FreMetaProperty | undefined = nr.property.findRefOfLastAppliedFeature();
            if (!!xx) { // todo check whether we need an extra error message for this case
                this.runner.simpleCheck(xx.isList,
                    `NotEmpty rule '${nr.property.toFreString()}' should refer to a list ${ParseLocationUtil.location(nr)}.`);
            }
        }
    }

    private checkExpressionRule(tr: ExpressionRule, enclosingConcept: FreMetaConcept) {
        LOGGER.log("checkExpressionRule");
        this.runner.nestedCheck(
            {
                check: !!tr.exp1 && !!tr.exp2,
                error: `Expression rule '${tr.toFreString()}' should have two types to compare ${ParseLocationUtil.location(tr)}.`,
                whenOk: () => {
                    // exp1 and exp2 should refer to valid properties or be simple expressions
                    this.myExpressionChecker!.checkLangExp(tr.exp1!, enclosingConcept);
                    this.myExpressionChecker!.checkLangExp(tr.exp2!, enclosingConcept);
                    // types of exp1 and exp2 should be equal
                    if (tr.exp1 instanceof FreLangSimpleExp) {
                        // test if type2 is a number
                    } else if (tr.exp2 instanceof FreLangSimpleExp) {
                        // test if type1 is a number
                    } else {
                        // compare both types
                        const type1 = tr.exp1!.findRefOfLastAppliedFeature()?.type;
                        this.runner.simpleCheck(type1 !== null, `Cannot find the type of ${tr.exp1!.toFreString()} ${ParseLocationUtil.location(tr)}.`);
                        const type2 = tr.exp2!.findRefOfLastAppliedFeature()?.type;
                        this.runner.simpleCheck(type2 !== null, `Cannot find the type of ${tr.exp2!.toFreString()} ${ParseLocationUtil.location(tr)}.`);
                        if (type1 !== null && type2 !== null) {
                            this.runner.simpleCheck(type1 === type2, `Types of expression rule '${tr.toFreString()}' should be equal ${ParseLocationUtil.location(tr)}.`);
                        }
                    }
                }
            });
    }

    private checkIsuniqueRule(tr: IsUniqueRule, enclosingConcept: FreMetaConcept) {
        LOGGER.log("checkIsuniqueRule");
        this.runner.nestedCheck(
            {
                check: !!tr.list && !!tr.listproperty,
                error: `Isunique rule '${tr.toFreString()}' should have a list and a property of that list to compare the elements ${ParseLocationUtil.location(tr)}.`,
                whenOk: () => {
                    // list should refer to a valid property of enclosingConcept
                    this.myExpressionChecker!.checkLangExp(tr.list!, enclosingConcept);
                    const myProp = tr.list!.findRefOfLastAppliedFeature();
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
                                                this.myExpressionChecker!.checkLangExp(tr.listproperty!, myType);
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
        if (!severity.severity) {
            severity.severity = FreErrorSeverity.ToDo;
        }
    }

    private checkValidationMessage(message: ValidationMessage, enclosingConcept: FreMetaClassifier) {
        this.runner.nestedCheck({check: !!message.content && !!message.content[0],
            error: `User defined error message should have a value ${ParseLocationUtil.location(message)}.`,
            whenOk: () => {
                message.content.forEach(part => {
                    // console.log("found " + part.toFreString());
                    if (part instanceof ValidationMessageReference && !!part.expression) {
                        this.myExpressionChecker!.checkLangExp(part.expression, enclosingConcept);
                    }
                });
            }
        });
    }
}
