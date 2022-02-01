import { Checker, isNullOrUndefined, LangUtil, Names } from "../../utils";
import {
    PiClassifier,
    PiConcept,
    PiInstance,
    PiInterface,
    PiLanguage,
    PiLimitedConcept, PiPrimitiveProperty,
    PiPrimitiveType,
    PiProperty,
    PiInstanceProperty, PiUnitDescription
} from "./PiLanguage";
import { PiElementReference } from "./PiElementReference";
import { PiLangAbstractChecker } from "./PiLangAbstractChecker";

export class PiLangCheckerPhase2 extends PiLangAbstractChecker {

    // now everything has been resolved, check that all concepts and interfaces have
    // unique names, that there are no circular inheritance or interface relationships,
    // and that all their properties have unique names
    public check(language: PiLanguage): void {
        this.errors = [];
        this.warnings = [];
        const names: string[] = [];
        let foundSomeCircularity: boolean = false;
        const extensions: string[] = [];
        language.units.forEach(unit => {
            this.checkUniqueNameOfClassifier(names, unit);
            this.checkUniqueFileExtension(extensions, unit);
        });
        language.concepts.forEach(con => {
             if (this.checkClassifier(names, con)) {
                // we cannot use a simple assignment, like "foundSomeCircularity = this.checkClassifier(names, con, false)"
                // because checking the next concept would set
                // the value of 'foundSomeCircularity' back to false;
                foundSomeCircularity = true;
            } else {
                // check that limited concepts have a name property
                // and that they do not inherit any non-prim properties
                // Note: this can be done only after checking for circular inheritance, because we need to look at allPrimProperties.
                if (con instanceof PiLimitedConcept) {
                    this.checkLimitedConceptAgain(con);
                }
            }
        });
        language.interfaces.forEach(intf => {
            if (this.checkClassifier(names, intf)) {
                foundSomeCircularity = true;
            }
        });
        if (!foundSomeCircularity) {
            // check if there are no infinite loops in the model, i.e.
            // A has part b: B and B has part a: A and both are mandatory
            // Note: this can be done only after checking for circular inheritance, because we need to look at allParts.
            this.checkInfiniteLoops(language);
        }
    }

    private checkUniqueNameOfClassifier(names: string[], classifier: PiClassifier) {
        // check unique names, disregarding upper/lower case of first character
        if (names.includes(classifier.name)) {
            this.simpleCheck(false,
                `Concept or interface with name '${classifier.name}' already exists ${Checker.location(classifier)}.`);
        } else {
            names.push(Names.startWithUpperCase(classifier.name));
            names.push(classifier.name);
        }
    }

    private checkUniqueFileExtension(extensions: string[], unit: PiUnitDescription) {
        // our parser accepts only variables for fileExtensions, therefore we do not need to check it further here.
        // set the file extension, if not present
        if (isNullOrUndefined(unit.fileExtension) || unit.fileExtension.length == 0) {
            // try to get a unique file extension that is as short as possible starting with a length of 3 chars
            if (unit.name.length < 3) {
                // for small names extend the name with a number
                for (let i = 0; i < 9; i++) {
                    let potional: string = unit.name.toLowerCase() + i;
                    if (!extensions.includes(potional)) {
                        unit.fileExtension = potional;
                        break;
                    }
                }
            } else {
                // for larger names use a substring that makes the extension unqiue
                for (let i = 3; i <= unit.name.length; i++) {
                    let potional: string = unit.name.substring(0, i).toLowerCase();
                    if (!extensions.includes(potional)) {
                        unit.fileExtension = potional;
                        break;
                    }
                }
            }
            if (isNullOrUndefined(unit.fileExtension) || unit.fileExtension.length == 0) { // could not set default
                this.simpleCheck(false,
                    `Could not create a file-extension for '${unit.name}', please provide one ${Checker.location(unit)}.`);
            } else {
                extensions.push(unit.fileExtension);
            }
        } else {
            // check uniqueness
            if (extensions.includes(unit.fileExtension)) {
                this.simpleCheck(false,
                    `FileExtension '${unit.fileExtension}' already exists ${Checker.location(unit)}.`);
            } else {
                extensions.push(unit.fileExtension);
            }
        }
    }

    /**
     *
     * @param names: all names of classifier that are encountered so far
     * @param classifier: the classifier to check
     * @private
     */
    private checkClassifier(names: string[], classifier: PiClassifier): boolean {
        this.checkUniqueNameOfClassifier(names, classifier);
        // check circularity
        const circularNames: string[] = [];
        const isCircular = this.checkCircularInheritance(circularNames, classifier);
        // check that all properties have unique names
        // Note: this can be done only after checking for circular inheritance, because we need to look at all properties,
        // including those of super classifiers and implemented interfaces.
        if (!isCircular) {
            this.checkPropertyInheritance(classifier);
        }
        return isCircular;
    }

