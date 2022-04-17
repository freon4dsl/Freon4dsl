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
        // sort the types such that any type comes before its super type
        const sortedTypes = NewTyperGenUtils.sortTypes(typerDef.types);
        // make sub-entries for each rule defined for an ast-element
        let astSubRules: string[] = [];
        sortedTypes.forEach( type => {
            // find the equalsRule, if present
            const foundRule: PitEqualsRule = equalsRules.find(conRule => conRule.owner.myClassifier === type);
            if (!!foundRule) {
                const myType: string = Names.classifier(type);
                astSubRules.push(`if (this.metaTypeOk((${leftVarName} as AstType).astElement, "${myType}")) {
                    const elem1: ${myType} = (${leftVarName} as AstType).astElement as ${myType};
                    const elem2: ${myType} = (${rightVarName} as AstType).astElement as ${myType};
                    if (!!elem1 && !!elem2) {
                        ${this.makeEqualsForExp(foundRule.exp, "elem1", "elem2", false, imports)};
                    }
                }`);
            }
        });
        // combine the sub-entries into one
        allRules.push(`if (${leftVarName}.$typename === "AstType") {
                        ${astSubRules.map(r => r).join(" else ")} ${astSubRules.length > 0 ? `else {` : ``}
                            return (${leftVarName} as AstType).astElement === (${rightVarName} as AstType).astElement;
                        ${astSubRules.length > 0 ? `}` : ``}
                } `)
        // make an entry for each rule that is not defined for an ast-element
        equalsRules.map(conRule => {
            if (NewTyperGenUtils.isType(conRule.owner.myClassifier)) {
                allRules.push(`if (${leftVarName}.$typename === "${Names.classifier(conRule.owner.myClassifier)}") {
                    ${this.makeEqualsForExp(conRule.exp, leftVarName, rightVarName, true, imports)};
                }`);
            }
        });
        return allRules.map(r => r).join(" else ");
    }

    private makeEqualsForExp(exp: PitExp, leftVarName: string, rightVarName: string, varIsType: boolean, imports: PiClassifier[]): string {
        if (exp instanceof PitWhereExp) {
            const allConditions: string[] = [];
            let returnStr: string = '';
            exp.sortedConditions().forEach((cond, index) => {
                const leftStr: string = NewTyperGenUtils.makeExpAsElement(cond.left, leftVarName, varIsType, imports);
                const rightStr: string = NewTyperGenUtils.makeExpAsElement(cond.right, rightVarName, varIsType, imports);
                if (NewTyperGenUtils.isType(cond.left.returnType)) {
                    allConditions.push(`const condition${index+1}: boolean = this.mainTyper.equals(${leftStr}, ${rightStr});`)
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
