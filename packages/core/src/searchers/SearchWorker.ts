import { AstWorker } from "../ast-utils";
import { PiElement } from "../ast";

export interface SearchWorker extends AstWorker {
    result: PiElement[];
}
