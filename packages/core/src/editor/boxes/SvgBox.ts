import { FreUtils } from "../../util";
import { FreNode } from "../../ast";
import { Box } from "./internal";

export class SvgBox extends Box {
    readonly kind = "SvgBox";

    svgPath: string = "";
    width: number = 20;
    height: number = 20;

    constructor(element: FreNode, role: string, svgPath: string, initializer?: Partial<SvgBox>) {
        super(element, role);
        FreUtils.initializeObject(this, initializer);
        this.svgPath = svgPath;
        this.selectable = false;
    }
}

export function isSvgBox(box: Box): box is SvgBox {
    return box?.kind === "SvgBox";
}
