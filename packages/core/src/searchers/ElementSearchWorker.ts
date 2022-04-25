import { LanguageWorker, PiElement } from "../language";


export class ElementSearchWorker implements LanguageWorker {
    private toFind: Partial<PiElement>;
    private metatype: string;
    private result: PiElement[];

    constructor(toFind: Partial<PiElement>, metatype: string, result: PiElement[]) {
        this.toFind = toFind;
        this.metatype = metatype;
        this.result = result;
    }

    execAfter(modelelement: PiElement): boolean {
        // unused
        return false;
    }

    execBefore(modelelement: PiElement): boolean {
        if (this.metatype === modelelement.piLanguageConcept() || this.metatype === "PiElementReference") {
            if (modelelement.match(this.toFind)) {
                this.result.push(modelelement);
            }
            return true;
        }
        return false;
    }

}
