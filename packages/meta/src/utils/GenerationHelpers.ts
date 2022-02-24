import {
    PiClassifier,
    PiConcept,
    PiConceptProperty, PiExpressionConcept,
    PiInterface, PiLangElement,
    PiLanguage,
    PiPrimitiveProperty,
    PiProperty
} from "../languagedef/metalanguage/";
import { PiInstanceExp, PiLangAppliedFeatureExp, PiLangExp, PiLangFunctionCallExp, PiLangSelfExp } from "../languagedef/metalanguage";
import { PiElementReference } from "../languagedef/metalanguage/PiElementReference";
import { PiPrimitiveType } from "../languagedef/metalanguage/PiLanguage";
import { Names } from "./Names";

/**
 * This function sorts the list of PiConcepts in such a way that
 * when a concept has a base concept, this base concept comes after the concept.
 * This is needed in cases where an if-statement is generated where the
 * condition is the type of the object, for instance in the unparser.
 * An entry for a subconcept must precede an entry for its base concept,
 * otherwise the unparse${concept.name} for the base concept will be called.
 *
 * Note that all concepts that exist must be in 'piconcepts', other deadlock will occur!!
 *
 * @param piconcepts: the list of concepts to be sorted
 */
export function sortConcepts(piconcepts: PiConcept[] | PiElementReference<PiConcept>[]): PiConcept[] {
    const newList: PiConcept[] = [];
    return _internalSort(piconcepts, newList);
}

/**
 * This function sorts the list of PiConcepts in such a way that
 * when a concept has a base concept, this base concept comes after the concept.
 * This is similar to 'sortConcepts', but here not all concepts that exist must
 * be in 'piconcepts'. Deadlock will not occur, when all concepts in 'piconcepts'
 * inherit from 'baseConcept'.
 *
 * Note that baseConcept will not appear in the result.
 *
 * @param piconcepts
 * @param baseConcept
 */
export function sortConceptsWithBase(piconcepts: PiConcept[] | PiElementReference<PiConcept>[], baseConcept: PiConcept): PiConcept[] {
    const newList: PiConcept[] = [baseConcept];
    return _internalSort(piconcepts, newList).filter(c => c !== baseConcept);
}

function _internalSort(original: PiConcept[] | PiElementReference<PiConcept>[], newList: PiConcept[]): PiConcept[] {
    let remaining: PiConcept[] = [];
    for (const c of original) {
        // without base must be last
        const concept = (c instanceof PiElementReference ? c.referred : c);
        if (!concept.base) {
            newList.push(concept);
        } else {
            remaining.push(concept);
        }
    }

    let itemsToGo: number = remaining.length;
    while (itemsToGo > 0) {
        for (const concept of remaining) {
            const base = concept.base?.referred; // the remaining ones should have a base
            if (!!base) {
                if (newList.indexOf(base) > -1) { // base of the concept is already in the list
                    // console.log("adding " + concept.name);
                    newList.push(concept);
                    remaining.splice(remaining.indexOf(concept),1);
                }
            }
        }
        // see whether we should continue
        // do not continue if (1) there are no remaining concepts
        // (2) we were not able to push any remaining concept in the last go
        if (remaining.length === 0 || remaining.length === itemsToGo) {
            newList.push(...remaining); // push the last few remaining concepts to the new list
            remaining = [];
        }
        itemsToGo = remaining.length;
        // console.log("====> items to go: " + itemsToGo);
    }
    return newList.reverse();
}

/**
 * This function returns true if 'list' contains 'element', whether the element
 * is a reference to, or the concept itself.
 *
 * @param list
 * @param element
 */
