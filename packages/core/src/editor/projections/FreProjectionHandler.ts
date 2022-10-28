import { Box, BoxFactory, LabelBox } from "../boxes";
import { isNullOrUndefined } from "../../util";
import { PiElement } from "../../ast";
import { PiTableDefinition } from "../PiTables";
import { FreBoxProvider } from "./FreBoxProvider";
import { FreProjection } from "./FreProjection";

export class FreProjectionHandler {
    private elementToProvider: Map<string, FreBoxProvider> = new Map<string, FreBoxProvider>();
    private projections: Map<string, boolean> = new Map<string, boolean>();  // a map from projection name to enabled
    private conceptNameToProviderConstructor: Map<string, () => FreBoxProvider> = new Map<string, () => FreBoxProvider>([]);
    private _customProjections: FreProjection[] = [];

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

    executeCustomProjection(element: PiElement, projectionName?: string): Box {
        let BOX: Box = null;
        let customFuction: (node: PiElement) => Box = null;
        this.customProjections.forEach(cp => {
            // first look for the specific projection that is asked for
            if (projectionName !== null && projectionName !== undefined && projectionName.length > 0) {
                if (cp.name === projectionName) {
                    // bind(cp) binds the projection 'cp' to the 'this' variable, for use within the custom function
                    customFuction = cp.nodeTypeToBoxMethod.get(element.piLanguageConcept())?.bind(cp);
                }
            }
            // no specific projection asked for, then find the first in the enabled projections
            // todo take priorities of custom projections into account
            if (this.enabledProjections().includes(cp.name)) {
                // bind(cp) binds the projection 'cp' to the 'this' variable, for use within the custom function
                customFuction = cp.nodeTypeToBoxMethod.get(element.piLanguageConcept())?.bind(cp);
            }
        });
        if (!!customFuction) {
            // console.log("FreProjectionHandler enabled projections: " + proj.enabledProjections().map(p => p));
            BOX = customFuction(element);
            // console.log('FreProjectionHandler found custom BOX: ' + BOX.role + ' for ' + BOX.element.piId());
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
        // console.log('FreProjectionHandler getBox ' + element?.piId())
        if (!!element) {
            // get the box provider
            const provider = this.getBoxProvider(element);
            let BOX: Box = provider.box;
            // console.log("FreProjectionHandler found BOX: " + BOX.role + " for " + BOX.element.piId());
            return BOX;
        }
        // return a default box if nothing has been  found.
        return new LabelBox(element, "unknown-projection", () => "unknown box for " + element);
    }

    getTableDefinition(conceptName: string): PiTableDefinition {
        // console.log('FreProjectionHandler getTableDefinition ' + conceptName)
        const boxProvider = this.conceptNameToProviderConstructor.get(conceptName)();
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
            boxProvider = this.conceptNameToProviderConstructor.get(element.piLanguageConcept())();
            this.elementToProvider.set(element.piId(), boxProvider);
            boxProvider.element = element;
        }
        return boxProvider;
    }

    // functions for registring the projections
    addProjection(p: string) {
        this.projections.set(p, true);
    }

    enableProjection(name: string): void {
        // todo maybe enable/disable all projections in one method?
        BoxFactory.clearCaches();
        console.log("Composite: enabling Projection " + name);
        this.projections.set(name, true);
        // todo make sure the editor.rootProjection is recalculated
    }

    disableProjection(name: string): void {
        BoxFactory.clearCaches();
        console.log("Composite: disabling Projection " + name);
        this.projections.set(name, false);
        // todo make sure the editor.rootProjection is recalculated
    }

    /**
     * Returns the names of all known projections.
     */
    projectionNames(): string[] {
        return Array.from(this.projections.keys());
    }

    /**
     * Returns the names of enabled projections.
     */
    enabledProjections(): string[] {
        const result: string[] = [];
        for (const [key, value] of this.projections) {
            if (value) result.push(key);
        }
        return result;
    }
}
