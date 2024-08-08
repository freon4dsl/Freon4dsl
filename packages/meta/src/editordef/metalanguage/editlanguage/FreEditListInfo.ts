import {FreMetaDefinitionElement} from "../../../utils/index.js";
import {FreEditProjectionDirection, ListJoinType} from "./internal.js";

/**
 * Information on how a list property should be projected: as list or table;
 * horizontal or vertical, row or columns based; with a terminator, separator, initiator, or
 * without any of these.
 */
export class FreEditListInfo extends FreMetaDefinitionElement {
    isTable: boolean = false;
    direction: FreEditProjectionDirection = FreEditProjectionDirection.Vertical;
    joinType: ListJoinType = ListJoinType.NONE; // indicates that user has not inserted join info
    joinText: string = "";

    toString(): string {
        if (this.isTable) {
            return `table ${this.direction}`;
        } else {
            return `direction: ${this.direction} joinType: ${this.joinType} [${this.joinText}]`;
        }
    }
}
