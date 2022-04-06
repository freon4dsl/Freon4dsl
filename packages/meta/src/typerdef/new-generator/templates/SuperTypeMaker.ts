import {
    PitConformanceOrEqualsRule,
    PitConforms, PitEquals, PitExp,
    PitLimitedRule,
    PitSingleRule, PitStatement,
    PitStatementKind, PitWhereExp,
    PiTyperDef
} from "../../new-metalanguage";
import { ListUtil, Names } from "../../../utils";
import { TyperGenUtils } from "./TyperGenUtils";
import { PiClassifier } from "../../../languagedef/metalanguage";

export class SuperTypeMaker {
    typerdef: PiTyperDef;

    public makeSuperTypes(typerdef: PiTyperDef, typevarName: string, imports: string[]): string {
        this.typerdef = typerdef;
        // Do this only for the classifier rules that contain a 'conformsto' clause,
        // which are (1) all PitConformanceOrEqualsRules that have a 'CONFORMS' kind ...,
        const conformsRules: PitConformanceOrEqualsRule[] = [];
        for (const rule of typerdef.classifierRules) {
            if (rule instanceof PitConformanceOrEqualsRule) {
                if (rule.myRules.find(single => single.kind === PitStatementKind.CONFORMS)) {
                    ListUtil.addIfNotPresent(conformsRules, rule);
                }
            }
        }
        // and which are (2) all PitLimitedRules that have a 'PitConforms' statement.
        const limitedRules: PitLimitedRule[] = [];
        for (const rule of typerdef.classifierRules) {
            if (rule instanceof PitLimitedRule) {
                if (rule.statements.find(s => s instanceof PitConforms)) {
                    ListUtil.addIfNotPresent(limitedRules, rule);
                }
            }
        }
        // create the common preamble
        const varName: string = "elem";
        let result: string = `if (!${typevarName}) {
            return [];
        }
        const ${varName}: PiElement = type.internal;
        `;
        // create an entry for each conforms rule
        result += conformsRules.map(rule => `if (${varName}.piLanguageConcept() === "${Names.classifier(rule.myClassifier)}") {
                ${this.makeSuperTypeForConforms(
                    rule.myRules.filter(single => single.kind === PitStatementKind.CONFORMS),
                    varName,
                    rule.myClassifier,
                    imports)}
            }`
        ).join(" else ");
        // create an entry for each limited rule
        result += limitedRules.map(rule => `if (${varName}.piLanguageConcept() === "${Names.classifier(rule.myClassifier)}") {                
                ${this.makeSuperTypeForLimited(rule.statements.filter(single => single instanceof PitConforms), varName, imports)}
            }`).join(" else ");
        // create the default return
        result += "return [];";
        return result;
    }

    private makeSuperTypeForConforms(pitSingleRules: PitSingleRule[], varName: string, cls: PiClassifier, imports: string[]) {
        let result: string = "";
        pitSingleRules.map(single => {
            result += `${this.makeSuperTypeForExp(single.exp, varName, cls, imports)}`;
        }).join("\n ");
        return result;
    }

    private makeSuperTypeForLimited(pitStatements: PitStatement[], varName: string, imports: string[]): string {
        let result: string = "";
        pitStatements.map(stat =>
            result += `if (${varName} === ${TyperGenUtils.makeTypeScriptForExp(stat.left, varName, imports)} ){
                /* ${stat.toPiString()} */
                return [this.inferType(${TyperGenUtils.makeTypeScriptForExp(stat.right, varName, imports)})];
            }`
        ).join(" else ");
        return result;
    }

    private makeSuperTypeForExp(exp: PitExp, varName: string, cls: PiClassifier, imports: string[]): string {
        let result: string = "";
        if (exp instanceof PitWhereExp) {
            const typeName: string = Names.classifier(exp.otherType.type);
            let conditionStr: string = "";
            const myConditions = exp.sortedConditions();
            const length: number = myConditions.length;
            myConditions.forEach((cond, index) => {
                if (this.typerdef.types.includes(cond.right.returnType)) {
                    // to avoid deadlock, we create a new piType object instead of calling 'inferType'
                    conditionStr +=
                        `const rhs${index}: PiType[] = this.getSuperTypes(PiType.create({ internal: ${TyperGenUtils.makeTypeScriptForExp(cond.right, varName, imports)}}));`;
                } else {
                    conditionStr +=
                        `const rhs${index}: PiType[] = this.getSuperTypes(this.inferType(${TyperGenUtils.makeTypeScriptForExp(cond.right, varName, imports)}));`;
                }
            });

            if (length > 1) {
                conditionStr += `
                /* make cartesian product of all conditions */
                `;
                for (let i = 0; i < length; i++) {
                    for (let j = i+1; j < length; j++) {
                        const typeOfPart = Names.classifier(myConditions[i].right.returnType);
                        conditionStr += `/* do rhs${i} times rhs${j} */
                        for (const part${i} of rhs${i}) {
                            const astElem: PiElement = part${i}.internal;
                            ${cls.allProperties().map(prop =>
                            `if (astElem.piLanguageConcept() === "${typeOfPart}" && astElem !== (${varName} as ${typeName}).${prop.name} ) {
                                result.push(PiType.create({internal: ${typeName}.create({
                                    ${cls.allProperties().map(prop2 =>
                                    `${prop === prop2 
                                        ?
                                        `${prop2.name}:${TyperGenUtils.makeCopyEntry(prop2, "astElem", typeName)}`
                                        : 
                                        `${prop2.name}:${TyperGenUtils.makeCopyEntry(prop2, varName, typeName)}`}`
                                ).join(",\n")}`)}));
                            }
                        }`;
                    }
                }

            } else {
                conditionStr += `result = rhs0;`;
            }
            result += `let result: PiType[] = [];
            ${conditionStr}
            return result;`;
        }
        return result;
    }
}
