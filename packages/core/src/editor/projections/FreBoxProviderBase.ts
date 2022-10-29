import { PiElement } from "../../ast";
import { Box, ElementBox, LabelBox } from "../boxes";
import { action, computed, makeObservable, observable } from "mobx";
import { FreProjectionHandler } from "./FreProjectionHandler";
import { FreBoxProvider } from "./FreBoxProvider";
import { PiTableDefinition } from "../PiTables";

/**
 * Base class for all classes that implement FreBoxProvider.
 */
export class FreBoxProviderBase implements FreBoxProvider {
    mainHandler: FreProjectionHandler;
    protected usedProjection: string = 'default';
    protected knownProjections: string[] = [];
    protected knownTableProjections: string[] = [];
    protected _element: PiElement;
    protected _mainBox: ElementBox = null; // init is needed for mobx!
    public conceptName: string;

    constructor(mainHandler: FreProjectionHandler) {
        this.mainHandler = mainHandler;
        /*
        1. 'usedProjection' is observable, because a change in projection must trigger a change in the
        content of the '_mainBox'.
        2. 'box' is computed, because then a cache is kept such that the contents of '_mainBox' are
        recalculated only when 'usedProjection' has changed.
        3. the actions are present, because the observable 'usedProjection' may be changed in one
        of these methods.
         */
        // makeObservable<FreBoxProviderBase, "usedProjection">(this, {
        //     usedProjection: observable,
        //     box: computed,
        //     checkUsedProjection: action,
        //     initUsedProjection: action,
        //     getNamedBox: action
        // });
    }

    /**
     * This method is called when the enabled projections have been changed.
     * It determines whether a new projection should be used to determine the contents
     * of the _mainBox.
     * @param enabledProjections
     */
    checkUsedProjection(enabledProjections: string[]) {
        let projToUse = this.findProjectionToUse(enabledProjections);
        if (this.usedProjection !== projToUse) {
            console.log('checkUsedProjection for ' + this._element.piId() + " " + this._element.piLanguageConcept() + ", old: " + this.usedProjection + ", new: " + projToUse);
            this.usedProjection = projToUse;
            this._mainBox.content = this.getContent(this.usedProjection);
        }
    }

    initUsedProjection(enabledProjections: string[]) {
        this.usedProjection = this.findProjectionToUse(enabledProjections);
        // console.log('INIT usedProjection for ' + this._element.piId() + " " + this._element.piLanguageConcept() + ": " + this.usedProjection);
    }

    private findProjectionToUse(enabledProjections: string[]): string {
        // see if we need to use a custom projection
        let projToUse: string = null;
        this.mainHandler.customProjections.forEach(cp => {
            // get the name of the first of the customs that fits
            // todo see whether we should loop backwards as in the enabledProjections
            if (projToUse === null && !!cp.nodeTypeToBoxMethod.get(this.conceptName)) {
                projToUse = cp.name;
            }
        });
        if (projToUse === null) {
            // From the list of projections that are enabled, select the first one that is available for this type of Freon node.
            // Loop through the projections backwards, because the last one takes precedence.
            for (let i = enabledProjections.length - 1; i >= 0 ; i--) {
                const proj = enabledProjections[i];
                // get the name of the first of the generated projections that fits
                if (this.knownProjections.includes(proj)) {
                    projToUse = proj;
                    break;
                }
            }
            // } else {
            //     console.log('found custom projection ' + projToUse + ' for ' + this.conceptName);
        }
        if (projToUse === null) { // still nothing found, then use the default
            projToUse = "default";
            // } else {
            //     console.log('found generated projection ' + projToUse + ' for ' + this.conceptName + ' from ' + this.knownProjections);
        }
        return projToUse;
    }

    set element(element: PiElement) {
        this._element = element;
    }

    /**
     * This getter may not have parameters, therefore there is another function called getNamedBox,
     * that takes a projectionName as parameter.
     */
    get box(): Box {
        // console.log("GET BOX " + this._element?.piId() + ' ' +  this._element?.piLanguageConcept());
        if (this._element === null) {
            return null;
        }

        if (this._mainBox === null || this._mainBox === undefined) {
            this._mainBox = new ElementBox(this._element, "main-box-for-" + this._element.piLanguageConcept() + "-" + this._element.piId());
        }

        // the main box always stays the same for this element, but the content may differ
        this._mainBox.content = this.getContent(this.usedProjection);
        // console.log('BOX: ' + this._mainBox.role + ' for ' + this._mainBox.element.piId());
        return this._mainBox;
    }

    public getNamedBox(projectionName: string): Box {
        if (projectionName !== null && projectionName !== undefined && projectionName.length > 0) {
            // select the projection named 'projectionName' => overrule 'this.usedProjection'!!
            if (this.usedProjection !== projectionName) {
                this.usedProjection = projectionName;
            }
        }
        return this.box;
    }

    public getContent(projectionName: string): Box {
        return new LabelBox(this._element, "unknown-projection", () => "Content should be determined by the appropriate subclass of PiBoxProvider.");
    }

    public getTableDefinition(): PiTableDefinition {
        console.log('FreBoxProviderBase.getTableDefinition() should be overwritten by its subclass');
        return {
            headers: [this._element.piLanguageConcept()],
            cells: [(element: PiElement) => {
                return this.mainHandler.getBox(element);
            }]
        };
    }
}

