import {FreEditProjectionDirection, FreEditTableProjection} from "../../../metalanguage/index.js";
import {
    FreMetaClassifier,
    FreMetaConceptProperty,
    FreMetaLanguage
} from "../../../../languagedef/metalanguage/index.js";
import {ListUtil, Names} from "../../../../utils/index.js";
import {ItemBoxHelper} from "./ItemBoxHelper.js";
import {BoxProviderTemplate} from "../BoxProviderTemplate.js";

export class TableBoxHelper {
    private _myTemplate: BoxProviderTemplate;
    private _myItemHelper: ItemBoxHelper;

    constructor(myTemplate: BoxProviderTemplate, myItemHelper: ItemBoxHelper) {
        this._myTemplate = myTemplate;
        this._myItemHelper = myItemHelper;
    }

    public generateTableProjection(language: FreMetaLanguage,
                                          concept: FreMetaClassifier,
                                          projection: FreEditTableProjection,
                                   topIndex: number) {
        if (!!projection) {
            let hasHeaders: boolean = false;
            if (!!projection.headers && projection.headers.length > 0) {
                hasHeaders = true;
            }
            const cellDefs: string[] = [];
            projection.cells.forEach((cell, index) => { // because we need the index, this is done outside the template
                ListUtil.addIfNotPresent(this._myTemplate.modelImports, Names.classifier(concept));
                cellDefs.push(this._myItemHelper.generateItem(cell,
                    `(this._node as ${Names.classifier(concept)})`,
                    index,
                    index,
                    concept.name + "_table",
                    language,
                    topIndex));
            });
            ListUtil.addIfNotPresent(this._myTemplate.coreImports, "TableRowBox");
            ListUtil.addIfNotPresent(this._myTemplate.coreImports, "TableUtil");
            return `private ${Names.tableProjectionMethod(projection)}(): TableRowBox {
                        const cells: Box[] = [];
                        ${cellDefs.map(cellDef => `cells.push(${cellDef})`).join(";\n")}
                        return TableUtil.rowBox(this._node, this._node.freOwnerDescriptor().propertyName, "${Names.classifier(concept)}", cells, this._node.freOwnerDescriptor().propertyIndex, ${hasHeaders});
                    }`;
        } else {
            console.log("INTERNAL FREON ERROR in generateTableCellFunction");
            return "";
        }
    }


    /**
     * Returns the text string that projects 'property' as a table.
     * @param orientation       Either row or column based
     * @param property          The property to be projected
     * @param elementVarName    The name of the variable that holds the property at runtime
     * @param language          The language for which this projection is made
     * @param coreImports
     * @param configImports
     */
    public generatePropertyAsTable(orientation: FreEditProjectionDirection,
                                          property: FreMetaConceptProperty,
                                          elementVarName: string,
                                          language: FreMetaLanguage): string {
        ListUtil.addIfNotPresent(this._myTemplate.coreImports, "TableUtil");
        ListUtil.addIfNotPresent(this._myTemplate.configImports, Names.environment(language));
        // return the projection based on the orientation of the table
        if (orientation === FreEditProjectionDirection.Vertical) {
            return `TableUtil.tableBoxColumnOriented(
                ${elementVarName},
                ${elementVarName}.${property.name},
                "${property.name}",
                this.mainHandler)`;
        } else {
            return `TableUtil.tableBoxRowOriented(
                ${elementVarName},
                ${elementVarName}.${property.name},
                "${property.name}",
                this.mainHandler)`;
        }
    }
}
