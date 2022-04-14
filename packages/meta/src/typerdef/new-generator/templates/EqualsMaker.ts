import {
    PitExp,
    PitWhereExp,
    PiTyperDef
} from "../../new-metalanguage";
import { Names } from "../../../utils";
import { NewTyperGenUtils } from "./NewTyperGenUtils";
import { PitEqualsRule } from "../../new-metalanguage/PitEqualsRule";
import { PiClassifier } from "../../../languagedef/metalanguage";

export class EqualsMaker {
    typerdef: PiTyperDef = null;

    public makeEqualsType(typerDef: PiTyperDef, leftVarName: string, rightVarName: string, imports: PiClassifier[]): string {
        NewTyperGenUtils.types = typerDef.types;
        this.typerdef = typerDef;
        let allRules: string[] = [];
        // find all equals rules
        const equalsRules: PitEqualsRule[] = [];
        typerDef.classifierSpecs.forEach(spec => {
            equalsRules.push(...spec.rules.filter(r => r instanceof PitEqualsRule));
        });
        // make an entry for each rule
        equalsRules.map(conRule => {
            const isType: boolean = typerDef.types.includes(conRule.owner.myClassifier);
            allRules.push(`if (${leftVarName}.internal.piLanguageConcept() === "${Names.classifier(conRule.owner.myClassifier)}") {
                ${this.makeEqualsForExp(conRule.exp, leftVarName, rightVarName, isType, imports)};
            }`);
            });
        return allRules.map(r => r).join(" else ");
    }

    private makeEqualsForExp(exp: PitExp, leftVarName: string, rightVarName: string, isType: boolean, imports: PiClassifier[]): string {
        if (exp instanceof PitWhereExp) {
            const allConditions: string[] = [];
            let returnStr: string = '';
            // exp.sortedConditions().forEach((cond, index) => {
            exp.conditions.forEach((cond, index) => {
                let leftStr: string;
                let rightStr: string;
                if (!isType) {
                    leftStr = NewTyperGenUtils.makeExpAsElement(cond.left, leftVarName, imports);
                    rightStr = NewTyperGenUtils.makeExpAsElement(cond.right, rightVarName, imports);
                } else {
                    leftStr = NewTyperGenUtils.makeExpAsElement(cond.left, leftVarName + ".internal", imports);
                    rightStr = NewTyperGenUtils.makeExpAsElement(cond.right, rightVarName + ".internal", imports);
                }
                if (this.typerdef.types.includes(cond.left.returnType)) {
                    allConditions.push(`const condition${index+1}: boolean = this.mainTyper.equalsType(${leftStr}, ${rightStr});`)
                } else {
                    allConditions.push(`const condition${index+1}: boolean = ${leftStr} === ${rightStr};`);
                }
                if (index > 0) {
                    returnStr += ` && condition${index+1}`;
                } else {
                    returnStr = `condition${index+1}`
                }
            });
            return `
                    ${allConditions.map(cond => cond).join("\n\t")}
                    return ${returnStr};`;
        }
        return '';
    }
}
