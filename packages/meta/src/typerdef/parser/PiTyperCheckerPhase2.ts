import { Checker, MetaLogger} from "../../utils";
import {
    PiTyperDef
} from "../metalanguage";

const LOGGER = new MetaLogger("PiTyperCheckerPhase2"); //.mute();

// TODO clean up this code
// TODO check on multiple stats with same prop in WhereExp
// For example:
// GenericLiteral {
//     // Set{ 12, 14, 16, 18 }
//     infertype x:GenericType where {
//         // the following results in a compile error, but not in a checker error
//         x.baseType equalsto (typeof(self.content) as Type);
//         x.baseType equalsto typeof(self.content);
//         x.kind equalsto self.kind;
//     };
// }

export class PiTyperCheckerPhase2 extends Checker<PiTyperDef>{
    definition: PiTyperDef;

    check(definition: PiTyperDef): void {
        // MetaLogger.unmuteAllLogs();
        this.definition = definition;
        // LOGGER.log("Checking typer definition phase 2");

        if ( this.language === null || this.language === undefined ) {
            throw new Error(`Typer checker does not known the language.`);
        }

        // definition.typeRoot = this.findTypeRoot(definition);
        // if (!!definition.classifierSpecs) {
        //     definition.classifierSpecs.forEach((rule, index) => {
        //         this.checkClassifierRule(rule);
        //     });
        // }
    }

