import { Checker, LangUtil, MetaLogger } from "../../utils";
import {
    PitAnytypeExp,
    PitClassifierRule,
    PitConformanceOrEqualsRule, PitExp, PitFunctionCallExp,
    PitInferenceRule, PitInstanceExp,
    PitLimitedRule, PitPropertyCallExp, PitSelfExp, PitSingleRule, PitStatement, PitWhereExp,
    PiTyperDef
} from "../new-metalanguage";
import { PiClassifier, PiConcept, PiElementReference, PiInterface, PiLimitedConcept, PiProperty } from "../../languagedef/metalanguage";
import { CommonSuperTypeUtil } from "../../utils/common-super/CommonSuperTypeUtil";
import { validFunctionNames } from "./NewPiTyperChecker";
import { PitExpWithType } from "../new-metalanguage/expressions/PitExpWithType";
import { ParserGenUtil } from "../../parsergen/parserTemplates/ParserGenUtil";

const LOGGER = new MetaLogger("PiTyperCheckerPhase2"); //.mute();

export class PiTyperCheckerPhase2 extends Checker<PiTyperDef>{
    definition: PiTyperDef;

    check(definition: PiTyperDef): void {
        // MetaLogger.unmuteAllLogs();
        this.definition = definition;
        // LOGGER.log("Checking typer definition phase 2");

        if ( this.language === null || this.language === undefined ) {
            throw new Error(`Typer checker does not known the language.`);
        }

        definition.typeRoot = this.findTypeRoot(definition);
        if (!!definition.classifierRules) {
            definition.classifierRules.forEach((rule, index) => {
                this.checkClassifierRule(rule);
            });
        }
    }

    private checkClassifierRule(rule: PitClassifierRule) {
        // LOGGER.log("Checking PitClassifierRule '" + rule.toPiString() + "'");
        if (!!rule.__myClassifier.referred) { // error message already done
            const classifier: PiClassifier = rule.myClassifier;
            if (rule instanceof PitInferenceRule) {
                this.checkInferenceRule(rule);
            } else if (rule instanceof PitConformanceOrEqualsRule) {
                this.checkConformanceOrEqualsRule(rule);
            } else if (rule instanceof PitLimitedRule) {
                this.checkLimitedRule(rule);
            }
        }
    }

    private checkInferenceRule(rule: PitInferenceRule) {
        this.checkPitExp(rule.exp, rule);
    }

    private checkConformanceOrEqualsRule(rule: PitConformanceOrEqualsRule) {
        for (const stat of rule.myRules) {
            this.checkSingleRule(stat, rule);
        }
    }

    private checkLimitedRule(rule: PitLimitedRule) {
        for (const stat of rule.statements) {
            this.checkStatement(stat, rule);
        }
    }

    private checkSingleRule(rule: PitSingleRule, overallRule: PitClassifierRule) {
        this.checkPitExp(rule.exp, overallRule);
    }

    private checkStatement(stat: PitStatement, rule: PitClassifierRule) {
        // LOGGER.log("Checking checkStatement '" + stat.toPiString() + "'");
        this.checkPitExp(stat.left, rule);
        this.checkPitExp(stat.right, rule);
        // check type conformance of left and right side
        // TODO returnType of expression should also include isList and isReferred, commonSuperType should handle these
        const type1: PiClassifier = stat.right.returnType;
        const type2: PiClassifier = stat.left.returnType;
        if (!!type1 && !!type2) { // either of these can be undefined when an earlier error has occurred
            if (type1 !== PiClassifier.ANY && type2 !== PiClassifier.ANY) {
                const possibles: PiClassifier[] = CommonSuperTypeUtil.commonSuperType([type1, type2]);
                this.simpleCheck(
                    possibles.length > 0,
                    `Types of '${type1.name}' and '${type2.name}' do not conform ${Checker.location(stat)}.`
                );
            }
        }
    }

    private checkPitExp(exp: PitExp, rule: PitClassifierRule, expectedType?: PiClassifier) {
        // LOGGER.log("Checking PitExp '" + exp.toPiString() + "'");
        if (exp instanceof PitAnytypeExp ) {
        } else if (exp instanceof PitSelfExp) {
        } else if (exp instanceof PitExpWithType) {
            this.checkPitExp(exp.inner, rule, exp.expectedType);
        } else if (exp instanceof PitFunctionCallExp) {
            this.checkFunctionCallExpression(exp, rule, expectedType);
        } else if (exp instanceof PitPropertyCallExp ) {
            this.checkPropertyCallExp(exp, rule, expectedType);
        } else if (exp instanceof PitInstanceExp) {
        } else if (exp instanceof PitWhereExp) {
            this.checkWhereExp(exp, rule);
        }
    }

