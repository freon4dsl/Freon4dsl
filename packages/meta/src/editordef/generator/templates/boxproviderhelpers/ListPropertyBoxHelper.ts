import { FreMetaConceptProperty, FreMetaLanguage } from "../../../../languagedef/metalanguage/index.js";
import {
    FreEditListInfo,
    FreEditProjectionDirection,
    FreEditPropertyProjection,
    ListJoinType,
} from "../../../metalanguage/index.js";
import { ListUtil, Names } from "../../../../utils/index.js";
import { BoxProviderTemplate } from "../BoxProviderTemplate.js";

export class ListPropertyBoxHelper {
    private _myTemplate: BoxProviderTemplate;

    constructor(myTemplate: BoxProviderTemplate) {
        this._myTemplate = myTemplate;
    }

    public generateReferenceAsList(
        language: FreMetaLanguage,
        listJoin: FreEditListInfo,
        reference: FreMetaConceptProperty,
        element: string
    ): string {
        ListUtil.addIfNotPresent(this._myTemplate.coreImports, "BoxUtil");
        ListUtil.addIfNotPresent(this._myTemplate.configImports, Names.environment(language));
        const joinEntry = this.getJoinEntry(listJoin);
        if (listJoin.direction === FreEditProjectionDirection.Vertical) {
            return `BoxUtil.verticalReferenceListBox(${element}, "${reference.name}", ${Names.environment(language)}.getInstance().scoper, ${joinEntry})`;
        } // else
        return `BoxUtil.horizontalReferenceListBox(${element}, "${reference.name}", ${Names.environment(language)}.getInstance().scoper, ${joinEntry})`;
    }

    public getJoinEntry(listJoin: FreEditListInfo): string {
        let joinEntry: string = `{ text:"${listJoin.joinText}", type:"${listJoin.joinType}" }`;
        if (listJoin.joinType === ListJoinType.NONE || !(listJoin.joinText?.length > 0)) {
            joinEntry = "null";
        }
        return joinEntry;
    }

    /**
     * generate the part list
     *
     * @param item
     * @param propertyConcept   The property for which the projection is generated.
     * @param elementVarName    The name of the element parameter of the getBox projection method.
     * @param coreImports
     */
    public generatePartAsList(
        item: FreEditPropertyProjection,
        propertyConcept: FreMetaConceptProperty,
        elementVarName: string,
    ): string {
        if (!!item.listInfo && !!item.property) {
            ListUtil.addIfNotPresent(this._myTemplate.coreImports, "BoxUtil");
            const joinEntry: string = this.getJoinEntry(item.listInfo);
            if (item.listInfo.direction === FreEditProjectionDirection.Vertical) {
                return `BoxUtil.verticalPartListBox(${elementVarName}, ${elementVarName}.${propertyConcept.name}, "${propertyConcept.name}", ${joinEntry}, this.mainHandler)`;
            } // else
            return `BoxUtil.horizontalPartListBox(${elementVarName}, ${elementVarName}.${propertyConcept.name}, "${propertyConcept.name}", ${joinEntry}, this.mainHandler)`;
        } else {
            return "";
        }
    }
}