    private checkPropertyInheritance(classifier: PiClassifier) {
        // Note that in this check method we cannot use the classifier methods 'implementedProperties', 'allProperties', etc.
        // Those methods depend on the fact that everything is correct - which should be checked here.
        // Five aspects to be tested, each numbered.
        const propsToCheck: PiProperty[] = [];
        propsToCheck.push(...classifier.primProperties);
        propsToCheck.push(...classifier.properties);
        const propsDone: PiProperty[] = [];
        propsToCheck.forEach(prop => {
            // 1. all props defined in this classifier against themselves:
            // no prop with same name allowed, not even if they have the same type
            const inSameCls = propsDone.find(prevProp => prevProp.name === prop.name);
            if (!!inSameCls) {
                this.simpleCheck(false,
                    `Property '${prop.name}' already exists in ${classifier.name} ${Checker.location(prop)} and ${Checker.location(inSameCls)}.`);
            }
            propsDone.push(prop);
            // 2. all props defined in this classifier should be different from the props of its super concepts/interfaces
            //      except when their types conform, then props of the sub should be marked 'implementedInBase' - but only if
            //      base is a concept
            if (classifier instanceof PiConcept && !!classifier.base) {
                this.checkPropsOfBase(classifier.base.referred, prop);
            } else if (classifier instanceof PiInterface) {
                classifier.base.forEach(ref => {
                    const inSuper = this.searchLocalProps(ref.referred, prop);
                    if (!!inSuper) {
                        this.simpleCheck(LangUtil.compareTypes(prop, inSuper),
                            `Property '${prop.name}' with non conforming type already exists in base interface '${ref.name}' ${Checker.location(prop)} and ${Checker.location(inSuper)}.`,);
                    }
                });
            }
            // 3. all props defined in this concept against props from implemented interfaces: name and type should conform
            if (classifier instanceof PiConcept) {
                classifier.allInterfaces().forEach(intf => {
                    this.checkPropAgainstInterface(intf, prop);
                });
            }
        });
        // 4. all props defined in implemented interfaces, that do not have a counterpart in the concept or its supers,
        //      should not have a name equal to any other, except when their types conform.
        if (classifier instanceof PiConcept) {
            const propsDone: PiProperty[] = [];
            classifier.allInterfaces().forEach(intf => {
                intf.allProperties().forEach(toBeImplemented => {
                    const implementedProp = this.findImplementedProperty(toBeImplemented, classifier);
                    if (!implementedProp) { // there is NO counter part in either this concept of its base
                        const inAnotherInterface = propsDone.find(prevProp => prevProp.name === toBeImplemented.name);
                        if (!!inAnotherInterface) { // there is a prop with the same name in another interface
                            // we must check type conformance both ways!
                            // when types conform: add a new prop with the most specific type to classifier
                            let virtualProp: PiProperty = null;
                            if (LangUtil.compareTypes(toBeImplemented, inAnotherInterface)) {
                                virtualProp = this.makeCopyOfProp(toBeImplemented, classifier);
                            } else if (LangUtil.compareTypes(inAnotherInterface, toBeImplemented)) {
                                virtualProp = this.makeCopyOfProp(inAnotherInterface, classifier);
                            }
                            // if virtualProp exists, the types did conform to eachother
                            this.simpleCheck(!!virtualProp,
                                `Concept '${classifier.name}': property '${toBeImplemented.name}' in '${intf.name}' does not conform to property '${toBeImplemented.name}' in '${inAnotherInterface.owningClassifier.name}' ${Checker.location(classifier)}.`);
                        }
                    }
                    propsDone.push(toBeImplemented);
                });
            });
        }
        // 5. all properties of super concepts, that are not overwritten in this concept, must conform props of all interfaces
        if (classifier instanceof PiConcept) {
            const myBase = classifier.base?.referred;
            if (!!myBase) {
                const basePropsToCheck: PiProperty[] = [];
                basePropsToCheck.push(...myBase.primProperties);
                basePropsToCheck.push(...myBase.properties);
                classifier.interfaces.forEach(intf => {
                    basePropsToCheck.forEach(baseProp => {
                        if (!this.searchLocalProps(classifier, baseProp)) {
                            this.checkPropAgainstInterface(intf.referred, baseProp);
                        }
                    });
                });
            }
        }
    }

    private checkPropsOfBase(myBase: PiConcept, prop: PiProperty) {
        const inSuper = this.searchLocalProps(myBase, prop);
        if (!!inSuper) {
            this.nestedCheck({
                check: LangUtil.compareTypes(prop, inSuper),
                error: `Property '${prop.name}' with non conforming type already exists in base concept '${myBase.name}' ${Checker.location(prop)} and ${Checker.location(inSuper)}.`,
                whenOk: () => {
                    // set the 'implementedInBase' flag
                    prop.implementedInBase = true;
                }
            });
        } else if (!!myBase.base) {
            // check base of base
            this.checkPropsOfBase(myBase.base.referred, prop);
        }
    }

