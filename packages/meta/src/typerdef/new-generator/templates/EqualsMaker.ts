import {
    PitEquals,
    PitExp, PitPropertyCallExp,

    PitWhereExp,
    PiTyperDef
} from "../../new-metalanguage";
import { Names } from "../../../utils";
import { TyperGenUtils } from "./TyperGenUtils";

export class EqualsMaker {
    public makeEqualsType(typerdef: PiTyperDef, leftVarName: string, rightVarName: string, imports: string[]): string {
        // if (!!typerdef.classifierRules) {
        //     // make entry for all concepts that have an inferType rule
        //     let rules: PitConformanceOrEqualsRule[] = typerdef.classifierRules.filter(rule =>
        //         rule instanceof PitConformanceOrEqualsRule) as PitConformanceOrEqualsRule[];
        //     const allRules: string[] = [];
        //     for (const rule of rules) {
        //         const equalsRule: PitSingleRule = rule.myRules.find(single => single.kind === PitStatementKind.EQUALS);
        //         let conditionStr: string = '';
        //         if (!!equalsRule) {
        //             conditionStr = this.makeEqualsForExp(typerdef, equalsRule.exp, leftVarName, rightVarName, imports);
        //         }
        //         allRules.push( `if (${leftVarName}.piLanguageConcept() === "${Names.classifier(rule.myClassifier)}") {
        //             ${conditionStr};
        //         }`);
        //     }
        //     return allRules.map(r => r).join(" else ");
        // }
        return '';
    }

    // private makeEqualsForExp(typerdef: PiTyperDef, exp: PitExp, leftVarName: string, rightVarName: string, imports: string[]) {
    //     // console.log('Making equals for ' + exp.constructor.name)
    //     if (exp instanceof PitEquals) {
    //         return `return ${TyperGenUtils.makeTypeScriptForExp(exp.left, leftVarName, imports)} === ${TyperGenUtils.makeTypeScriptForExp(exp.right, rightVarName, imports)}`;
    //     } else if (exp instanceof PitWhereExp) {
    //         const allConditions: string[] = [];
    //         let returnStr: string = '';
    //         exp.sortedConditions().forEach((cond, index) => {
    //             const leftStr = `(${leftVarName} as ${exp.otherType.type.name}).${TyperGenUtils.makeTypeScriptForExp(cond.left, leftVarName, imports, true)}`;
    //             const rightStr = TyperGenUtils.makeTypeScriptForExp(cond.right, rightVarName, imports);
    //             if (typerdef.types.includes(cond.left.returnType)) {
    //                 allConditions.push(`const condition${index+1}: boolean = this.mainTyper.equalsType(${leftStr}, ${rightStr});`)
    //             } else {
    //                 allConditions.push(`const condition${index+1}: boolean = ${leftStr} === ${rightStr};`);
    //             }
    //             if (index > 0) {
    //                 returnStr += ` && condition${index+1}`;
    //             } else {
    //                 returnStr = `condition${index+1}`
    //             }
    //         });
    //         return `
    //         ${allConditions.map(cond => cond).join("\n\t")}
    //         return ${returnStr};`;
    //     } else {
    //         return `return ${TyperGenUtils.makeTypeScriptForExp(exp, leftVarName, imports)}`;
    //     }
    // }
}
