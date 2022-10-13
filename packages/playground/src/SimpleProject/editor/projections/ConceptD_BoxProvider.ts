import { computed } from "mobx";

import {
    Box,
    BoxUtils,
    BoxFactory, ElementBox, PiElement
} from "@projectit/core";

import { ConceptD } from "../../language/gen";
import { BoxProvider } from "./BoxProvider";
import { NewCompositeProjection } from "./NewCompositeProjection";

export class ConceptD_BoxProvider implements BoxProvider {
    private _mainBox: ElementBox;
    private _element: ConceptD;
    private knownProjections: string[] = ['default'];

    set element(element: PiElement) {
        if (element.piLanguageConcept() === 'ConceptD') {
            this._element = element as ConceptD;
        } else {
            console.log('setelement: wrong type (' + element.piLanguageConcept() + '!= ConceptD)')
        }
    }
    
    @computed
    get box(): Box {
        if (this._element === null) {
            return null;
        }

        if (this._mainBox === null || this._mainBox === undefined) {
            this._mainBox = new ElementBox(this._element, 'main-box-for-' + this._element.piLanguageConcept() + '-' + this._element.piId());
        }

        this._mainBox.content = this.getContent();
        return this._mainBox;
    }

    private getContent(): Box {
        let projToUse = NewCompositeProjection.getProjectionNames().filter(p => this.knownProjections.includes(p))[0];
        if ( projToUse === 'default') {
            return this.getDefault();
        }
        return this.getDefault();
    }

    public getDefault(): Box {
        return BoxFactory.horizontalList(
            this._element,
            "ConceptD-hlist-line-0",
            [
                BoxUtils.labelBox(this._element, "Street:", "top-1-line-0-item-0"),
                BoxUtils.textBox(this._element, "street"),
                BoxUtils.numberBox(this._element, "nr")
            ],
            { selectable: true }
        );
    }
}
