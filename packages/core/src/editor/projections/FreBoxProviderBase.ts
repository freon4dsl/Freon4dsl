import { PiElement } from "../../ast";
import { Box, ElementBox, LabelBox } from "../boxes";
import { computed, makeObservable } from "mobx";

/**
 * Base class for all classes that implement FreBoxProvider.
 */
export class FreBoxProviderBase {
    private _mainBox: ElementBox = null; // init is needed for mobx!
    protected _element: PiElement;

    constructor() {
        makeObservable(this, {
            box: computed
        });
    }

    set element(element: PiElement) {
        this._element = element;
    }

    /**
     * This getter may not have parameters, therefore there is a copy of this function called getNamedBox,
     * that takes a projectionName as parameter. There is also a copy that has a function a param.
     * TODO rethink these three functions, maybe collapse into one?
     */
    get box(): Box {
        if (this._element === null) {
            return null;
        }

        if (this._mainBox === null || this._mainBox === undefined) {
            this._mainBox = new ElementBox(this._element, "main-box-for-" + this._element.piLanguageConcept() + "-" + this._element.piId());
        }

        // the main box always stays the same for this element, but the content may differ
        this._mainBox.content = this.getContent();
        // console.log('BOX: ' + this._mainBox.role + ' for ' + this._mainBox.element.piId());
        return this._mainBox;
    }

    public getNamedBox(projectionName: string): Box {
        if (this._element === null) {
            return null;
        }

        if (this._mainBox === null || this._mainBox === undefined) {
            this._mainBox = new ElementBox(this._element, "main-box-for-" + this._element.piLanguageConcept() + "-" + this._element.piId());
        }

        // the main box always stays the same for this element, but the content may differ
        this._mainBox.content = this.getContent(projectionName);
        // console.log('BOX: ' + this._mainBox.role + ' for ' + this._mainBox.element.piId());
        return this._mainBox;
    }

    public getCustomBox(customFuction: (node: PiElement) => Box): Box {
        if (this._element === null) {
            return null;
        }

        if (this._mainBox === null || this._mainBox === undefined) {
            this._mainBox = new ElementBox(this._element, "main-box-for-" + this._element.piLanguageConcept() + "-" + this._element.piId());
        }

        // the main box always stays the same for this element, but the content may differ
        this._mainBox.content = customFuction(this._element);
        // console.log('BOX: ' + this._mainBox.role + ' for ' + this._mainBox.element.piId());
        return this._mainBox;
    }

    public getContent(projectionName?: string): Box {
        return new LabelBox(this._element, "unknown-projection", () => "Content should be determined by the appropriate subclass of PiBoxProvider.");
    }
}

