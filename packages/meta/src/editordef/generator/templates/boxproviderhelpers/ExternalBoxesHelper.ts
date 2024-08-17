import {
    FreEditPropertyProjection, FreEditSimpleExternal,
} from "../../../metalanguage/index.js";
import {
    FreMetaConceptProperty,
    FreMetaPrimitiveProperty,
    FreMetaProperty
} from "../../../../languagedef/metalanguage/index.js";
import {ListUtil} from "../../../../utils/index.js";
import {BoxProviderTemplate} from "../BoxProviderTemplate.js";

export class ExternalBoxesHelper {
    private _myTemplate: BoxProviderTemplate;

    constructor(myTemplate: BoxProviderTemplate) {
        this._myTemplate = myTemplate;
    }

    public generatePrimAsExternal(item: FreEditPropertyProjection, property: FreMetaPrimitiveProperty, elementVarName: string, innerResult: string): string {
        let result: string = '';
        if (!!item.externalInfo!.wrapBy && item.externalInfo!.wrapBy.length > 0) {
            // wrap the result in an ExternalBox
            result += this.wrapPrimByExternal(item, property, elementVarName, innerResult);
        } else {
            // replace the property box by an ExternalBox
            result += this.replacePrimByExternal(item, property, elementVarName);
        }
        return result;
    }

    public generateSingleAsExternal(item: FreEditPropertyProjection, property: FreMetaConceptProperty, elementVarName: string, innerResult: string): string {
        let result: string = '';
        if (!!item.externalInfo!.wrapBy && item.externalInfo!.wrapBy.length > 0) {
            // wrap the result in an ExternalBox
            result += this.wrapSingleByExternal(item, property, elementVarName, innerResult);
        } else {
            // replace the property box by an ExternalBox
            result += this.replaceSingleByExternal(item, property, elementVarName);
        }
        return result;
    }

    public generateListAsExternal(item: FreEditPropertyProjection, property: FreMetaConceptProperty, elementVarName: string, innerResult: string): string {
        let result: string = '';
        if (!!item.externalInfo!.wrapBy && item.externalInfo!.wrapBy.length > 0) {
            // wrap the result in an ExternalBox
            result += this.wrapListByExternal(item, property, elementVarName, innerResult);
        } else {
            // replace the property box by an ExternalBox
            result += this.replaceListByExternal(item, property, elementVarName);
        }
        return result;
    }

    public generateSimpleExternal(
        item: FreEditSimpleExternal,
        element: string,
        mainBoxLabel: string
    ): string {
        // create role todo make sure this is the right role
        const myRole: string = `${mainBoxLabel}-simple-external-${item.name!}`;
        // build the initializer with parameters to the external component
        let initializer: string = '';
        if (!!item.params && item.params.length > 0) {
            initializer = `, { params: [${item.params.map(x => `{key: "${x.key}", value: "${x.value}"}`).join(", ")}] }`;
        }
        ListUtil.addIfNotPresent(this._myTemplate.coreImports, "ExternalSimpleBox");
        return `new ExternalSimpleBox("${item.name}", ${element}, "${myRole}"${initializer})`;
    }

    private wrapSingleByExternal(item: FreEditPropertyProjection, propertyConcept: FreMetaConceptProperty, elementVarName: string, innerResult: string): string {
        let initializer: string = this.buildInitializer(item);
        // todo get the role correct
        let myRole: string = `${propertyConcept.name}-external-${item.externalInfo!.wrapBy}`;
        ListUtil.addIfNotPresent(this._myTemplate.coreImports, "PartWrapperBox");
        return `new PartWrapperBox(
                    "${item.externalInfo!.wrapBy}",
                    ${elementVarName},
                    "${myRole}",
                    "${propertyConcept.name}",
                    ${innerResult},
                    ${initializer}
                    )`;
    }

    private replaceSingleByExternal(item: FreEditPropertyProjection, propertyConcept: FreMetaConceptProperty, elementVarName: string): string {
        let initializer: string = this.buildInitializer(item);
        // todo get the role correct
        let myRole: string = `${propertyConcept.name}-external-${item.externalInfo!.replaceBy}`;
        ListUtil.addIfNotPresent(this._myTemplate.coreImports, "ExternalPartBox");
        return `new ExternalPartBox(
                    "${item.externalInfo!.replaceBy}",
                    ${elementVarName},
                    "${myRole}",
                    "${propertyConcept.name}",
                    ${initializer}
                    )`;
    }

