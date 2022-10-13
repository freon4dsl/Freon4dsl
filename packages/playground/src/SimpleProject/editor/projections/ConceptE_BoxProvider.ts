import { computed } from "mobx";

import {
    Box,
    BoxUtils,
    BoxFactory, ElementBox, PiElement, PiBoxProvider
} from "@projectit/core";

import { ConceptE } from "../../language/gen";
import { SimpleBoxProviderCache } from "./SimpleBoxProviderCache";

export class ConceptE_BoxProvider implements PiBoxProvider {
    private _mainBox: ElementBox;
    private _element: ConceptE;
    private knownProjections: string[] = ['default'];

    set element(element: PiElement) {
        if (element.piLanguageConcept() === 'ConceptE') {
            this._element = element as ConceptE;
        } else {
            console.log('setelement: wrong type (' + element.piLanguageConcept() + '!= ConceptE)')
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
        let projToUse = SimpleBoxProviderCache.getInstance().getProjectionNames().filter(p => this.knownProjections.includes(p))[0];
        if ( projToUse === 'default') {
            return this.getDefault();
        }
        return this.getDefault();
    }

    public getDefault(): Box {
        return BoxFactory.horizontalList(
            this._element,
            "ConceptE-hlist-line-0",
            [BoxUtils.labelBox(this._element, "Leaf content:", "top-1-line-0-item-0"), BoxUtils.textBox(this._element, "leaf")],
            { selectable: true }
        );
    }
}