export function refListIncludes(list: PiElementReference<PiLangElement>[],
                                element: PiElementReference<PiLangElement> | PiLangElement): boolean {
    for (const xx of list) {
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
 * Takes a list of PiClassifiers that contains both interfaces and concepts and returns a list of concepts
 * that are either in the list or implement an interface that is in the list.
 *
 * @param classifiers
 */
export function replaceInterfacesWithImplementors(classifiers: PiClassifier[] | PiElementReference<PiClassifier>[]): PiConcept[] {
    const result: PiConcept[] = [];
    for (const ref of classifiers) {
        const myClassifier = (ref instanceof PiElementReference ? ref.referred : ref);
        if (myClassifier instanceof PiInterface) {
            const implementors = myClassifier.language.concepts.filter(con => con.interfaces.some(intf => intf.referred === myClassifier));
            // check on duplicates
            for (const implementor of implementors) {
                if (!result.includes(implementor)) {
                    result.push(implementor);
                }
            }
        } else if (myClassifier instanceof PiConcept) {
            if (!result.includes(myClassifier)) {
                result.push(myClassifier);
            }
        }
    }
    return result;
}

/**
 * Returns a string representation of 'exp' that can be used in TypeScript code.
 * @param exp
 */
export function langExpToTypeScript(exp: PiLangExp): string {
    // tslint:disable-next-line:typedef-whitespace
    let result : string = "";
    if (exp instanceof PiLangSelfExp) {
        result = `modelelement.${langExpToTypeScript(exp.appliedfeature)}`;
    } else if (exp instanceof PiLangFunctionCallExp) {
        result = `this.${exp.sourceName} (${exp.actualparams.map(
            param => `${langExpToTypeScript(param)}`
        ).join(", ")})`;
    } else if (exp instanceof PiLangAppliedFeatureExp) {
        // TODO this should be replaced by special getters and setters for reference properties
        // and the unparser should be adjusted to this
        const isRef = isReferenceProperty(exp);
        result = exp.sourceName + (isRef ? "?.referred" : "")
            + (exp.appliedfeature ? (`?.${langExpToTypeScript(exp.appliedfeature)}`) : "");
    } else if (exp instanceof PiInstanceExp) {
        result = `${exp.sourceName}.${exp.instanceName}`;
    } else {
        result = exp?.toPiString();
    }
    return result;
}

/**
 * Returns a string representation of 'exp' that can be used in TypeScript code.
 * @param exp
 */
export function propertyToTypeScript(prop : PiProperty): string {
    const isRef = !prop.isPart;
    let result: string = `modelelement.${prop.name + (isRef ? "?.referred" : "")}`;
    return result;
}

/**
 * Returns a string representation of 'exp' that can be used in TypeScript code.
 * @param exp
 */
export function propertyToTypeScriptWithoutReferred(prop : PiProperty): string {
    let result: string = `modelelement.${prop.name}`;
    return result;
}

/**
 * Returns true if the feature to which 'exp' refers, is marked to be a reference
 * property in the language.
 * @param exp
 */
function isReferenceProperty(exp: PiLangAppliedFeatureExp) {
    let isRef: boolean = false;
    const ref = exp.__referredElement?.referred;
    if (!!ref) { // should be present, otherwise it is an incorrect model
        // now see whether it is marked in the .ast file as 'reference'
        isRef = (ref instanceof PiConceptProperty) && !ref.isPart && !ref.isList;
    }
    return isRef;
}

/**
 * Returns the property of 'con' that is called 'name' and has as type 'string', i.e. the property that
 * represents the name of the concept.
 * @param con
 */
export function findNameProp(con: PiClassifier): PiPrimitiveProperty {
    return con.allPrimProperties().find(p => p.name === "name" && p.type === PiPrimitiveType.identifier);
}

/**
 * Returns true if 'piClasssifier' has a property that respresents it name, i.e. a property
 * that is called 'name' and has as type 'string'.
 * @param piClassifier
 */
export function hasNameProperty (piClassifier: PiClassifier): boolean {
    if (!!piClassifier) {
        if (piClassifier.allPrimProperties().some(prop => prop.name === "name" && prop.type === PiPrimitiveType.identifier) ) {
            return true;
        }
    }
    return false;
}

/**
 * Returns the type of the property 'prop' without taking into account 'isList' or 'isPart'
 */
export function getBaseTypeAsString(property: PiProperty): string {
    const myType = property.type;
    if (property instanceof PiPrimitiveProperty) {
        if (myType === PiPrimitiveType.identifier) {
            return "string";
        } else if (myType === PiPrimitiveType.string) {
            return "string";
        } else if (myType === PiPrimitiveType.boolean) {
            return "boolean";
        } else if (myType === PiPrimitiveType.number) {
            return "number";
        }
        return "any";
    } else {
        return Names.classifier(myType);
    }
}

/**
 * Returns the type of the property 'prop' TAKING INTO ACCOUNT 'isList' or 'isPart'
 */
export function getTypeAsString(property: PiProperty): string {
    let type: string = getBaseTypeAsString(property);
    if (!property.isPart) {
        type = `${Names.PiElementReference}<${type}>`;
    }
    if (property.isList) {
        type = type + '[]';
    }
    return type;
}

export function createImports(language: PiLanguage): string {
    // sort all names alphabetically
    let tmp: string[] = [];
    language.concepts.map(c =>
        tmp.push(Names.concept(c))
    );
    language.units.map(c =>
        tmp.push(Names.classifier(c))
    );
    tmp.push(Names.classifier(language.modelConcept));
    tmp = tmp.sort();

    return `${tmp.map(c =>
        `${c}`
    ).join(", ")}`;
}

export function findExpressionBase(exp: PiExpressionConcept): PiExpressionConcept {
    if (!!exp.base && exp.base.referred instanceof PiExpressionConcept) {
        return findExpressionBase(exp.base.referred);
    } else {
        return exp;
    }
}
