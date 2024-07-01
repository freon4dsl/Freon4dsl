import { FreNode } from "./FreNode";

export interface FreNamedNode extends FreNode {
    name: string;

    // copy(): FreNamedNode;
}
