import { ElementSearchWorker } from "./ElementSearchWorker";
import { LanguageWalker, PiElement, PiModelUnit } from "../language";

export class ElementSearcher {

    findElement(unit: PiModelUnit, toFind: Partial<PiElement>, metatype: string): PiElement[] {
        const result: PiElement[] = [];

        // create the walker over the model tree
        const walker = new LanguageWalker();

        // create the finder
        let searchWorker = new ElementSearchWorker(toFind, metatype, result);

        // add the searcher to the walker
        walker.myWorkers.push(searchWorker);

        // do the work
        walker.walk(unit, () => {
            return true;
        });
        return result;
    }
}
