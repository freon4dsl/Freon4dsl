import {
    FreFunctionExp,
    FreLangExp,
    FreLangSimpleExp,
    FreLimitedInstanceExp,
    FreVarExp
} from "../metalanguage/index.js"
import { Imports, Names } from '../../utils/on-lang/index.js';
import { FreMetaClassifier, FreMetaProperty } from '../../languagedef/metalanguage/index.js';
import { MetaFunctionNames } from '../../utils/no-dependencies/index.js';

/**
 * This class should replace the use of GenerationUtil.langExpToTypeScript,
 * when all meta languages are adjusted to the new language expressions: FreLangExp.
 */
export class ExpressionGenerationUtil {
    static previousIsList: boolean = false;
    static previousMaybeUndefined: boolean = false;

    /**
     * Generates the typescript code for 'exp', which is an expression over the metamodel.
     * In the generated code 'paramName' is used to represent the 'self' object.
     * Anything that needs to be imported because it is used in the generated code is added to 'imports'.
     * If 'asFreNodeReference' is true, the expression is generated without '.referred', i.e. its result is
     * a FreNodeReference, not a FreNode. The default value if false. Note that only the last element of
     * a 'dotted' expression responds to this parameter. That is 'self.refProp1.refProp2', where both
     * 'refProp1' and 'refProp2' are references, is by default generated as 'paramName.refProp1.referred.refProp2.referred'.
     * Only when 'asFreNodeReference' is true, it is generated as 'paramName.refProp1.referred.refProp2'.
     * Actually, we use the $-sign notation, for which a getter function is generated: 'paramName.$refProp1.$refProp2'
     *
     * @param exp
     * @param paramName
     * @param imports
     * @param asFreNodeReference    if true, the expression is generated without '.referred', i.e. its result is a FreNodeReference, not a FreNode
     * @private
     */
    public static langExpToTypeScript(exp: FreLangExp, paramName: string, imports: Imports, asFreNodeReference?: boolean): string {
        this.previousIsList = false;
        this.previousMaybeUndefined = false;
        return this.langExpToTypeScriptPrivate(exp, paramName, imports, '', asFreNodeReference ? asFreNodeReference : false);
    }

    private static langExpToTypeScriptPrivate(exp: FreLangExp, paramName: string, imports: Imports, previousExpAsTS: string, asFreNodeReference: boolean): string {
        let result: string = '';
        if (exp instanceof FreVarExp) {
            if (exp.name === Names.nameForSelf) {
                result = paramName;
            } else {
                result = this.varExpToTypeScript(exp, paramName, imports, previousExpAsTS, asFreNodeReference);
            }
            if (!!exp.applied) {
                this.previousIsList = this.previousIsList || (exp.referredProperty? exp.referredProperty.isList : false);
                this.previousMaybeUndefined = this.previousMaybeUndefined || (exp.referredProperty? exp.referredProperty.isOptional : false);
                result = `${this.langExpToTypeScriptPrivate(exp.applied, paramName, imports, result, asFreNodeReference)}`;
            }
        } else if (exp instanceof FreFunctionExp) {
            switch (exp.name) {
                case MetaFunctionNames.typeFunc: {
                    result = this.typeFuncToTypeScript(exp, paramName, imports, previousExpAsTS);
                    break;
                }
                case MetaFunctionNames.ifFunc: {
                    result = this.ifFuncToTypeScript(exp, paramName, imports, previousExpAsTS);
                    break;
                }
                case MetaFunctionNames.ownerFunc: {
                    result = this.ownerFuncToTypescript(exp, paramName, imports, previousExpAsTS);
                    break;
                }
                case MetaFunctionNames.conformsToFunc: { result = '/* TODO conformTo */'; break;}
                case MetaFunctionNames.equalsTypeFunc: { result = '/* TODO equalsType */'; break;}
            }
            if (!!exp.applied) {
                this.previousIsList = this.previousIsList || (exp.referredProperty ? exp.referredProperty.isList : false);
                this.previousMaybeUndefined = this.previousMaybeUndefined || (exp.referredProperty? exp.referredProperty.isOptional : false);
                result = `${this.langExpToTypeScriptPrivate(exp.applied, paramName, imports, result, asFreNodeReference)}`;
            }
        } else if (exp instanceof FreLimitedInstanceExp) {
            imports.language.add(exp.conceptName);
            result = `${exp.conceptName}.${exp.instanceName}`;
        } else if (exp instanceof FreLangSimpleExp) {
            result = exp.value.toString();
        } else {
            result = 'Error: unknown expression';
        }
        return result;
    }

    /**
     *
     * @param exp
     * @param paramName
     * @param imports
     * @param previousExpAsTS
     * @private
     */
    private static ownerFuncToTypescript(exp: FreFunctionExp, paramName: string, imports: Imports, previousExpAsTS: string): string {
        if (!exp.referredClassifier) { // the applied expression must be 'if()', this is established in the checker
            if (!!exp.previous && !!previousExpAsTS && previousExpAsTS.length > 0) {
                // NB if there is a previous expression, there should also be a 'previousExpAsTS'
                if (this.previousMaybeUndefined) {
                    previousExpAsTS += '?';
                }
                if (this.previousIsList) {
                    const previousType: FreMetaClassifier = exp.previous.referredClassifier
                    imports.language.add(previousType.name);
                    return `${previousExpAsTS}.map((x: ${previousType.name}) => x.freOwner())`
                } else {
                    return `${previousExpAsTS}.freOwner()`;
                }
            } else {
                return `${paramName}.freOwner()`;
            }
        } else {
            imports.language.add(exp.referredClassifier.name);
            if (!!exp.previous && !!previousExpAsTS && previousExpAsTS.length > 0) {
                // NB if there is a previous expression, there should also be a 'previousExpAsTS'
                if (this.previousMaybeUndefined) {
                    previousExpAsTS += '?';
                }
                if (this.previousIsList) {
                    const previousType: FreMetaClassifier = exp.previous.referredClassifier
                    imports.language.add(previousType.name);
                    return `${previousExpAsTS}.map((x: ${previousType.name}) => (x.freOwner() as ${exp.referredClassifier.name}))`
                } else {
                    return `(${previousExpAsTS}.freOwner() as ${exp.referredClassifier.name})`;
                }
            } else {
                return `(${paramName}.freOwner() as ${exp.referredClassifier.name})`;
            }
        }
    }

