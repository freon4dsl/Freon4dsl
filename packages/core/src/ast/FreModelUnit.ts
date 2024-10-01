import { FreNamedNode } from "./FreNamedNode.js";

export interface FreModelUnit extends FreNamedNode {
    fileExtension: string;

    // copy(): FreModelUnit;
}
