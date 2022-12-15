import { FreBoxProvider } from "./FreBoxProvider";
import { FreProjectionHandler } from "./FreProjectionHandler";
import { PiElement } from "../../ast";
import { Box } from "../boxes";
import { BoxUtils, TableUtil } from "../simplifiedBoxAPI";

export class FreHeaderProvider extends FreBoxProvider {
    propertyName: string;
    _hasContent: boolean = false;

    constructor(element: PiElement, propertyName: string, conceptName: string, mainHandler: FreProjectionHandler) {
        super(mainHandler);
        this._element = element;
        this.propertyName = propertyName;
        this.conceptName = conceptName;
        this._mustUseTable = true;
        this.knownTableProjections = mainHandler.getKnownTableProjectionsFor(conceptName);
        this.knownBoxProjections = [];
    }

    protected getContent(projectionName: string): Box {
        const cells: Box[] = [];
        let headers = this.mainHandler.getTableHeaderInfo(this.conceptName, projectionName);
        console.log('getting headers for ' + this.conceptName + ', with projection ' + projectionName + ' : ' + headers )
        if (!!headers && headers.length > 0) {
            headers.forEach((head, index) => {
                console.log('pushing cell: ' + head);
                cells.push(BoxUtils.labelBox(this._element, head, `table-header-${index+1}`));
            });
            this._hasContent = true;
        } else {
            this._hasContent = false;
        }

        return TableUtil.rowBox(
            this._element,
            this.propertyName,
            cells,
            0,
            false
        );
    }

    hasContent() {
        return this._hasContent;
    }
}
