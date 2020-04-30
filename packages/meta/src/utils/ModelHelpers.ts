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
 * @param piclasses: the list of classes to be sorted
 */
export function sortClasses(piclasses: PiConcept[]): PiConcept[] {
    let newList: PiConcept[] = [];
    for (let c of piclasses) {
        // without base must be last
        if (!c.base) {
            newList.push(c);
        }
    }
    while (newList.length < piclasses.length) {
        for (let c of piclasses) {
            if (c.base) {
                // push c before c.base
                if (newList.includes(c.base.referred)) {
                    newList.unshift(c);
                }
            }
        }
    }
    return newList;
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
    if (exp instanceof PiLangSelfExp) {
        return `modelelement.${langExpToTypeScript(exp.appliedfeature)}`;
    } else if (exp instanceof PiLangFunctionCallExp) {
        return `this.${exp.sourceName} (${exp.actualparams.map(
            param => `${this.makeTypeExp(param)}`
        ).join(", ")})`;
    } else if (exp instanceof PiLangAppliedFeatureExp) {
        // TODO this should be replaced by special getters and setters for reference properties
        let isRef: boolean = false;
        if (!!exp.referedElement && !!exp.referedElement.referred) { // should be present, otherwise it is an incorrect model
            // now see whether it is marked in the .lang file as 'reference'
            const ref = exp.referedElement.referred;
            isRef = (ref instanceof PiConceptProperty) && ref.owningConcept.references().some(r => r === ref);
        }
        return exp.sourceName + (isRef ? ".referred" : "") + (exp.appliedfeature ? ("." + this.langRefToTypeScript(exp.appliedfeature)) : "");
    } else if (exp instanceof PiInstanceExp) {
        return `${exp.sourceName}.${langExpToTypeScript(exp.appliedfeature)}`;
    } else {
        return exp?.toPiString();
    }
}
