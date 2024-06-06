import {
    FretAnytypeExp,
    FretExp,
    FretFunctionCallExp,
    FretLimitedInstanceExp,
    FretPropertyCallExp, FretPropInstance,
    FretSelfExp, FretTypeConcept,
    FretWhereExp
} from "../../metalanguage";
import { ListUtil, Names } from "../../../utils";
import { FreMetaClassifier, FreMetaProperty } from "../../../languagedef/metalanguage";
import { FretBinaryExp, FretCreateExp, FretVarCallExp } from "../../metalanguage/expressions";

const inferFunctionName: string = "inferType";
const conformsFunctionName: string = "conformsTo";
const equalsFunctionName: string = "equalsType";
const typeofName: string = "typeof";
const commonSuperName: string = "commonSuperType";

export class FreTyperGenUtils {
    static types: FreMetaClassifier[] = [];

    public static isType(cls: FreMetaClassifier): boolean {
        if (cls.name === Names.FreType) {
            return true;
        } else if (cls instanceof FretTypeConcept) {
            return true;
        }
        return false;
    }

    public static makeExpAsTypeOrElement(exp: FretExp, varName: string, varIsType: boolean, imports: FreMetaClassifier[]): string {
        if (FreTyperGenUtils.isType(exp.returnType)) {
            return FreTyperGenUtils.makeExpAsType(exp, varName, varIsType, imports);
        } else {
            return FreTyperGenUtils.makeExpAsElement(exp, varName, varIsType, imports);
        }
    }

    public static makeExpAsType(exp: FretExp, varName: string, varIsType: boolean, imports: FreMetaClassifier[]): string {
        let result: string = "";
        if (exp instanceof FretAnytypeExp) {
            result = `AstType.ANY_TYPE`;
        } else if (exp instanceof FretBinaryExp) {
            result = "null /* FretBinaryExp */";
        } else if (exp instanceof FretCreateExp) {
            ListUtil.addIfNotPresent(imports, exp.type);
            // result = `${Names.classifier(exp.type)}.create({
            //     ${exp.propertyDefs.map(prop => `${prop.property.name}: ${TyperGenUtils.makePropValue(prop, varName, varIsType, imports)}`)}
            // }) /* FretCreateExp A */`;
            result = `${Names.classifier(exp.type)}.create({
                ${exp.propertyDefs.map(prop => `${prop.property.name}: ${FreTyperGenUtils.makePropValue(prop, varName, varIsType, imports)}`)}
            }) /* FretCreateExp A */`;
            if (this.types.includes(exp.type)) {
                // the 'create' makes an object that is an AST concept, not a FretTypeConcept
                // therefore we need to wrap it in a FreType object
                result = `AstType.create({ astElement: ${result} }) /* FretCreateExp B */`;
            }
        } else if (exp instanceof FretFunctionCallExp) {
            if (exp.calledFunction === typeofName) {
                const myParam: FretExp = exp.actualParameters[0];
                if (myParam instanceof FretPropertyCallExp && myParam.property.isList) {
                    result = `this.mainTyper.commonSuperType(${FreTyperGenUtils.makeExpAsElement(myParam, varName, varIsType, imports)}) /* FretFunctionCallExp A */`;
                } else {
                    result = `this.mainTyper.${inferFunctionName}(${FreTyperGenUtils.makeExpAsElement(myParam, varName, varIsType, imports)}) /* FretFunctionCallExp B */`;
                }
            } else if (exp.calledFunction === commonSuperName) {
                // TODO params that are lists themselves
                result = `this.mainTyper.commonSuperType([${exp.actualParameters.map(par => `${FreTyperGenUtils.makeExpAsElement(par, varName, varIsType, imports)}`). join(", ")}])`;
            } else {
                result = "null /* FretFunctionCallExp */";
            }
        } else if (exp instanceof FretLimitedInstanceExp) {
            result = `AstType.create({ astElement: ${FreTyperGenUtils.makeExpAsElement(exp, varName, varIsType, imports)} }) /* FretLimitedInstanceExp */`;
        } else if (exp instanceof FretPropertyCallExp) {
            if (exp.property.isList) {
                // use common super type, because the argument to inferType is a list
                result = `this.mainTyper.commonSuper(${FreTyperGenUtils.makeExpAsElement(exp, varName, varIsType, imports)}) /* FretPropertyCallExp A */`;
            } else {
                try {
                    if (FreTyperGenUtils.isType(exp.returnType)) {
                        result = `${FreTyperGenUtils.makeExpAsElement(exp, varName, varIsType, imports)} /* FretPropertyCallExp B */`;
                    } else {
                        // if (varName === "modelelement" && varIsType) {
                        //     throw new Error("FOUTTTTT: " + varName + ": " + varIsType);
                        // }
                        result = `this.mainTyper.${inferFunctionName}(${FreTyperGenUtils.makeExpAsElement(exp, varName, varIsType, imports)}) /* FretPropertyCallExp C */`;
                    }
                } catch (e: unknown) {
                    if (e instanceof Error) {
                        console.log(e.stack);
                    }
                }
            }
        } else if (exp instanceof FretSelfExp) {
            ListUtil.addIfNotPresent(imports, exp.returnType);
            result = `AstType.create({ astElement: ${FreTyperGenUtils.makeExpAsElement(exp, varName, varIsType, imports)} }) /* FretSelfExp B */`;
        } else if (exp instanceof FretVarCallExp) {
            result = "null /* FretVarCallExp B */";
        } else if (exp instanceof FretWhereExp) {
            result = "null /* FretWhereExp B */";
        }
        return result;
    }

