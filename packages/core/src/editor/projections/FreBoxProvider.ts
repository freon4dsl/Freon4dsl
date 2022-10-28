import { Box } from "../boxes";
import { PiElement } from "../../ast";
import { PiTableDefinition } from "../PiTables";
import { FreProjectionHandler } from "./FreProjectionHandler";


export interface FreBoxProvider {
    // we add a link to the overall FreProjectionHandler here, to avoid looking up
    mainHandler: FreProjectionHandler;

    // todo add comments
    set element(element: PiElement);

    get box(): Box;

    getContent(projectionName?: string): Box;

    getCustomBox(customFuction: (node: PiElement) => Box): Box;

    getTableDefinition(): PiTableDefinition;
}
