import { PiLangClass, PiLangConcept, PiLangConceptReference, PiLangElement, PiLangElementReference } from "../languagedef/metalanguage";

    // As in the WalkerTemplate,
    // the entries for the unparse${concept.name} must be sorted,
    // because an entry for a subclass must preceed an entry for
    // its base class, otherwise only the unparse${concept.name} for
    // the base class will be called.
    // TODO change description
    export function sortClasses(piclasses: PiLangClass[]) : PiLangClass[] {
        let newList : PiLangClass[] = [];
        for (let c of piclasses) {
            // without base must be last
            if ( !c.base ) {
                newList.push(c);
            }
        }
        while (newList.length < piclasses.length) { 
            for (let c of piclasses) {
                if ( c.base ) {
                    // push c before c.base
                    if (newList.includes(c.base.referedElement())) {
                        newList.unshift(c);
                    }
                }
            }
        }
        return newList;
    }

    /**
     * returns true if the list of concept references contains the element, whether the element is a reference to, or the concept itself
     */
    export function refListIncludes(list: PiLangElementReference[], element: PiLangElementReference | PiLangElement): boolean {
        // TODO ??? should we add a check on the types of the list and the element?
        for (let xx of list) {
            if (element instanceof PiLangElement) {
                if (xx.referedElement() === element) {
                    return true;
                }
            } else if (element instanceof PiLangElementReference) {
                if (xx.referedElement() === element.referedElement()) {
                    return true;
                }
            }
        }
        return false;
    }
