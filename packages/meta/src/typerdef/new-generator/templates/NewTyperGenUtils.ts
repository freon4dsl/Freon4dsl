import {
    PitAnytypeExp, PitClassifierSpec, PitConformanceRule, PitConformsExp, PitEqualsExp,
    PitExp,
    PitFunctionCallExp,
    PitLimitedInstanceExp,
    PitPropertyCallExp, PitPropInstance,
    PitSelfExp, PitTypeConcept,
    PitWhereExp, PiTyperDef
} from "../../new-metalanguage";
import { ListUtil, Names } from "../../../utils";
import { PiClassifier, PiElementReference, PiLimitedConcept, PiProperty } from "../../../languagedef/metalanguage";
import { PitBinaryExp, PitCreateExp, PitVarCallExp } from "../../new-metalanguage/expressions";

const inferFunctionName: string = "inferType";
const conformsFunctionName: string = "conformsTo";
const equalsFunctionName: string = "equalsType";
const typeofName: string = 'typeof';
const commonSuperName: string= 'commonSuperType';

export class NewTyperGenUtils {
    static types: PiClassifier[] = [];

    public static isType(cls: PiClassifier): boolean {
        if (cls.name === "PiType") {
            return true;
        } else if (cls instanceof PitTypeConcept) {
            return true;
        }
        return false;
        // return this.types.includes(cls);
    }

    public static makeExpAsTypeOrElement(exp: PitExp, varName: string, imports: PiClassifier[]): string {
        if (NewTyperGenUtils.isType(exp.returnType)) {
            return NewTyperGenUtils.makeExpAsType(exp, varName, imports);
        } else {
            return NewTyperGenUtils.makeExpAsElement(exp, varName, imports);
        }
    }

    public static makeExpAsType(exp: PitExp, varName: string, imports: PiClassifier[]): string {
        let result: string = "";
        if (exp instanceof PitAnytypeExp) {
            result = `PiType.ANY_TYPE`;
        } else if (exp instanceof PitBinaryExp) {
            result = "null /* PitBinaryExp */";
        } else if (exp instanceof PitCreateExp) {
            ListUtil.addIfNotPresent(imports, exp.type);
            result = `${Names.classifier(exp.type)}.create({
                ${exp.propertyDefs.map(prop => `${prop.property.name}: ${NewTyperGenUtils.makePropValue(prop, varName, imports)}`)}
            }) /* PitCreateExp */`;
            if (this.types.includes(exp.type)) {
                // the 'create' makes an object that is an AST concept, not a PitTypeConcept
                // therefore we need to wrap it in a PiType object
                result = `PiType.create({ internal: ${result} }) /* PitCreateExp */`;
            }
        } else if (exp instanceof PitFunctionCallExp) {
            if (exp.calledFunction === typeofName) {
                const myParam: PitExp = exp.actualParameters[0];
                if (myParam instanceof PitPropertyCallExp && myParam.property.isList) {
                    result = `this.mainTyper.commonSuperType(${NewTyperGenUtils.makeExpAsElement(myParam, varName, imports)}) /* PitFunctionCallExp */`;
                } else {
                    result = `this.mainTyper.${inferFunctionName}(${NewTyperGenUtils.makeExpAsElement(myParam, varName, imports)}) /* PitFunctionCallExp */`;
                }
            } else if (exp.calledFunction === commonSuperName) {
                // TODO params that are lists themselves
                result = `this.mainTyper.commonSuperType([${exp.actualParameters.map(par => `${NewTyperGenUtils.makeExpAsElement(par, varName, imports)}`). join(", ")}])`;
            } else {
                result = "null /* PitFunctionCallExp */"
            }
        } else if (exp instanceof PitLimitedInstanceExp) {
            result = `PiType.create({ internal: ${NewTyperGenUtils.makeExpAsElement(exp, varName, imports)} }) /* PitLimitedInstanceExp */`;
        } else if (exp instanceof PitPropertyCallExp) {
            if (exp.property.isList) {
                // use common super type, because the argument to inferType is a list
                result = `this.mainTyper.commonSuper(${NewTyperGenUtils.makeExpAsElement(exp, varName, imports)}) /* PitPropertyCallExp */`;
            } else {
                if (exp.property.type instanceof PitTypeConcept) {
                    result = `${NewTyperGenUtils.makeExpAsElement(exp, varName, imports)} /* PitPropertyCallExp */`;
                } else {
                    result = `this.mainTyper.${inferFunctionName}(${NewTyperGenUtils.makeExpAsElement(exp, varName, imports)}) /* PitPropertyCallExp */`;
                }
            }
        } else if (exp instanceof PitSelfExp) {
            ListUtil.addIfNotPresent(imports, exp.returnType);
            result = `PiType.create({ internal: ${NewTyperGenUtils.makeExpAsElement(exp, varName, imports)} }) /* PitSelfExp */`;
        } else if (exp instanceof PitVarCallExp) {
            result = "null /* PitVarCallExp */";
        } else if (exp instanceof PitWhereExp) {
            result = "null /* PitWhereExp */";
        }
        return result;
    }

