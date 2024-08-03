import {Box, FreNode} from "@freon4dsl/core";

export class DancingBox extends Box {
    readonly kind: string = "dancing";
    constructor(node: FreNode, role: string) {
        super(node, role);
    }
}
