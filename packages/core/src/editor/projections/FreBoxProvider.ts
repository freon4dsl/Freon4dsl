import { PiElement } from "../../ast";
import { Box, ElementBox, LabelBox } from "../boxes";
import { action, computed, makeObservable, observable } from "mobx";
import { FreProjectionHandler } from "./FreProjectionHandler";
import { startWithUpperCase } from "../../util";

/**
 * Base class for all box providers.
 */
export abstract class FreBoxProvider {
    mainHandler: FreProjectionHandler;                  // Reference to the overall FreProjectionHandler, to avoid looking up often.
    conceptName: string;                                // Name of the concept/interface for which this provider is defined.
    protected _element: PiElement;                      // The node in the model which this provider is serving.
    protected _mainBox: ElementBox = null;              // The box that is return by the method box(). Note that the initialization is needed for mobx!
    protected usedProjection: string = 'default';       // Name of the projection that currently is used to determine the contents of _mainBox.
    protected knownBoxProjections: string[] = [];       // The names of all generated projections, i.e. these are the projections for which this
    // provider itself has methods that can provide the contents of the _mainBox.
    protected knownTableProjections: string[] = [];     // The names of the generated table projections for this type of concept.
    protected _mustUseTable: boolean = false;

    constructor(mainHandler: FreProjectionHandler) {
        this.mainHandler = mainHandler;
        /*
        1. 'usedProjection' is observable, because a change in projection must trigger a change in the
        content of the '_mainBox'.
        2. 'box' is computed, because then a cache is kept such that the contents of '_mainBox' are
        recalculated only when either 'usedProjection' has changed, or when the underlying part of the
        PiElement model has changed.
        3. checkUsedProjection, initUsedProjection, and getNamedBox are 'actions', because the observable
        'usedProjection' may be changed in one of these methods.
         */
        makeObservable<FreBoxProvider, "usedProjection">(this, {
            usedProjection: observable,
            box: computed,
            checkUsedProjection: action,
            initUsedProjection: action,
            getNamedBox: action,
            mustUseTable: action
        });
    }

    /**
     * Every box provider is coupled one-on-one to a single node in the PiElement model.
     * The property 'element' is a link to this node.
     * @param element
     */
    set element(element: PiElement) {
        this._element = element;
    }

    public mustUseTable(value: boolean) {
        this._mustUseTable = value;
        this.usedProjection = this.findTableProjectionToUse();
    }
    /**
     * This is the main method in the box provider, which returns a Box for use in the
     * web application. Once the box provider is created, the box that is returned,
     * remains the same. However, its contents may change (see getContent). The box
     * that is returned is an ElementBox that itself is not rendered, but its content is.
     * Note that this getter may not have parameters, therefore there is another function
     * called getNamedBox, that takes a projectionName as parameter, which can be used in
     * case a specific projection is requested.
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
        return this._mainBox;
    }

    // public getBoxAsTable(projectionName?: string): Box {
    //     console.log('getBoxAsTable')
    //     if (projectionName !== null && projectionName !== undefined && projectionName.length > 0) {
    //         projectionName = this.transformToTableProjectionName(projectionName);
    //         if (this.knownTableProjections.includes(projectionName)) {
    //             // select the projection named 'projectionName' => overrule 'this.usedProjection'!!
    //             if (this.usedProjection !== projectionName) {
    //                 this.usedProjection = projectionName;
    //             }
    //         }
    //     } else {
    //         this.usedProjection = this.findTableProjectionToUse();
    //     }
    //     if (this._element === null) {
    //         return null;
    //     }
    //
    //     if (this._mainBox === null || this._mainBox === undefined) {
    //         this._mainBox = new ElementBox(this._element, "main-box-for-" + this._element.piLanguageConcept() + "-" + this._element.piId());
    //     }
    //
    //     // the main box always stays the same for this element, but the content may differ
    //     this._mainBox.content = this.getContent(this.usedProjection);
    //     return this._mainBox;
    // }

    public getNamedBox(projectionName: string): Box {
        if (projectionName !== null && projectionName !== undefined && projectionName.length > 0) {
            // select the projection named 'projectionName' => overrule 'this.usedProjection'!!
            if (this.usedProjection !== projectionName) {
                this.usedProjection = projectionName;
            }
        }
        return this.box;
    }

    /**
     * Returns the content of the box that is returned by box() (or .box).
     * See the comment there.
     * This method should be overwritten by each box provider.
     * @param projectionName
     */
    public getContent(projectionName: string): Box {
        return new LabelBox(this._element, "unknown-projection", () => "Content should be determined by the appropriate subclass of PiBoxProvider.");
    }

