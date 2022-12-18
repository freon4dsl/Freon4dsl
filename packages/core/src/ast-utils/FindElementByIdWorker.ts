import { AstWorker } from "./AstWorker";
import { PiElement } from "../ast";

export class FindElementByIdWorker implements AstWorker {
    private idToBeFound: string;
    found: PiElement = null;

    constructor(id: string) {
        this.idToBeFound = id;
    }

    execAfter(modelelement: PiElement): boolean {
        return false;
    }

    execBefore(modelelement: PiElement): boolean {
        if (modelelement.piId() === this.idToBeFound) {
            this.found = modelelement;
            return true;
        } else {
            return false;
        }
    }

}
