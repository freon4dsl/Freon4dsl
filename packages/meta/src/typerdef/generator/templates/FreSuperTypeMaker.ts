import {
    FretClassifierSpec,
    FretConformanceRule,
    FretConformsExp,
    FretEqualsExp,
    FretExp,
    FretPropertyCallExp,
    FretWhereExp,
    TyperDef,
    FretBinaryExp,
    FretEqualsRule,
} from "../../metalanguage/index.js";
import { FreTyperGenUtils } from "./FreTyperGenUtils.js";
import { Imports, Names } from '../../../utils/on-lang/index.js';
import { FreMetaClassifier, FreMetaLimitedConcept, LangUtil } from "../../../languagedef/metalanguage/index.js";

/**
 * This class generates the code for all 'conformsto' entries in the .type file.
 */
export class FreSuperTypeMaker {
    // @ts-ignore Property is set in the only public method 'makeSuperTypes'.
    typerdef: TyperDef;

    public makeSuperTypes(typerdef: TyperDef, typevarName: string, imports: Imports): string {
        FreTyperGenUtils.types = typerdef.types;
        this.typerdef = typerdef;
        // Find all conformsto rules, which are (1) all FretConformanceRules,
        // and (2) all FretLimitedRules that have a 'FretConforms' statement.
        const conformanceRules: FretConformanceRule[] = [];
        const limitedSpecs: FretClassifierSpec[] = [];
        typerdef.classifierSpecs.forEach((spec) => {
            conformanceRules.push(...spec.rules.filter((r) => r instanceof FretConformanceRule));
        });
        typerdef.classifierSpecs.forEach((spec) => {
            if (spec.myClassifier instanceof FreMetaLimitedConcept) {
                if (spec.rules.filter((r) => r.exp instanceof FretConformsExp)) {
                    limitedSpecs.push(spec);
                }
            }
        });
        // sort the types such that any type comes before its super type
        const sortedTypes = LangUtil.sortClassifiers(typerdef.types);
        // make sub-entries for each rule defined for an ast-element
        const astSubRules: string[] = [];
        sortedTypes.forEach((type) => {
            // find the equalsRule, if present
            const myType: string = Names.classifier(type);
            const foundRule: FretEqualsRule | undefined = conformanceRules.find(
                (conRule) => conRule.owner.myClassifier === type,
            );
            if (!!foundRule) {
                if (!!foundRule.owner.myClassifier && !FreTyperGenUtils.isType(foundRule.owner.myClassifier)) {
                    astSubRules.push(`if (${Names.FreLanguage}.getInstance().metaConformsToType(elem, "${myType}")) {
                        // todo use the conforms rule for 'myType' (?)
                    }`);
                }
            } else {
                const foundLimitedSpec = limitedSpecs.find((spec) => spec.myClassifier === type);
                if (!!foundLimitedSpec) {
                    // make sub-entry for limited spec
                    const conformsExps: FretBinaryExp[] = foundLimitedSpec.rules
                        .filter((r) => r.exp instanceof FretConformsExp)
                        .map((r) => r.exp as FretConformsExp);
                    astSubRules.push(`if (${Names.FreLanguage}.getInstance().metaConformsToType(elem, "${myType}")) {
                            ${this.makeSuperTypeForLimited(conformsExps, "elem", true, imports)}
                        }`);
                    limitedSpecs.splice(limitedSpecs.indexOf(foundLimitedSpec), 1);
                }
            }
        });
        // make sub-entries for remaining limited specs
        limitedSpecs.map((spec) => {
            if (!!spec.myClassifier) {
                const myType: string = Names.classifier(spec.myClassifier);
                const conformsExps: FretBinaryExp[] = spec.rules
                    .filter((r) => r.exp instanceof FretConformsExp)
                    .map((r) => r.exp as FretConformsExp);
                astSubRules.push(`if (${Names.FreLanguage}.getInstance().metaConformsToType(elem, "${myType}")) {
                ${this.makeSuperTypeForLimited(conformsExps, "elem", true, imports)}
            }`);
            }
        });

        const allRules: string[] = [];
        // combine the sub-entries into one
        allRules.push(`if (${typevarName}.$typename === "AstType") {
                        const elem: ${Names.FreNode} = (type as AstType).astElement;
                        ${astSubRules.map((r) => r).join(" else ")}${astSubRules.length > 0 ? `else {` : ``}
                            return [];
                        ${astSubRules.length > 0 ? `}` : ``}
                } `);
        // make an entry for each rule that is defined for a type concept
        conformanceRules.map((rule) => {
            if (!!rule.owner.myClassifier && FreTyperGenUtils.isType(rule.owner.myClassifier)) {
                allRules.push(`if (${typevarName}.$typename === "${Names.classifier(rule.owner.myClassifier)}") {
                ${this.makeSuperForExp(rule.exp, typevarName, imports)}
            }`);
            }
        });

        // return all rules with a common preamble
        return `if (!${typevarName}) {
            return [];
        }
        let result: ${Names.FreType}[] = [];
        ${allRules.map((r) => r).join(" else ")}
        return result;`;
    }

    private makeSuperTypeForLimited(
        binaryExps: FretBinaryExp[],
        varName: string,
        varIsType: boolean,
        imports: Imports,
    ): string {
        let result: string = "";

        binaryExps
            .map(
                (stat) =>
                    (result += `if (${varName} === ${FreTyperGenUtils.makeExpAsElement(stat.left, varName, varIsType, imports)} ){
                return [${FreTyperGenUtils.makeExpAsType(stat.right, varName, varIsType, imports)}];
            }`),
            )
            .join(" else ");
        return result;
    }

