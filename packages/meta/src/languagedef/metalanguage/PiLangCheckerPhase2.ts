import { LangUtil, Names } from "../../utils";
import {
    PiClassifier,
    PiConcept,
    PiInstance,
    PiInterface,
    PiLanguage,
    PiLimitedConcept, PiPrimitiveProperty,
    PiPrimitiveType,
    PiProperty,
    PiPropertyInstance
} from "./PiLanguage";
import { PiElementReference } from "./PiElementReference";
import { PiLangAbstractChecker } from "./PiLangAbstractChecker";

export class PiLangCheckerPhase2 extends PiLangAbstractChecker {

    // now everything has been resolved, check that all concepts and interfaces have
    // unique names, that there are no circular inheritance or interface relationships,
    // and that all their properties have unique names
    public check(language: PiLanguage): void {
        this.errors = [];
        const names: string[] = [];
        let foundSomeCircularity: boolean = false;
        language.concepts.forEach(con => {
            if (this.forConcepts(names, con, foundSomeCircularity)) {
                // we cannot use a simple assignment, because the next concept would set
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
            if (this.forInterfaces(names, intf, foundSomeCircularity)) {
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

    private forInterfaces(names: string[], intf: PiInterface, foundSomeCircularity: boolean) {
        // check unique names, disregarding upper/lower case of first character
        if (names.includes(intf.name)) {
            this.simpleCheck(false,
                `Concept or interface with name '${intf.name}' already exists ${this.location(intf)}.`);
        } else {
            names.push(Names.startWithUpperCase(intf.name));
            names.push(intf.name);
        }
        // check circularity
        const circularNames: string[] = [];
        let interfaceIsCircular: boolean = this.checkCircularInheritance(circularNames, intf);
        // remember that we found circularity for one of the interfaces
        if (interfaceIsCircular) {
            foundSomeCircularity = true;
        }
        if (!interfaceIsCircular) {
            // check that all properties have unique names
            // Note: this can be done only after checking for circular inheritance, because we need to look at allPrimProperties.
            this.checkPropertyUniqueNames(intf, false);
        }
        return foundSomeCircularity;
    }

    private forConcepts(names: string[], con: PiConcept | PiLimitedConcept, foundSomeCircularity: boolean) {
        // check unique names, disregarding upper/lower case of first character
        if (names.includes(con.name)) {
            this.simpleCheck(false,
                `Concept with name '${con.name}' already exists ${this.location(con)}.`);
        } else {
            names.push(Names.startWithUpperCase(con.name));
            names.push(con.name);
        }
        // check circularity
        const circularNames: string[] = [];
        const conceptIsCircular = this.checkCircularInheritance(circularNames, con);
        // remember that we found circularity for one of the concepts
        if (conceptIsCircular) {
            foundSomeCircularity = true;
        }
        // check that all properties have unique names
        // Note: this can be done only after checking for circular inheritance, because we need to look at allPrimProperties.
        if (!conceptIsCircular) {
            this.checkPropertyUniqueNames(con, true);
        }
        return foundSomeCircularity;
    }

    private checkPropertyUniqueNames(con: PiClassifier, strict: boolean) {
        const propnames: string[] = [];
        const propsDone: PiProperty[] = [];
        con.allProperties().forEach(prop => {
            if (propnames.includes(prop.name)) {
                if (strict) {
                    const previous = propsDone.find(prevProp => prevProp.name === prop.name);
                    this.simpleCheck(false,
                        `Property with name '${prop.name}' already exists in ${con.name} ${this.location(previous)} and ${this.location(prop)}.`);
                } else {
                    // in non-strict mode properties with the same name are allowed, but only if they have the same type
                    // find the first property with this name
                    const otherProp = propsDone.find(p => p.name === prop.name);
                    this.simpleCheck(LangUtil.compareTypes(prop, otherProp),
                        `Property with name '${prop.name}' but different type already exists in ${con.name} ${this.location(prop)} and ${this.location(otherProp)}.`);
                }
            } else {
                propnames.push(prop.name);
                propsDone.push(prop);
            }
        });
    }

    private checkLimitedConceptAgain(piLimitedConcept: PiLimitedConcept) {
        const nameProperty = piLimitedConcept.allPrimProperties().find(p => p.name === "name");
        this.nestedCheck({
            check: !!nameProperty,
            error: `A limited concept ('${piLimitedConcept.name}') can only be used as a reference, therefore it should have a 'name' property ${this.location(piLimitedConcept)}.`,
            whenOk: () => {
                this.simpleCheck(nameProperty.type.referred === PiPrimitiveType.identifier,
                    `A limited concept ('${piLimitedConcept.name}') can only be used as a reference, therefore its 'name' property should be of type 'identifier' ${this.location(piLimitedConcept)}.`);
            }
        });
        this.simpleCheck(piLimitedConcept.allParts().length === 0,
            `A limited concept may not inherit or implement non-primitive parts ${this.location(piLimitedConcept)}.`);
        this.simpleCheck(piLimitedConcept.allReferences().length === 0,
            `A limited concept may not inherit or implement references ${this.location(piLimitedConcept)}.`);

        // checking the predefined instances => here, because now we know that the definition of the limited concept is complete
        const names: string[] = [];
        piLimitedConcept.instances.forEach(inst => {
            if (names.includes(inst.name)) {
                this.simpleCheck(false,
                    `Instance with name '${inst.name}' already exists ${this.location(inst)}.`);
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
                `Concept or interface '${con.name}' is part of a forbidden circular inheritance tree (${text}) ${this.location(con)}.`);
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
                                    `Language contains an infinite loop: mandatory part '${aPart.name}' has mandatory property '${bPart.name}' of type ${bPart.type.name} ${this.location(aPart)}.`);
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
            error: `Predefined instance '${piInstance.name}' should belong to a concept ${this.location(piInstance)}.`,
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
                    `Predefined instance '${piInstance.name}' should provide value for property 'name' ${this.location(piInstance)}.`);
            }
        });
    }

    private checkInstanceProperty(piPropertyInstance: PiPropertyInstance, enclosingConcept: PiConcept) {
        const myInstance = piPropertyInstance.owningInstance.referred;
        this.nestedCheck(
            {
                check: !!myInstance,
                error: `Property '${piPropertyInstance.name}' should belong to a predefined instance ${this.location(piPropertyInstance)}.`,
                whenOk: () => {
                    // find the property to which this piPropertyInstance refers
                    const myProp = myInstance.concept.referred.allPrimProperties().find(p => p.name === piPropertyInstance.name);
                    this.nestedCheck({
                        check: !!myProp,
                        error: `Property '${piPropertyInstance.name}' does not exist on concept ${enclosingConcept.name} ${this.location(piPropertyInstance)}.`,
                        whenOk: () => {
                            this.nestedCheck({
                                check: myProp instanceof PiPrimitiveProperty,
                                error: `Predefined property '${piPropertyInstance.name}' should have a primitive type ${this.location(piPropertyInstance)}.`,
                                whenOk: () => {
                                    piPropertyInstance.property = PiElementReference.create<PiProperty>(myProp, "PiProperty");
                                    let myPropType: PiPrimitiveType = myProp.type.referred as PiPrimitiveType;
                                    if (!myProp.isList) {
                                        this.simpleCheck(this.checkValueToType(piPropertyInstance.value, myPropType),
                                            `Type of '${piPropertyInstance.value}' (${typeof piPropertyInstance.value}) does not fit type (${myPropType.name}) of property '${piPropertyInstance.name}' ${this.location(piPropertyInstance)}.`);
                                    } else {
                                        if (!!piPropertyInstance.valueList) {
                                            piPropertyInstance.valueList.forEach(value => {
                                                this.simpleCheck(this.checkValueToType(value, myPropType),
                                                    `Type of '${value}' (${typeof value}) does not fit type (${myPropType.name}) of property '${piPropertyInstance.name}' ${this.location(piPropertyInstance)}.`);
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
}
