import { Box } from "../boxes";
import { PiElement } from "../../ast";
import { PiTableDefinition } from "../PiTables";
import { FreProjectionHandler } from "./FreProjectionHandler";


export interface FreBoxProvider {
    // we add a link to the overall FreProjectionHandler here, to avoid looking up
    mainHandler: FreProjectionHandler;
    conceptName: string;

    // todo add comments
    set element(element: PiElement);

    get box(): Box;

    getContent(projectionName: string): Box;

    getTableDefinition(): PiTableDefinition;

    checkUsedProjection(enabledProjections: string[]);

    initUsedProjection(enabledProjections: string[]);
}
