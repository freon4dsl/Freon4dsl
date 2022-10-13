import { computed } from "mobx";

import {
    Box,
    BoxUtils,
    BoxFactory, ElementBox, PiElement, isNullOrUndefined, RoleProvider
} from "@projectit/core";

import { SimplePart } from "../../language/gen";
import { BoxProvider } from "./BoxProvider";
import { NewCompositeProjection } from "./NewCompositeProjection";
import { Utils } from "./Utils";

export class SimplePart_BoxProvider implements BoxProvider {
    private _mainBox: ElementBox;
    private _element: SimplePart;
    private knownProjections: string[] = ['default'];

    set element(element: PiElement) {
        if (element.piLanguageConcept() === 'SimplePart') {
            this._element = element as SimplePart;
        } else {
            console.log('setelement: wrong type (' + element.piLanguageConcept() + '!= SimplePart)')
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
        console.log('BOX: ' + this._mainBox.role + ' for ' + this._mainBox.element.piId());
        return this._mainBox;
    }

    private getContent(): Box {
        let projToUse = NewCompositeProjection.getProjectionNames().filter(p => this.knownProjections.includes(p))[0];
        if ( projToUse === 'default') {
            return this.getDefault();
        }
        return this.getDefault();
    }

    private getDefault(): Box {
        console.log('SimplePart_Projection.getDefault for element ' + this._element.piId())
        if (isNullOrUndefined(this._element)) {
            console.log('element is null')
            return null;
        }
        return BoxFactory.horizontalList(
            this._element,
            "SimplePart-hlist-line-0",
            [
                BoxUtils.labelBox(this._element, "SIMPLE", "top-1-line-0-item-0"),
                Utils.getBoxOrAlias(this._element, "basis", "ConceptA"),
                BoxUtils.labelBox(this._element, "END", "top-1-line-0-item-2")
            ],
            { selectable: true }
        );
    }
}
