import { Checker } from "../../utils";
import {
    PiTyperDef
} from "../new-metalanguage";

export class PiTyperCheckerPhase3 extends Checker<PiTyperDef> {
    definition: PiTyperDef;

    check(definition: PiTyperDef): void {
        // MetaLogger.unmuteAllLogs();
        this.definition = definition;
        // LOGGER.log("Checking typer definition phase 2");

        if ( this.language === null || this.language === undefined ) {
            throw new Error(`Typer checker does not known the language.`);
        }

        if (!!definition.classifierSpecs) {
            definition.classifierSpecs.forEach((rule, index) => {
                // this.checkClassifierRule(rule);
            });
        }
    }

    // private checkClassifierRule(rule: PitClassifierRule) {
    //     // LOGGER.log("Checking PitClassifierRule '" + rule.toPiString() + "'");
    //     if (!!rule.__myClassifier.referred) { // error message already done
    //         if (rule instanceof PitInferenceRule) {
    //             this.checkInferenceRule(rule);
    //         } else if (rule instanceof PitConformanceOrEqualsRule) {
    //             this.checkConformanceOrEqualsRule(rule);
    //         } else if (rule instanceof PitLimitedRule) {
    //             this.checkLimitedRule(rule);
    //         }
    //     }
    // }

    // private checkInferenceRule(rule: PitInferenceRule) {
    //     this.checkPitExp(rule.exp, rule);
    //     //
    //     if (!!rule.returnType) {
    //         let conforms: boolean = false;
    //         for (const type of this.definition.types) {
    //             if (this.doTypesConform(rule.returnType, type)) {
    //                 conforms = true;
    //             }
    //         }
    //         this.simpleCheck(conforms, `Inference rule does not result in a valid type ${Checker.location(rule.exp)}.`);
    //     }
    // }

    //
    // private checkStatement(stat: PitStatement, rule: PitClassifierRule) {
    //     // LOGGER.log("Checking checkStatement '" + stat.toPiString() + "'");
    //     this.checkPitExp(stat.left, rule);
    //     this.checkPitExp(stat.right, rule);
    //     // check type conformance of left and right side
    //     // TODO returnType of expression should also include isList, commonSuperType should handle this
    //     const type1: PiClassifier = stat.left.returnType;
    //     const type2: PiClassifier = stat.right.returnType;
    //     this.simpleCheck(
    //         this.doTypesConform(type1, type2),
    //         `Types of '${type1?.name}' and '${type2?.name}' do not conform ${Checker.location(stat)}.`
    //     );
    // }

    // private checkPitExp(exp: PitExp, rule: PitClassifierRule, expectedType?: PiClassifier) {
    //     // LOGGER.log("Checking PitExp '" + exp.toPiString() + "'");
    //     if (!!expectedType) {
    //         const found = this.definition.types.find(t => t === expectedType);
    //         if (!found) {
    //             console.log("All types: " + this.definition.types.map(t => t.name).join(", ") + ", expectedType: " + expectedType.name)
    //             this.simpleCheck(false, `Expected type ${expectedType.name} is not marked 'isType' ${Checker.location(exp)}`);
    //             expectedType = null;
    //         }
    //     }
    //     if (exp instanceof PitAnytypeExp ) {
    //     } else if (exp instanceof PitSelfExp) {
    //     } else if (exp instanceof PitFunctionCallExp) {
    //         this.checkFunctionCallExpression(exp, rule, expectedType);
    //     } else if (exp instanceof PitPropertyCallExp ) {
    //         this.checkPropertyCallExp(exp, rule, expectedType);
    //     } else if (exp instanceof PitLimitedInstanceExp) {
    //     } else if (exp instanceof PitWhereExp) {
    //         this.checkWhereExp(exp, rule);
    //     }
    // }
    //
    // private checkWhereExp(exp: PitWhereExp, rule: PitClassifierRule) {
    //     // LOGGER.log("Checking PitWhereExp '" + exp.toPiString() + "'");
    //     exp.conditions.forEach(cond => {
    //         this.checkStatement(cond, rule);
    //     });
    // }
    //
    // private checkPropertyCallExp(exp: PitPropertyCallExp, rule: PitClassifierRule, expectedType: PiClassifier) {
    //     if (!!exp.source) {
    //         this.checkPitExp(exp.source, rule, expectedType);
    //     }
    // }
    //
    // private checkFunctionCallExpression(exp: PitFunctionCallExp, rule: PitClassifierRule, expectedType: PiClassifier) {
    //     // console.log("checkFunctionCallExpression " + exp?.toPiString());
    // }
    //
    // private doTypesConform(type1: PiClassifier, type2: PiClassifier): boolean {
    //     if (!!type1 && !!type2) { // either of these can be undefined when an earlier error has occurred
    //         if (type1 !== PiClassifier.ANY && type2 !== PiClassifier.ANY) {
    //             const possibles: PiClassifier[] = CommonSuperTypeUtil.commonSuperType([type1, type2]);
    //             return possibles.length > 0;
    //         } else {
    //             return true;
    //         }
    //     }
    //     return false;
    // }
}
