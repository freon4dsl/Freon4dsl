import { FreErrorSeverity, MetaLogger } from '../../utils/no-dependencies/index.js';
import { Checker, CheckRunner, ParseLocationUtil } from '../../utils/basic-dependencies/index.js';
import { ReferenceResolver } from '../../languagedef/checking/ReferenceResolver.js';
import {
    FreMetaClassifier,
    FreMetaLanguage,
    FreMetaPrimitiveProperty,
    FreMetaProperty, nameForSelf
} from '../../languagedef/metalanguage/index.js';
import {
    CheckConformsRule,
    CheckEqualsTypeRule,
    ClassifierRuleSet,
    ExpressionRule,
    IsUniqueRule,
    NotEmptyRule,
    ValidatorDef,
    ValidationMessage,
    ValidationMessageReference,
    ValidationRule,
    ValidationSeverity,
    ValidNameRule,
} from "./ValidatorDefLang.js";
import { FreMetaPrimitiveType } from "../../languagedef/metalanguage/index.js";
import { FreLangExpressionCheckerNew } from '../../langexpressions/checking/FreLangExpressionCheckerNew.js';
import { FreLangSimpleExpNew, FreVarExp } from '../../langexpressions/metalanguage/index.js';
import { isNullOrUndefined } from '../../utils/file-utils/index.js';

const LOGGER: MetaLogger = new MetaLogger("ValidatorChecker");
const equalsTypeName: string = "equalsType";
const conformsToName: string = "conformsTo";

// 'severityLevels' should mirror the levels in FreValidator/FreErrorSeverity, but
// all names should be in lowercase
const severityLevels: string[] = ["error", "warning", "hint", "improvement", "todo", "info"];

export class ValidatorChecker extends Checker<ValidatorDef> {
    myExpressionChecker: FreLangExpressionCheckerNew | undefined;
    // @ts-ignore runner gets its value in the 'check' method
    runner: CheckRunner;

    constructor(language: FreMetaLanguage | undefined) {
        super(language);
    }

    public check(definition: ValidatorDef): void {
        LOGGER.log("Checking validator Definition from '" + definition.location.filename + "'");

        if (this.language === null || this.language === undefined) {
            throw new Error(
                `Validator definition checker does not known the language ${ParseLocationUtil.location(definition)}.`,
            );
        } else {
            this.runner = new CheckRunner(this.errors, this.warnings);
            this.myExpressionChecker = new FreLangExpressionCheckerNew(this.language);
            // in all private methods that are called by method 'check' we can assume that 'this.myExpressionChecker !== undefined'
        }

        definition.classifierRules.forEach((rule) => {
            this.checkConceptRule(rule);
        });
        this.errors = this.errors.concat(this.myExpressionChecker.errors);
    }

    private checkConceptRule(rule: ClassifierRuleSet): void {
        LOGGER.log("Check concept rule " + rule.classifierRef?.name);
        if (!!rule.classifierRef) {
            ReferenceResolver.resolveClassifierReference(rule.classifierRef, this.runner, this.language!);

            const enclosingConcept: FreMetaClassifier | undefined = rule.classifier;
            if (!!enclosingConcept) { // error given by ReferenceResolver
                rule.rules.forEach((tr) => {
                    this.checkRule(tr, enclosingConcept!);
                });
            }
        }
    }

