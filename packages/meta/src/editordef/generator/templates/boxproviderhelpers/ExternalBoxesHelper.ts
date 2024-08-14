import {FreEditPropertyProjection} from "../../../metalanguage/index.js";
import {FreMetaConceptProperty, FreMetaProperty} from "../../../../languagedef/metalanguage/index.js";
import {ListUtil} from "../../../../utils/index.js";
import {BoxProviderTemplate} from "../BoxProviderTemplate.js";

export class ExternalBoxesHelper {
    private _myTemplate: BoxProviderTemplate;

    constructor(myTemplate: BoxProviderTemplate) {
        this._myTemplate = myTemplate;
    }

    private buildInitializer(item: FreEditPropertyProjection) {
        // build the initializer with parameters to the external component
        let initializer: string = '';
        if (!!item.externalInfo!.params && item.externalInfo!.params.length > 0) {
            initializer = `, { params: [${item.externalInfo!.params.map(x => `{key: "${x.key}", value: "${x.value}"}`).join(", ")}] }`;
        }
        return initializer;
    }

    public generateListAsExternal(item: FreEditPropertyProjection, propertyConcept: FreMetaConceptProperty, elementVarName: string) {
        let initializer: string = this.buildInitializer(item);
        // todo get the role correct
        let myRole: string = `${propertyConcept.name}-external-${item.externalInfo!.wrapBy}`;
        ListUtil.addListIfNotPresent(this._myTemplate.coreImports, ["BoxUtil", "ExternalPartListBox"]);
        return `new ExternalPartListBox(
                    "${item.externalInfo!.wrapBy}",
                    ${elementVarName},
                    "${myRole}",
                    BoxUtil.makePartItems(${elementVarName}, ${elementVarName}.${propertyConcept.name}, "${propertyConcept.name}", this.mainHandler)
                    ${initializer}
                    )`;
    }

    public generatePrimAsExternal(item: FreEditPropertyProjection, propertyConcept: FreMetaProperty, elementVarName: string): string {
        let initializer: string = this.buildInitializer(item);
        // todo get the role correct
        let myRole: string = `${propertyConcept.name}-external-${item.externalInfo!.wrapBy}`;
        let boxType: string = '';
        switch (propertyConcept.type.name) {
            case 'string'   : { boxType = 'ExternalStringBox'; break;}
            case 'boolean'  : { boxType = 'ExternalBooleanBox'; break;}
            case 'number'   : { boxType = 'ExternalNumberBox'; break;}
        }
        ListUtil.addListIfNotPresent(this._myTemplate.coreImports, ["BoxUtil", `${boxType}`]);
        return `new ${boxType}(
                    "${item.externalInfo!.wrapBy}",
                    ${elementVarName},
                    "${myRole}",
                    "${propertyConcept.name}"
                    ${initializer}
                    )`;
    }

    public generateSingleAsExternal(item: FreEditPropertyProjection, propertyConcept: FreMetaProperty, elementVarName: string): string {
        let initializer: string = this.buildInitializer(item);
        // todo get the role correct
        let myRole: string = `${propertyConcept.name}-external-${item.externalInfo!.wrapBy}`;
        ListUtil.addListIfNotPresent(this._myTemplate.coreImports, ["BoxUtil", "ExternalPartBox"]);
        return `new ExternalPartBox(
                    "${item.externalInfo!.wrapBy}",
                    ${elementVarName},
                    "${myRole}",
                    "${propertyConcept.name}",
                    ${initializer}
                    )`;
    }

}
