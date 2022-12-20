import { AstWorker } from "./AstWorker";
import { PiElement } from "../ast";

// TODO does not seems to be used, remove?
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
