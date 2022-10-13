import { PiElement } from "../../ast";
import { Box } from "../boxes";

export interface PiBoxProvider {
    get box(): Box;

    set element(element: PiElement);
}

