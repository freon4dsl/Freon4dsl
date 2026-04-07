import type { FreMetaConceptProperty, FreMetaLanguage } from "../../../../languagedef/metalanguage/index.js";
import type {
    FreEditListInfo,
    FreEditPropertyProjection} from "../../../metalanguage/index.js";
import {
    FreEditProjectionDirection,
    ListJoinType,
} from "../../../metalanguage/index.js";
import { Names } from "../../../../utils/on-lang/index.js";
import type { BoxProviderTemplate } from "../BoxProviderTemplate.js";

export class ListPropertyBoxHelper {
    private _myTemplate: BoxProviderTemplate;

    constructor(myTemplate: BoxProviderTemplate) {
        this._myTemplate = myTemplate;
    }

    /**
     * Build an initializer string for ListBox properties that can be set from .edit file params.
     * Currently supports: canDragAndDrop (defaults to true if not specified)
     * @param item The property projection item that may contain externalInfo with params
     * @returns An initializer string like ", { canDragAndDrop: false }" or empty string
     */
    private buildListInitializer(item: FreEditPropertyProjection): string {
        const params = item.externalInfo?.params;
        if (!params || params.length === 0) {
            return "";
        }
        
        // Extract list-specific params that should be passed to the ListBox initializer
        const canDragAndDropParam = params.find(p => p.key === "canDragAndDrop");
        
        // Build initializer object properties
        const initProps: string[] = [];
        if (canDragAndDropParam) {
            const value = canDragAndDropParam.value.toLowerCase() === "true";
            initProps.push(`canDragAndDrop: ${value}`);
        }
        
        if (initProps.length === 0) {
            return "";
        }
        
        return `, { ${initProps.join(", ")} }`;
    }

    public generateReferenceAsList(
        // @ts-ignore
        language: FreMetaLanguage,
        listJoin: FreEditListInfo,
        reference: FreMetaConceptProperty,
        element: string,
        item?: FreEditPropertyProjection
    ): string {
        this._myTemplate.imports.core.add("BoxUtil");
        this._myTemplate.imports.root.add(Names.LanguageEnvironment);
        const joinEntry = this.getJoinEntry(listJoin);
        const initializer = item ? this.buildListInitializer(item) : "";
        if (listJoin.direction === FreEditProjectionDirection.Vertical) {
            return `BoxUtil.verticalReferenceListBox(${element}, "${reference.name}", ${Names.LanguageEnvironment}.getInstance().scoper, ${joinEntry}${initializer})`;
        } // else
        return `BoxUtil.horizontalReferenceListBox(${element}, "${reference.name}", ${Names.LanguageEnvironment}.getInstance().scoper, ${joinEntry}${initializer})`;
    }

    public getJoinEntry(listJoin: FreEditListInfo): string {
        let joinEntry: string = `{ text:"${listJoin.joinText}", type:"${listJoin.joinType}" }`;
        if (listJoin.joinType === ListJoinType.NONE || !(listJoin.joinText?.length > 0)) {
            this._myTemplate.imports.core.add("FreListInfo");
            joinEntry = "FreListInfo.NullListInfo";
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
            this._myTemplate.imports.core.add("BoxUtil");
            const joinEntry: string = this.getJoinEntry(item.listInfo);
            const initializer: string = this.buildListInitializer(item);
            if (item.listInfo.direction === FreEditProjectionDirection.Vertical) {
                return `BoxUtil.verticalPartListBox(${elementVarName}, ${elementVarName}.${propertyConcept.name}, "${propertyConcept.name}", ${joinEntry}, this.mainHandler${initializer})`;
            } // else
            return `BoxUtil.horizontalPartListBox(${elementVarName}, ${elementVarName}.${propertyConcept.name}, "${propertyConcept.name}", ${joinEntry}, this.mainHandler${initializer})`;
        } else {
            return "";
        }
    }
}
