import {FreMetaPrimitiveProperty, FreMetaPrimitiveType} from "../../../../languagedef/metalanguage/index.js";
import {
    ForType,
    FreEditBoolKeywords,
    FreEditGlobalProjection,
    FreEditListInfo,
    FreEditProjectionDirection, FreEditProjectionGroup
} from "../../../metalanguage/index.js";
import {ListUtil, Roles} from "../../../../utils/index.js";
import {DisplayTypeHelper} from "./DisplayTypeHelper.js";
import {BoxProviderTemplate} from "../BoxProviderTemplate.js";

export class PrimitivePropertyBoxesHelper {
    private _myTemplate: BoxProviderTemplate;

    constructor(myTemplate: BoxProviderTemplate) {
        this._myTemplate = myTemplate;
    }

    // The values for the boolean keywords are set on initialization (by a call to 'setGlobalBooleanKeywords').
    private trueKeyword: string = "true";
    private falseKeyword: string = "false";
    private stdBoolDisplayType: string = "text";
    private stdNumberDisplayType: string = "text";

    public setGlobals(defProjGroup: FreEditProjectionGroup) {
        // get the global labels for true and false, and the global display type (checkbox, radio, text, etc.) for boolean values
        if (!!defProjGroup) {
            const globalBoolProj: FreEditGlobalProjection | undefined = defProjGroup.findGlobalProjFor(ForType.Boolean);
            const stdLabels: FreEditBoolKeywords | undefined = globalBoolProj?.keywords;
            if (!!stdLabels) {
                this.trueKeyword = stdLabels.trueKeyword;
                this.falseKeyword = stdLabels.falseKeyword ? stdLabels.falseKeyword : "false";
            }
            const boolDisplayType: string | undefined = globalBoolProj?.displayType;
            if (!!boolDisplayType) {
                this.stdBoolDisplayType = boolDisplayType;
            }
            const numberDisplayType: string | undefined = defProjGroup.findGlobalProjFor(ForType.Number)?.displayType;
            if (!!numberDisplayType) {
                this.stdNumberDisplayType = numberDisplayType;
            }
        }
    }

    public listPrimitivePropertyProjection(property: FreMetaPrimitiveProperty, element: string, boolDisplayType?: string, boolInfo?: FreEditBoolKeywords, listInfo?: FreEditListInfo): string {
        let direction: string = "verticalList";
        if (!!listInfo && listInfo.direction === FreEditProjectionDirection.Horizontal) {
            direction = "horizontalList";
        }
        // TODO also adjust role '..-hlist' to '..-vlist'?
        ListUtil.addIfNotPresent(this._myTemplate.coreImports, "BoxFactory");
        ListUtil.addIfNotPresent(this._myTemplate.coreImports, "Box");
        // TODO Create Action for the role to actually add an element.
        return `BoxFactory.${direction}(${element}, "${Roles.property(property)}-hlist", "",
                            (${element}.${property.name}.map( (item, index)  =>
                                ${this.singlePrimitivePropertyProjection(property, element, boolDisplayType, boolInfo)}
                            ) as Box[]).concat( [
                                BoxFactory.action(${element}, "new-${Roles.property(property)}-hlist", "<+ ${property.name}>")
                            ])
                        )`;
    }

    public primitivePropertyProjection(property: FreMetaPrimitiveProperty, element: string, boolDisplayType?: string, boolInfo?: FreEditBoolKeywords, listInfo?: FreEditListInfo): string {
        if (property.isList) {
            return this.listPrimitivePropertyProjection(property, element, boolDisplayType, boolInfo, listInfo);
        } else {
            return this.singlePrimitivePropertyProjection(property, element, boolDisplayType, boolInfo);
        }
    }

    public singlePrimitivePropertyProjection(property: FreMetaPrimitiveProperty, element: string, displayType?: string, boolKeywords?: FreEditBoolKeywords): string {
        ListUtil.addIfNotPresent(this._myTemplate.coreImports, "BoxUtil");
        const listAddition: string = `${property.isList ? `, index` : ``}`;
        switch (property.type) {
            case FreMetaPrimitiveType.string:
            case FreMetaPrimitiveType.identifier:
                return `BoxUtil.textBox(${element}, "${property.name}"${listAddition})`;
            case FreMetaPrimitiveType.number:
                // get the right displayType
                let displayTypeToUse1: string = DisplayTypeHelper.getTypeScriptForDisplayType(this.stdNumberDisplayType);
                if (!!displayType) {
                    displayTypeToUse1 = DisplayTypeHelper.getTypeScriptForDisplayType(displayType);
                }
                ListUtil.addIfNotPresent(this._myTemplate.coreImports, "NumberDisplay");
                return `BoxUtil.numberBox(${element}, "${property.name}"${listAddition}, NumberDisplay.${displayTypeToUse1})`;
            case FreMetaPrimitiveType.boolean:
                // get the right keywords
                let trueKeyword: string = this.trueKeyword;
                let falseKeyword: string = this.falseKeyword;
                if (!!boolKeywords) {
                    trueKeyword = boolKeywords.trueKeyword;
                    falseKeyword = boolKeywords.falseKeyword ? boolKeywords.falseKeyword : "undefined";
                }
                // get the right displayType
                let displayTypeToUse2: string = DisplayTypeHelper.getTypeScriptForDisplayType(this.stdBoolDisplayType);
                if (!!displayType) {
                    displayTypeToUse2 = DisplayTypeHelper.getTypeScriptForDisplayType(displayType);
                }
                ListUtil.addIfNotPresent(this._myTemplate.coreImports, "BoolDisplay");
                return `BoxUtil.booleanBox(${element}, "${property.name}", {yes:"${trueKeyword}", no:"${falseKeyword}"}${listAddition}, BoolDisplay.${displayTypeToUse2})`;
            default:
                return `BoxUtil.textBox(${element}, "${property.name}"${listAddition})`;
        }
    }

}
