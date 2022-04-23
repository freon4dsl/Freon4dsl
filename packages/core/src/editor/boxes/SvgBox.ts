import { observable, makeObservable } from "mobx";

import { PiUtils } from "../../util";
import { PiElement } from "../../model";
import { Box } from "./internal";

export class SvgBox extends Box {
    readonly kind = "SvgBox";

    svgPath: string = "";
    width: number = 20;
    height: number = 20;

    constructor(element: PiElement, role: string, svgPath: string, initializer?: Partial<SvgBox>) {
        super(element, role);
        makeObservable(this, {
            svgPath: observable,
            width: observable,
            height: observable
        });
        PiUtils.initializeObject(this, initializer);
        this.svgPath = svgPath;
    }
}

export function isSvgBox(box: Box): box is SvgBox {
    return box.kind === "SvgBox";
}
