import {
    PitAnytypeExp,
    PitExp,
    PitFunctionCallExp,
    PitLimitedInstanceExp,
    PitPropertyCallExp,
    PitSelfExp,
    PitWhereExp
} from "../../new-metalanguage";
import { ListUtil, Names } from "../../../utils";
import { PiClassifier } from "../../../languagedef/metalanguage";
import { PitBinaryExp, PitCreateExp, PitVarCallExp } from "../../new-metalanguage/expressions";

const inferFunctionName: string = "inferType";
const conformsFunctionName: string = "conformsTo";
const equalsFunctionName: string = "equalsType";
const typeofName: string = 'typeof';
const commonSuperName: string= 'commonSuperType';

export class NewTyperGenUtils {
    static types: PiClassifier[] = [];

    public static makeExpAsTypeOrElement(exp: PitExp, varName: string, imports: PiClassifier[]): string {
        if (NewTyperGenUtils.types.includes(exp.returnType)) {
            return NewTyperGenUtils.makeExpAsType(exp, varName, imports);
        } else {
            return NewTyperGenUtils.makeExpAsElement(exp, varName, imports);
        }
    }

    public static makeExpAsType(exp: PitExp, varName: string, imports: PiClassifier[]): string {
        let result: string = "";
        if (exp instanceof PitAnytypeExp) {
            result = `PiType.create({ internal: PiType.ANY_TYPE });`;
        } else if (exp instanceof PitBinaryExp) {
            result = "null /* PitBinaryExp */";
        } else if (exp instanceof PitCreateExp) {
            ListUtil.addIfNotPresent(imports, exp.type);
            result = `${Names.classifier(exp.type)}.create({
                ${exp.propertyDefs.map(prop => `${prop.property.name}: ${NewTyperGenUtils.makeExpAsTypeOrElement(prop.value, varName, imports)}`)}
            })`;
        } else if (exp instanceof PitFunctionCallExp) {
            if (exp.calledFunction === typeofName) {
                const myParam: PitExp = exp.actualParameters[0];
                if (myParam instanceof PitPropertyCallExp && myParam.property.isList) {
                    result = `this.mainTyper.commonSuperType(${NewTyperGenUtils.makeExpAsElement(myParam, varName, imports)})`;
                } else {
                    result = `this.mainTyper.${inferFunctionName}(${NewTyperGenUtils.makeExpAsElement(myParam, varName, imports)})`;
                }
            } else if (exp.calledFunction === commonSuperName) {
                // TODO params that are lists themselves
                result = `this.mainTyper.commonSuperType([${exp.actualParameters.map(par => `${NewTyperGenUtils.makeExpAsElement(par, varName, imports)}`). join(", ")}])`;
            } else {
                result = "null /* PitFunctionCallExp */"
            }
        } else if (exp instanceof PitLimitedInstanceExp) {
            result = `PiType.create({ internal: ${NewTyperGenUtils.makeExpAsElement(exp, varName, imports)} })`;
        } else if (exp instanceof PitPropertyCallExp) {
            if (exp.property.isList) {
                // use common super type, because the argument to inferType is a list
                result = `this.mainTyper.commonSuper(${NewTyperGenUtils.makeExpAsElement(exp, varName, imports)})`;
            } else {
                result = `this.mainTyper.${inferFunctionName}(${NewTyperGenUtils.makeExpAsElement(exp, varName, imports)})`;
            }
        } else if (exp instanceof PitSelfExp) {
            ListUtil.addIfNotPresent(imports, exp.returnType);
            result = `PiType.create({ internal: ${NewTyperGenUtils.makeExpAsElement(exp, varName, imports)} })`;
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

}
