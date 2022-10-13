import { PiBoxProvider } from "."
import { PiElement } from "../../ast";

export interface PiBoxProviderCache {
    addConceptProjection(elementId: string, provider: PiBoxProvider);

    getConceptProjection(element: PiElement): PiBoxProvider ;

    getProjectionNames(): string[];

    getConstructor(conceptName: string): () => PiBoxProvider ;
}
