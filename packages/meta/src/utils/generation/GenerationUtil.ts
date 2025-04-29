import {
    FreMetaClassifier,
    FreMetaConcept,
    FreMetaConceptProperty,
    FreMetaExpressionConcept,
    FreMetaLangElement,
    FreMetaLanguage,
    FreMetaPrimitiveProperty,
    FreMetaProperty,
} from "../../languagedef/metalanguage/index.js";
import {
    FreInstanceExp,
    FreLangAppliedFeatureExp,
    FreLangExp,
    FreLangFunctionCallExp,
    FreLangSelfExp,
    MetaElementReference,
    FreMetaPrimitiveType,
} from "../../languagedef/metalanguage/index.js";
import { Names } from "./Names.js";
import { LangUtil } from "./LangUtil.js";

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
    public static sortConceptsOrRefs(
        freConcepts: FreMetaConcept[] | MetaElementReference<FreMetaConcept>[],
    ): FreMetaConcept[] {
        const newList: FreMetaConcept[] = [];
        // change all references to 'real' concepts
        freConcepts.forEach((p) => {
            if (p instanceof FreMetaConcept) {
                newList.push(p);
            } else if (p instanceof MetaElementReference) {
                newList.push(p.referred);
            }
        });
        return this.sortClassifiers(newList) as FreMetaConcept[];
    }

    /**
     * Sorts the classifiers such that any classifier comes before its super concept or interface
     */
    public static sortClassifiers(toBeSorted: FreMetaClassifier[]): FreMetaClassifier[] {
        const result: FreMetaClassifier[] = [];
        const remaining: FreMetaClassifier[] = []; // contains all elements that are not yet sorted
        remaining.push(...toBeSorted); // do not assign, because otherwise the 'container' of the 'toBeSorted' elements is changed
        while (remaining.length > 0) {
            remaining.forEach((cls) => {
                const supers = LangUtil.superClassifiers(cls);
                let hasSuperInList: boolean = false;
                supers.forEach((superCls) => {
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
            result.forEach((cls) => {
                const indexInRemaining: number = remaining.indexOf(cls);
                if (indexInRemaining >= 0) {
                    remaining.splice(indexInRemaining, 1);
                }
            });
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
    public static refListIncludes(
        list: MetaElementReference<FreMetaLangElement>[],
        element: MetaElementReference<FreMetaLangElement> | FreMetaLangElement,
    ): boolean {
        for (const xx of list) {
            if (element instanceof FreMetaLangElement) {
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
     * Returns a string representation of 'exp' that can be used in TypeScript code.
     * @param exp
     */
    public static langExpToTypeScript(exp: FreLangExp, paramName: string): string {
        let result: string = "";
        if (exp instanceof FreLangSelfExp) {
            result = `${paramName}.${this.langExpToTypeScript(exp.appliedfeature, paramName)}`;
        } else if (exp instanceof FreLangFunctionCallExp) {
            if (exp.sourceName === "ancestor") {
                const metaType: string = this.langExpToTypeScript(exp.actualparams[0], paramName); // there is always 1 param to this function
                result = `this.ancestor(${paramName}, "${metaType}") as ${metaType}`;
            } else {
                result = `this.${exp.sourceName} (${exp.actualparams
                    .map((param) => `${this.langExpToTypeScript(param, paramName)}`)
                    .join(", ")})`;
            }
            if (!!exp.appliedfeature) {
                result = `(${result}).${this.langExpToTypeScript(exp.appliedfeature, paramName)}`;
            }
        } else if (exp instanceof FreLangAppliedFeatureExp) {
            // TODO this should be replaced by special getters and setters for reference properties
            // and the unparser should be adjusted to this
            const isRef = this.isReferenceProperty(exp);
            // result = exp.sourceName + (isRef ? "?.referred" : "")
            //     + (exp.appliedfeature ? (`?.${this.langExpToTypeScript(exp.appliedfeature)}`) : "");
            result =
                (isRef ? Names.refName(exp.referredElement) : exp.sourceName) +
                (exp.appliedfeature ? `?.${this.langExpToTypeScript(exp.appliedfeature, paramName)}` : "");
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
    public static propertyToTypeScript(prop: FreMetaProperty): string {
        const isRef = !prop.isPart;
        return `modelelement.${prop.name + (isRef ? "?.referred" : "")}`;
    }

    /**
     * Returns a string representation of 'prop' that can be used in TypeScript code.
     * @param prop
     */
    public static propertyToTypeScriptWithoutReferred(prop: FreMetaProperty): string {
        return `modelelement.${prop.name}`;
    }

    /**
     * Returns true if the feature to which 'exp' refers, is marked to be a reference
     * property in the language.
     * @param exp
     */
    private static isReferenceProperty(exp: FreLangAppliedFeatureExp) {
        let isRef: boolean = false;
        const ref = exp.$referredElement?.referred;
        if (!!ref) {
            // should be present, otherwise it is an incorrect model
            // now see whether it is marked in the .ast file as 'reference'
            isRef = ref instanceof FreMetaConceptProperty && !ref.isPart && !ref.isList;
        }
        return isRef;
    }

    /**
     * Returns the property of 'con' that is called 'name' and has as type 'identifier', i.e. the property that
     * represents the name of the concept.
     * @param con
     */
    public static findNameProp(con: FreMetaClassifier): FreMetaPrimitiveProperty | undefined {
        return con.allPrimProperties().find((p) => p.name === "name" && p.type === FreMetaPrimitiveType.identifier);
    }

    /**
     * Returns true if 'freClasssifier' has a property that represents it name, i.e. a property
     * that is called 'name' and has as type 'identifier'.
     * @param freClassifier
     */
    public static hasNameProperty(freClassifier: FreMetaClassifier): boolean {
        if (!!freClassifier) {
            if (
                freClassifier
                    .allPrimProperties()
                    .some((prop) => prop.name === "name" && prop.type === FreMetaPrimitiveType.identifier)
            ) {
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
    public static isNameProp(p: FreMetaProperty): boolean {
        return p.name === "name" && p.type === FreMetaPrimitiveType.identifier;
    }

    /**
     * Returns the type of the property 'prop' without taking into account 'isList' or 'isPart'
     */
    public static getBaseTypeAsString(property: FreMetaProperty): string {
        const myType = property.type;
        if (property instanceof FreMetaPrimitiveProperty) {
            if (myType === FreMetaPrimitiveType.identifier) {
                return "string";
            } else if (myType === FreMetaPrimitiveType.string) {
                return "string";
            } else if (myType === FreMetaPrimitiveType.boolean) {
                return "boolean";
            } else if (myType === FreMetaPrimitiveType.number) {
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
    public static getTypeAsString(property: FreMetaProperty): string {
        let type: string = this.getBaseTypeAsString(property);
        if (!property.isPart) {
            type = `${Names.FreNodeReference}<${type}>`;
        }
        if (property.isList) {
            type = type + "[]";
        }
        return type;
    }

    public static createImports(language: FreMetaLanguage): string {
        // sort all names alphabetically
        let tmp: string[] = [];
        language.concepts.map((c) => tmp.push(Names.concept(c)));
        language.units.map((c) => tmp.push(Names.classifier(c)));
        tmp.push(Names.classifier(language.modelConcept));
        tmp = tmp.sort();

        return `${tmp.map((c) => `${c}`).join(", ")}`;
    }

    public static findExpressionBase(exp: FreMetaExpressionConcept): FreMetaExpressionConcept {
        if (!!exp.base && exp.base.referred instanceof FreMetaExpressionConcept) {
            return this.findExpressionBase(exp.base.referred);
        } else {
            return exp;
        }
    }

    public static sortUnitNames(language: FreMetaLanguage, unitNames: string[]) {
        // sort all names alphabetically
        const tmp: string[] = [];
        language.concepts.map((c) => tmp.push(Names.concept(c)));
        language.interfaces.map((c) => tmp.push(Names.interface(c)));
        tmp.push(...unitNames);
        tmp.push(Names.classifier(language.modelConcept));

        return tmp.sort();
    }
}
