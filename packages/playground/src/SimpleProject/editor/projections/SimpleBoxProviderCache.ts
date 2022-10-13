import { isNullOrUndefined, PiBoxProvider, PiCompositeProjection, PiElement, PiNamedElement, PiStdlib } from "@projectit/core";

import { SimplePart_BoxProvider } from "./SimplePart_BoxProvider";
import { ConceptA_BoxProvider } from "./ConceptA_BoxProvider";
import { ConceptB_BoxProvider } from "./ConceptB_BoxProvider";
import { ConceptD_BoxProvider } from "./ConceptD_BoxProvider";
import { ConceptE_BoxProvider } from "./ConceptE_BoxProvider";

export class SimpleBoxProviderCache extends PiCompositeProjection {
    private static theInstance: SimpleBoxProviderCache = null; // the only instance of this class

    /**
     * This method implements the singleton pattern
     */
    public static getInstance(): SimpleBoxProviderCache {
        if (this.theInstance === undefined || this.theInstance === null) {
            this.theInstance = new SimpleBoxProviderCache();
        }
        return this.theInstance;
    }

    /**
     * A private constructor, as demanded by the singleton pattern,
     * in which the list of predefined elements is filled.
     */
    private constructor() {
        super();
    }

    private elementToProvider: Map<string, PiBoxProvider> = new Map<string, PiBoxProvider>();
    private conceptNameToProviderConstructor: Map<string, () => PiBoxProvider> = new Map<string, () => PiBoxProvider>(
        [
            ["SimplePart", () => {
                return new SimplePart_BoxProvider()
            }],
            ["ConceptA", () => {
                return new ConceptA_BoxProvider()
            }],
            ["ConceptB", () => {
                return new ConceptB_BoxProvider()
            }],
            ["ConceptD", () => {
                return new ConceptD_BoxProvider()
            }],
            ["ConceptE", () => {
                return new ConceptE_BoxProvider()
            }],
        ]);

    addConceptProjection(elementId: string, provider: PiBoxProvider) {
        this.elementToProvider.set(elementId, provider);
    }

    getConceptProjection(element: PiElement): PiBoxProvider {
        // let boxType: string = element.piLanguageConcept();
        // if (!!nameOfSuper && nameOfSuper.length > 0) {
        //     if (!this.rootProjection.checkSuper(nameOfSuper, element.piLanguageConcept())) {
        //         throw new Error(
        //             `A box requested for '${nameOfSuper}', which is not a super class or interface of '${element.piLanguageConcept()}'`
        //         );
        //     } else {
        //         boxType = nameOfSuper;
        //     }
        // }

        // try {
        if (isNullOrUndefined(element)) {
            throw Error('NewCompositeProjection.getConceptProjection: element is null/undefined');
        }
        // } catch (e) {
        //     console.log(e.stack);
        //     return null;
        // }

        // return if present, else create a new provider based on the language concept
        let boxProvider = this.elementToProvider.get(element.piId());
        if (isNullOrUndefined(boxProvider)) {
            boxProvider = this.conceptNameToProviderConstructor.get(element.piLanguageConcept())();
            this.elementToProvider.set(element.piId(), boxProvider);
            boxProvider.element = element;
        }
        return boxProvider;
    }

    getProjectionNames(): string[] {
        return ['default'];
    }

    getConstructor(conceptName: string): () => PiBoxProvider {
        return this.conceptNameToProviderConstructor.get(conceptName);
    }
}
