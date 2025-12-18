import type { FreEditExternalInfo, FreEditFragmentProjection, FreEditPropertyProjection, FreEditSimpleExternal } from "../../../metalanguage/index.js"
import type {
    FreMetaConceptProperty,
    FreMetaLanguage,
    FreMetaPrimitiveProperty,
    FreMetaProperty,
} from "../../../../languagedef/metalanguage/index.js";
import { Names } from '../../../../utils/on-lang/index.js';
import type { BoxProviderTemplate } from "../BoxProviderTemplate.js";

export class ExternalBoxesHelper {
    private _myTemplate: BoxProviderTemplate;

    constructor(myTemplate: BoxProviderTemplate) {
        this._myTemplate = myTemplate;
    }

    public generatePrimAsExternal(
        item: FreEditPropertyProjection,
        property: FreMetaPrimitiveProperty,
        elementVarName: string,
        innerResult: string,
    ): string {
        let result: string = "";
        if (!!item.externalInfo!.wrapBy && item.externalInfo!.wrapBy.length > 0) {
            // wrap the result in an ExternalBox
            if (!innerResult || innerResult.length === 0) {
                innerResult = "null";
            }
            result += this.wrapPrimByExternal(item, property, elementVarName, innerResult);
        } else {
            // replace the property box by an ExternalBox
            result += this.replacePrimByExternal(item, property, elementVarName);
        }
        return result;
    }

    public generateSingleAsExternal(
        item: FreEditPropertyProjection,
        property: FreMetaConceptProperty,
        elementVarName: string,
        innerResult: string,
    ): string {
        let result: string = "";
        if (!!item.externalInfo!.wrapBy && item.externalInfo!.wrapBy.length > 0) {
            // wrap the result in an ExternalBox
            if (!innerResult || innerResult.length === 0) {
                innerResult = "null";
            }
            result += this.wrapByExternal(item, property, elementVarName, innerResult);
        } else {
            // replace the property box by an ExternalBox
            result += this.replaceSingleByExternal(item, property, elementVarName);
        }
        return result;
    }

    public generateListAsExternal(
        item: FreEditPropertyProjection,
        property: FreMetaConceptProperty,
        elementVarName: string,
        innerResult: string,
        language: FreMetaLanguage,
    ): string {
        let result: string = "";
        if (!!item.externalInfo!.wrapBy && item.externalInfo!.wrapBy.length > 0) {
            // wrap the result in an ExternalBox
            if (!innerResult || innerResult.length === 0) {
                innerResult = "null";
            }
            result += this.wrapByExternal(item, property, elementVarName, innerResult);
        } else {
            // replace the property box by an ExternalBox
            result += this.replaceListByExternal(item, property, elementVarName, language);
        }
        return result;
    }

    public generateSimpleExternal(item: FreEditSimpleExternal, element: string, mainBoxLabel: string): string {
        // create role todo make sure this is the right role
        const myRole: string = `${mainBoxLabel}-simple-external-${item.name!}`;
        // build the initializer with parameters to the external component
        let initializer: string = "";
        if (!!item.params && item.params.length > 0) {
            initializer = `, { params: [${item.params.map((x) => `{key: "${x.key}", value: "${x.value}"}`).join(", ")}] }`;
        }
        this._myTemplate.imports.core.add("SimpleExternalBox");
        return `new SimpleExternalBox("${item.name}", ${element}, "${myRole}"${initializer})`;
    }

    private wrapByExternal(
        item: FreEditPropertyProjection,
        property: FreMetaProperty,
        elementVarName: string,
        innerResult: string,
    ): string {
        let initializer: string = this.buildInitializer(item);
        let methodName: string = "partWrapperBox";
        if (property.isPart && property.isList) {
            methodName = "partListWrapperBox";
        } else if (property.isPart && !property.isList) {
            methodName = "partWrapperBox";
        } else if (!property.isPart && property.isList) {
            methodName = "refListWrapperBox";
        } else if (!property.isPart && !property.isList) {
            methodName = "refWrapperBox";
        }
        return `BoxUtil.${methodName}(
                        ${elementVarName},
                        "${property.name}",
                        "${item.externalInfo!.wrapBy}",
                    ${innerResult}
                    ${initializer}
                    )`;
    }