    private static typeFuncToTypeScript(exp: FreFunctionExp, paramName: string, imports: Imports, previousExpAsTS: string): string {
        imports.root.add(Names.LanguageEnvironment);
        if (!!exp.previous && !!previousExpAsTS && previousExpAsTS.length > 0) {
            // NB if there is a previous expression, there should also be a 'previousExpAsTS'
            if (this.previousIsList) {
                if (this.previousMaybeUndefined) {
                    previousExpAsTS += '?';
                }
                const previousType: FreMetaClassifier = exp.previous.referredClassifier
                imports.language.add(previousType.name);
                this.previousMaybeUndefined = true;
                return `${previousExpAsTS}.map((x: ${previousType.name}) => ${Names.LanguageEnvironment}.getInstance().typer.inferType(x).toAstElement())`;
            } else {
                this.previousMaybeUndefined = true;
                return `${Names.LanguageEnvironment}.getInstance().typer.inferType(${previousExpAsTS}).toAstElement()`;
            }
        } else {
            this.previousMaybeUndefined = true;
            return `${Names.LanguageEnvironment}.getInstance().typer.inferType(${paramName}).toAstElement()`;
        }
    }

    private static ifFuncToTypeScript(exp: FreFunctionExp, paramName: string, imports: Imports, previousExpAsTS: string): string {
        imports.language.add(exp.referredClassifier.name);
        if (!!exp.previous && !!previousExpAsTS && previousExpAsTS.length > 0) {
            // NB if there is a previous expression, there should also be a 'previousExpAsTS'
            imports.core.add(Names.FreLanguage);
            if (this.previousIsList) {
                if (this.previousMaybeUndefined) {
                    previousExpAsTS += '?';
                }
                const previousType: FreMetaClassifier = exp.previous.referredClassifier
                imports.language.add(previousType.name);
                return `${previousExpAsTS}.filter((x: ${previousType.name}) => ${Names.FreLanguage}.getInstance().metaConformsToType(x, ${exp.referredClassifier.name}))`;
            } else {
                return this.nonListIfFuncToTS(previousExpAsTS, exp);
            }
        } else {
            return this.nonListIfFuncToTS(paramName, exp);
        }
    }

    private static nonListIfFuncToTS(previousExpAsTS: string, exp: FreFunctionExp) {
        this.previousMaybeUndefined = true;
        return `(${Names.FreLanguage}.getInstance().metaConformsToType(${previousExpAsTS}, '${exp.referredClassifier.name}') ?
                (${previousExpAsTS} as ${exp.referredClassifier.name}) :
                undefined)`;
    }

    private static varExpToTypeScript(exp: FreVarExp, paramName: string, imports: Imports, previousExpAsTS: string, asFreNodeReference: boolean) {
        // LOGGER.log('varExpToTypeScript ' + exp.toErrorString() + ' ' + this.previousMaybeUndefined)
        if (!exp.referredProperty) { // var refers to a classifier
            return exp.name;
        } else { // var refers to a property
            if (!exp.previous) {
                return this.generateNodeOrReference(exp, asFreNodeReference, paramName);
            } else {
                if (this.previousMaybeUndefined) {
                    previousExpAsTS += '?';
                }
                const thisProperty: FreMetaProperty = exp.referredProperty;
                if (this.previousIsList) {
                    const previousType: FreMetaClassifier = exp.previous.referredClassifier
                    imports.language.add(previousType.name);
                    if (thisProperty?.isList) {
                        return `${previousExpAsTS}.map((x: ${previousType.name}) => x.${exp.name}).flat()`;
                    } else {
                        return `${previousExpAsTS}.map((x: ${previousType.name}) => x.${exp.name})`;
                    }
                } else {
                    this.previousIsList = thisProperty?.isList;
                    this.previousMaybeUndefined = this.previousMaybeUndefined || thisProperty?.isOptional;
                    return this.generateNodeOrReference(exp, asFreNodeReference, previousExpAsTS);
                }
            }
        }
    }

    /**
     * Generates the expression as a FreNodeReference or a FreNode, depending on 'asFreNodeReference'.
     * Note that only the last of the expression may be an instance of FreNodeReference, all other parts are generated as FreNodes.
     *
     * @param exp
     * @param asFreNodeReference
     * @param previousExpAsTS
     * @private
     *
     */
    private static generateNodeOrReference(exp: FreVarExp, asFreNodeReference: boolean, previousExpAsTS: string) {
        if (!exp.referredProperty.isPart && !exp.applied && !asFreNodeReference) {
            // Use a $-sign, for example 'node.$referredProp', to get the referred node from a FreNodeReference
            // We could also use 'node.referredProp.referred'.
            return `${previousExpAsTS}.\$${exp.name}`;
        } else {
            return `${previousExpAsTS}.${exp.name}`;
        }
    }
}
