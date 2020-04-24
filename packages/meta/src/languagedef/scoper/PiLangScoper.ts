import { PiLogger } from "../../../../core/src/util/PiLogging";
import { PiLangConceptType } from "../metalanguage/PiLangConceptType";
import { PiLangEveryConcept } from "../metalanguage/PiLangEveryConcept";
import { PiLangNamespace } from "./PiLangNamespace";
import { PiLangElement } from "../metalanguage";

const LOGGER = new PiLogger("PiLangScoper");

export class PiLangScoper {

    getVisibleElements(modelelement: PiLangEveryConcept, metatype?: PiLangConceptType, excludeSurrounding?: boolean): PiLangElement[] {
        let result: PiLangElement[] = [];
        if (!!modelelement) {
            let ns = new PiLangNamespace(modelelement);
            result = ns.getVisibleElements(metatype, excludeSurrounding); // true means that we are excluding names from parent namespaces
            return result;
        } else {
            LOGGER.error(this, "getVisibleElements: modelelement is null");
            return result;
        }
    }

    getFromVisibleElements(
        modelelement: PiLangEveryConcept,
        name: string,
        metatype?: PiLangConceptType,
        excludeSurrounding?: boolean
    ): PiLangElement {
        let vis = this.getVisibleElements(modelelement, metatype, excludeSurrounding);
        if (vis !== null) {
            for (let e of vis) {
                let n: string = e.name;
                if (name === n) {
                    return e;
                }
            }
        }
        return null;
    }

    getVisibleNames(modelelement: PiLangEveryConcept, metatype?: PiLangConceptType, excludeSurrounding?: boolean): string[] {
        let result: string[] = [];
        let vis = this.getVisibleElements(modelelement, metatype, excludeSurrounding);
        for (let e of vis) {
            let n: string = e.name;
            result.push(n);
        }
        return result;
    }

    isInScope(modelElement: PiLangEveryConcept, name: string, metatype?: PiLangConceptType, excludeSurrounding?: boolean): boolean {
        if (this.getFromVisibleElements(modelElement, name, metatype, excludeSurrounding) !== null) {
            return true;
        } else {
            return false;
        }
    }
}