    // private checkClassifierRule(rule: PitClassifierRule) {
    //     // LOGGER.log("Checking PitClassifierRule '" + rule.toPiString() + "'");
    //     if (!!rule.__myClassifier.referred) { // error message already done
    //         const classifier: PiClassifier = rule.myClassifier;
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
    // }
    //
    // private checkConformanceOrEqualsRule(rule: PitConformanceOrEqualsRule) {
    //     for (const stat of rule.myRules) {
    //         this.checkSingleRule(stat, rule);
    //     }
    // }
    //
    // private checkLimitedRule(rule: PitLimitedRule) {
    //
    // }
    //
    // private checkSingleRule(rule: PitSingleRule, overallRule: PitClassifierRule) {
    //     this.checkPitExp(rule.exp, overallRule);
    // }
    //
    // private checkStatement(stat: PitStatement, rule: PitClassifierRule) {
    //     // LOGGER.log("Checking checkStatement '" + stat.toPiString() + "'");
    //     this.checkPitExp(stat.left, rule);
    //     this.checkPitExp(stat.right, rule);
    //     // TODO make sure that only one of the conditions refers to the 'otherType' of the where clause
    //     // TODO switch conditions such that the part that refers to the 'otherType' of the where clause is always the left one
    // }
    //
    // private doTypesConform(type1: PiClassifier, type2: PiClassifier): boolean {
    //     if (!!type1 && !!type2) { // either of these can be undefined when an earlier error has occurred
    //         if (type1 !== PiClassifier.ANY && type2 !== PiClassifier.ANY) {
    //             const possibles: PiClassifier[] = CommonSuperTypeUtil.commonSuperType([type1, type2]);
    //             return possibles.length > 0;
    //         }
    //     }
    //     return false;
    // }
    //
    // private checkPitExp(exp: PitExp, rule: PitClassifierRule, expectedType?: PiClassifier) {
    //     // LOGGER.log("Checking PitExp '" + exp.toPiString() + "'");
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
    //     this.checkArguments(exp, rule);
    //
    //     const functionName = validFunctionNames.find(name => name === exp.calledFunction);
    //     if (exp.calledFunction === validFunctionNames[0]) { // "typeof"
    //         if (!!expectedType) {
    //             this.checkTypeOfCall(exp, rule, expectedType);
    //         } else {
    //             exp.returnType = this.findTypeOfCall(exp, rule);
    //         }
    //         // TODO see if recursiveness has been implemented correctly
    //     } else if (exp.calledFunction === validFunctionNames[1]) { // "commonSuperType"
    //     } else if (exp.calledFunction === validFunctionNames[2]) { // "ownerOfType"
    //         const argType: PiClassifier = exp.actualParameters[0].returnType;
    //         if (!!argType) {
    //             this.simpleCheck(rule.myClassifier !== argType,
    //                 `Definition of rule for '${argType.name}' is circular ${Checker.location(exp)}.`);
    //             // TODO see if argType really is an owner of rule.myClassifier. Is this possible???
    //         }
    //     }
    // }
    //
    // private checkTypeOfCall(exp: PitFunctionCallExp, rule: PitClassifierRule, expectedType: PiClassifier) {
    //     // console.log("checking " + exp.toPiString());
    //     const argType: PiClassifier = exp.actualParameters[0].returnType;
    //     if (!!argType) {
    //         // this.nestedCheck({
    //         //     check: rule.myClassifier !== argType,
    //         //     error: `Definition of rule for '${argType.name}' is circular ${Checker.location(exp)}.`,
    //         //     whenOk: () => {
    //         //         // find inferenceRules for argType or its subtypes
    //         //         const rules: PitInferenceRule[] = this.findInferenceRulesFor(argType);
    //         //         if (rules.length === 0) {
    //         //             if (this.definition.types.includes(argType)) { // no inferType rule found, but the argument is marked 'isType'
    //         //                 this.simpleCheck(LangUtil.conforms(argType, expectedType),
    //         //                     `Result '${argType.name}' (from ${rule.myClassifier.name}) of '${exp.toPiString()}' does not conform to expected type (${expectedType.name}) ${Checker.location(exp)}.`);
    //         //             } else {
    //         //                 this.simpleCheck(false, `Cannot find inferType rule(s) for '${exp.actualParameters[0].toPiString()}' (of type '${argType.name}') ${Checker.location(exp)}.`);
    //         //             }
    //         //         } else {
    //         //             for (const rule of rules) {
    //         //                 // console.log("\t Does " + rule.returnType.name + " conform to " + expectedType.name + ": " + LangUtil.conforms(rule.returnType, expectedType))
    //         //                 this.simpleCheck(LangUtil.conforms(rule.returnType, expectedType),
    //         //                     `Result '${rule.returnType.name}' (from ${rule.myClassifier.name}) of '${exp.toPiString()}' does not conform to expected type (${expectedType.name}) ${Checker.location(exp)}.`);
    //         //             }
    //         //         }
    //         //     }
    //         // });
    //     }
    // }
    //
    // private findTypeOfCall(exp: PitFunctionCallExp, rule: PitClassifierRule): PiClassifier {
    //     // console.log("checking " + exp.toPiString());
    //     let result: PiClassifier = null;
    //     let argType: PiClassifier = exp.actualParameters[0].returnType;
    //     if (!!argType) {
    //         this.nestedCheck({
    //             check: rule.myClassifier !== argType,
    //             error: `Definition of rule for '${argType.name}' is circular ${Checker.location(exp)}.`,
    //             whenOk: () => {
    //                 const rules: PitInferenceRule[] = this.findInferenceRulesFor(argType);
    //                 if (rules.length === 0) {
    //                     if (this.definition.types.includes(argType)) { // no inferType rule found, but the argument is marked 'isType'
    //                         result = argType;
    //                     } else {
    //                         this.simpleCheck(false, `Cannot find inferType rule(s) for '${exp.actualParameters[0].toPiString()}' (of type '${argType.name}') ${Checker.location(exp)}.`);
    //                     }
    //                 } else {
    //                     const xx: PiClassifier[] = CommonSuperTypeUtil.commonSuperType(rules.map(rule => rule.returnType));
    //                     // console.log("found metatype(s) of typeof: " + xx.map(t => t.name).join(","));
    //                     if (!!xx && xx.length > 0) {
    //                         result = xx[0];
    //                     }
    //                 }
    //             }
    //         });
    //     }
    //     return result;
    // }
    //
    // private findTypesRecusive(argType: PiClassifier): PiClassifier[] {
    //     const result: PiClassifier[] = [];
    //     const rules: PitInferenceRule[] = this.findInferenceRulesFor(argType);
    //     if (rules.length === 0) {
    //         // No inferType rule found, but the argument is marked 'isType'.
    //         // Note that classifiers marked 'isType' may also have an inference rule,
    //         // therefore this check needs to be done after searching for inference rules!
    //         if (this.definition.types.includes(argType)) {
    //             result.push(argType);
    //         }
    //     } else {
    //         const xx: PiClassifier[] = CommonSuperTypeUtil.commonSuperType(rules.map(rule => rule.returnType));
    //         // console.log("found metatype(s) of typeof: " + xx.map(t => t.name).join(","));
    //         if (!!xx && xx.length > 0) {
    //             result.push(...xx);
    //             for (const t of xx){
    //                 const extra: PiClassifier[] = this.findTypesRecusive(t);
    //                 if (!!extra && extra.length > 0) {
    //                     result.push(...extra);
    //                 }
    //             }
    //         }
    //     }
    //     return result;
    // }
    //
    // private findInferenceRulesFor(argType: PiClassifier): PitInferenceRule[] {
    //     const result: PitInferenceRule[] = [];
    //     const inferRule = this.definition.classifierSpecs.find(rule => rule.myClassifier === argType);
    //     if (!!inferRule && inferRule instanceof PitInferenceRule) {
    //         result.push(inferRule);
    //     } else { // not found, search for rules on subtypes of argType
    //         const subtypes: PiClassifier[] = [];
    //         if (argType instanceof PiConcept) {
    //             ListUtil.addListIfNotPresent(subtypes, argType.allSubConceptsRecursive());
    //         } else if (argType instanceof PiInterface) {
    //             ListUtil.addListIfNotPresent(subtypes, argType.allSubInterfacesRecursive());
    //         }
    //         for (const subtype of subtypes) {
    //             // console.log("searching for rule on subtype: " + subtype.name)
    //             const foundRule = this.definition.classifierSpecs.find(rule => rule.myClassifier === subtype);
    //             if (!!foundRule && foundRule instanceof PitInferenceRule) {
    //                 result.push(foundRule);
    //             }
    //         }
    //     }
    //     // TODO resursiveness!!! more than second layer
    //     // for (const r of result) {
    //     //     const secondLayer = this.findInferenceRulesFor(r.returnType);
    //     //     if (secondLayer.length > 0) {
    //     //         // console.log("found second layer: " + secondLayer.map(e => e.myClassifier.name).join(", "));
    //     //         secondLayer.forEach(e => {
    //     //             ListUtil.addListIfNotPresent(result, this.findInferenceRulesFor(e.myClassifier));
    //     //         });
    //     //     }
    //     // }
    //     return result;
    // }
    //
    // private checkArguments(exp: PitFunctionCallExp, rule: PitClassifierRule) {
    //     exp.actualParameters.forEach(p => {
    //             this.checkPitExp(p, rule);
    //         }
    //     );
    // }
    //
    // private findTypeRoot(definition: PiTyperDef): PiClassifier {
    //     const possibles: PiClassifier[] = CommonSuperTypeUtil.commonSuperType(definition.types);
    //     if (possibles.length === 1) {
    //         return possibles[0];
    //     } else {
    //         return PiClassifier.ANY;
    //     }
    // }
}
