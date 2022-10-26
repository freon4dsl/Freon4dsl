import { Box } from "../boxes";
import { PiElement } from "../../ast";
import { PiTableDefinition } from "../PiTables";


export interface FreBoxProvider {
    set element(element: PiElement);

    get box(): Box;

    getContent(projectionName?: string): Box;

    getCustomBox(customFuction: (node: PiElement) => Box): Box;

    getTableDefinition(): PiTableDefinition;
}