    private searchLocalProps(myBase: PiClassifier, prop: PiProperty) {
        let inSuper: PiProperty = myBase.primProperties.find(prevProp => prevProp.name === prop.name);
        if (!inSuper) {
            inSuper = myBase.properties.find(prevProp => prevProp.name === prop.name);
        }
        return inSuper;
    }

    private checkPropAgainstInterface(intf: PiInterface, prop: PiProperty) {
        let inIntf: PiProperty = intf.primProperties.find(prevProp => prevProp.name === prop.name);
        if (!inIntf) {
            inIntf = intf.properties.find(prevProp => prevProp.name === prop.name);
        }
        if (!!inIntf) {
            this.simpleCheck(LangUtil.compareTypes(prop, inIntf),
                `(Inherited) property '${prop.name}' with non conforming type exists in implemented interface '${intf.name}' ${Checker.location(prop)} and ${Checker.location(inIntf)}.`);
        }
    }

    private findImplementedProperty(prop: PiProperty, concept: PiConcept) {
        const propsToCheck: PiProperty[] = [];
        propsToCheck.push(...concept.primProperties);
        propsToCheck.push(...concept.properties);
        let implementedProp = propsToCheck.find(prevProp => prevProp.name === prop.name);
        // if not implemented by the concept itself, try its base - recursive -
        const myBase = concept.base?.referred;
        if (!implementedProp && !!myBase) {
            implementedProp = this.findImplementedProperty(prop, myBase);
        }
        return implementedProp;
    }

    private checkLimitedConceptAgain(piLimitedConcept: PiLimitedConcept) {
        let nameProperty: PiPrimitiveProperty = piLimitedConcept.allPrimProperties().find(p => p.name === "name");
        // if 'name' property is not present, create it.
        if ( !nameProperty ) {
            nameProperty = new PiPrimitiveProperty();
            nameProperty.name = "name";
            nameProperty.type = PiElementReference.create<PiPrimitiveType>(PiPrimitiveType.identifier, "PiPrimitiveType");
            nameProperty.isPart = true;
            nameProperty.isList = false;
            nameProperty.isOptional = false;
            nameProperty.isPublic = false;
            nameProperty.isStatic = false;
            nameProperty.owningClassifier = piLimitedConcept;
            piLimitedConcept.primProperties.push(nameProperty);
        } else {
            this.simpleCheck(nameProperty.type.referred === PiPrimitiveType.identifier,
                `A limited concept ('${piLimitedConcept.name}') can only be used as a reference, therefore its 'name' property should be of type 'identifier' ${Checker.location(piLimitedConcept)}.`);
        }
        this.simpleCheck(piLimitedConcept.allParts().length === 0,
            `A limited concept may not inherit or implement non-primitive parts ${Checker.location(piLimitedConcept)}.`);
        this.simpleCheck(piLimitedConcept.allReferences().length === 0,
            `A limited concept may not inherit or implement references ${Checker.location(piLimitedConcept)}.`);

        // checking the predefined instances => here, because now we know that the definition of the limited concept is complete
        const names: string[] = [];
        piLimitedConcept.instances.forEach(inst => {
            if (names.includes(inst.name)) {
                this.simpleCheck(false,
                    `Instance with name '${inst.name}' already exists ${Checker.location(inst)}.`);
            } else {
                names.push(inst.name);
            }
            this.checkInstance(inst);
        });
    }

    private checkCircularInheritance(circularNames: string[], con: PiClassifier): boolean {
        if (circularNames.includes(con.name)) {
            // error, already seen this name
            const text: string = circularNames.map(name => name ).join(", ");
            this.simpleCheck(false,
                `Concept or interface '${con.name}' is part of a forbidden circular inheritance tree (${text}) ${Checker.location(con)}.`);
            return true;
        } else {
            // not (yet) found a circularity, check 'base'
            circularNames.push(con.name);
            if (con instanceof PiConcept) {
                const base = con.base?.referred;
                if (!!base) {
                    return this.checkCircularInheritance(circularNames, base);
                } else {
                    // no problem because there is no 'base'
                    return false;
                }
            } else if (con instanceof PiInterface) {
                let result = false;
                for ( const base of con.base ) {
                    const realBase = base.referred;
                    if (!!realBase) {
                        result = result || this.checkCircularInheritance(circularNames, realBase);
                    }
                }
                return result;
            } else {
                // does not occur, PiConcept and PiInterface are the only subclasses of PiClassifier
                // TODO add unit
                console.log("INTERNAL ERROR: UNIT NOT HANDLED");
                return false;
            }
        }
    }

