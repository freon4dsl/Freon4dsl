import { PiElement } from "../../ast";
import { Box } from "../boxes";
import { PiTableDefinition } from "../PiTables";

export interface PiBoxProvider {
    get box(): Box;

    getContent(projectionName?: string): Box;

    getTableDefinition(): PiTableDefinition;

    set element(element: PiElement);
}

