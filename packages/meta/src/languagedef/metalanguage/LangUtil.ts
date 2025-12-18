import type {
    FreMetaPrimitiveProperty,
    FreMetaProperty} from './internal.js';
import {
    FreMetaClassifier,
    FreMetaConcept,
    FreMetaExpressionConcept,
    FreMetaLangElement,
    FreMetaPrimitiveType,
    FreMetaInterface,
    FreMetaUnitDescription,
    MetaElementReference
} from './internal.js';

export class LangUtil {
    /**
     * This function sorts the list of FreConcepts in such a way that
     * when a concept has a base concept, this base concept comes after the concept.
     * This is needed in cases where an if-statement is generated where the
     * condition is the type of the object, for instance in the unparser.
     * An entry for a subconcept must precede an entry for its base concept,
     * otherwise the unparse${concept.name} for the base concept will be called.
     *
     * @param freConcepts the list of concepts to be sorted
     */
    public static sortConceptsOrRefs(
        freConcepts: FreMetaConcept[] | MetaElementReference<FreMetaConcept>[],
    ): FreMetaConcept[] {
        const newList: FreMetaConcept[] = [];
        // change all references to 'real' concepts
        freConcepts.forEach((p) => {
            if (p instanceof FreMetaConcept) {
                newList.push(p);
            } else {
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
                const supers = FreMetaClassifier.superClassifiers(cls);
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
            } else {
                if (xx.referred === element.referred) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Returns a string representation of 'prop' that can be used in TypeScript code.
     * @param prop
     */
    public static propertyToTypeScript(prop: FreMetaProperty): string {
        const isRef = !prop.isPart;
        return `node.${prop.name + (isRef ? "?.referred" : "")}`;
    }

    /**
     * Returns a string representation of 'prop' that can be used in TypeScript code.
     * @param prop
     */
    public static propertyToTypeScriptWithoutReferred(prop: FreMetaProperty): string {
        return `node.${prop.name}`;
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
     * Returns true if 'freClassifier' has a property that represents it name, i.e. a property
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

    public static findExpressionBase(exp: FreMetaExpressionConcept): FreMetaExpressionConcept {
        if (!!exp.base && exp.base.referred instanceof FreMetaExpressionConcept) {
            return this.findExpressionBase(exp.base.referred);
        } else {
            return exp;
        }
    }

    /**
     * Returns the set of all concepts that are the base of 'self' recursively.
     * @param self
     */
    public static superConcepts(self: FreMetaClassifier): FreMetaConcept[] {
        const result: FreMetaConcept[] = [];
        LangUtil.superConceptsRecursive(self, result);
        return result;
    }

    private static superConceptsRecursive(self: FreMetaClassifier, result: FreMetaConcept[]): void {
        if (self instanceof FreMetaConcept) {
            if (!!self.base) {
                result.push(self.base.referred);
                LangUtil.superConceptsRecursive(self.base.referred, result);
            }
        }
    }

    /**
     * Returns all interfaces that 'self' implements, if 'self' is a concept or a unit, recursive.
     * Returns all interfaces that 'self' inherits from, if 'self' is an interface, recursive.
     * @param self
     */
    public static superInterfaces(self: FreMetaClassifier): FreMetaInterface[] {
        const result: FreMetaInterface[] = [];
        LangUtil.superInterfacesRecursive(self, result);
        return result;
    }

    private static superInterfacesRecursive(self: FreMetaClassifier, result: FreMetaInterface[]): void {
        if (self instanceof FreMetaConcept) {
            if (!!self.base) {
                LangUtil.superInterfacesRecursive(self.base.referred, result);
            }
            for (const i of self.interfaces) {
                result.push(i.referred);
                LangUtil.superInterfacesRecursive(i.referred, result);
            }
        }
        if (self instanceof FreMetaUnitDescription) {
            for (const i of self.interfaces) {
                result.push(i.referred);
                LangUtil.superInterfacesRecursive(i.referred, result);
            }
        }
        if (self instanceof FreMetaInterface) {
            for (const i of self.base) {
                result.push(i.referred);
                LangUtil.superInterfacesRecursive(i.referred, result);
            }
        }
    }

    /**
     * Returns all interfaces that 'self' is a super interface of, recursive.
     * Param 'self' is NOT included in the result.
     * @param self
     */
    public static subInterfaces(self: FreMetaInterface): FreMetaInterface[] {
        const result: FreMetaInterface[] = [];
        for (const cls of self.language.interfaces) {
            if (LangUtil.superInterfaces(cls).includes(self)) {
                result.push(cls);
            }
        }
        return result;
    }

    /**
     * Returns all concepts AND units of which 'self' is an implemented interface, recursive.
     * Param 'self' is NOT included in the result.
     * @param self
     */
    public static subClassifiers(self: FreMetaClassifier): FreMetaClassifier[] {
        const result: FreMetaClassifier[] = FreMetaClassifier.subConcepts(self);
        for (const cls of self.language.units) {
            if (FreMetaClassifier.superClassifiers(cls).includes(self)) {
                result.push(cls);
            }
        }
        return result;
    }

    /**
     * Takes a FreInterface and returns a list of concepts that directly implement it,
     * without taking into account sub interfaces.
     *
     * @param freInterface
     */
    public static findImplementorsDirect(
        freInterface: FreMetaInterface | MetaElementReference<FreMetaInterface>,
    ): FreMetaClassifier[] {
        const result: FreMetaClassifier[] = [];
        const myInterface = freInterface instanceof MetaElementReference ? freInterface.referred : freInterface;
        result.push(...myInterface.language.concepts.filter((con) =>
            con.interfaces.some((intf) => intf.referred === myInterface),
        ));
        result.push(...myInterface.language.units.filter((con) =>
          con.interfaces.some((intf) => intf.referred === myInterface),
        ));
        return result;
    }

    /**
     * Takes a FreInterface and returns a list of concepts that implement it,
     * including the concepts that implement subinterfaces.
     *
     * @param freInterface
     */
    public static findImplementorsRecursive(
        freInterface: FreMetaInterface | MetaElementReference<FreMetaInterface>,
    ): FreMetaClassifier[] {
        const myInterface = freInterface instanceof MetaElementReference ? freInterface.referred : freInterface;
        const implementors: FreMetaClassifier[] = this.findImplementorsDirect(myInterface);

        // add implementors of sub-interfaces
        for (const sub of myInterface.allSubInterfacesRecursive()) {
            const extraImplementors = myInterface.language.concepts.filter((con) =>
                con.interfaces.some((intf) => intf.referred === sub),
            );
            for (const concept of extraImplementors) {
                if (!implementors.includes(concept)) {
                    implementors.push(concept);
                }
            }
        }
        return implementors;
    }

    /**
     * Takes a classifier (either a concept or an interface) and returns a list of all subconcepts -resursive-,
     * all concepts that implement one of the interfaces or a sub-interface -resursive-, and their subconcepts -resursive-.
     * The 'classifier' itself is also included.
     *
     * @param classifier
     */
    public static findAllImplementorsAndSubs(
      classifier: MetaElementReference<FreMetaClassifier> | FreMetaClassifier,
    ): FreMetaClassifier[] {
        let result: FreMetaClassifier[] = [];
        const myClassifier = classifier instanceof MetaElementReference ? classifier.referred : classifier;
        if (!!myClassifier) {
            result.push(myClassifier);
            if (myClassifier instanceof FreMetaConcept) {
                // find all subclasses and mark them as namespace
                result = result.concat(myClassifier.allSubConceptsRecursive());
            } else if (myClassifier instanceof FreMetaInterface) {
                // find all implementors and their subclasses
                // we do not use findImplementorsRecursive(), because we not only add the implementing concepts,
                // but the subinterfaces as well
                for (const implementor of this.findImplementorsDirect(myClassifier)) {
                    if (!result.includes(implementor)) {
                        result.push(implementor);
                        if (implementor instanceof FreMetaConcept) {
                            result = result.concat(implementor.allSubConceptsRecursive());
                        }
                    }
                }
                // find all subinterfaces and add their implementors as well
                for (const subInterface of myClassifier.allSubInterfacesRecursive()) {
                    if (!result.includes(subInterface)) {
                        result.push(subInterface);
                        for (const implementor of this.findImplementorsDirect(subInterface)) {
                            if (!result.includes(implementor)) {
                                result.push(implementor);
                                if (implementor instanceof FreMetaConcept) {
                                    result = result.concat(implementor.allSubConceptsRecursive());
                                }
                            }
                        }
                    }
                }
            }
        }
        return result;
    }

    /**
     * Returns true if the names of the types of both parameters are equal.
     * @param firstProp
     * @param secondProp
     */
    public static compareTypes(firstProp: FreMetaProperty, secondProp: FreMetaProperty): boolean {
        if (firstProp.isList !== secondProp.isList) {
            // return false when a list is compared with a non-list
            return false;
        }

        const type1: FreMetaClassifier = firstProp.type;
        const type2: FreMetaClassifier = secondProp.type;
        if (!type1 || !type2) {
            console.error("INTERNAL ERROR: property types are not set: " + firstProp.name + ", " + secondProp.name);
            return false;
        }

        // console.log("comparing " + type1Exp.name + " and " + type2Exp.name)
        return LangUtil.conforms(type1, type2);
    }

    public static conforms(type1: FreMetaClassifier, type2: FreMetaClassifier) {
        if (type1 === type2) {
            // return true when types are equal
            // console.log("\t ==> types are equal")
            return true;
        }
        if (type1 instanceof FreMetaConcept) {
            if (type2 instanceof FreMetaConcept && type2.allSubConceptsRecursive().includes(type1)) {
                // return true when type1Exp is subconcept of type2Exp
                // console.log("\t ==> " + type1Exp.name + " is a sub concept of " + type2Exp.name)
                return true;
            } else if (type2 instanceof FreMetaInterface) {
                return this.doesImplement(type1, type2);
            }
        } else if (type1 instanceof FreMetaInterface) {
            if (type2 instanceof FreMetaInterface && type2.allSubInterfacesRecursive().includes(type1)) {
                // return true when type1Exp is subinterface of type2Exp
                // console.log("\t ==> " + type1Exp.name + " is a sub interface of " + type2Exp.name)
                return true;
            }
        }
        return false;
    }

    private static doesImplement(concept: FreMetaConcept, interf: FreMetaInterface): boolean {
        let result: boolean = false;
        if (LangUtil.refListIncludes(concept.interfaces, interf)) {
            // return true when type1Exp implements type2Exp
            // console.log("\t ==> " + concept.name + " implements " + interf.name)
            result = true;
        } else {
            // see if one of the base classes of type1Exp implements type2Exp
            for (const super1 of this.superConcepts(concept)) {
                if (this.doesImplement(super1, interf)) {
                    // console.log("\t ==> " + super1.name + " implements " + interf.name)
                    result = true;
                }
            }
        }
        return result;
    }
}
