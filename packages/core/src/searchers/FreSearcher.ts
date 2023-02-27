import { FreNode } from "../ast";
import { AstWalker } from "../ast-utils";
import { FreWriter } from "../writer";
import { StructureSearchWorker } from "./StructureSearchWorker";
import { NamedElementSearchWorker } from "./NamedElementSearchWorker";
import { StringSearchWorker } from "./StringSearchWorker";
import { FreSearchWorker } from "./FreSearchWorker";

export class FreSearcher {
    /**
     * Returns all elements in 'toBeSearched' that match the structure and values in 'toFind'.
     * If 'metatype' is present, then only those elements are returned that have the exact metatype.
     * @param toBeSearched
     * @param toFind
     * @param metatype
     */
    findStructure(toFind: Partial<FreNode>, toBeSearched: FreNode, metatype?: string): FreNode[] {
        if (!!toFind && !!toBeSearched) {
            // create the finder
            const searchWorker = new StructureSearchWorker(toFind, metatype);
            // do the work
            return this.internalFind(toBeSearched, searchWorker);
        } else {
            return [];
        }
    }

    /**
     * Returns all elements in 'toBeSearched' that have 'nameToFind' as value of their 'name: identifier' property.
     * If 'metatype' is present, then only those elements are returned that have the exact metatype.
     * This search is case-sensitive.
     * @param toBeSearched
     * @param nameToFind
     * @param metatype
     */
    findNamedElement(nameToFind: string, toBeSearched: FreNode, metatype?: string): FreNode[] {
        if (nameToFind.length > 0 && !!toBeSearched) {
            // create the finder
            const searchWorker = new NamedElementSearchWorker(nameToFind, true, metatype);
            // do the work
            return this.internalFind(toBeSearched, searchWorker);
        } else {
            return [];
        }
    }

    /**
     * Returns all elements in 'toBeSearched' that have 'nameToFind' as value of their 'name: identifier' property.
     * If 'metatype' is present, then only those elements are returned that have the exact metatype.
     * This search is NOT case-sensitive.
     * @param toBeSearched
     * @param nameToFind
     * @param metatype
     */
    findNamedElementNotCaseSensitive(nameToFind: string, toBeSearched: FreNode, metatype?: string): FreNode[] {
        if (nameToFind.length > 0 && !!toBeSearched) {
            // create the finder
            const searchWorker = new NamedElementSearchWorker(nameToFind, false, metatype);
            // do the work
            return this.internalFind(toBeSearched, searchWorker);
        } else {
            return [];
        }
    }

    /**
     * Note that this can be a resource consuming method, because of the creation of the string
     * representation for many AST nodes.
     *
     * Returns all elements in 'toBeSearched' that contain the string 'toFind' in the
     * string representation of 'toBeSearched' created by 'writer'. If 'metatype' is present,
     * then only those elements are returned that have the exact metatype.
     * This search is case-sensitive.
     *
     * @param toFind
     * @param toBeSearched
     * @param writer
     * @param metatype
     */
    findString(toFind: string, toBeSearched: FreNode, writer: FreWriter, metatype?: string): FreNode[] {
        // TODO determine whether line breaks and tabs should be handled specially
        if (toFind.length > 0 && !!toBeSearched && !!writer) {
            // create the finder
            const searchWorker = new StringSearchWorker(toFind, writer, metatype);
            // do the work
            return this.internalFind(toBeSearched, searchWorker);
        } else {
            return [];
        }
    }

    private internalFind(toBeSearched: FreNode, searchWorker: FreSearchWorker): FreNode[] {
        // create the walker over the model tree
        const walker = new AstWalker();
        // add the searcher to the walker
        walker.myWorkers.push(searchWorker);
        // do the work
        walker.walk(toBeSearched, () => {
            return true;
        });
        return searchWorker.result;
    }
}
