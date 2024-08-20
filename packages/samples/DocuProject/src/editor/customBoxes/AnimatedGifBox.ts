import {Box, FreNode} from "@freon4dsl/core";

export class AnimatedGifBox extends Box {
    readonly kind: string = "animatedGif";
    constructor(node: FreNode, role: string) {
        super(node, role);
    }
}