    public static makeExpAsElement(exp: PitExp, varName: string, imports: PiClassifier[]): string {
        let result: string = "";
        if (exp instanceof PitAnytypeExp) {
            result = "PiType.ANY";
        } else if (exp instanceof PitBinaryExp) {
            result = "PitBinaryExp";
        } else if (exp instanceof PitCreateExp) {
            result = "PitCreateExp";
        } else if (exp instanceof PitFunctionCallExp) {
            if (exp.calledFunction === typeofName) {
                result = NewTyperGenUtils.makeExpAsType(exp, varName, imports);
            } else if (exp.calledFunction === commonSuperName) {
                result = NewTyperGenUtils.makeExpAsType(exp, varName, imports);
            } else {
                result = "PitFunctionCallExp";
            }
        } else if (exp instanceof PitLimitedInstanceExp) {
            ListUtil.addIfNotPresent(imports, exp.myLimited);
            result = exp.myLimited.name + "." + exp.myInstance.name;
        } else if (exp instanceof PitPropertyCallExp) {
            result = NewTyperGenUtils.makeExpAsElement(exp.source, varName, imports);
            result += "." + exp.property.name;
            if (!exp.property.isPart) {
                result += ".referred";
            }
        } else if (exp instanceof PitSelfExp) {
            ListUtil.addIfNotPresent(imports, exp.returnType);
            result = `(${varName} as ${Names.classifier(exp.returnType)})`;
        } else if (exp instanceof PitVarCallExp) {
            result = `(${varName} as ${Names.classifier(exp.returnType)})`;
        } else if (exp instanceof PitWhereExp) {
            result = "PitWhereExp";
        }
        return result;
    }

    public static makePropValue(propExp: PitPropInstance, varName: string, imports: PiClassifier[]): string {
        let result: string = NewTyperGenUtils.makeExpAsTypeOrElement(propExp.value, varName, imports);
        if (!propExp.property.isPart) { // it is a reference, wrap it in a PiElementReference
            // TODO find solution for this import, currently it is imported always
            // ListUtil.addIfNotPresent(imports, "PiElementReference");
            const typeName: string = Names.classifier(propExp.property.type);
            ListUtil.addIfNotPresent(imports, propExp.property.type);
            result = `PiElementReference.create<${typeName}>(${result}, "${typeName}")`;
        }
        return result;
    }

    public static makeCopyEntry(prop: PiProperty, toBeCopiedName: string, toBeCopiedTypeName: string): string {
        // TODO lists
        const typeName: string = Names.classifier(prop.type);
        if (prop.isPart) {
            return `this.makeCopyOf${typeName}((${toBeCopiedName} as ${toBeCopiedTypeName}).${prop.name})`;
        } else {
            return `PiElementReference.create<${typeName}>((${toBeCopiedName} as ${toBeCopiedTypeName}).\$${prop.name}, "${typeName}")`;
        }
        return '';
    }

}