    private checkWhereExp(exp: PitWhereExp, rule: PitClassifierRule) {
        // LOGGER.log("Checking PitWhereExp '" + exp.toPiString() + "'");
        exp.conditions.forEach(cond => {
            this.checkStatement(cond, rule);
        });
    }

    private checkPropertyCallExp(exp: PitPropertyCallExp, rule: PitClassifierRule, expectedType: PiClassifier) {
        if (!!exp.source) {
            this.checkPitExp(exp.source, rule, expectedType);
        }
    }

    private checkFunctionCallExpression(exp: PitFunctionCallExp, rule: PitClassifierRule, expectedType: PiClassifier) {
        console.log("checkFunctionCallExpression " + exp?.toPiString());
        this.checkArguments(exp, rule);

        const functionName = validFunctionNames.find(name => name === exp.calledFunction);
        if (exp.calledFunction === validFunctionNames[0]) { // "typeof"
            this.nestedCheck({
                check: !!expectedType,
                error: `Function '${validFunctionNames[0]}' should have an expected type ${Checker.location(exp)}.`,
                whenOk: () => {
                    this.checkTypeOfCall(exp, rule, expectedType);
                }
            });
        } else if (exp.calledFunction === validFunctionNames[1]) { // "commonSuperType"
        } else if (exp.calledFunction === validFunctionNames[2]) { // "ownerOfType"
            const argType: PiClassifier = exp.actualParameters[0].returnType;
            if (!!argType) {
                this.simpleCheck(rule.myClassifier !== argType,
                    `Definition of rule for '${argType.name}' is circular ${Checker.location(exp)}.`);
                // TODO see if argType really is an owner of rule.myClassifier. Is this possible???
            }
        }
    }

    private checkTypeOfCall(exp: PitFunctionCallExp, rule: PitClassifierRule, expectedType: PiClassifier) {
        // console.log("checking " + exp.toPiString());
        const argType: PiClassifier = exp.actualParameters[0].returnType;
        if (!!argType) {
            this.nestedCheck({
                check: rule.myClassifier !== argType,
                error: `Definition of rule for '${argType.name}' is circular ${Checker.location(exp)}.`,
                whenOk: () => {
                    // find inferenceRules for argType or its subtypes
                    const rules: PitInferenceRule[] = this.findInferenceRulesFor(argType);
                    for (const rule of rules) {
                        this.simpleCheck(LangUtil.conforms(rule.returnType, expectedType),
                            `Result '${rule.returnType.name}' (from ${rule.myClassifier.name}) of '${exp.toPiString()}' does not conform to expected type (${expectedType.name}) ${Checker.location(exp)}.`);
                    }
                    if (rules.length === 0) {
                        this.simpleCheck(false, `Cannot find inferType rule(s) for '${argType.name}' ${Checker.location(exp)}.`);
                    }
                }
            });
        }
    }

    private findInferenceRulesFor(argType: PiClassifier): PitInferenceRule[] {
        const result: PitInferenceRule[] = [];
        const inferRule = this.definition.classifierRules.find(rule => rule.myClassifier === argType);
        if (!!inferRule && inferRule instanceof PitInferenceRule) {
            result.push(inferRule);
        } else { // not found, search for rules on subtypes of argType
            const subtypes: PiClassifier[] = [];
            if (argType instanceof PiConcept) {
                ParserGenUtil.addListIfNotPresent(subtypes, argType.allSubConceptsRecursive());
            } else if (argType instanceof PiInterface) {
                ParserGenUtil.addListIfNotPresent(subtypes, argType.allSubInterfacesRecursive());
            }
            for (const subtype of subtypes) {
                // console.log("searching for rule on subtype: " + subtype.name)
                const foundRule = this.definition.classifierRules.find(rule => rule.myClassifier === subtype);
                if (!!foundRule && foundRule instanceof PitInferenceRule) {
                    result.push(foundRule);
                }
            }
        }
        return result;
    }

    private checkArguments(exp: PitFunctionCallExp, rule: PitClassifierRule) {
        exp.actualParameters.forEach(p => {
                this.checkPitExp(p, rule);
            }
        );
    }

    private findTypeRoot(definition: PiTyperDef): PiClassifier {
        const possibles: PiClassifier[] = CommonSuperTypeUtil.commonSuperType(definition.types);
        if (possibles.length === 1) {
            return possibles[0];
        } else {
            return PiClassifier.ANY;
        }
    }
}
