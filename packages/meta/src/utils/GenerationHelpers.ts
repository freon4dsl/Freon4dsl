import {
    PiClassifier,
    PiConcept,
    PiConceptProperty,
    PiInterface,
    PiLanguage,
    PiPrimitiveProperty,
    PiProperty
} from "../languagedef/metalanguage/";
import { PiInstanceExp, PiLangAppliedFeatureExp, PiLangExp, PiLangFunctionCallExp, PiLangSelfExp } from "../languagedef/metalanguage";
import { PiElementReference } from "../languagedef/metalanguage/PiElementReference";
import { PiPrimitiveType } from "../languagedef/metalanguage/PiLanguage";
import { Names } from "./Names";

/**
 * This function sorts the list of PiClasses in such a way that
 * when a class has a base class, this base class comes after the class.
 * This is needed in cases where an if-statement is generated where the
 * condition is the type of the object, for instance in the unparser.
 * An entry for a subclass must precede an entry for its base class,
 * otherwise the unparse${concept.name} for the base class will be called.
 *
 * @param piclasses: the list of classes to be sorted
 */
export function sortClasses(piclasses: PiConcept[] | PiElementReference<PiConcept>[]): PiConcept[] {
    const newList: PiConcept[] = [];
    for (const c of piclasses) {
        // without base must be last
        const concept = (c instanceof PiElementReference ? c.referred : c);
        if (!concept.base) {
            newList.push(concept);
        }
    }

    while (newList.length < piclasses.length) {
        for (const c of piclasses) {
            const concept = (c instanceof PiElementReference ? c.referred : c);
            if (!newList.includes(concept)) { // concept is already in the list
                const base = concept.base?.referred;
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

// /**
//  * This function returns true if 'list' contains 'element', whether the element
//  * is a reference to, or the concept itself.
//  *
//  * @param list
//  * @param element
//  */
// export function refListIncludes(list: PiElementReference<PiLangElement>[],
//                                 element: PiElementReference<PiLangElement> | PiLangElement): boolean {
//     for (const xx of list) {
//         if (element instanceof PiLangElement) {
//             if (xx.referred === element) {
//                 return true;
//             }
//         } else if (element instanceof PiElementReference) {
//             if (xx.referred === element.referred) {
//                 return true;
//             }
//         }
//     }
//     return false;
// }

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
 * Returns true if the feature to which 'exp' refers, is marked to be a reference
 * property in the language.
 * @param exp
 */
function isReferenceProperty(exp: PiLangAppliedFeatureExp) {
    let isRef: boolean = false;
    const ref = exp.referredElement?.referred;
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
    return con.allPrimProperties().find(p => p.name === "name" && p.type.referred === PiPrimitiveType.identifier);
}

/**
 * Returns true if 'piClasssifier' has a property that respresents it name, i.e. a property
 * that is called 'name' and has as type 'string'.
 * @param piClassifier
 */
export function hasNameProperty (piClassifier: PiClassifier): boolean {
    if (!!piClassifier) {
        if (piClassifier.allPrimProperties().some(prop => prop.name === "name" && prop.type.referred === PiPrimitiveType.identifier) ) {
            return true;
        }
    }
    return false;
}

/**
 * Returns the type of the property 'prop' without taking into account 'isList' or 'isPart'
 */
export function getBaseTypeAsString(property: PiProperty): string {
    const myType = property.type.referred;
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
