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
import { PitEqualsRule } from "../../new-metalanguage/PitEqualsRule";

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
        // sort the types such that any type comes before its super type
        const sortedTypes = NewTyperGenUtils.sortTypes();
        // make sub-entries for each rule defined for an ast-element
        let astRules: string[] = [];
        sortedTypes.forEach( type => {
            // find the equalsRule, if present
            const foundRule: PitEqualsRule = conformanceRules.find(conRule => conRule.owner.myClassifier === type);
            if (!!foundRule) {
                const myType: string = Names.classifier(type);
                if (!NewTyperGenUtils.isType(foundRule.owner.myClassifier)) {
                    astRules.push(`if (elem.piLanguageConcept() === "${myType}") {

                    }`);
                }
            } else {
                const foundLimitedSpec = limitedSpecs.find(spec => spec.myClassifier === type);
                if (!!foundLimitedSpec) {
                    // make sub-entry for limited spec
                    const conformsExps: PitBinaryExp[] = foundLimitedSpec.rules.filter(r => r.exp instanceof PitConformsExp).map(r => r.exp as PitConformsExp);
                    astRules.push(`if (elem.piLanguageConcept() === "${type}") {
                            ${this.makeSuperTypeForLimited(conformsExps, "elem", true, imports)}
                        }`);
                    limitedSpecs.splice(limitedSpecs.indexOf(foundLimitedSpec), 1);
                }
            }
        });
        // make sub-entries for remaining limited specs
        limitedSpecs.map(spec => {
            const isType: boolean = typerdef.types.includes(spec.myClassifier);
            const conformsExps: PitBinaryExp[] = spec.rules.filter(r => r.exp instanceof PitConformsExp).map(r => r.exp as PitConformsExp);
            astRules.push(`if (elem.piLanguageConcept() === "${Names.classifier(spec.myClassifier)}") {
                ${this.makeSuperTypeForLimited(conformsExps, "elem", true, imports)}
            }`);
        });

        let allRules: string[] = [];
        // combine the sub-entries into one
        allRules.push(`if (${typevarName}.$typename === "AstType") {
                        const elem: PiElement = (type as AstType).astElement;
                        ${astRules.map(r => r).join(" else ")}
                        else {
                            return [];
                        }
                } `)
        // make an entry for each rule that is not defined for an ast-element
        conformanceRules.map(rule => {
            if (NewTyperGenUtils.isType(rule.owner.myClassifier)) {
                allRules.push(`if (${typevarName}.$typename === "${Names.classifier(rule.owner.myClassifier)}") {                
                ${this.makeSuperForExp(rule.exp, typevarName, imports)}
            }`);
            }
        });


        // return all rules with a common preamble
        return `if (!${typevarName}) {
            return [];
        }
        let result: PiType[] = [];
        ${allRules.map(r => r).join(" else ")}
        return result;`;
    }

    private makeSuperTypeForLimited(binaryExps: PitBinaryExp[], varName: string, varIsType: boolean, imports: PiClassifier[]): string {
        let result: string = "";

        binaryExps.map(stat =>
            result += `if (${varName} === ${NewTyperGenUtils.makeExpAsElement(stat.left, varName, varIsType, imports)} ){
                return [${NewTyperGenUtils.makeExpAsType(stat.right, varName, varIsType, imports)}];
            }`
        ).join(" else ");
        return result;
    }

    private makeSuperForExp(exp: PitExp, typevarName: string, imports: PiClassifier[]): string {
        if (exp instanceof PitWhereExp) {
            return this.makeWhereExp(exp, typevarName, imports);
        } else {
            return NewTyperGenUtils.makeExpAsType(exp, typevarName, false, imports)
        }
    }

    public makeWhereExp(exp: PitWhereExp, varName: string, imports: PiClassifier[]): string {
        let result: string = '/* PitWhereExp */\n';
        const myConditions = exp.sortedConditions();
        myConditions.forEach((cond, index) => {
            if (cond instanceof PitConformsExp) {
                result += `const rhs${index}: PiType[] = this.getSuperTypes(${NewTyperGenUtils.makeExpAsType(cond.right, varName, true, imports)});\n`;
            } else if (cond instanceof PitEqualsExp) {
                result += `const rhs${index}: PiType[] = [${NewTyperGenUtils.makeExpAsType(cond.right, varName, true, imports)}];\n`;
            }
        });
        if (myConditions.length > 1) {
            const cls: PiClassifier = exp.variable.type;
            ListUtil.addIfNotPresent(imports, cls);
            result += `/* make cartesian product of all conditions */`;
            for (let i = 0; i < myConditions.length; i++) {
                const propAToBeChanged: string = this.getPropNameFromExp(myConditions[i].left);
                const propA_isAstElement: boolean = !NewTyperGenUtils.isType(myConditions[i].left.returnType);
                const propA_typeName: string = Names.classifier(myConditions[i].left.returnType);
                const propsANotToBeChanged: string[] = cls.allProperties().map(prop => prop.name).filter(name => name !== propAToBeChanged);
                for (let j = i + 1; j < myConditions.length; j++) {
                    if (NewTyperGenUtils.isType(cls)) {
                        const typeName = Names.classifier(cls);
                        const propBToBeChanged: string = this.getPropNameFromExp(myConditions[j].left);
                        const propB_isAstElement: boolean = !NewTyperGenUtils.isType(myConditions[j].left.returnType);
                        const propB_typeName: string = Names.classifier(myConditions[j].left.returnType);
                        const propsBNotToBeChanged: string[] = cls.allProperties().map(prop => prop.name).filter(name => name !== propBToBeChanged);
                        result += `
                    /* do rhs${i} times rhs${j} */
                    for (const partA of rhs${i}) {
                        ${propA_isAstElement ? `const elemA = this.getElemFromAstType(partA, "${propA_typeName}");` : ``}
                        result.push(
                            ${typeName}.create({
                                ${propAToBeChanged}: ${this.makeCondition(myConditions[i].right, `${propA_isAstElement ? `elemA` : `partA`}`, imports)},
                                ${propsANotToBeChanged.map(name => `${name}: (${varName} as ${typeName}).${name}`).join(",\n")}
                            })
                        );
                        for (const partB of rhs${j}) {
                            ${propB_isAstElement ? `const elemB = this.getElemFromAstType(partB, "${propB_typeName}");` : ``}
                            ${propA_isAstElement ? `const elemA = this.getElemFromAstType(partA, "${propA_typeName}");` : ``}
                            result.push(
                                ${typeName}.create({                                   
                                    ${propAToBeChanged}: ${this.makeCondition(myConditions[i].right, `${propA_isAstElement ? `elemA` : `partA`}`, imports)},
                                    ${propBToBeChanged}: ${this.makeCondition(myConditions[j].right, `${propB_isAstElement ? `elemB` : `partB`}`, imports)},
                                    ${propsANotToBeChanged.filter(name => name !== propBToBeChanged).map(name => `${name}: (${varName} as ${typeName}).${name}`).join(",\n")}
                                })
                            );
                        }                        
                    }
                    for (const partB of rhs${j}) {
                        ${propB_isAstElement ? `const elemB = this.getElemFromAstType(partB, "GenericKind");` : ``}
                        result.push(
                            ${typeName}.create({
                                ${propBToBeChanged}: ${this.makeCondition(myConditions[j].right, `${propB_isAstElement ? `elemB` : `partB`}`, imports)},
                                ${propsBNotToBeChanged.map(name => `${name}: (${varName} as ${typeName}).${name}`).join(",\n")}
                            })
                        );
                    }`;
                    }
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
        ListUtil.addIfNotPresent(imports, right.returnType);
        return `(${partName} as ${Names.classifier(right.returnType)})`;
    }
}
