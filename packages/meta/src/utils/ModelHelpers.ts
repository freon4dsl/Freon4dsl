import { PiClassifier, PiInterface, PiLangElement } from "../languagedef/metalanguage/";
import { PiConcept, PiConceptProperty } from "../languagedef/metalanguage/";
import { PiInstanceExp, PiLangAppliedFeatureExp, PiLangExp, PiLangFunctionCallExp, PiLangSelfExp } from "../languagedef/metalanguage";
import { PiElementReference } from "../languagedef/metalanguage/PiElementReference";
import { int } from "parjs";

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
        let concept = (c instanceof PiElementReference ? c.referred : c);
        if (!concept.base) {
            newList.push(concept);
        }
    }

    while (newList.length < piclasses.length) {
        for (let c of piclasses) {
            let concept = (c instanceof PiElementReference ? c.referred : c);
            if (!newList.includes(concept)) { // concept is already in the list
                let base = concept.base?.referred;
                if (base) {
                    if (newList.indexOf(base) > -1) { // base of the concept is already in the list
                        newList.push(concept);
                    }
                }
            }
        }
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
            param => `${langExpToTypeScript(param)}`
        ).join(", ")})`;
    } else if (exp instanceof PiLangAppliedFeatureExp) {
        // TODO this should be replaced by special getters and setters for reference properties
        // and the unparser should be adjusted to this
        let isRef = isReferenceProperty(exp);
        result = exp.sourceName + (isRef ? "?.referred" : "") + (exp.appliedfeature ? (`?.${langExpToTypeScript(exp.appliedfeature)}`) : "");
    } else if (exp instanceof PiInstanceExp) {
        result = `${exp.sourceName}.${exp.instanceName}`;
    } else {
        result = exp?.toPiString();
    }
    return result;
}

function isReferenceProperty(exp: PiLangAppliedFeatureExp) {
    let isRef: boolean = false;
    // if (!!exp.referredElement && !!exp.referredElement.referred) { // should be present, otherwise it is an incorrect model
    //     // now see whether it is marked in the .lang file as 'reference'
    //     const ref = exp.referredElement.referred;
    //     isRef = (ref instanceof PiConceptProperty) && !ref.isPart && !ref.isList;
    // }
    // TODO check the change from the above to this code
    const ref = exp.referredElement?.referred;
    if (!!ref) { // should be present, otherwise it is an incorrect model
        // now see whether it is marked in the .lang file as 'reference'
        isRef = (ref instanceof PiConceptProperty) && !ref.isPart && !ref.isList;
    }
    return isRef;
}

/**
 * Takes a list of PiClassifiers that contains both interfaces and concepts and returns a list of concepts
 * that are either in the list or implement an interface that is in the list.
 *
 * @param classifiers
 */
export function  replaceInterfacesWithImplementors(classifiers: PiClassifier[] | PiElementReference<PiClassifier>[]): PiConcept[] {
    let result: PiConcept[] = [];
    for (let ref of classifiers) {
        let myClassifier = (ref instanceof PiElementReference ? ref.referred : ref);
        if (myClassifier instanceof PiInterface){
            let implementors = myClassifier.language.concepts.filter(con => con.interfaces.some(intf => intf.referred === myClassifier));
            // check on duplicates
            for (let implementor of implementors) {
                if (!result.includes(implementor)) {
                    result.push(implementor);
                }
            }
        } else if (myClassifier instanceof PiConcept){
            if (!result.includes(myClassifier)) {
                result.push(myClassifier);
            }
        }
    }
    return result;
}

/**
 * Takes a PiInterface and returns a list of concepts that implement it.
 *
 * @param piInterface
 */
export function  findImplementors(piInterface: PiInterface | PiElementReference<PiInterface>): PiConcept[] {
    // TODO add implementors of sub-interfaces
    let myInterface = (piInterface instanceof PiElementReference ? piInterface.referred : piInterface);
    return myInterface.language.concepts.filter(con => con.interfaces.some(intf => intf.referred === myInterface));
}

/**
 * Takes a classifier (either a concept or an interface) and returns a list of all subconcepts -resursive-,
 * all concepts that implement one of the interfaces or a sub-interface -resursive-, and their subconcepts -resursive-.
 * The 'classifier' itself is also included.
 *
 * @param classifier
 */
export function findAllImplementorsAndSubs(classifier: PiElementReference<PiClassifier> | PiClassifier): PiClassifier[] {
    let result: PiClassifier[] = [];
    let myClassifier = (classifier instanceof PiElementReference ? classifier.referred : classifier);
    if (!!myClassifier) {
        result.push(myClassifier);
        if (myClassifier instanceof  PiConcept) { // find all subclasses and mark them as namespace
            result = result.concat(myClassifier.allSubConceptsRecursive());
        } else if (myClassifier instanceof  PiInterface) { // find all implementors and their subclasses and mark them as namespace
            for (let implementor of findImplementors(myClassifier)) {
                if (!result.includes(implementor)) {
                    result.push(implementor);
                    result = result.concat(implementor.allSubConceptsRecursive());
                }
            }
            // find all subinterfaces and add their implementors as well
            for (let subInterface of myClassifier.allSubInterfacesRecursive()) {
                if (!result.includes(subInterface)) {
                    result.push(subInterface);
                    for (let implementor of findImplementors(subInterface)) {
                        if (!result.includes(implementor)) {
                            result.push(implementor);
                            result = result.concat(implementor.allSubConceptsRecursive());
                        }
                    }
                }
            }
        }
    }
    return result;
}

export function hasNameProperty (piClassifier: PiClassifier): boolean {
    if (!!piClassifier) {
        if (piClassifier.allPrimProperties().some(prop => prop.name === 'name' && prop.primType === 'string') ) {
            return true;
        }
    }
    return false;
}