    public static makeExpAsElement(exp: FretExp, varName: string, varIsType: boolean, imports: FreMetaClassifier[]): string {
        let result: string = "";
        if (exp instanceof FretAnytypeExp) {
            result = Names.FreType + ".ANY";
        } else if (exp instanceof FretBinaryExp) {
            result = "FretBinaryExp";
        } else if (exp instanceof FretCreateExp) {
            result = "FretCreateExp";
        } else if (exp instanceof FretFunctionCallExp) {
            if (exp.calledFunction === typeofName) {
                result = FreTyperGenUtils.makeExpAsType(exp, varName, varIsType, imports);
            } else if (exp.calledFunction === commonSuperName) {
                result = FreTyperGenUtils.makeExpAsType(exp, varName, varIsType, imports);
            } else {
                result = "FretFunctionCallExp";
            }
        } else if (exp instanceof FretLimitedInstanceExp) {
            ListUtil.addIfNotPresent(imports, exp.myLimited);
            result = exp.myLimited.name + "." + exp.myInstance.name;
        } else if (exp instanceof FretPropertyCallExp) {
            result = FreTyperGenUtils.makeExpAsElement(exp.source, varName, varIsType, imports);
            result += "?." + exp.property.name;
            if (!exp.property.isPart) {
                result += "?.referred";
            }
        } else if (exp instanceof FretSelfExp) {
            ListUtil.addIfNotPresent(imports, exp.returnType);
            result = `(${varName} as ${Names.classifier(exp.returnType)}) /* FretSelfExp A */`;
        } else if (exp instanceof FretVarCallExp) {
            if (varIsType) {
                result = `(${varName} as ${Names.classifier(exp.returnType)}) /* FretVarCallExp A1 */`;
            } else {
                result = `(${varName} as ${Names.classifier(exp.returnType)}) /* FretVarCallExp A2 */`;
            }
        } else if (exp instanceof FretWhereExp) {
            result = "FretWhereExp";
        }
        return result;
    }

    public static makePropValue(propExp: FretPropInstance, varName: string, varIsType: boolean, imports: FreMetaClassifier[]): string {
        let result: string = FreTyperGenUtils.makeExpAsTypeOrElement(propExp.value, varName, varIsType, imports);
        if (!propExp.property.isPart) { // it is a reference, wrap it in a FreElementReference
            // TODO find solution for this import, currently it is imported always
            // ListUtil.addIfNotPresent(imports, Names.FreElementReference);
            const typeName: string = Names.classifier(propExp.property.type);
            ListUtil.addIfNotPresent(imports, propExp.property.type);
            result = `${Names.FreNodeReference}.create<${typeName}>(${result}, "${typeName}") /* PropValue */ `;
        }
        return result;
    }

    public static makeCopyEntry(prop: FreMetaProperty, toBeCopiedName: string, toBeCopiedTypeName: string): string {
        // TODO lists
        const typeName: string = Names.classifier(prop.type);
        if (prop.isPart) {
            return `this.makeCopyOf${typeName}((${toBeCopiedName} as ${toBeCopiedTypeName}).${prop.name})`;
        } else {
            return `${Names.FreNodeReference}.create<${typeName}>((${toBeCopiedName} as ${toBeCopiedTypeName}).\$${prop.name}, "${typeName}")`;
        }
    }

}
