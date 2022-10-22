import { PiBoxProvider } from "./PiBoxProvider";
import { PiCompositeProjection } from "../PiCompositeProjection";
import { Box, BoxFactory, LabelBox } from "../boxes";
import { createDefaultBinaryBox, isNullOrUndefined } from "../../util";
import { PiBinaryExpression, PiElement } from "../../ast";


export class NewCompositeProjection extends PiCompositeProjection {
    // the following overrides the same stuff as there is in the 'old' CompositeProjection
    private _myRootProvider: PiBoxProvider | null = null;
    set rootProjection(p: PiCompositeProjection) {
        // for now, we completely ignore this, in favor of rootProvider
    }

    set rootProvider(p: PiBoxProvider) {
        this._myRootProvider = p;
    }

    getBox(element: PiElement): Box {
        try {
            if (isNullOrUndefined(element)) {
                throw Error('NewCompositeProjection.getBox: element is null/undefined');
            }
        } catch (e) {
            console.log(e.stack);
            return null;
        }
        console.log('NewCompositeProjection getBox ' + element?.piId() + ", root projection: " + this._myRootProvider.constructor.name)
        if (!!this._myRootProvider && !!element) {
            // todo check type of rootProjection against type of element
            this._myRootProvider.element = element;
            const BOX = this._myRootProvider.box;
            console.log('BOX: ' + BOX.role + ' for ' + BOX.element.piId());
            return BOX;
        }
        // return a default box if nothing has been  found. // todo what to return if element if null/undefined?
        return new LabelBox(element, "unknown-projection", () => "unknown box for " + element);
    }


}
