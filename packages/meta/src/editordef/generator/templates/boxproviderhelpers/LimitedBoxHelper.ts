import {
    FreMetaConceptProperty, FreMetaLanguage
} from "../../../../languagedef/metalanguage/index.js";
import {ListUtil, Names} from "../../../../utils/index.js";
import {DisplayTypeHelper} from "./DisplayTypeHelper.js";
import {ForType, FreEditListInfo, FreEditProjectionGroup} from "../../../metalanguage/index.js";
import {ListPropertyBoxHelper} from "./ListPropertyBoxHelper.js";
import {PartPropertyBoxHelper} from "./PartPropertyBoxHelper.js";
import {BoxProviderTemplate} from "../BoxProviderTemplate.js";

export class LimitedBoxHelper {
    private stdLimitedSingleDisplayType: string = "text";
    private stdLimitedListDisplayType: string = "text";
    private _myTemplate: BoxProviderTemplate;
    private _myListPropHelper: ListPropertyBoxHelper;
    private readonly _myPartPropHelper: PartPropertyBoxHelper;

    constructor(myTemplate: BoxProviderTemplate, myListPropHelper: ListPropertyBoxHelper, myPartPropHelper: PartPropertyBoxHelper) {
        this._myTemplate = myTemplate;
        this._myListPropHelper = myListPropHelper;
        this._myPartPropHelper = myPartPropHelper;
    }

    public setGlobals(defProjGroup: FreEditProjectionGroup) {
        // get the global labels for true and false, and the global display type (checkbox, radio, text, etc.) for boolean values
        if (!!defProjGroup) {
            const limitedSingleDisplayType: string | undefined = defProjGroup.findGlobalProjFor(ForType.Limited)?.displayType;
            if (!!limitedSingleDisplayType) {
                this.stdLimitedSingleDisplayType = limitedSingleDisplayType;
            }
            const limitedListDisplayType: string | undefined = defProjGroup.findGlobalProjFor(ForType.LimitedList)?.displayType;
            if (!!limitedListDisplayType) {
                this.stdLimitedListDisplayType = limitedListDisplayType;
            }
        }
    }

    public generateLimited(property: FreMetaConceptProperty, elementVarName: string, language: FreMetaLanguage, listInfo: FreEditListInfo | undefined, displayType: string | undefined): string {
        let result: string = '';
        if (property.isList) {
            if (displayType === "checkbox" || this.stdLimitedListDisplayType === "checkbox") { // use limited control
                result += this.generateLimitedListProjection(property, elementVarName, "checkbox");
            } else { // make 'normal' reference list
                if (!!listInfo) {
                    result += this._myListPropHelper.generateReferenceAsList(language, listInfo, property, elementVarName);
                }
            }
        } else {
            if (displayType === "radio" || this.stdLimitedListDisplayType === "radio") { // use limited control
                result += this.generateLimitedSingleProjection(property, elementVarName, "radio");
            } else { // make 'normal' reference
                result += this._myPartPropHelper.generateReferenceProjection(language, property, elementVarName);
            }
        }
        return result;
    }

    private generateLimitedSingleProjection(appliedFeature: FreMetaConceptProperty, element: string, displayType: string) {
        const featureType: string = Names.classifier(appliedFeature.type);
        ListUtil.addIfNotPresent(this._myTemplate.modelImports, featureType);
        ListUtil.addListIfNotPresent(this._myTemplate.coreImports, [Names.FreNodeReference, "BoxUtil", "LimitedDisplay"]);
        // get the right displayType
        let displayTypeToUse: string = DisplayTypeHelper.getTypeScriptForDisplayType(this.stdLimitedSingleDisplayType);
        if (!!displayType) {
            displayTypeToUse = DisplayTypeHelper.getTypeScriptForDisplayType(displayType);
        }
        return `BoxUtil.limitedBox(
                                ${element},
                                "${appliedFeature.name}",
                                (selected: string) => {
                                    ${element}.${appliedFeature.name} = ${Names.FreNodeReference}.create<${featureType}>(
                                               selected, "${featureType}" );
                                },
                                LimitedDisplay.${displayTypeToUse}
               )`;
    }

    private generateLimitedListProjection(appliedFeature: FreMetaConceptProperty, element: string, displayType: string) {
        const featureType: string = Names.classifier(appliedFeature.type);
        ListUtil.addIfNotPresent(this._myTemplate.modelImports, featureType);
        ListUtil.addListIfNotPresent(this._myTemplate.coreImports, [Names.FreNodeReference, "BoxUtil", "LimitedDisplay"]);
        // get the right displayType
        let displayTypeToUse: string = DisplayTypeHelper.getTypeScriptForDisplayType(this.stdLimitedListDisplayType);
        if (!!displayType) {
            displayTypeToUse = DisplayTypeHelper.getTypeScriptForDisplayType(displayType);
        }
        return `BoxUtil.limitedListBox(
                                ${element},
                                "${appliedFeature.name}",
                                (selected: string[]) => {
                                        for (let i: number = 0; i < ${element}.${appliedFeature.name}.length; i++) {
                                            if (!selected.includes(${element}.${appliedFeature.name}[i].name)) {
                                                ${element}.${appliedFeature.name}.splice(i, 1);
                                            }
                                        }
                                        const existingNames: string[] = ${element}.${appliedFeature.name}.map((n) => n.name);
                                        for (let i: number = 0; i < selected.length; i++) {
                                            if (!existingNames.includes(selected[i])) {
                                                ${element}.${appliedFeature.name}.push(${Names.FreNodeReference}.create<${featureType}>(
                                               selected, "${featureType}" ));
                                            }
                                        }
                                },
                                LimitedDisplay.${displayTypeToUse}
               )`;
    }


}
