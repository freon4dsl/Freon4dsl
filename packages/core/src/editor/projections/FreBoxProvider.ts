import { Box } from "../boxes";
import { PiElement } from "../../ast";

export interface FreBoxProvider {
    getContent(projectionName?: string): Box;

    set element(element: PiElement);

    get box(): Box;
}
