import { PiBoxProvider } from "."
import { PiElement } from "../../ast";

export interface PiBoxProviderCache {
    addBoxProvider(elementId: string, provider: PiBoxProvider);

    getBoxProvider(element: PiElement): PiBoxProvider ;

    getProjectionNames(): string[];

    getConstructor(conceptName: string): () => PiBoxProvider ;
}
