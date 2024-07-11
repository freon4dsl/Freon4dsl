import {
    FretExp,
    FretWhereExp,
    TyperDef
} from "../../metalanguage";
import { Names, GenerationUtil } from "../../../utils";
import { FreTyperGenUtils } from "./FreTyperGenUtils";
import { FretEqualsRule } from "../../metalanguage/FretEqualsRule";
import { FreMetaClassifier } from "../../../languagedef/metalanguage";

/**
 * This class generates the code for the 'equalsto' entries in the .type file.
 */
export class FreTypeEqualsMaker {
    typerdef: TyperDef | undefined = undefined;

    public makeEqualsType(typerDef: TyperDef, leftVarName: string, rightVarName: string, imports: FreMetaClassifier[]): string {
        FreTyperGenUtils.types = typerDef.types;
        this.typerdef = typerDef;
        const allRules: string[] = [];
        // find all equals rules
        const equalsRules: FretEqualsRule[] = [];
        typerDef.classifierSpecs.forEach(spec => {
            equalsRules.push(...spec.rules.filter(r => r instanceof FretEqualsRule));
        });
        // sort the types such that any type comes before its super type
        const sortedTypes = GenerationUtil.sortClassifiers(typerDef.types);
        // make sub-entries for each rule defined for an ast-element
        const astSubRules: string[] = [];
        sortedTypes.forEach( type => {
            // find the equalsRule, if present
            const foundRule: FretEqualsRule | undefined = equalsRules.find(conRule => conRule.owner.myClassifier === type);
            if (!!foundRule) {
                const myType: string = Names.classifier(type);
                astSubRules.push(`if (${Names.FreLanguage}.getInstance().metaConformsToType((${leftVarName} as AstType).astElement, "${myType}")) {
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
                } `);
        // make an entry for each rule that is not defined for an ast-element
        equalsRules.map(conRule => {
            if (!!conRule.owner.myClassifier && FreTyperGenUtils.isType(conRule.owner.myClassifier)) {
                allRules.push(`if (${leftVarName}.$typename === "${Names.classifier(conRule.owner.myClassifier)}") {
                    ${this.makeEqualsForExp(conRule.exp, leftVarName, rightVarName, true, imports)};
                }`);
            }
        });
        return allRules.map(r => r).join(" else ");
    }

    private makeEqualsForExp(exp: FretExp, leftVarName: string, rightVarName: string, varIsType: boolean, imports: FreMetaClassifier[]): string {
        if (exp instanceof FretWhereExp) {
            const allConditions: string[] = [];
            let returnStr: string = "";
            exp.conditions.forEach((cond, index) => {
                const leftStr: string = FreTyperGenUtils.makeExpAsElement(cond.left, leftVarName, varIsType, imports);
                const rightStr: string = FreTyperGenUtils.makeExpAsElement(cond.right, rightVarName, varIsType, imports);
                if (!!cond.left.returnType && FreTyperGenUtils.isType(cond.left.returnType)) {
                    allConditions.push(`const condition${index + 1}: boolean = this.mainTyper.equals(${leftStr}, ${rightStr});`);
                } else {
                    allConditions.push(`const condition${index + 1}: boolean = ${leftStr} === ${rightStr};`);
                }
                if (index > 0) {
                    returnStr += ` && condition${index + 1}`;
                } else {
                    returnStr = `condition${index + 1}`;
                }
            });
            return `
                    ${allConditions.map(cond => cond).join("\n\t")}
                    return ${returnStr};`;
        }
        return "";
    }
}
