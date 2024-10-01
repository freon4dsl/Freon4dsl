import { AstWorker } from "../ast-utils/index.js";
import { FreNode } from "../ast/index.js";

export interface FreSearchWorker extends AstWorker {
    result: FreNode[];
}
