import { computed } from "mobx";

import {
    Box,
    BoxUtils,
    BoxFactory,
    ElementBox, PiElement, PiBoxProvider
} from "@projectit/core";

import { ConceptA } from "../../language/gen";
import { SimpleBoxProviderCache } from "./SimpleBoxProviderCache";
import { NewBoxUtils } from "@projectit/core/dist/editor/projections/NewBoxUtils";

export class ConceptA_BoxProvider implements PiBoxProvider {
    private _mainBox: ElementBox;
    private _element: ConceptA;
    private knownProjections: string[] = ["default"];

    set element(element: PiElement) {
        if (element.piLanguageConcept() === "ConceptA") {
            this._element = element as ConceptA;
        } else {
            console.log("setelement: wrong type (" + element.piLanguageConcept() + "!= ConceptA)");
        }
    }

    @computed
    get box(): Box {
        if (this._element === null) {
            return null;
        }

        if (this._mainBox === null || this._mainBox === undefined) {
            this._mainBox = new ElementBox(this._element, "main-box-for-" + this._element.piLanguageConcept() + "-" + this._element.piId());
        }

        this._mainBox.content = this.getContent();
        return this._mainBox;
    }

    private getContent(): Box {
        let projToUse = SimpleBoxProviderCache.getInstance()
            .getProjectionNames()
            .filter(p => this.knownProjections.includes(p))[0];
        if (projToUse === "default") {
            return this.getDefault();
        }
        return this.getDefault();
    }

    public getDefault(): Box {
        return BoxFactory.verticalList(this._element, "ConceptA-overall", [
            BoxFactory.horizontalList(
                this._element,
                "ConceptA-hlist-line-0",
                [BoxUtils.labelBox(this._element, "Name:", "top-1-line-0-item-0"), BoxUtils.textBox(this._element, "name")],
                { selectable: true }
            ),
            BoxFactory.horizontalList(
                this._element,
                "ConceptA-hlist-line-1",
                [
                    BoxUtils.labelBox(this._element, "Tree:", "top-1-line-1-item-0"),
                    NewBoxUtils.getBoxOrAlias(this._element, "partA1", "ConceptB", SimpleBoxProviderCache.getInstance())
                ],
                { selectable: true }
            ),
            BoxFactory.horizontalList(
                this._element,
                "ConceptA-hlist-line-2",
                [
                    BoxUtils.labelBox(this._element, "Leaf:", "top-1-line-2-item-0"),
                    NewBoxUtils.getBoxOrAlias(this._element, "partA2", "ConceptE", SimpleBoxProviderCache.getInstance())
                ],
                { selectable: true }
            )
        ]);
    }
}

