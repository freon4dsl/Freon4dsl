import { Box, BoxFactory, LabelBox } from "../boxes";
import { isNullOrUndefined } from "../../util";
import { PiElement } from "../../ast";
import { PiTableDefinition } from "../PiTables";
import { FreBoxProvider } from "./FreBoxProvider";
import { FreProjection } from "./FreProjection";
import { action, makeObservable, observable } from "mobx";

/**
 * This class, of which there should be one instance per editor, registers all
 * custom projections (of type FreProjection) and all box providers (of type
 * FreBoxProvider). Based on these registrations in the two main methods 'getBox',
 * and 'getTableDefinition', it is determined which of these should create the box for
 * a certain element. However, because box providers have a one-to-one relationship
 * with nodes (of type PiElement), it is always the box provider that ultimately
 * returns the requested box.
 */
export class FreProjectionHandler {
    private elementToProvider: Map<string, FreBoxProvider> = new Map<string, FreBoxProvider>();
    // private projections: Map<string, boolean> = new Map<string, boolean>();  // a map from projection name to enabled
    private _allProjections: string[] = [];
    private _enabledProjections: string[] = [];
    private conceptNameToProviderConstructor: Map<string, (h: FreProjectionHandler) => FreBoxProvider> = new Map<string, (h: FreProjectionHandler) => FreBoxProvider>([]);
    private _customProjections: FreProjection[] = [];

    constructor() {
        makeObservable<FreProjectionHandler>(this, {
            // _enabledProjections: observable,
            enableProjections: action
        });
    }
    // methods for custom projections
    initProviderConstructors(constructorMap: Map<string, () => FreBoxProvider>) {
        this.conceptNameToProviderConstructor = constructorMap;
    }

    get customProjections() : FreProjection[] {
        return this._customProjections;
    }
    addCustomProjection(p: FreProjection) {
        this._customProjections.push(p); // todo check if already present
        this.addProjection(p.name);
    }

    executeCustomProjection(element: PiElement, projectionName: string): Box {
        let BOX: Box = null;
        const customToUse = this.customProjections.find(cp => cp.name === projectionName);
        if(!!customToUse) {
            // bind(customToUse) binds the projection 'customToUse' to the 'this' variable, for use within the custom function
            let customFuction: (node: PiElement) => Box = customToUse.nodeTypeToBoxMethod.get(element.piLanguageConcept())?.bind(customToUse);

            if (!!customFuction) {
                // console.log("FreProjectionHandler enabled projections: " + proj.enabledProjections().map(p => p));
                BOX = customFuction(element);
                // console.log('FreProjectionHandler found custom BOX: ' + BOX.role + ' for ' + BOX.element.piId());
            }
        }
        return BOX;
    }

    // the main methods
    getBox(element: PiElement): Box {
        try {
            if (isNullOrUndefined(element)) {
                throw Error('FreProjectionHandler.getBox: element is null/undefined');
            }
        } catch (e) {
            console.log(e.stack);
            return null;
        }
        console.log('FreProjectionHandler getBox ' + element?.piLanguageConcept() + "-" + element?.piId())
        if (!!element) {
            // get the box provider
            const provider = this.getBoxProvider(element);
            let BOX: Box = provider.box; // todo remove console.log and adjust return statement
            // console.log("FreProjectionHandler found BOX: " + BOX.role + " for " + BOX.element.piId());
            return BOX;
        }
        // return a default box if nothing has been  found.
        return new LabelBox(element, "unknown-projection", () => "unknown box for " + element);
    }

    getTableDefinition(conceptName: string): PiTableDefinition {
        // console.log('FreProjectionHandler getTableDefinition ' + conceptName)
        const boxProvider = this.conceptNameToProviderConstructor.get(conceptName)(this);
        let tableDef = boxProvider.getTableDefinition();
        if (!!tableDef) {
            return tableDef;
        } else {
            // return default values if nothing has been found.
            return {
                headers: [conceptName],
                cells: [(element: PiElement) => {
                    return this.getBox(element);
                }]
            };
        }
    }

    // methods for registring the boxproviders
    addBoxProvider(elementId: string, provider: FreBoxProvider) {
        this.elementToProvider.set(elementId, provider);
    }

    getBoxProvider(element: PiElement): FreBoxProvider {
        if (isNullOrUndefined(element)) {
            throw Error("FreProjectionHandler.getBoxProvider: element is null/undefined");
        }

        // return if present, else create a new provider based on the language concept
        let boxProvider = this.elementToProvider.get(element.piId());
        if (isNullOrUndefined(boxProvider)) {
            boxProvider = this.conceptNameToProviderConstructor.get(element.piLanguageConcept())(this);
            this.elementToProvider.set(element.piId(), boxProvider);
            boxProvider.element = element;
            boxProvider.initUsedProjection(this.enabledProjections());
        }
        return boxProvider;
    }

    // functions for registring the projections
    addProjection(p: string) {
        this._allProjections.push(p); // todo check for duplicates
        if (p !== 'default') {
            this._enabledProjections.push(p);
        }
    }

    enableProjections(names: string[]) {
        BoxFactory.clearCaches();
        // Because priority needs to be taken into account, we loop over all projections
        // in order to get the order of enabled projections correct.
        const newList: string[] = [];
        for (const proj of this._allProjections) {
            if (names.includes(proj)) {
                newList.push(proj);
            }
        }
        this._enabledProjections = newList;

        //  Let all providers know that projection may be changed.
        for (const provider of this.elementToProvider.values()) {
            provider.checkUsedProjection(this.enabledProjections());
        }
    }

    /**
     * Returns the names of all known projections.
     */
    projectionNames(): string[] {
        return this._allProjections;
    }

    /**
     * Returns the names of enabled projections.
     */
    enabledProjections(): string[] {
        return this._enabledProjections;
    }
}
