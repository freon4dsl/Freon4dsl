import {
    PitAnytypeExp,
    PitExp,
    PitFunctionCallExp,
    PitLimitedInstanceExp,
    PitPropertyCallExp, PitPropInstance,
    PitSelfExp, PitTypeConcept,
    PitWhereExp
} from "../../metalanguage";
import { ListUtil, Names } from "../../../utils";
import { FreClassifier, FreProperty } from "../../../languagedef/metalanguage";
import { PitBinaryExp, PitCreateExp, PitVarCallExp } from "../../metalanguage/expressions";

const inferFunctionName: string = "inferType";
const conformsFunctionName: string = "conformsTo";
const equalsFunctionName: string = "equalsType";
const typeofName: string = 'typeof';
const commonSuperName: string= 'commonSuperType';

export class FreonTyperGenUtils {
    static types: FreClassifier[] = [];

    public static isType(cls: FreClassifier): boolean {
        if (cls.name === Names.FreType) {
            return true;
        } else if (cls instanceof PitTypeConcept) {
            return true;
        }
        return false;
    }

    public static makeExpAsTypeOrElement(exp: PitExp, varName: string, varIsType: boolean, imports: FreClassifier[]): string {
        if (FreonTyperGenUtils.isType(exp.returnType)) {
            return FreonTyperGenUtils.makeExpAsType(exp, varName, varIsType, imports);
        } else {
            return FreonTyperGenUtils.makeExpAsElement(exp, varName, varIsType, imports);
        }
    }

    public static makeExpAsType(exp: PitExp, varName: string, varIsType: boolean, imports: FreClassifier[]): string {
        let result: string = "";
        if (exp instanceof PitAnytypeExp) {
            result = `AstType.ANY_TYPE`;
        } else if (exp instanceof PitBinaryExp) {
            result = "null /* PitBinaryExp */";
        } else if (exp instanceof PitCreateExp) {
            ListUtil.addIfNotPresent(imports, exp.type);
            // result = `${Names.classifier(exp.type)}.create({
            //     ${exp.propertyDefs.map(prop => `${prop.property.name}: ${TyperGenUtils.makePropValue(prop, varName, varIsType, imports)}`)}
            // }) /* PitCreateExp A */`;
            result = `${Names.classifier(exp.type)}.create({
                ${exp.propertyDefs.map(prop => `${prop.property.name}: ${FreonTyperGenUtils.makePropValue(prop, varName, varIsType, imports)}`)}
            }) /* PitCreateExp A */`;
            if (this.types.includes(exp.type)) {
                // the 'create' makes an object that is an AST concept, not a PitTypeConcept
                // therefore we need to wrap it in a FreType object
                result = `AstType.create({ astElement: ${result} }) /* PitCreateExp B */`;
            }
        } else if (exp instanceof PitFunctionCallExp) {
            if (exp.calledFunction === typeofName) {
                const myParam: PitExp = exp.actualParameters[0];
                if (myParam instanceof PitPropertyCallExp && myParam.property.isList) {
                    result = `this.mainTyper.commonSuperType(${FreonTyperGenUtils.makeExpAsElement(myParam, varName, varIsType, imports)}) /* PitFunctionCallExp A */`;
                } else {
                    result = `this.mainTyper.${inferFunctionName}(${FreonTyperGenUtils.makeExpAsElement(myParam, varName, varIsType, imports)}) /* PitFunctionCallExp B */`;
                }
            } else if (exp.calledFunction === commonSuperName) {
                // TODO params that are lists themselves
                result = `this.mainTyper.commonSuperType([${exp.actualParameters.map(par => `${FreonTyperGenUtils.makeExpAsElement(par, varName, varIsType, imports)}`). join(", ")}])`;
            } else {
                result = "null /* PitFunctionCallExp */"
            }
        } else if (exp instanceof PitLimitedInstanceExp) {
            result = `AstType.create({ astElement: ${FreonTyperGenUtils.makeExpAsElement(exp, varName, varIsType, imports)} }) /* PitLimitedInstanceExp */`;
        } else if (exp instanceof PitPropertyCallExp) {
            if (exp.property.isList) {
                // use common super type, because the argument to inferType is a list
                result = `this.mainTyper.commonSuper(${FreonTyperGenUtils.makeExpAsElement(exp, varName, varIsType, imports)}) /* PitPropertyCallExp A */`;
            } else {
                try {
                    if (FreonTyperGenUtils.isType(exp.returnType)) {
                        result = `${FreonTyperGenUtils.makeExpAsElement(exp, varName, varIsType, imports)} /* PitPropertyCallExp B */`;
                    } else {
                        if (varName === "modelelement" && varIsType) {
                            throw new Error("FOUTTTTT: " + varName + ": " + varIsType);
                        }
                        if (varName !== "modelelement" && !varIsType) {
                            throw new Error("FOUTTTTT: " + varName + ": " + varIsType);
                        }
                        result = `this.mainTyper.${inferFunctionName}(${FreonTyperGenUtils.makeExpAsElement(exp, varName, varIsType, imports)}) /* PitPropertyCallExp C */`;
                    }
                } catch (e) {
                    console.log(e.stack)
                }
            }
        } else if (exp instanceof PitSelfExp) {
            ListUtil.addIfNotPresent(imports, exp.returnType);
            result = `AstType.create({ astElement: ${FreonTyperGenUtils.makeExpAsElement(exp, varName, varIsType, imports)} }) /* PitSelfExp B */`;
        } else if (exp instanceof PitVarCallExp) {
            result = "null /* PitVarCallExp B */";
        } else if (exp instanceof PitWhereExp) {
            result = "null /* PitWhereExp B */";
        }
        return result;
    }