    private replaceSingleByExternal(
        item: FreEditPropertyProjection,
        property: FreMetaConceptProperty,
        elementVarName: string,
    ): string {
        let initializer: string = this.buildInitializer(item);
        let methodName: string = "partReplacerBox";
        if (!property.isPart) {
            methodName = "refReplacerBox";
        }
        this._myTemplate.imports.core.add(`BoxUtil`);
        return `BoxUtil.${methodName}(
                        ${elementVarName},
                        "${property.name}",
                        "${item.externalInfo!.replaceBy}"
                        ${initializer}
                    ),`;
    }

    private replaceListByExternal(
        item: FreEditPropertyProjection,
        property: FreMetaConceptProperty,
        elementVarName: string,
        // @ts-ignore
        language: FreMetaLanguage,
    ) {
        let initializer: string = this.buildInitializer(item);
        this._myTemplate.imports.core.add(`BoxUtil`);
        if (property.isPart) {
            return `BoxUtil.partListReplacerBox(
                        ${elementVarName},
                        ${elementVarName}.${property.name},
                        "${property.name}",
                        "${item.externalInfo!.replaceBy}",
                        this.mainHandler
                        ${initializer}
                    )`;
        } else {
            return `BoxUtil.refListReplacerBox(
                        ${elementVarName},
                        "${property.name}",
                        "${item.externalInfo!.replaceBy}",
                        ${Names.LanguageEnvironment}.getInstance().scoper
                        ${initializer}
                    )`;
        }
    }

    private wrapPrimByExternal(
        item: FreEditPropertyProjection,
        propertyConcept: FreMetaProperty,
        elementVarName: string,
        innerBoxStr: string,
    ): string {
        let initializer: string = this.buildInitializer(item);
        let methodName: string = "stringWrapperBox";
        switch (propertyConcept.type.name) {
            case "boolean": {
                methodName = "booleanWrapperBox";
                break;
            }
            case "number": {
                methodName = "numberWrapperBox";
                break;
            }
        }
        this._myTemplate.imports.core.add(`BoxUtil`);
        return `BoxUtil.${methodName}(
                        ${elementVarName},
                        "${propertyConcept.name}",
                        "${item.externalInfo!.wrapBy}",
                        ${innerBoxStr}
                        ${initializer}
                    )`;
    }

    private replacePrimByExternal(
        item: FreEditPropertyProjection,
        property: FreMetaPrimitiveProperty,
        elementVarName: string,
    ): string {
        let initializer: string = this.buildInitializer(item);
        let methodName: string = "stringReplacerBox";
        switch (property.type.name) {
            case "boolean": {
                methodName = "booleanReplacerBox";
                break;
            }
            case "number": {
                methodName = "numberReplacerBox";
                break;
            }
        }
        this._myTemplate.imports.core.add(`BoxUtil`);
        return `BoxUtil.${methodName}(${elementVarName}, "${property.name}", "${item.externalInfo!.replaceBy}" ${initializer})`;
    }

    private buildInitializer(item: FreEditPropertyProjection) {
        return this.buildExternalInitializer(item.externalInfo!)
    }
 
    private buildFragmentInitializer(item: FreEditFragmentProjection) {
        return this.buildExternalInitializer(item.wrapperInfo!)
    }

    private buildExternalInitializer(externalInfo: FreEditExternalInfo) {
        // build the initializer with parameters to the external component
        let initializer: string = "";
        if (!!externalInfo.params && externalInfo.params.length > 0) {
            initializer = `, { params: [${externalInfo.params.map((x) => `{key: "${x.key}", value: "${x.value}"}`).join(", ")}] }`;
        }
        return initializer;
    }

    wrapFragmentByExternal(item: FreEditFragmentProjection, elementVarName: string, innerBoxStr: string,): string {
        let initializer: string = this.buildFragmentInitializer(item);
        let methodName: string = "fragmentWrapperBox";
        this._myTemplate.imports.core.add('BoxUtil')
        return `BoxUtil.${methodName}(
                        ${elementVarName},
                        "${item.wrapperInfo!.wrapBy}",
                        ${innerBoxStr}
                        ${initializer}
                    )`;
    }
}
