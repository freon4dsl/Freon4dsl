import {
    PitAnytypeExp,
    PitConforms,
    PitEquals,
    PitExp,
    PitFunctionCallExp,
    PitLimitedInstanceExp,
    PitPropertyCallExp,
    PitSelfExp,
    PitWhereExp,
    PiTyperDef
} from "../../new-metalanguage";
import { ListUtil, Names } from "../../../utils";
import { PiClassifier, PiLanguage, PiProperty } from "../../../languagedef/metalanguage";

const conformsFunctionName: string = "conformsTo";
const equalsFunctionName: string = "equalsType";

export class TyperGenUtils {
    public static makeTypeScriptForExp(exp: PitExp, varName: string, imports: string[], noSource?: boolean): string {
        // console.log("makeTypeScriptForExp " + exp.toPiString() + "[" + exp.constructor.name + "]")
        if (exp instanceof PitAnytypeExp) {
            return "any";
        } else if (exp instanceof PitFunctionCallExp) {
            let argumentsStr: string = exp.actualParameters.map(arg => `this.mainTyper.inferType(${this.makeTypeScriptForExp(arg, varName, imports)})`).join(", ");
            if (exp.calledFunction === 'typeof') {
                // we know that typeof has a single argument
                if (exp.actualParameters[0] instanceof PitPropertyCallExp && exp.actualParameters[0].property.isList) { // use common super type, because the argument to inferType is a list
                    return `this.mainTyper.commonSuper(${argumentsStr})`;
                } else {
                    return argumentsStr;
                }
            } else if (exp.calledFunction === 'commonSuperType') {
                return `this.mainTyper.commonSuper([${argumentsStr}])`;
            } else {
                return `${exp.calledFunction}(${argumentsStr})`;
            }
        } else if (exp instanceof PitPropertyCallExp) {
            let refText: string = '';
            if (!exp.property.isPart) {
                refText = ".referred";
            }
            if (noSource) { // replace the name of the property by the parameter 'varName'
                return `${exp.property.name}${refText}`;
            } else {
                // return `${this.makeSourceTypeScript(exp, varName, imports)}${exp.property.name}${refText}`;
                return ''
            }
        } else if (exp instanceof PitLimitedInstanceExp) {
            ListUtil.addIfNotPresent(imports, Names.concept(exp.myLimited));
            return Names.concept(exp.myLimited) + "." + Names.instance(exp.myInstance);
        } else if (exp instanceof PitSelfExp) {
            ListUtil.addIfNotPresent(imports, Names.classifier(exp.returnType));
            return `(${varName} as ${Names.classifier(exp.returnType)})`;
        } else if (exp instanceof PitConforms) {
            const leftVarName: string = "left";
            const rightVarName: string = "right";
            return `this.mainTyper.${conformsFunctionName}(${this.makeTypeScriptForExp(exp.left, leftVarName, imports)}, ${this.makeTypeScriptForExp(exp.right, rightVarName, imports)})`;
        } else if (exp instanceof PitEquals) {
            const leftVarName: string = "left";
            const rightVarName: string = "right";
            return `this.mainTyper.${equalsFunctionName}(${this.makeTypeScriptForExp(exp.left, leftVarName, imports)}, ${this.makeTypeScriptForExp(exp.right, rightVarName, imports)})`;
        } else if (exp instanceof PitWhereExp) {
            // no common typescript for all occcurences of whereExp
        }
        return '';
    }

    // public static makeSourceTypeScript(exp: PitApplied, varName: string, imports: string[]) {
    //     let sourceStr: string = "";
    //     if (!!exp.source) {
    //         sourceStr = this.makeTypeScriptForExp(exp.source, varName, imports) + ".";
    //     }
    //     return sourceStr;
    // }

    static getTypeRoot(language: PiLanguage, typerdef: PiTyperDef) {
        let rootType: string = Names.allConcepts(language);
        if (!!typerdef && !!typerdef.typeRoot) {
            if (typerdef.typeRoot !== PiClassifier.ANY) {
                rootType = Names.classifier(typerdef.typeRoot);
            }
        }
        return rootType;
    }

    // static removeBaseSource(otherTypePart: PitExp | PitAppliedExp): PitAppliedExp {
    //     // console.log("removing base Source: " + otherTypePart.toPiString());
    //     if (otherTypePart instanceof PitAppliedExp && !!otherTypePart.source) {
    //         if (!(otherTypePart.source instanceof PitAppliedExp)) {
    //             return this.removeBaseSource(otherTypePart.source);
    //         } else {
    //             otherTypePart.source = null;
    //             // console.log("remove returns: " + otherTypePart.toPiString());
    //             return otherTypePart;
    //         }
    //     }
    //     console.log("remove returns: null" );
    //     return null;
    // }

    static makeCopyEntry(prop: PiProperty, toBeCopiedName: string, toBeCopiedTypeName: string): string {
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
