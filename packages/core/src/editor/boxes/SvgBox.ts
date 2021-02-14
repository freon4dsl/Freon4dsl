import { observable } from "mobx";

import { PiUtils } from "../../util/PiUtils";
import { PiElement } from "../../language/PiModel";
import { Box } from "./Box";

export class SvgBox extends Box {
    readonly kind = "SvgBox";

    @observable public svg: JSX.Element;
    @observable width: number = 20;
    @observable height: number = 20;

    constructor(element: PiElement, role: string, svg: JSX.Element, initializer?: Partial<SvgBox>) {
        super(element, role);
        PiUtils.initializeObject(this, initializer);
        this.svg = svg;
    }
}
