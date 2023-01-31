import {
    FreClassifier,
    FreConcept,
    FreConceptProperty, FreExpressionConcept,
    FreInterface, FreLangElement,
    FreLanguage,
    FrePrimitiveProperty,
    FreProperty
} from "../../languagedef/metalanguage";
import { FreInstanceExp, FreLangAppliedFeatureExp, FreLangExp, FreLangFunctionCallExp, FreLangSelfExp, MetaElementReference, FrePrimitiveType } from "../../languagedef/metalanguage";
import { Names } from "./Names";
import { LangUtil } from "./LangUtil";

export class GenerationUtil {

    /**
     * This function sorts the list of FreConcepts in such a way that
     * when a concept has a base concept, this base concept comes after the concept.
     * This is needed in cases where an if-statement is generated where the
     * condition is the type of the object, for instance in the unparser.
     * An entry for a subconcept must precede an entry for its base concept,
     * otherwise the unparse${concept.name} for the base concept will be called.
     *
     * @param freConcepts: the list of concepts to be sorted
     */
    public static sortConceptsOrRefs(freConcepts: FreConcept[] | MetaElementReference<FreConcept>[]): FreConcept[] {
        const newList: FreConcept[] = [];
        // change all references to 'real' concepts
        freConcepts.forEach( p => {
            if (p instanceof FreConcept) {
                newList.push(p);
            } else if (p instanceof MetaElementReference) {
                newList.push(p.referred);
            }
        })
        return this.sortClassifiers(newList) as FreConcept[];
    }

    /**
     * Sorts the classifiers such that any classifier comes before its super concept or interface
     **/
    public static sortClassifiers(toBeSorted: FreClassifier[]): FreClassifier[] {
        const result: FreClassifier[] = [];
        const remaining: FreClassifier[] = []; // contains all elements that are not yet sorted
        remaining.push(...toBeSorted); // do not assign, because otherwise the 'container' of the 'toBeSorted' elements is changed
        while (remaining.length > 0) {
            remaining.forEach(cls => {
                const supers = LangUtil.superClassifiers(cls);
                let hasSuperInList: boolean = false;
                supers.forEach(superCls => {
                    if (remaining.includes(superCls)) {
                        hasSuperInList = true;
                    }
                });
                // if an element has supers in the 'remaining' list it is retained, otherwise it is added to the result
                if (!hasSuperInList) {
                    result.push(cls);
                }
            });
            // remove all elements that are already sorted, i.e. are in the result, from the 'remaining' list
            result.forEach(cls => {
                const indexInRemaining: number = remaining.indexOf(cls)
                if (indexInRemaining >= 0) {
                    remaining.splice(indexInRemaining, 1);
                }
            })
        }
        // reverse the list because the elements without supers were added first, but they should be last
        return result.reverse();
    }

