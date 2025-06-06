import {
    FreAppliedExp,
    FreFunctionExp,
    FreLangExpNew, FreLangSimpleExp,
    FreLimitedInstanceExp,
    FreVarExp
} from "../metalanguage/index.js"
import { Names } from "../../utils/index.js"
import { MetaFunctionNames } from "../../utils/MetaFunctionNames.js"

export class ExpressionGenerationUtil {

    public static langExpToTypeScript(exp: FreLangExpNew, paramName: string, previousExpAsTS: string): string {
        let result: string = '';
        if (exp instanceof FreVarExp) {
            if (exp.name === Names.nameForSelf) {
                result = 'self';
            } else {
                result = exp.name;
            }
            if (!!exp.applied) {
                result = `(${result}).${this.langExpToTypeScript(exp.applied, paramName, result)}`;
            }
        } else if (exp instanceof FreFunctionExp) {
            switch (exp.name) {
                case MetaFunctionNames.typeFunc: {
                    result = `LanguageEnvironment.getInstance().typer.inferType(${previousExpAsTS});)`
                    break;
                }
                case MetaFunctionNames.ifFunc: {
                    break;
                }
                case MetaFunctionNames.ownerFunc: { result = 'freOwner()'; break;}
                case MetaFunctionNames.conformsToFunc: { result = '/* TODO conformTo */'; break;}
                case MetaFunctionNames.equalsTypeFunc: { result = '/* TODO equalsType */'; break;}
            }
            if (!!exp.applied) {
                result = `(${result}).${this.langExpToTypeScript(exp.applied, paramName, result)}`;
            }
        } else if (exp instanceof FreAppliedExp) {
            result = `.${this.langExpToTypeScript(exp.exp, paramName, result)}`;
        } else if (exp instanceof FreLimitedInstanceExp) {

        } else if (exp instanceof FreLangSimpleExp) {

        } else {

        }
        return result;
    }
}
