import type { FreEditTableProjection } from "../../../metalanguage/index.js";
import { FreEditProjectionDirection } from "../../../metalanguage/index.js";
import type {
    FreMetaClassifier,
    FreMetaConceptProperty,
    FreMetaLanguage,
} from "../../../../languagedef/metalanguage/index.js";
import { Names } from "../../../../utils/on-lang/index.js";
import { NamesForEditor } from "../../../../utils/on-lang-and-editor/index.js";
import type { ItemBoxHelper } from "./ItemBoxHelper.js";
import type { BoxProviderTemplate } from "../BoxProviderTemplate.js";

export class TableBoxHelper {
    private _myTemplate: BoxProviderTemplate;
    private _myItemHelper: ItemBoxHelper;

    constructor(myTemplate: BoxProviderTemplate, myItemHelper: ItemBoxHelper) {
        this._myTemplate = myTemplate;
        this._myItemHelper = myItemHelper;
    }

    public generateTableProjection(
        language: FreMetaLanguage,
        concept: FreMetaClassifier,
        projection: FreEditTableProjection,
        topIndex: number,
    ) {
        if (!!projection) {
            let hasHeaders: boolean = false;
            if (!!projection.headers && projection.headers.length > 0) {
                hasHeaders = true;
            }
            const cellDefs: string[] = [];
            projection.cells.forEach((cell, index) => {
                // because we need the index, this is done outside the template
                this._myTemplate.imports.language.add(Names.classifier(concept));
                cellDefs.push(
                    this._myItemHelper.generateItem(
                        cell,
                        `(this._node as ${Names.classifier(concept)})`,
                        index,
                        index,
                        concept.name + "_table",
                        language,
                        topIndex,
                    ),
                );
            });
            this._myTemplate.imports.core.add("TableRowBox").add("TableUtil");
            return `private ${NamesForEditor.tableProjectionMethod(projection)}(): TableRowBox {
                        const cells: Box[] = [];
                        ${cellDefs.map((cellDef) => `cells.push(${cellDef})`).join(";\n")}
                        return TableUtil.rowBox(
                            this._node, 
                            this._node.freOwnerDescriptor().propertyName, 
                            "${Names.classifier(concept)}", 
                            cells, 
                            typeof this._node.freOwnerDescriptor().propertyIndex === "number"
                              ? this._node.freOwnerDescriptor().propertyIndex as number
                              : 0,
                            ${hasHeaders}
                        );
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
     */
    public generatePropertyAsTable(
        orientation: FreEditProjectionDirection,
        property: FreMetaConceptProperty,
        elementVarName: string,
        // @ts-ignore
        language: FreMetaLanguage,
    ): string {
        this._myTemplate.imports.core.add("TableUtil");
        this._myTemplate.imports.root.add(Names.LanguageEnvironment);
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
