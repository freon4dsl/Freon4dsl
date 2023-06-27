import { FreNamedNode } from "../ast";

export interface FreStdlib {
    elements: FreNamedNode[];
}

export class EmptyStdLib implements FreStdlib {
    elements: FreNamedNode[] = [];
}
