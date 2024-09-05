import { isNullOrUndefined } from "../../util";
import { FreBoxProvider } from "./FreBoxProvider";
import { FreProjectionHandler } from "./FreProjectionHandler";
import { FreNode } from "../../ast";
import { Box, TableRowBox } from "../boxes";
import { BoxUtil, TableUtil } from "../simplifiedBoxAPI";

export class FreHeaderProvider extends FreBoxProvider {
    propertyName: string;
    _hasContent: boolean = false;

    constructor(node: FreNode, propertyName: string, conceptName: string, mainHandler: FreProjectionHandler) {
        super(mainHandler);
        this._node = node;
        this.propertyName = propertyName;
        this.conceptName = conceptName;
        this.knownTableProjections = mainHandler.getKnownTableProjectionsFor(conceptName);
        this.knownBoxProjections = [];
    }

    protected getContent(projectionName: string): Box {
        const cells: Box[] = [];
        const headers = this.mainHandler.getTableHeaderInfo(this.conceptName, projectionName);
        // console.log('getting headers for ' + this.conceptName + ', with projection ' + projectionName + ' : ' + headers )
        // console.log('    know table projections ' + this.knownTableProjections )
        if (!!headers && headers.length > 0) {
            headers.forEach((head, index) => {
                // console.log('pushing cell: ' + head);
                // todo should the labelBox be wrapped in a TableCellBox?
                cells.push(BoxUtil.labelBox(this._node, head, `table-header-${index + 1}`));
            });
            this._hasContent = true;
        } else {
            this._hasContent = false;
        }

        const result: TableRowBox = TableUtil.rowBox(this._node, this.propertyName, this.conceptName, cells, 0, false);
        result.isHeader = true;
        return result;
    }

    hasContent() {
        return this._hasContent;
    }

    /** Special for HeaderProvider, because we do not start from the child in the property.
     */
    projection() {
        const myBoxProvider: FreBoxProvider = this.mainHandler.getBoxProvider(this._node);
        let myProjection = myBoxProvider.projection();
        // TODO A hack, since the name may already be "table-ified" and the nontable-ified name is needed
        if (myProjection.startsWith("tableRowFor_")) {
            myProjection = myProjection.replace("tableRowFor_", "");
            // TODO Only need first to lowercae
            // myProjection = myProjection.toLowerCase();
        }
        // console.log("   My projection  is " + myProjection)
        const ownerRequired = this.mainHandler.getRequiredProjection(
            this._node.freLanguageConcept(),
            myProjection,
            this.propertyName,
        );
        if (isNullOrUndefined(ownerRequired)) {
            // console.error("SHOULD NOT HAPPEN");
            // No requirement from owner projection: just find the first projection in the active list of projections
            this.usedProjection = this.findProjectionToUse(false);
        } else {
            // The projection to use is defined by the parent element
            if (ownerRequired === "__TABLE__") {
                this.usedProjection = this.findProjectionToUse(true);
            } else {
                // Named projection
                this.usedProjection = ownerRequired;
            }
        }
        // console.log("Header Provider Projection for " + this._node.freLanguageConcept() + " is " + this.usedProjection);
        return this.usedProjection;
    }
}
