import { FreNamedNode } from "./FreNamedNode";

export interface FreModelUnit extends FreNamedNode {
    fileExtension: string;

    // copy(): FreModelUnit;
}
