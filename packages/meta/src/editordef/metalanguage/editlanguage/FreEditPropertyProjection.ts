import { FreMetaDefinitionElement } from "../../../utils/no-dependencies/index.js";
import { FreMetaProperty, MetaElementReference } from "../../../languagedef/metalanguage/index.js";
import { FreEditBoolKeywords, DisplayType, FreEditListInfo, FreEditExternalInfo } from "./internal.js";

/**
 * An element of a line in a projection definition that represents the projection of a property.
 * Note that properties that are lists, properties that have boolean type, and optional properties,
 * are represented by subclasses of this class.
 */
export class FreEditPropertyProjection extends FreMetaDefinitionElement {
    // @ts-ignore
    property: MetaElementReference<FreMetaProperty>;
    // projection info if the referred property is a list
    listInfo?: FreEditListInfo = undefined;
    // projection info if the referred property is to be displayed by an external component
    externalInfo?: FreEditExternalInfo = undefined;
    // projection info about display
    displayType?: DisplayType = undefined;
    // projection info if the referred property is a primitive of boolean type
    boolKeywords?: FreEditBoolKeywords = undefined;
    // projection to be used for this property
    projectionName: string = "";

    toString(): string {
        let extraText: string = "";
        if (!!this.projectionName && this.projectionName.length > 0) {
            extraText = `\n/* projectionName */ ${this.projectionName}`;
        }
        if (!!this.listInfo) {
            extraText = `\n/* list */ ${this.listInfo}`;
        }
        if (!!this.externalInfo) {
            extraText = `\n/* external */ ${this.externalInfo}`;
        }
        if (!!this.displayType) {
            extraText = `\n/* displayType */ ${this.displayType}`;
        }
        if (!!this.boolKeywords) {
            extraText = `\n/* boolean */ ${this.boolKeywords}`;
        }
        let nameText: string | undefined = this.property.name;
        if (!nameText || nameText.length === 0) {
            nameText = this.property?.name;
        }
        return `\${ ${nameText} }${extraText}`;
    }
}