    private wrapListByExternal(item: FreEditPropertyProjection, propertyConcept: FreMetaConceptProperty, elementVarName: string, innerResult: string) {
        let initializer: string = this.buildInitializer(item);
        // todo get the role correct
        let myRole: string = `${propertyConcept.name}-external-wrap-by-${item.externalInfo!.wrapBy}`;
        ListUtil.addIfNotPresent(this._myTemplate.coreImports, "PartListWrapperBox");
        return `new PartListWrapperBox(
                    "${item.externalInfo!.wrapBy}",
                    ${elementVarName},
                    "${myRole}",
                    "${propertyConcept.name}",
                    ${innerResult}
                    ${initializer}
                    )`;
    }

    private replaceListByExternal(item: FreEditPropertyProjection, propertyConcept: FreMetaConceptProperty, elementVarName: string) {
        let initializer: string = this.buildInitializer(item);
        // todo get the role correct
        let myRole: string = `${propertyConcept.name}-external-replace-by-${item.externalInfo!.replaceBy}`;
        ListUtil.addIfNotPresent(this._myTemplate.coreImports, "ExternalPartListBox");
        return `new ExternalPartListBox(
                    "${item.externalInfo!.replaceBy}",
                    ${elementVarName},
                    "${myRole}",
                    "${propertyConcept.name}",
                    BoxUtil.makePartItems(${elementVarName}, ${elementVarName}.${propertyConcept.name}, "${propertyConcept.name}", this.mainHandler)
                    ${initializer}
                    )`;
    }

    private wrapPrimByExternal(item: FreEditPropertyProjection, propertyConcept: FreMetaProperty, elementVarName: string, innerBoxStr: string): string {
        let initializer: string = this.buildInitializer(item);
        // todo get the role correct
        let myRole: string = `${propertyConcept.name}-external-wrap-${item.externalInfo!.wrapBy}`;
        let boxType: string = 'StringWrapperBox';
        switch (propertyConcept.type.name) {
            case 'identifier'   : { boxType = 'StringWrapperBox'; break;}
            case 'string'       : { boxType = 'StringWrapperBox'; break;}
            case 'boolean'      : { boxType = 'BooleanWrapperBox'; break;}
            case 'number'       : { boxType = 'NumberWrapperBox'; break;}
        }
        ListUtil.addIfNotPresent(this._myTemplate.coreImports, `${boxType}`);
        return `new ${boxType}(
                    "${item.externalInfo!.wrapBy}",
                    ${elementVarName},
                    "${myRole}",
                    "${propertyConcept.name}",
                    ${innerBoxStr}
                    ${initializer}
                    )`;
    }

    private replacePrimByExternal(item: FreEditPropertyProjection, property: FreMetaPrimitiveProperty, elementVarName: string): string {
        let initializer: string = this.buildInitializer(item);
        // todo get the role correct
        let myRole: string = `${property.name}-external-replace-${item.externalInfo!.replaceBy}`;
        let boxType: string = 'ExternalStringBox';
        switch (property.type.name) {
            case 'identifier'   : { boxType = 'ExternalStringBox'; break;}
            case 'string'       : { boxType = 'ExternalStringBox'; break;}
            case 'boolean'      : { boxType = 'ExternalBooleanBox'; break;}
            case 'number'       : { boxType = 'ExternalNumberBox'; break;}
        }
        ListUtil.addIfNotPresent(this._myTemplate.coreImports, `${boxType}`);
        return `new ${boxType}(
                    "${item.externalInfo!.replaceBy}",
                    ${elementVarName},
                    "${myRole}",
                    "${property.name}"
                    ${initializer}
                    )`;
    }

    private buildInitializer(item: FreEditPropertyProjection) {
        // build the initializer with parameters to the external component
        let initializer: string = '';
        if (!!item.externalInfo!.params && item.externalInfo!.params.length > 0) {
            initializer = `, { params: [${item.externalInfo!.params.map(x => `{key: "${x.key}", value: "${x.value}"}`).join(", ")}] }`;
        }
        return initializer;
    }
}
