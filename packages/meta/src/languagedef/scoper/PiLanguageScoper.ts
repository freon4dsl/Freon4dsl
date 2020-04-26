import { PiLangEveryConcept } from "../metalanguage/PiLangEveryConcept";
import { PiLangConceptType } from "../metalanguage/PiLangConceptType";
import { PiLangAppliedFeatureExp, PiLangExp, PiProperty } from "../metalanguage";
import { PiLanguageNamespace } from "./PiLanguageNamespace";
import { PiLogger } from "../../../../core/src/util/PiLogging";
import { PiLangElement } from "../metalanguage/PiLangElement";

const LOGGER = new PiLogger("PiLanguageScoper");

export class PiLanguageScoper {

    getVisibleElements(
        modelelement: PiLangEveryConcept,
        metatype?: PiLangConceptType,
        excludeSurrounding?: boolean
    ): PiLangElement[] {
        let result: PiLangElement[] = [];
        if (!!modelelement) {
            if (modelelement instanceof PiLangAppliedFeatureExp) {
                // use alternative scope 'typeof( container )'
                let newScopeElement = (modelelement.sourceExp.referedElement.referred as PiProperty).type.referred;
                // let newScopeElement = this.myTyper.inferType(modelelement.piContainer().container as PiLangEveryConcept);
                if (!!newScopeElement) {
                    let ns = new PiLanguageNamespace(newScopeElement);
                    result = ns.getVisibleElements(metatype, true); // true means that we are excluding names from parent namespaces
                } else {
                    throw  new Error("alternative scope for applied feature not found");
                }
            } else {
                let ns = new PiLanguageNamespace(modelelement);
                result = ns.getVisibleElements(metatype, excludeSurrounding); // true means that we are excluding names from parent namespaces
            }
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
