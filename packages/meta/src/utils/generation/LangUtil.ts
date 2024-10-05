import {
    FreMetaClassifier,
    FreMetaConcept,
    MetaElementReference,
    FreMetaInterface,
    FreMetaProperty,
} from "../../languagedef/metalanguage/index.js";
import { GenerationUtil } from "./GenerationUtil.js";

/**
 * This class contains a series of helper functions over the language.
 * Note that a number of similar functions can be found in FreLanguage.ts.
 */
export class LangUtil {
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
     * Returns all interfaces that 'self' implements, if 'self' is a concept, recursive.
     * Returns all interfaces that 'self' inherits from, recursive
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
        if (self instanceof FreMetaInterface) {
            for (const i of self.base) {
                result.push(i.referred);
                LangUtil.superInterfacesRecursive(i.referred, result);
            }
        }
    }

    /**
     * Returns all concepts that 'self' inherits from, and all interfaces that 'self'
     * implements of inherits from, recursive.
     * @param self
     */
    public static superClassifiers(self: FreMetaClassifier): FreMetaClassifier[] {
        const result: FreMetaClassifier[] = [];
        LangUtil.superClassifiersRecursive(self, result);
        return result;
    }

    private static superClassifiersRecursive(self: FreMetaClassifier, result: FreMetaClassifier[]) {
        if (self instanceof FreMetaConcept) {
            if (!!self.base) {
                result.push(self.base.referred);
                LangUtil.superClassifiersRecursive(self.base.referred, result);
            }
            for (const i of self.interfaces) {
                result.push(i.referred);
                LangUtil.superClassifiersRecursive(i.referred, result);
            }
        }
        if (self instanceof FreMetaInterface) {
            for (const i of self.base) {
                result.push(i.referred);
                LangUtil.superClassifiersRecursive(i.referred, result);
            }
        }
    }

    /**
     * Returns all concepts that 'self' is a super interface of, recursive. Param 'self' is NOT included in the result.
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
     * Returns all concepts of which 'self' is a super class, or 'self' is an implemented interface, recursive.
     * Param 'self' is NOT included in the result.
     * @param self
     */
    public static subConcepts(self: FreMetaClassifier): FreMetaConcept[] {
        const result: FreMetaConcept[] = [];
        if (self.language === undefined) {
            return [];
        }
        for (const cls of self.language.concepts) {
            if (LangUtil.superClassifiers(cls).includes(self)) {
                result.push(cls);
            }
        }
        return result;
    }

    /**
     * Returns all concepts of which 'self' is a super class, or 'self' is an implemented interface, recursive.
     * Param 'self' IS included in the result.
     * @param self
     */
    public static subConceptsIncludingSelf(self: FreMetaClassifier): FreMetaConcept[] {
        if (self === undefined) {
            return [];
        }
        const result = LangUtil.subConcepts(self);
        if (self instanceof FreMetaConcept) {
            result.push(self);
        }
        return result;
    }

    /**
     * Takes a FreInterface and returns a list of concepts that directly implement it,
     * without taking into account subinterfaces.
     *
     * @param freInterface
     */
    public static findImplementorsDirect(
        freInterface: FreMetaInterface | MetaElementReference<FreMetaInterface>,
    ): FreMetaConcept[] {
        const myInterface = freInterface instanceof MetaElementReference ? freInterface.referred : freInterface;
        return myInterface.language.concepts.filter((con) =>
            con.interfaces.some((intf) => intf.referred === myInterface),
        );
    }

    /**
     * Takes a FreInterface and returns a list of concepts that implement it,
     * including the concepts that implement subinterfaces.
     *
     * @param freInterface
     */
    public static findImplementorsRecursive(
        freInterface: FreMetaInterface | MetaElementReference<FreMetaInterface>,
    ): FreMetaConcept[] {
        const myInterface = freInterface instanceof MetaElementReference ? freInterface.referred : freInterface;
        const implementors: FreMetaConcept[] = this.findImplementorsDirect(myInterface);

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
                        result = result.concat(implementor.allSubConceptsRecursive());
                    }
                }
                // find all subinterfaces and add their implementors as well
                for (const subInterface of myClassifier.allSubInterfacesRecursive()) {
                    if (!result.includes(subInterface)) {
                        result.push(subInterface);
                        for (const implementor of this.findImplementorsDirect(subInterface)) {
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

    // TODO check whether this is a better implementation
    // private findAllImplementorsAndSubs(myClassifier: FreClassifier): FreClassifier[] {
    //     const result: FreClassifier[] = [];
    //     if (myClassifier instanceof FreConcept) {
    //         ListUtil.addListIfNotPresent<FreClassifier>(result, LangUtil.subConcepts(myClassifier));
    //     } else if (myClassifier instanceof FreInterface) {
    //         const implementors = LangUtil.findImplementorsRecursive(myClassifier);
    //         ListUtil.addListIfNotPresent<FreClassifier>(result, implementors);
    //         for (const implementor of implementors) {
    //             ListUtil.addListIfNotPresent<FreClassifier>(result, this.findAllSubs(implementor));
    //         }
    //
    //         const subInterfaces = LangUtil.subInterfaces(myClassifier);
    //         ListUtil.addListIfNotPresent<FreClassifier>(result, subInterfaces);
    //         for (const subInterface of subInterfaces) {
    //             ListUtil.addListIfNotPresent<FreClassifier>(result, this.findAllSubs(subInterface));
    //         }
    //     }
    //     return result;
    // }

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

        // console.log("comparing " + type1.name + " and " + type2.name)
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
                // return true when type1 is subconcept of type2
                // console.log("\t ==> " + type1.name + " is a sub concept of " + type2.name)
                return true;
            } else if (type2 instanceof FreMetaInterface) {
                return this.doesImplement(type1, type2);
            }
        } else if (type1 instanceof FreMetaInterface) {
            if (type2 instanceof FreMetaInterface && type2.allSubInterfacesRecursive().includes(type1)) {
                // return true when type1 is subinterface of type2
                // console.log("\t ==> " + type1.name + " is a sub interface of " + type2.name)
                return true;
            }
        }
        return false;
    }

    private static doesImplement(concept: FreMetaConcept, interf: FreMetaInterface): boolean {
        let result: boolean = false;
        if (GenerationUtil.refListIncludes(concept.interfaces, interf)) {
            // return true when type1 implements type2
            // console.log("\t ==> " + concept.name + " implements " + interf.name)
            result = true;
        } else {
            // see if one of the base classes of type1 implements type2
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
