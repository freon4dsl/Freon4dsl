import { Box, PiElement } from "@projectit/core";


export interface BoxProvider {
    get box(): Box;

    set element(element: PiElement);
}

