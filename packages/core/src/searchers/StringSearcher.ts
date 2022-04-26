import { StringSearchWorker } from "./StringSearchWorker";
import { PiWriter } from "../writer";
import { PiElement } from "../ast";
import { AstWalker } from "../ast-utils";

export class StringSearcher {

    /**
     * Returns all elements in 'toBeSearched' that contain the string 'toFind' in the
     * string representation of 'toBeSearched' created by 'writer'. If 'metatype' is present,
     * then only those elements are returned that have the exact metatype.
     *
     * Note that this can be a resource consuming method, because of the creation of the string
     * representation for many AST nodes.
     *
     * @param toFind
     * @param toBeSearched
     * @param writer
     * @param metatype
     */
    findElementWithSubString(toFind: string, toBeSearched: PiElement, writer: PiWriter, metatype?: string): PiElement[] {
        // create the walker over the model tree
        const walker = new AstWalker();

        // create the finder
        let searchWorker = new StringSearchWorker(toFind, writer, metatype);

        // add the searcher to the walker
        walker.myWorkers.push(searchWorker);

        // do the work
        walker.walk(toBeSearched, (elem: PiElement) => {
            return searchWorker.includeNode(elem);
        });
        return searchWorker.result;
    }
}
