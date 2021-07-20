import { observable } from "mobx";

import { PiUtils } from "../../util";
import { PiElement } from "../../language";
import { Box } from "./internal";

export class SvgBox extends Box {
    readonly kind = "SvgBox";

    @observable public svgPath: string;
    @observable width: number = 20;
    @observable height: number = 20;

    constructor(element: PiElement, role: string, svgPath: string, initializer?: Partial<SvgBox>) {
        super(element, role);
        PiUtils.initializeObject(this, initializer);
        this.svgPath = svgPath;
    }
}

export function isSvgBox(box: Box): box is SvgBox {
    return box.kind === "SvgBox";
}
