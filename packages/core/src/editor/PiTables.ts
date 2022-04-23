import { PiElement } from "../model";
import { Box } from "./boxes/index";

export type PiTableDefinition = {
    headers: string[];
    cells: ((e: PiElement) => Box)[];
}
