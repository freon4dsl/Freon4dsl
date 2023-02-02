import { AstWorker } from "../ast-utils";
import { FreNode } from "../ast";

export interface FreSearchWorker extends AstWorker {
    result: FreNode[];
}