    /**
     * When the user of the webapp request a different projection, this method is called.
     * The currently enabled projections are compared to the projections known for this
     * type of concept (this.conceptName), and the name of the projection to use is changed
     * accordingly. Based on the projection name, it is determined whether the contents
     * of the _mainBox shoudl be recalculated. (See also comment in constructor.)
     *
     * The order is: (1) see if there is a custom projection for this type of concept,
     * (2) see if one of the generated projections is enabled,
     * (3) if nothing has been found return 'default'.
     * In all this it is assumed that the parameter enabledProjections is sorted such that
     * the last is the projection with the highest priority.
     * @param enabledProjections
     */
    checkUsedProjection(enabledProjections: string[]) {
        let projToUse: string = this.findProjectionToUse(enabledProjections);
        if (this.usedProjection !== projToUse) {
            this.usedProjection = projToUse;
        }
    }

    /**
     * Initializes the name of the projection to use in a similar way as checkUsedProjection
     * does.
     * @param enabledProjections
     */
    initUsedProjection(enabledProjections: string[]) {
        this.usedProjection = this.findProjectionToUse(enabledProjections);
    }

    private findProjectionToUse(enabledProjections: string[]) {
        let projToUse: string = '';
        if (!this._mustUseTable) {
            projToUse = this.findBoxProjectionToUse(enabledProjections);
        } else {
            projToUse = this.findTableProjectionToUse();
        }
        return projToUse;
    }

    /**
     * Method used to determine which projection to use for getting the table definition for
     * this type of concept.
     * @protected
     */
    private findTableProjectionToUse(): string {
        // see if we need to use a custom projection
        let projToUse: string = null;
        this.mainHandler.customProjections.forEach(cp => {
            // get the name of the first of the customs that fits
            // todo see whether we should loop backwards as in the enabledProjections
            if (projToUse === null && !!cp.nodeTypeToTableDefinition.get(this.conceptName)) {
                projToUse = cp.name;
            }
        });
        if (projToUse === null) {
            // From the list of projections that are enabled, select the first one that is available for this type of Freon node.
            // Loop through the projections backwards, because the last one takes precedence.
            const enabledProjections = this.mainHandler.enabledProjections();
            for (let i = enabledProjections.length - 1; i >= 0; i--) {
                const proj = this.transformToTableProjectionName(enabledProjections[i]);
                // get the name of the first of the generated projections that fits
                if (this.knownTableProjections.includes(proj)) {
                    projToUse = proj;
                    break;
                }
            }
            // } else {
            //     console.log('found custom table projection ' + projToUse + ' for ' + this.conceptName);
        }
        if (projToUse === null) { // still nothing found, then use the default
            projToUse = "default";
            // } else {
            //     console.log("found generated table projection " + projToUse + " for " + this.conceptName + " from " + this.knownTableProjections);
        }
        return projToUse;
    }

    private transformToTableProjectionName(projToUse: string) {
        return "tableFor" + startWithUpperCase(projToUse);
    }

    /**
     * Method used by both checkUsedProjection and InitUsedProjection, which determines
     * which projection to use for this type of concept.
     * @param enabledProjections
     * @private
     */
    private findBoxProjectionToUse(enabledProjections: string[]): string {
        // todo maybe remove parameter in favor of this.mainHandler.enabledProjections()
        // see if we need to use a custom projection
        let projToUse: string = null;
        for (const cp of this.mainHandler.customProjections) {
            // get the name of the first of the customs that fits
            // todo see whether we should loop backwards as in the enabledProjections
            if (projToUse === null && !!cp.nodeTypeToBoxMethod.get(this.conceptName)) {
                projToUse = cp.name;
            }
        }
        if (projToUse === null) {
            // From the list of projections that are enabled, select the first one that is available for this type of Freon node.
            // Loop through the projections backwards, because the last one takes precedence.
            for (let i = enabledProjections.length - 1; i >= 0 ; i--) {
                const proj = enabledProjections[i];
                // get the name of the first of the generated projections that fits
                if (this.knownBoxProjections.includes(proj)) {
                    projToUse = proj;
                    break;
                }
            }
        }
        if (projToUse === null) { // still nothing found, then use the default
            projToUse = "default";
        }
        // console.log('FOUND projection for ' + this.conceptName + ' : ' + projToUse);
        return projToUse;
    }

}