    public static makeExpAsElement(exp: PitExp, varName: string, varIsType: boolean, imports: FreClassifier[]): string {
        let result: string = "";
        if (exp instanceof PitAnytypeExp) {
            result = Names.FreType + ".ANY";
        } else if (exp instanceof PitBinaryExp) {
            result = "PitBinaryExp";
        } else if (exp instanceof PitCreateExp) {
            result = "PitCreateExp";
        } else if (exp instanceof PitFunctionCallExp) {
            if (exp.calledFunction === typeofName) {
                result = FreonTyperGenUtils.makeExpAsType(exp, varName, varIsType, imports);
            } else if (exp.calledFunction === commonSuperName) {
                result = FreonTyperGenUtils.makeExpAsType(exp, varName, varIsType, imports);
            } else {
                result = "PitFunctionCallExp";
            }
        } else if (exp instanceof PitLimitedInstanceExp) {
            ListUtil.addIfNotPresent(imports, exp.myLimited);
            result = exp.myLimited.name + "." + exp.myInstance.name;
        } else if (exp instanceof PitPropertyCallExp) {
            result = FreonTyperGenUtils.makeExpAsElement(exp.source, varName, varIsType, imports);
            result += "?." + exp.property.name;
            if (!exp.property.isPart) {
                result += "?.referred";
            }
        } else if (exp instanceof PitSelfExp) {
            ListUtil.addIfNotPresent(imports, exp.returnType);
            result = `(${varName} as ${Names.classifier(exp.returnType)}) /* PitSelfExp A */`;
        } else if (exp instanceof PitVarCallExp) {
            if (varIsType) {
                result = `(${varName} as ${Names.classifier(exp.returnType)}) /* PitVarCallExp A1 */`;
            } else {
                result = `(${varName} as ${Names.classifier(exp.returnType)}) /* PitVarCallExp A2 */`;
            }
        } else if (exp instanceof PitWhereExp) {
            result = "PitWhereExp";
        }
        return result;
    }

    public static makePropValue(propExp: PitPropInstance, varName: string, varIsType: boolean, imports: FreClassifier[]): string {
        let result: string= FreonTyperGenUtils.makeExpAsTypeOrElement(propExp.value, varName, varIsType, imports);
        if (!propExp.property.isPart) { // it is a reference, wrap it in a FreElementReference
            // TODO find solution for this import, currently it is imported always
            // ListUtil.addIfNotPresent(imports, Names.PiElementReference);
            const typeName: string = Names.classifier(propExp.property.type);
            ListUtil.addIfNotPresent(imports, propExp.property.type);
            result = `${Names.FreNodeReference}.create<${typeName}>(${result}, "${typeName}") /* PropValue */ `;
        }
        return result;
    }

    public static makeCopyEntry(prop: FreProperty, toBeCopiedName: string, toBeCopiedTypeName: string): string {
        // TODO lists
        const typeName: string = Names.classifier(prop.type);
        if (prop.isPart) {
            return `this.makeCopyOf${typeName}((${toBeCopiedName} as ${toBeCopiedTypeName}).${prop.name})`;
        } else {
            return `${Names.FreNodeReference}.create<${typeName}>((${toBeCopiedName} as ${toBeCopiedTypeName}).\$${prop.name}, "${typeName}")`;
        }
        return '';
    }

}