    // check if there are no infinite loops in the model, i.e.
    // A has part b: B and B has part a: A and both are mandatory
    private checkInfiniteLoops(language: PiLanguage) {
        language.conceptsAndInterfaces().forEach(classifier => {
            classifier.allParts().forEach(aPart => {
                if (!aPart.isPrimitive && !aPart.isOptional && !aPart.isList) {
                    const aPartType = aPart.type.referred;
                    if (!!aPartType) {
                        aPartType.allParts().forEach(bPart => {
                            if (!bPart.isOptional && !bPart.isList) {
                                const bPartType = bPart.type.referred;
                                this.simpleCheck(bPartType !== classifier,
                                    `Language contains an infinite loop: mandatory part '${aPart.name}' has mandatory property '${bPart.name}' of type ${bPart.type.name} ${Checker.location(aPart)}.`);
                            }
                        });
                    }
                }
            });
        });
    }

    private checkInstance(piInstance: PiInstance) {
        this.checkClassifierReference(piInstance.concept);
        this.nestedCheck({
            check: piInstance.concept.referred !== null,
            error: `Predefined instance '${piInstance.name}' should belong to a concept ${Checker.location(piInstance)}.`,
            whenOk: () => {
                let hasValueForNameProperty: boolean = false;
                piInstance.props.forEach(p => {
                    this.checkInstanceProperty(p, piInstance.concept.referred);
                    if (p.name === "name" && (p.value.toString().length !== 0) ) {
                        hasValueForNameProperty = true;
                    }
                });
                // the following check is not really needed, because this situation is taken care of by the 'createInstance' method in 'LanguageCreators.ts'
                this.simpleCheck(hasValueForNameProperty,
                    `Predefined instance '${piInstance.name}' should provide value for property 'name' ${Checker.location(piInstance)}.`);
            }
        });
    }

    private checkInstanceProperty(piPropertyInstance: PiInstanceProperty, enclosingConcept: PiConcept) {
        const myInstance = piPropertyInstance.owningInstance.referred;
        this.nestedCheck(
            {
                check: !!myInstance,
                error: `Property '${piPropertyInstance.name}' should belong to a predefined instance ${Checker.location(piPropertyInstance)}.`,
                whenOk: () => {
                    // find the property to which this piPropertyInstance refers
                    const myProp = myInstance.concept.referred.allPrimProperties().find(p => p.name === piPropertyInstance.name);
                    this.nestedCheck({
                        check: !!myProp,
                        error: `Property '${piPropertyInstance.name}' does not exist on concept ${enclosingConcept.name} ${Checker.location(piPropertyInstance)}.`,
                        whenOk: () => {
                            this.nestedCheck({
                                check: myProp instanceof PiPrimitiveProperty,
                                error: `Predefined property '${piPropertyInstance.name}' should have a primitive type ${Checker.location(piPropertyInstance)}.`,
                                whenOk: () => {
                                    piPropertyInstance.property = PiElementReference.create<PiProperty>(myProp, "PiProperty");
                                    let myPropType: PiPrimitiveType = myProp.type.referred as PiPrimitiveType;
                                    if (!myProp.isList) {
                                        this.simpleCheck(this.checkValueToType(piPropertyInstance.value, myPropType),
                                            `Type of '${piPropertyInstance.value}' (${typeof piPropertyInstance.value}) does not fit type (${myPropType.name}) of property '${piPropertyInstance.name}' ${Checker.location(piPropertyInstance)}.`);
                                    } else {
                                        if (!!piPropertyInstance.valueList) {
                                            piPropertyInstance.valueList.forEach(value => {
                                                this.simpleCheck(this.checkValueToType(value, myPropType),
                                                    `Type of '${value}' (${typeof value}) does not fit type (${myPropType.name}) of property '${piPropertyInstance.name}' ${Checker.location(piPropertyInstance)}.`);
                                            });
                                        }
                                    }
                                }
                            });
                        }
                    });
                }
            });
    }

    private makeCopyOfProp(property: PiProperty, classifier: PiConcept): PiProperty {
        let copy: PiProperty = new PiProperty();
        if (property instanceof PiPrimitiveProperty) {
            copy = new PiPrimitiveProperty();
        }
        copy.name = property.name;
        copy.isPublic = property.isPublic;
        copy.isOptional = property.isOptional;
        copy.isList = property.isList;
        copy.isPart = property.isPart;
        copy.implementedInBase = false; // TODO check this: maybe false because the original property might come from an interface
        copy.type = PiElementReference.create<PiClassifier>(property.type.referred, "PiClassifier");
        copy.owningClassifier = classifier;
        if (property instanceof PiPrimitiveProperty) {
            classifier.primProperties.push(copy as PiPrimitiveProperty);
        } else {
            classifier.properties.push(copy);
        }
        return copy;
    }
}
