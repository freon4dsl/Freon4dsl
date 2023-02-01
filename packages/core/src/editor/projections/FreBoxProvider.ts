import { PiElement } from "../../ast";
import { isNullOrUndefined } from "../../util";
import { Box, ElementBox, LabelBox } from "../boxes";
import { FreProjectionHandler } from "./FreProjectionHandler";
import { FreProjectionCalculator } from "./FreProjectionCalculator";


/**
 * Base class for all box providers.
 */
export abstract class FreBoxProvider {
    mainHandler: FreProjectionHandler;               // Reference to the overall FreProjectionHandler, to avoid looking up often.
    conceptName: string;                             // Name of the concept/interface for which this provider is defined.
    protected _element: PiElement;                   // The node in the model which this provider is serving.
    protected _mainBox: ElementBox = null;           // The box that is return by the method box(). Note that the initialization is needed for mobx!
    public usedProjection: string = null;            // Name of the projection that currently is used to determine the contents of _mainBox.
    public knownBoxProjections: string[] = [];       // The names of all generated projections, i.e. these are the projections for which this
    // provider itself has methods that can provide the contents of the _mainBox.
    public knownTableProjections: string[] = [];     // The names of the generated table projections for this type of concept.

    constructor(mainHandler: FreProjectionHandler) {
        this.mainHandler = mainHandler;
    }

    /**
     * Every box provider is coupled one-on-one to a single node in the PiElement model.
     * The property 'element' is a link to this node.
     * @param element
     */
    set element(element: PiElement) {
        this._element = element;
    }

    /**
     * This is the main method in the box provider, which returns a Box for use in the
     * web application. Once the box provider is created, the box that is returned,
     * remains the same. However, its contents may change (see getContent). The box
     * that is returned is an ElementBox that itself is not rendered, but its content is.
     */
    get box(): ElementBox {
        // console.log("GET BOX " + this._element?.piId() + ' ' +  this._element?.piLanguageConcept());
        if (this._element === null) {
            return null;
        }

        if (this._mainBox === null || this._mainBox === undefined) {
            this._mainBox = new ElementBox(this._element, "main-box-for-" + this._element.piLanguageConcept() + "-" + this._element.piId());
        }

        // the main box always stays the same for this element, but the content may differ
        this._mainBox.content = this.getContent(this.projection());
        return this._mainBox;
    }

    /**
     * Returns the content of the box that is returned by box() (or .box).
     * See the comment there.
     * This method should be overwritten by each box provider.
     * @param projectionName
     */
    protected getContent(projectionName: string): Box {
        return new LabelBox(this._element, "unknown-projection", () => "Content should be determined by the appropriate subclass of PiBoxProvider.");
    }

    public getContentForSuper(projectionName: string): Box {
        return this.getContent(projectionName);
    }

    /**
     * When the user of the webapp request a different projection, this method is called.
     * It clears the current used projection, so it will be recalculated when needed.
     * @param enabledProjections
     */
    clearUsedProjection(): void {
        this.usedProjection = null;
    }

    /**
     * Find projection based on known (table) projections and active projections
     * @protected
     */
    protected findProjectionToUse(table: boolean): string {
        if (table) {
            this.usedProjection = FreProjectionCalculator.findProjectionToUse(this.mainHandler, this.conceptName, this.knownTableProjections, table);
        } else {
            this.usedProjection = FreProjectionCalculator.findProjectionToUse(this.mainHandler, this.conceptName, this.knownBoxProjections, table);
        }
        return this.usedProjection;
    }

    /**
     * Return (or calculate if needed) the projection to be used for this._element
     */
    projection() {
        if (isNullOrUndefined(this.usedProjection)) {
            const ownerDescriptor = this?._element?.piOwnerDescriptor();
            if (isNullOrUndefined(ownerDescriptor) || ownerDescriptor.owner.piIsModel() ) {
                // just find the first projection in the active list of projections
                this.usedProjection = this.findProjectionToUse(false);
            } else {
                const ownerBoxProvider: FreBoxProvider = this.mainHandler.getBoxProvider(ownerDescriptor.owner);
                const ownerRequired = this.mainHandler.getRequiredProjection(ownerDescriptor.owner.piLanguageConcept(), ownerBoxProvider.projection() ,ownerDescriptor.propertyName);
                if (ownerRequired === null || ownerRequired === undefined) {
                    // No requirement from owner projection: just find the first projection in the active list of projections
                    this.usedProjection = this.findProjectionToUse(false);
                } else {
                    // The projection to use is defined by the parent element
                    if (ownerRequired === "__TABLE__") {
                        this.usedProjection = this.findProjectionToUse(true);
                    } else {
                        // Named projection
                        this.usedProjection = ownerRequired
                    }
                }
            }
        }
        return this.usedProjection;
    }
}

