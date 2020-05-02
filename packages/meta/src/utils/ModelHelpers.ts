import { PiLangElement } from "../languagedef/metalanguage/";
import { PiConcept, PiConceptProperty } from "../languagedef/metalanguage/";
import { PiInstanceExp, PiLangAppliedFeatureExp, PiLangExp, PiLangFunctionCallExp, PiLangSelfExp } from "../languagedef/metalanguage";
import { PiElementReference } from "../languagedef/metalanguage/PiElementReference";

/**
 * This function sorts the list of PiClasses in such a way that
 * when a class had a base class, this base class comes after the class.
 * This is needed in cases where an if-statement is generated where the
 * condition is the type of the object, for instance in the unparser.
 * An entry for a subclass must precede an entry for its base class,
 * otherwise the unparse${concept.name} for the base class will be called.
 *
 * @param piclasses: the list of classes to be sorted
 */
export function sortClasses(piclasses: PiConcept[] | PiElementReference<PiConcept>[]): PiConcept[] {
    let newList: PiConcept[] = [];
    for (let c of piclasses) {
        // without base must be last
        let concept: PiConcept;
        if (c instanceof PiConcept) {
            concept = c;
        } else if (c instanceof PiElementReference) {
            concept = c.referred;
        }
        if (!concept.base) {
            newList.push(concept);
        }
    }
    while (newList.length < piclasses.length) {
        for (let c of piclasses) {
            let concept: PiConcept;
            if (c instanceof PiConcept) {
                concept = c;
            } else if (c instanceof PiElementReference) {
                concept = c.referred;
            }
            if (concept.base) {
                // see whether the base, or the base of the base recursively, is in the new list
                // if so, push concept before concept.base, else push concept as first
                let index = indexOfBaseInList(newList, concept);
                if (index !== -1) { // no base found in 'newList'
                    newList.splice(index, 0, concept);
                } else {
                    newList.unshift(concept);
                }
            }
        }
    }
    return newList;
}

/**
 * Returns the index of the base of 'concept' in 'newList'.
 * If the direct base is not present, the function will search for parents of
 * the direct base recursively.
 * Returns -1 if no of the base concepts of 'concept' is present.
 *
 * @param newList
 * @param concept
 */
function indexOfBaseInList(newList: PiConcept[], concept: PiConcept): number {
    let myBase = concept.base?.referred;
    let index = -1;
    while (!!myBase || index > 0) {
        index = newList.indexOf(myBase);
        myBase = myBase?.base?.referred;
    }
    return index;
}

/**
 * This function returns true if 'list' contains 'element', whether the element
 * is a reference to, or the concept itself.
 *
 * @param list
 * @param element
 */
export function refListIncludes(list: PiElementReference<PiLangElement>[], element: PiElementReference<PiLangElement> | PiLangElement): boolean {
    // TODO ??? should we add a check on the types of the list and the element?
    for (let xx of list) {
        if (element instanceof PiLangElement) {
            if (xx.referred === element) {
                return true;
            }
        } else if (element instanceof PiElementReference) {
            if (xx.referred === element.referred) {
                return true;
            }
        }
    }
    return false;
}

/**
 * This function returns true if 'type' is regarded a primitive in PiLanguage. It can
 * have the values "string", "number", or "boolean".
 * @param type
 */
export function isPrimitiveType(type: PiLangElement): boolean {
    return type.name === "string" || type.name === "number" || type.name === "boolean";
}

export function langExpToTypeScript(exp: PiLangExp): string {
    let result : string = '';
    if (exp instanceof PiLangSelfExp) {
        result = `modelelement.${langExpToTypeScript(exp.appliedfeature)}`;
    } else if (exp instanceof PiLangFunctionCallExp) {
        result = `this.${exp.sourceName} (${exp.actualparams.map(
            param => `${this.makeTypeExp(param)}`
        ).join(", ")})`;
    } else if (exp instanceof PiLangAppliedFeatureExp) {
        // TODO this should be replaced by special getters and setters for reference properties
        let isRef = isReferenceProperty(exp);
        result = exp.sourceName + (isRef ? "?.referred" : "") + (exp.appliedfeature ? (`.${langExpToTypeScript(exp.appliedfeature)}`) : "");
    } else if (exp instanceof PiInstanceExp) {
        result = `${exp.sourceName}.${langExpToTypeScript(exp.appliedfeature)}`;
    } else {
        result = exp?.toPiString();
    }
    return result;
}

function isReferenceProperty(exp: PiLangAppliedFeatureExp) {
    let isRef: boolean = false;
    if (!!exp.referedElement && !!exp.referedElement.referred) { // should be present, otherwise it is an incorrect model
        // now see whether it is marked in the .lang file as 'reference'
        const ref = exp.referedElement.referred;
        isRef = (ref instanceof PiConceptProperty) && !ref.isPart;

        // isRef = (ref instanceof PiConceptProperty) && ref.owningConcept.references().some(r => r === ref);
    }
    return isRef;
}
