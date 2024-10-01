import { FreNamedNode } from "../ast/index.js";

export interface FreStdlib {
    elements: FreNamedNode[];
}

export class EmptyStdLib implements FreStdlib {
    elements: FreNamedNode[] = [];
}