    private makeSuperForExp(exp: FretExp, typevarName: string, imports: Imports): string {
        if (exp instanceof FretWhereExp) {
            return this.makeWhereExp(exp, typevarName, imports);
        } else {
            return FreTyperGenUtils.makeExpAsType(exp, typevarName, false, imports);
        }
    }

    private makeWhereExp(exp: FretWhereExp, varName: string, imports: Imports): string {
        let result: string = "/* FretWhereExp */\n";
        const myConditions = exp.conditions;
        myConditions.forEach((cond, index) => {
            if (cond instanceof FretConformsExp) {
                imports.core.add("notNullOrUndefined")
                result += `const param${index} = ${FreTyperGenUtils.makeExpAsType(cond.right, varName, true, imports)}
                const rhs${index}: ${Names.FreType}[] = notNullOrUndefined(param${index}) ? this.getSuperTypes(param${index}) : [];\n`;
            } else if (cond instanceof FretEqualsExp) {
                result += `const rhs${index}: ${Names.FreType}[] = [${FreTyperGenUtils.makeExpAsType(cond.right, varName, true, imports)}];\n`;
            }
        });
        if (myConditions.length > 1 && !!exp.variable.type) {
            const cls: FreMetaClassifier = exp.variable.type;
            FreTyperGenUtils.addTypeToImports(cls, imports);
            result += `/* make cartesian product of all conditions */`;
            for (let i = 0; i < myConditions.length; i++) {
                const propAToBeChanged: string = this.getPropNameFromExp(myConditions[i].left);
                let propAisAstElement: boolean = true;
                // const propAisAstElement: boolean = !FreTyperGenUtils.isType(myConditions[i].left.returnType);
                let propAtypeName: string = "";
                if (!!myConditions[i].left.returnType) {
                    propAisAstElement = !FreTyperGenUtils.isType(myConditions[i].left.returnType!);
                    propAtypeName = Names.classifier(myConditions[i].left.returnType!);
                }
                const propsANotToBeChanged: string[] = cls
                    .allProperties()
                    .map((prop) => prop.name)
                    .filter((name) => name !== propAToBeChanged);
                for (let j = i + 1; j < myConditions.length; j++) {
                    if (FreTyperGenUtils.isType(cls)) {
                        const typeName = Names.classifier(cls);
                        const propBToBeChanged: string = this.getPropNameFromExp(myConditions[j].left);
                        let propBisAstElement: boolean = true;
                        let propBtypeName: string = "";
                        if (!!myConditions[j].left.returnType) {
                            propBisAstElement = !FreTyperGenUtils.isType(myConditions[j].left.returnType!);
                            propBtypeName = Names.classifier(myConditions[j].left.returnType!);
                        }
                        const propsBNotToBeChanged: string[] = cls
                            .allProperties()
                            .map((prop) => prop.name)
                            .filter((name) => name !== propBToBeChanged);
                        result += `
                    /* do rhs${i} times rhs${j} */
                    for (const partA of rhs${i}) {
                        ${propAisAstElement ? `const elemA = this.getElemFromAstType(partA, "${propAtypeName}");` : ``}
                        result.push(
                            ${typeName}.create({
                                ${propAToBeChanged}: ${this.makeCondition(myConditions[i].right, `${propAisAstElement ? `elemA` : `partA`}`, imports)},
                                ${propsANotToBeChanged.map((name) => `${name}: (${varName} as ${typeName}).${name}`).join(",\n")}
                            })
                        );
                        for (const partB of rhs${j}) {
                            ${propBisAstElement ? `const elemB = this.getElemFromAstType(partB, "${propBtypeName}");` : ``}
                            ${propAisAstElement ? `const elemA = this.getElemFromAstType(partA, "${propAtypeName}");` : ``}
                            result.push(
                                ${typeName}.create({
                                    ${propAToBeChanged}: ${this.makeCondition(myConditions[i].right, `${propAisAstElement ? `elemA` : `partA`}`, imports)},
                                    ${propBToBeChanged}: ${this.makeCondition(myConditions[j].right, `${propBisAstElement ? `elemB` : `partB`}`, imports)},
                                    ${propsANotToBeChanged
                                        .filter((name) => name !== propBToBeChanged)
                                        .map((name) => `${name}: (${varName} as ${typeName}).${name}`)
                                        .join(",\n")}
                                })
                            );
                        }
                    }
                    for (const partB of rhs${j}) {
                        ${propBisAstElement ? `const elemB = this.getElemFromAstType(partB, "GenericKind");` : ``}
                        result.push(
                            ${typeName}.create({
                                ${propBToBeChanged}: ${this.makeCondition(myConditions[j].right, `${propBisAstElement ? `elemB` : `partB`}`, imports)},
                                ${propsBNotToBeChanged.map((name) => `${name}: (${varName} as ${typeName}).${name}`).join(",\n")}
                            })
                        );
                    }`;
                    } else {
                        // TODO see how types that are AST nodes should be handled
                    }
                }
            }
        } else {
            result += `result = rhs0;`;
        }
        return result;
    }

    private getPropNameFromExp(left: FretExp): string {
        if (left instanceof FretPropertyCallExp && !!left.property) {
            return left.property.name;
        }
        return "unknown";
    }

    private makeCondition(right: FretExp, partName: string, imports: Imports): string {
        if (!!right.returnType) {
            FreTyperGenUtils.addTypeToImports(right.returnType, imports);
            return `(${partName} as ${Names.classifier(right.returnType)})`;
        } else {
            return "";
        }
    }
}
