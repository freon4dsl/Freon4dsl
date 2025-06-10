import {
    FreFunctionExp,
    FreLangExpNew,
    FreLangSimpleExpNew,
    FreLimitedInstanceExp,
    FreVarExp
} from "../metalanguage/index.js"
import { Names } from "../../utils/on-lang/index.js"
import { FreMetaProperty } from '../../languagedef/metalanguage/index.js';
import { MetaFunctionNames } from '../../utils/no-dependencies/index.js';

/**
 * This class should replace the use of GenerationUtil.langExpToTypeScript,
 * when all meta languages are adjusted to the new language expressions: FreLangExpNew.
 */
export class ExpressionGenerationUtil {

    public static langExpToTypeScript(exp: FreLangExpNew, paramName: string, previousExpAsTS?: string): string {
        let result: string = '';
        if (exp instanceof FreVarExp) {
            if (exp.name === Names.nameForSelf) {
                result = paramName;
            } else {
                result = this.varExpToTypeScript(exp, paramName, previousExpAsTS);
            }
            if (!!exp.applied) {
                result = `${this.langExpToTypeScript(exp.applied, paramName, result)}`;
            }
        } else if (exp instanceof FreFunctionExp) {
            switch (exp.name) {
                case MetaFunctionNames.typeFunc: {
                    result = this.typeFuncToTypeScript(exp, paramName, previousExpAsTS);
                    break;
                }
                case MetaFunctionNames.ifFunc: {
                    result = this.ifFuncToTypeScript(exp, paramName, previousExpAsTS);
                    break;
                }
                case MetaFunctionNames.ownerFunc: { result = `${paramName}.freOwner()`; break;}
                case MetaFunctionNames.conformsToFunc: { result = '/* TODO conformTo */'; break;}
                case MetaFunctionNames.equalsTypeFunc: { result = '/* TODO equalsType */'; break;}
            }
            if (!!exp.applied) {
                result = `${this.langExpToTypeScript(exp.applied, paramName, result)}`;
            }
        } else if (exp instanceof FreLimitedInstanceExp) {
            result = `${exp.conceptName}.${exp.instanceName}`;
        } else if (exp instanceof FreLangSimpleExpNew) {
            result = exp.value.toString();
        } else {
            result = 'Error: unknown expression';
        }
        return result;
    }

    private static typeFuncToTypeScript(exp: FreFunctionExp, paramName: string, previousExpAsTS: string | undefined) {
        if (!!exp.previous && !!previousExpAsTS && previousExpAsTS.length > 0) {
            // NB if there is a previous expression, there should also be a 'previousExpAsTS'
            const previousProperty: FreMetaProperty = exp.previous.referredProperty;
            if (!!previousProperty && previousProperty?.isList) {
                const thisProperty: FreMetaProperty = exp.referredProperty;
                if (thisProperty?.isList) {
                    return `${previousExpAsTS}.map(_x => LanguageEnvironment.getInstance().typer.inferType(_x)).flat()`;
                } else {
                    return `${previousExpAsTS}.map(_x => LanguageEnvironment.getInstance().typer.inferType(_x))`;
                }
            } else {
                return `LanguageEnvironment.getInstance().typer.inferType(${previousExpAsTS})`;
            }
        } else {
            return `LanguageEnvironment.getInstance().typer.inferType(${paramName})`;
        }
    }

    private static ifFuncToTypeScript(exp: FreFunctionExp, paramName: string, previousExpAsTS: string | undefined) {
        if (!!exp.previous && !!previousExpAsTS && previousExpAsTS.length > 0) {
            // NB if there is a previous expression, there should also be a 'previousExpAsTS'
            const previousProperty: FreMetaProperty = exp.previous.referredProperty;
            if (!!previousProperty && previousProperty?.isList) {
                const thisProperty: FreMetaProperty = exp.referredProperty;
                if (thisProperty?.isList) {
                    return `${previousExpAsTS}.filter(_x => FreLanguage.getInstance().metaConformsToType(_x, ${exp.referredClassifier.name})).flat()`;
                } else {
                    return `${previousExpAsTS}.filter(_x => FreLanguage.getInstance().metaConformsToType(_x, ${exp.referredClassifier.name}))`;
                }
            } else {
                return `(${previousExpAsTS} as ${exp.referredClassifier.name})`;
            }
        } else {
            return `(${paramName} as ${exp.referredClassifier.name})`;
        }
    }

    private static varExpToTypeScript(exp: FreVarExp, paramName: string, previousExpAsTS: string | undefined) {
        if (!exp.referredProperty) { // var refers to a classifier
            return exp.name;
        } else { // var refers to a property
            if (!exp.previous) {
                return `${paramName}.${exp.name}`;
            } else {
                const previousProperty: FreMetaProperty = exp.previous.referredProperty;
                if (!!previousProperty && previousProperty?.isList) {
                    const thisProperty: FreMetaProperty = exp.referredProperty;
                    if (thisProperty?.isList) {
                        return `${previousExpAsTS}.map(_x => _x.${exp.name}).flat()`;
                    } else {
                        return `${previousExpAsTS}.map(_x => _x.${exp.name})`;
                    }
                } else {
                    return `${previousExpAsTS}.${exp.name}`;
                }
            }
        }
    }
}