    private checkRule(tr: ValidationRule, enclosingConcept: FreMetaClassifier) {
        if (tr instanceof CheckEqualsTypeRule) {
            this.checkEqualsTypeRule(tr, enclosingConcept);
        }
        if (tr instanceof CheckConformsRule) {
            this.checkConformsTypeRule(tr, enclosingConcept);
        }
        if (tr instanceof NotEmptyRule) {
            this.checkNotEmptyRule(tr, enclosingConcept);
        }
        if (tr instanceof ValidNameRule) {
            this.checkValidNameRule(tr, enclosingConcept);
        }
        if (tr instanceof ExpressionRule) {
            this.checkExpressionRule(tr, enclosingConcept);
        }
        if (tr instanceof IsUniqueRule) {
            this.checkIsUniqueRule(tr, enclosingConcept);
        }
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

    private checkValidNameRule(rule: ValidNameRule, enclosingConcept: FreMetaClassifier) {
        LOGGER.log("checkValidNameRule");
        // check whether rule.property (if set) is a property of enclosingConcept
        // if not set, set rule.property to the 'self.name' property of the enclosingConcept
        if (!!rule.property) {
            this.myExpressionChecker!.checkLangExp(rule.property, enclosingConcept, this.runner);
        } else {
            // no property in the .valid file found, so add an expression that refers to the 'name' property

            // 1. try to find the name property
            let myProp: FreMetaProperty | undefined = undefined;
            for (const i of enclosingConcept.allProperties()) {
                if (i.name === "name") {
                    myProp = i;
                }
            }
            // 2. check the existence of name property
            this.runner.nestedCheck({
                check: !!myProp,
                error: `Cannot find property 'name' in ${enclosingConcept.name} ${ParseLocationUtil.location(rule)}.`,
                whenOk: () => {
                    let testedProp: FreMetaProperty = myProp!; // here we can use the non-null assertion operator
                    // 3. create the expression
                    const yy = new FreVarExp();
                    yy.name = 'name';
                    yy.referredProperty = testedProp;
                    yy.referredClassifier = testedProp.type;
                    yy.location = rule.location;
                    rule.property = yy;
                },
            });
        }
        // check if found property is of type 'identifier'
        const lastExp = rule.property?.getLastExpression();
        if (!isNullOrUndefined(lastExp) && lastExp instanceof FreVarExp) {
            const myProp = lastExp.referredProperty;
            this.runner.simpleCheck(
                myProp instanceof FreMetaPrimitiveProperty && myProp.type === FreMetaPrimitiveType.identifier,
                `Valid name rule expression '${rule.property!.toFreString()}' should have type 'identifier' ${ParseLocationUtil.location(rule.property)}.`,
            );
        }
    }

    private checkEqualsTypeRule(tr: CheckEqualsTypeRule, enclosingConcept: FreMetaClassifier) {
        LOGGER.log("checkEqualsTypeRule " + tr.toFreString());
        // check references to types
        this.runner.nestedCheck({
            check: !isNullOrUndefined(tr.type1Exp) && !isNullOrUndefined(tr.type2Exp),
            error: `Type check '${equalsTypeName}' should have two types to compare ${ParseLocationUtil.location(tr)}.`,
            whenOk: () => {
                this.myExpressionChecker!.checkLangExp(tr.type1Exp!, enclosingConcept, this.runner);
                this.myExpressionChecker!.checkLangExp(tr.type2Exp!, enclosingConcept, this.runner);
            },
        });
    }

    private checkConformsTypeRule(tr: CheckConformsRule, enclosingConcept: FreMetaClassifier) {
        LOGGER.log("checkConformsTypeRule " + tr.toFreString());
        // check references to types
        this.runner.nestedCheck({
            check: !isNullOrUndefined(tr.type1Exp) && !isNullOrUndefined(tr.type2Exp),
            error: `Type check "${conformsToName}" should have two types to compare ${ParseLocationUtil.location(tr)}.`,
            whenOk: () => {
                this.myExpressionChecker!.checkLangExp(tr.type1Exp!, enclosingConcept, this.runner);
                this.myExpressionChecker!.checkLangExp(tr.type2Exp!, enclosingConcept, this.runner);
            },
        });
    }

    private checkNotEmptyRule(nr: NotEmptyRule, enclosingConcept: FreMetaClassifier) {
        LOGGER.log("checkNotEmptyRule " + nr.toFreString());
        // check whether nr.property is a property of enclosingConcept
        // and whether it is a list
        if (!isNullOrUndefined(nr.property)) {
            this.myExpressionChecker!.checkLangExp(nr.property, enclosingConcept, this.runner);
            this.runner.simpleCheck(
              nr.property.getLastExpression().getIsList(),
              `NotEmpty rule '${nr.property.toFreString()}' should refer to a list ${ParseLocationUtil.location(nr)}.`,
            );
        }
    }

    private checkExpressionRule(rule: ExpressionRule, enclosingConcept: FreMetaClassifier) {
        LOGGER.log("checkExpressionRule " + rule.toFreString());
        this.runner.nestedCheck({
            check: !!rule.exp1 && !!rule.exp2,
            error: `Expression rule '${rule.toFreString()}' should have two types to compare ${ParseLocationUtil.location(rule)}.`,
            whenOk: () => {
                // exp1 and exp2 should refer to valid properties or be simple expressions
                this.myExpressionChecker!.checkLangExp(rule.exp1!, enclosingConcept, this.runner);
                this.myExpressionChecker!.checkLangExp(rule.exp2!, enclosingConcept, this.runner);
                const type1 = rule.exp1!.getResultingClassifier();
                const type2 = rule.exp2!.getResultingClassifier();
                // types of exp1 and exp2 should conform
                if (rule.exp1 instanceof FreLangSimpleExpNew) {
                    // test if type2Exp is a number
                    this.runner.simpleCheck(
                      type2?.name === 'number',
                      `Type of '${rule.exp2!.toFreString()}' does not conform to 'number' ${ParseLocationUtil.location(rule)}.`
                    );
                } else if (rule.exp2 instanceof FreLangSimpleExpNew) {
                    // test if type1Exp is a number
                    this.runner.simpleCheck(
                      type1?.name === 'number',
                      `Type of '${rule.exp1!.toFreString()}' does not conform to 'number' ${ParseLocationUtil.location(rule)}.`
                    );
                } else {
                    // compare both types
                    this.runner.simpleCheck(
                        !isNullOrUndefined(type1),
                        `Cannot find the type of '${rule.exp1!.toFreString()}' ${ParseLocationUtil.location(rule)}.`,
                    );
                    this.runner.simpleCheck(
                      !isNullOrUndefined(type2),
                        `Cannot find the type of '${rule.exp2!.toFreString()}' ${ParseLocationUtil.location(rule)}.`,
                    );
                    if (!isNullOrUndefined(type1) && !isNullOrUndefined(type2)) {
                        // todo use metatype conform here
                        this.runner.simpleCheck(
                            type1 === type2,
                            `Types of expression rule '${rule.toFreString()}' should be equal ${ParseLocationUtil.location(rule)}.`,
                        );
                    }
                }
            },
        });
    }

    private checkIsUniqueRule(tr: IsUniqueRule, enclosingConcept: FreMetaClassifier) {
        LOGGER.log("checkIsUniqueRule");
        this.runner.nestedCheck({
            check: !!tr.listExp && !!tr.listpropertyExp,
            error: `IsUnique rule '${tr.toFreString()}' should have a list and a property of that list to compare the elements ${ParseLocationUtil.location(tr)}.`,
            whenOk: () => {
                // list should refer to a valid property of enclosingConcept
                this.myExpressionChecker!.checkLangExp(tr.listExp!, enclosingConcept, this.runner);
                const lastExp = tr.listExp!.getLastExpression();
                this.runner.nestedCheck({
                    check: lastExp instanceof FreVarExp,
                    error: `IsUnique rule can only be applied to a property ${ParseLocationUtil.location(tr.listExp)}.`,
                    whenOk: () => {
                        const myProp = (lastExp as FreVarExp).referredProperty;
                        if (!!myProp) {
                            // error message provided by checkLangExp
                            this.runner.nestedCheck({
                                check: myProp.isList,
                                error: `IsUnique rule cannot be applied to a property that is not a list (${myProp.name}) ${ParseLocationUtil.location(tr.listExp)}.`,
                                whenOk: () => {
                                    const myType = myProp.type;
                                    this.runner.nestedCheck({
                                        check: !!myType,
                                        error: `List ${myProp.name} does not have a valid type ${ParseLocationUtil.location(tr.listExp)}.`,
                                        whenOk: () => {
                                            this.runner.simpleWarning(
                                                !(tr.listpropertyExp instanceof FreVarExp && tr.listpropertyExp.name === nameForSelf),
                                                `Note that '${nameForSelf}' refers to list elements, i.e. instances of ${myType.name} ${ParseLocationUtil.location(tr.listExp)}.`
                                            );
                                            // now check the property of the list against the type of the elements in the list
                                            this.myExpressionChecker!.checkLangExp(tr.listpropertyExp!, myType, this.runner);
                                        },
                                    });
                                },
                            });
                        }
                    }
                })
            },
        });
    }

    private checkAndFindSeverity(severity: ValidationSeverity) {
        const myValue = severity.value.toLowerCase();
        this.runner.nestedCheck({
            check: severityLevels.includes(myValue),
            error:
                `Severity '${severity.value}' should equal (disregarding case) one of the values ` +
                `(${severityLevels.map((elem) => `${elem}`).join(", ")}) ${ParseLocationUtil.location(severity)}.`,
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
                    case "hint": {
                        severity.severity = FreErrorSeverity.Hint;
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
                    case "warning": {
                        severity.severity = FreErrorSeverity.Warning;
                        break;
                    }
                    default: {
                        severity.severity = FreErrorSeverity.ToDo;
                    }
                }
            },
        });
        if (!severity.severity) {
            severity.severity = FreErrorSeverity.ToDo;
        }
    }

    private checkValidationMessage(message: ValidationMessage, enclosingConcept: FreMetaClassifier) {
        this.runner.nestedCheck({
            check: !!message.content && !!message.content[0],
            error: `User defined error message should have a value ${ParseLocationUtil.location(message)}.`,
            whenOk: () => {
                message.content.forEach((part) => {
                    if (part instanceof ValidationMessageReference && !!part.expression) {
                        this.myExpressionChecker!.checkLangExp(part.expression, enclosingConcept, this.runner);
                    }
                });
            },
        });
    }
}
