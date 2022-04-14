import {
    PitClassifierSpec,
    PitConformanceRule, PitConformsExp, PitEqualsExp, PitExp,
    PitLimitedRule, PitPropertyCallExp, PitWhereExp,
    PiTyperDef
} from "../../new-metalanguage";
import { NewTyperGenUtils } from "./NewTyperGenUtils";
import { ListUtil, Names } from "../../../utils";
import { PiClassifier, PiLimitedConcept } from "../../../languagedef/metalanguage";
import { PitBinaryExp } from "../../new-metalanguage/expressions";

export class SuperTypeMaker {
    typerdef: PiTyperDef;

    public makeSuperTypes(typerdef: PiTyperDef, typevarName: string, imports: PiClassifier[]): string {
        NewTyperGenUtils.types = typerdef.types;
        this.typerdef = typerdef;
        // Find all conformsto rules, which are (1) all PitConformanceRules,
        // and (2) all PitLimitedRules that have a 'PitConforms' statement.
        const conformanceRules: PitConformanceRule[] = [];
        const limitedSpecs: PitClassifierSpec[] = [];
        typerdef.classifierSpecs.forEach(spec => {
            conformanceRules.push(...spec.rules.filter(r => r instanceof PitConformanceRule));
        });
        typerdef.classifierSpecs.forEach(spec => {
            if (spec.myClassifier instanceof PiLimitedConcept) {
                if (spec.rules.filter(r => r.exp instanceof PitConformsExp)) {
                    limitedSpecs.push(spec);
                }
            }
        });
        // make an entry for each rule
        let allRules: string[] = [];
        conformanceRules.map(rule => {
            const isType: boolean = typerdef.types.includes(rule.owner.myClassifier);
            allRules.push(`if (${!isType ? `${typevarName}` : `${typevarName}.internal`}.$typename === "${Names.classifier(rule.owner.myClassifier)}") {                
                ${this.makeSuperForExp(rule.exp, typevarName, imports)}
            }`);
        });
        limitedSpecs.map(spec => {
            const isType: boolean = typerdef.types.includes(spec.myClassifier);
            const conformsExps: PitBinaryExp[] = spec.rules.filter(r => r.exp instanceof PitConformsExp).map(r => r.exp as PitConformsExp);
            allRules.push(`if (${typevarName}.internal.piLanguageConcept() === "${Names.classifier(spec.myClassifier)}") {
                ${this.makeSuperTypeForLimited(conformsExps, `${typevarName}.internal`, imports)}
            }`);
        });

        // return all rules with a common preamble
        return `if (!${typevarName}) {
            return [];
        }
        let result: PiType[] = [];
        ${allRules.map(r => r).join(" else ")}
        return result;`;
    }

    private makeSuperTypeForLimited(binaryExps: PitBinaryExp[], varName: string, imports: PiClassifier[]): string {
        let result: string = "";
        binaryExps.map(stat =>
            result += `if (${varName} === ${NewTyperGenUtils.makeExpAsElement(stat.left, varName, imports)} ){
                return [${NewTyperGenUtils.makeExpAsType(stat.right, varName, imports)}];
            }`
        ).join(" else ");
        return result;
    }

    private makeSuperForExp(exp: PitExp, typevarName: string, imports: PiClassifier[]): string {
        if (exp instanceof PitWhereExp) {
            return this.makeWhereExp(exp, typevarName, imports);
        } else {
            return NewTyperGenUtils.makeExpAsType(exp, typevarName, imports)
        }
    }

    public makeWhereExp(exp: PitWhereExp, varName: string, imports: PiClassifier[]): string {
        // TODO move this to class SuperTypeMaker
        let result: string = '/* PitWhereExp */\n';
        const myConditions = exp.sortedConditions();
        myConditions.forEach((cond, index) => {
            if (cond instanceof PitConformsExp) {
                result += `const rhs${index}: PiType[] = this.getSuperTypes(${NewTyperGenUtils.makeExpAsType(cond.right, varName, imports)});\n`;
            } else if (cond instanceof PitEqualsExp) {
                result += `const rhs${index}: PiType[] = [${NewTyperGenUtils.makeExpAsType(cond.right, varName, imports)}];\n`;
            }
        });
        if (myConditions.length > 1) {
            const cls: PiClassifier = exp.variable.type;
            ListUtil.addIfNotPresent(imports, cls);
            result += `/* make cartesian product of all conditions */`;
            for (let i = 0; i < myConditions.length; i++) {
                const propAToBeChanged: string = this.getPropNameFromExp(myConditions[i].left);
                const propsANotToBeChanged: string[] = cls.allProperties().map(prop => prop.name).filter(name => name !== propAToBeChanged);
                for (let j = i + 1; j < myConditions.length; j++) {
                    const typeName = Names.classifier(cls);
                    const propBToBeChanged: string = this.getPropNameFromExp(myConditions[j].left);
                    const propsBNotToBeChanged: string[] = cls.allProperties().map(prop => prop.name).filter(name => name !== propBToBeChanged);
                    result += `
                    /* do rhs${i} times rhs${j} */
                    for (const partA of rhs${i}) {
                        result.push(
                            ${typeName}.create({
                                ${propAToBeChanged}: ${this.makeCondition(myConditions[i].right, "partA", imports)},
                                ${propsANotToBeChanged.map(name => `${name}: (${varName} as ${typeName}).${name}`).join(",\n")}
                            })
                        );
                        for (const partB of rhs${j}) {
                            result.push(
                                ${typeName}.create({                                   
                                    ${propAToBeChanged}: ${this.makeCondition(myConditions[i].right, "partA", imports)},
                                    ${propBToBeChanged}: ${this.makeCondition(myConditions[j].right, "partB", imports)},
                                    ${propsANotToBeChanged.filter(name => name !== propBToBeChanged).map(name => `${name}: (${varName} as ${typeName}).${name}`).join(",\n")}
                                })
                            );
                        }                        
                    }
                    for (const partB of rhs${j}) {
                        result.push(
                            ${typeName}.create({
                                ${propBToBeChanged}: ${this.makeCondition(myConditions[j].right, "partB", imports)},
                                ${propsBNotToBeChanged.map(name => `${name}: (${varName} as ${typeName}).${name}`).join(",\n")}
                            })
                        );
                    }`;
                }
            }
        } else {
            result += `result = rhs0;`;
        }
        return result;
    }

    public getPropNameFromExp(left: PitExp): string {
        if (left instanceof PitPropertyCallExp) {
            return left.property.name;
        }
        return "unknown";
    }

    private makeCondition(right: PitExp, partName: string, imports: PiClassifier[]): string {
        const isType: boolean = NewTyperGenUtils.isType(right.returnType);
        console.log("Generating for " + right.toPiString() + ": " + isType)
        ListUtil.addIfNotPresent(imports, right.returnType);
        if (isType) {
            return `(${partName} as ${Names.classifier(right.returnType)})`;
        } else {
            return `${partName}.internal as ${Names.classifier(right.returnType)}`;
        }
    }
}
