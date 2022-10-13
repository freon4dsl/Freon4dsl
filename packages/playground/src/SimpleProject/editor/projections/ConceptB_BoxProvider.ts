import { computed } from "mobx";

import {
    PiElement,
    Box,
    BoxUtils,
    BoxFactory, 
    ElementBox
} from "@projectit/core";

import { ConceptB } from "../../language/gen";
import { BoxProvider } from "./BoxProvider";
import { NewCompositeProjection } from "./NewCompositeProjection";
import { NewBoxUtils } from "./NewBoxUtils";


export class ConceptB_BoxProvider implements BoxProvider {
    private _mainBox: ElementBox;
    private _element: ConceptB;
    private knownProjections: string[] = ['default'];

    set element(element: PiElement) {
        if (element.piLanguageConcept() === 'ConceptB') {
            this._element = element as ConceptB;
        } else {
            console.log('setelement: wrong type (' + element.piLanguageConcept() + '!= ConceptB)')
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
        return BoxFactory.verticalList(this._element, "ConceptB-overall", [
            BoxFactory.horizontalList(
                this._element,
                "ConceptB-hlist-line-0",
                [
                    BoxUtils.labelBox(this._element, "List:", "top-1-line-0-item-0"),
                    NewBoxUtils.verticalPartListBox(this._element, this._element.list1, "list1", null),  // the boxes for the elements in property 'list1'
                ],
                { selectable: true }
            ),
            BoxFactory.horizontalList(
                this._element,
                "ConceptB-hlist-line-1",
                [
                    BoxUtils.labelBox(this._element, "Leaf:", "top-1-line-1-item-0"),
                    NewBoxUtils.getBoxOrAlias(this._element, "partB2", "ConceptE"),
                ],
                { selectable: true }
            )
        ]);
    }
}
