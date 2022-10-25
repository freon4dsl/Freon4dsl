import { PiBoxProvider } from "./PiBoxProvider";
import { PiCompositeProjection } from "../PiCompositeProjection";
import { Box, LabelBox } from "../boxes";
import { isNullOrUndefined } from "../../util";
import { PiElement } from "../../ast";
import { PiTableDefinition } from "../PiTables";
import { PiBoxProviderCache } from "./PiBoxProviderCache";


export class NewCompositeProjection extends PiCompositeProjection {
    // the following overrides the same stuff as there is in the 'old' CompositeProjection
    private _myRootProvider: PiBoxProviderCache = null;
    set rootProjection(p: PiCompositeProjection) {
        // for now, we completely ignore this, in favor of rootProvider
    }

    set rootProvider(p: PiBoxProviderCache) {
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
            const provider = this._myRootProvider.getBoxProvider(element);
            const BOX = provider.box;
            console.log('NewCompositeProjection found BOX: ' + BOX.role + ' for ' + BOX.element.piId());
            return BOX;
        }
        // return a default box if nothing has been  found.
        return new LabelBox(element, "unknown-projection", () => "unknown box for " + element);
    }

    getTableDefinition(conceptName: string): PiTableDefinition {
        console.log('NewCompositeProjection getTableDefinition ' + conceptName + ", root projection: " + this._myRootProvider.constructor.name)
        // todo re-implement this
        // for (let p of this.projections.values()) {
        //     if (p.isEnabled) {
        //         const result = p.getTableDefinition(conceptName);
        //         if (result !== null) {
        //             return result;
        //         }
        //     }
        // }
        // return a default box if nothing has been found.
        return {
            headers: [conceptName],
            cells: [(element: PiElement) => {
                return this.getBox(element);
            }]
        };
    }
}
