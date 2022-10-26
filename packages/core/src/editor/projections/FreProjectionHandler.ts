import { Box, BoxFactory, LabelBox } from "../boxes";
import { isNullOrUndefined } from "../../util";
import { PiElement } from "../../ast";
import { PiTableDefinition } from "../PiTables";
import { FreBoxProvider } from "./FreBoxProvider";

export class FreProjectionHandler {
    private elementToProvider: Map<string, FreBoxProvider> = new Map<string, FreBoxProvider>();
    private projections: Map<string, boolean> = new Map<string, boolean>();  // a map from projection name to enabled
    private conceptNameToProviderConstructor: Map<string, () => FreBoxProvider> = new Map<string, () => FreBoxProvider>([]);

    initProviderConstructors(constructorMap: Map<string, () => FreBoxProvider>) {
        this.conceptNameToProviderConstructor = constructorMap;
    }

    getBox(element: PiElement): Box {
        try {
            if (isNullOrUndefined(element)) {
                throw Error('FreProjectionHandler.getBox: element is null/undefined');
            }
        } catch (e) {
            console.log(e.stack);
            return new LabelBox(element, "unknown-projection", () => "element is null or undefined ");
        }
        // console.log('FreProjectionHandler getBox ' + element?.piId() + ", root projection: " + this._myCache.constructor.name)
        if (!!element) {
            const provider = this.getBoxProvider(element);
            const BOX = provider.box;
            console.log('FreProjectionHandler found BOX: ' + BOX.role + ' for ' + BOX.element.piId());
            return BOX;
        }
        // return a default box if nothing has been  found.
        return new LabelBox(element, "unknown-projection", () => "unknown box for " + element);
    }

    getTableDefinition(conceptName: string): PiTableDefinition {
        // console.log('FreProjectionHandler getTableDefinition ' + conceptName + ", root projection: " + this._myCache.constructor.name)
        // todo re-implement this
        // for (let p of this.projections.values()) {
        //     if (p.isEnabled) {
        //         const result = p.getTableDefinition(conceptName);
        //         if (result !== null) {
        //             return result;
        //         }
        //     }
        // }
        // return a default box if nothing has been found.
        return {
            headers: [conceptName],
            cells: [(element: PiElement) => {
                return this.getBox(element);
            }]
        };
    }

    // functions for the boxproviders
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

    // functions for the projections
    addProjection(p: string) {
        this.projections.set(p, true);
    }

    enableProjection(name: string): void {
        BoxFactory.clearCaches();
        console.log("Composite: enabling Projection " + name);
        this.projections.set(name, true);
    }

    disableProjection(name: string): void {
        BoxFactory.clearCaches();
        console.log("Composite: disabling Projection " + name);
        this.projections.set(name, false);
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