    /**
     * This function returns true if 'list' contains 'element', whether the element
     * is a reference to, or the concept itself.
     *
     * @param list
     * @param element
     */
    public static refListIncludes(list: MetaElementReference<FreLangElement>[],
                                  element: MetaElementReference<FreLangElement> | FreLangElement): boolean {
        for (const xx of list) {
            if (element instanceof FreLangElement) {
                if (xx.referred === element) {
                    return true;
                }
            } else if (element instanceof MetaElementReference) {
                if (xx.referred === element.referred) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Takes a list of FreClassifiers that contains both interfaces and concepts and returns a list of concepts
     * that are either in the list or implement an interface that is in the list.
     *
     * @param classifiers
     */
    public static replaceInterfacesWithImplementors(classifiers: FreClassifier[] | MetaElementReference<FreClassifier>[]): FreClassifier[] {
        const result: FreClassifier[] = [];
        for (const ref of classifiers) {
            const myClassifier = (ref instanceof MetaElementReference ? ref.referred : ref);
            if (myClassifier instanceof FreInterface) {
                const implementors = myClassifier.language.concepts.filter(con => con.interfaces.some(intf => intf.referred === myClassifier));
                // check on duplicates
                for (const implementor of implementors) {
                    if (!result.includes(implementor)) {
                        result.push(implementor);
                    }
                }
            } else {
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
    public static langExpToTypeScript(exp: FreLangExp): string {
        // tslint:disable-next-line:typedef-whitespace
        let result: string;
        if (exp instanceof FreLangSelfExp) {
            result = `modelelement.${this.langExpToTypeScript(exp.appliedfeature)}`;
        } else if (exp instanceof FreLangFunctionCallExp) {
            if (exp.sourceName === 'ancestor') {
                const metaType: string = this.langExpToTypeScript(exp.actualparams[0]); // there is always 1 param to this function
                result = `this.ancestor(modelelement, "${metaType}") as ${metaType}`;
            } else {
                result = `this.${exp.sourceName} (${exp.actualparams.map(
                    param => `${this.langExpToTypeScript(param)}`
                ).join(", ")})`;
            }
            if (!!exp.appliedfeature) {
                result = `(${result}).${this.langExpToTypeScript(exp.appliedfeature)}`;
            }
        } else if (exp instanceof FreLangAppliedFeatureExp) {
            // TODO this should be replaced by special getters and setters for reference properties
            // and the unparser should be adjusted to this
            const isRef = this.isReferenceProperty(exp);
            // result = exp.sourceName + (isRef ? "?.referred" : "")
            //     + (exp.appliedfeature ? (`?.${this.langExpToTypeScript(exp.appliedfeature)}`) : "");
            result = (isRef ? Names.refName(exp.referredElement) : exp.sourceName)
                + (exp.appliedfeature ? (`?.${this.langExpToTypeScript(exp.appliedfeature)}`) : "");
        } else if (exp instanceof FreInstanceExp) {
            result = `${exp.sourceName}.${exp.instanceName}`;
        } else {
            result = exp?.toFreString();
        }
        return result;
    }

    /**
     * Returns a string representation of 'prop' that can be used in TypeScript code.
     * @param prop
     */
    public static propertyToTypeScript(prop: FreProperty): string {
        const isRef = !prop.isPart;
        return `modelelement.${prop.name + (isRef ? "?.referred" : "")}`;
    }

    /**
     * Returns a string representation of 'prop' that can be used in TypeScript code.
     * @param prop
     */
    public static propertyToTypeScriptWithoutReferred(prop: FreProperty): string {
        return `modelelement.${prop.name}`;
    }

    /**
     * Returns true if the feature to which 'exp' refers, is marked to be a reference
     * property in the language.
     * @param exp
     */
    private static isReferenceProperty(exp: FreLangAppliedFeatureExp) {
        let isRef: boolean = false;
        const ref = exp.__referredElement?.referred;
        if (!!ref) { // should be present, otherwise it is an incorrect model
            // now see whether it is marked in the .ast file as 'reference'
            isRef = (ref instanceof FreConceptProperty) && !ref.isPart && !ref.isList;
        }
        return isRef;
    }

    /**
     * Returns the property of 'con' that is called 'name' and has as type 'identifier', i.e. the property that
     * represents the name of the concept.
     * @param con
     */
    public static findNameProp(con: FreClassifier): FrePrimitiveProperty {
        return con.allPrimProperties().find(p => p.name === "name" && p.type === FrePrimitiveType.identifier);
    }

    /**
     * Returns true if 'freClasssifier' has a property that respresents it name, i.e. a property
     * that is called 'name' and has as type 'identifier'.
     * @param freClassifier
     */
    public static hasNameProperty(freClassifier: FreClassifier): boolean {
        if (!!freClassifier) {
            if (freClassifier.allPrimProperties().some(prop => prop.name === "name" && prop.type === FrePrimitiveType.identifier)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns true if 'p' is called 'name' and has as type 'identifier', i.e. the property
     * represents the name of a concept.
     * @param p
     */
    public static isNameProp(p: FreProperty): boolean {
        return p.name === "name" && p.type === FrePrimitiveType.identifier;
    }

    /**
     * Returns the type of the property 'prop' without taking into account 'isList' or 'isPart'
     */
    public static getBaseTypeAsString(property: FreProperty): string {
        const myType = property.type;
        if (property instanceof FrePrimitiveProperty) {
            if (myType === FrePrimitiveType.identifier) {
                return "string";
            } else if (myType === FrePrimitiveType.string) {
                return "string";
            } else if (myType === FrePrimitiveType.boolean) {
                return "boolean";
            } else if (myType === FrePrimitiveType.number) {
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
    public static getTypeAsString(property: FreProperty): string {
        let type: string = this.getBaseTypeAsString(property);
        if (!property.isPart) {
            type = `${Names.FreNodeReference}<${type}>`;
        }
        if (property.isList) {
            type = type + '[]';
        }
        return type;
    }

    public static createImports(language: FreLanguage): string {
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

    public static findExpressionBase(exp: FreExpressionConcept): FreExpressionConcept {
        if (!!exp.base && exp.base.referred instanceof FreExpressionConcept) {
            return this.findExpressionBase(exp.base.referred);
        } else {
            return exp;
        }
    }
}

