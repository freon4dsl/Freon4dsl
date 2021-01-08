import { Checker, Names } from "../../utils";
import {
    PiLanguage,
    PiBinaryExpressionConcept,
    PiExpressionConcept,
    PiPrimitiveProperty,
    PiInterface, PiConcept, PiProperty, PiClassifier, PiLimitedConcept, PiInstance, PiPropertyInstance, PiPrimitiveType,
    PiElementReference, PiMetaEnvironment, PiLangUtil } from "./internal";
import { MetaLogger } from "../../utils/MetaLogger";
import { reservedWordsInTypescript } from "../../validatordef/generator/templates/ReservedWords";

const LOGGER = new MetaLogger("PiLanguageChecker").mute();
const piReservedWords = ["model", "modelunit", "abstract", "limited", "language", "property", "concept", "binary", "expression", "concept", "base", "reference", "priority", "implements"];

// TODO add check: priority error from parser into checker => only for expression concepts

export class PiLanguageChecker extends Checker<PiLanguage> {
    foundModel = false;

    public check(language: PiLanguage): void {
        LOGGER.info(this, "Checking language '" + language.name + "'");
        this.foundModel = false;
        this.errors = [];
        this.simpleCheck(!!language.name && !piReservedWords.includes(language.name.toLowerCase()) ,
            `Language should have a name ${this.location(language)}.`);

        this.language = language;
        // Note: this should be done first, otherwise the references will not be resolved
        PiMetaEnvironment.metascoper.language = language;

        // now check the whole language
        language.concepts.forEach(concept => this.checkConcept(concept));
        language.interfaces.forEach(concept => this.checkInterface(concept));

        const myModel = language.concepts.find(c => c.isModel);
        // language.modelConcept should be  set in 'checkConcept'
        if (myModel != language.modelConcept) {
            LOGGER.error(this, "Internal error: language.modelConcept is not set correctly");
        }
        this.nestedCheck({check: !!myModel,
            error: `There should be a model in your language ${this.location(language)}.`,
            whenOk: () => {
                // models may not be modelunits
                this.simpleCheck(!myModel.isUnit, `A model may not be a modelunit ${this.location(myModel)}.`);
                this.nestedCheck({
                    check: myModel.primProperties.some(prop => prop.name === "name"),
                    error: `The model should have a 'name' property ${this.location(myModel)}.`,
                    whenOk: () => {
                        this.simpleCheck(myModel.parts().length > 0,
                            `The model should have at least one unit type ${this.location(myModel)}.`);
                    }
                });
            },
        });

        // now everything has been resolved, check that all concepts and interfaces have
        // unique names, that there are no circular inheritance or interface relationships,
        // and that all their properties have unique names
        const names: string[] = [];
        let foundSomeCircularity: boolean = false;
        language.concepts.forEach(con => {
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
                // check that modelunits have a name property and that they are not marked as 'model'
                if ( con.isUnit ) {
                    this.checkUnitConceptName(con);
                    this.simpleCheck(!con.isModel, `A modelunit may not be a model ${this.location(con)}.`);
                }
                // check that limited concepts have a name property
                // and that they do not inherit any non-prim properties
                if (con instanceof PiLimitedConcept) {
                    this.checkLimitedConceptAgain(con);
                }
            }
        });
        let interfaceIsCircular: boolean = false;
        language.interfaces.forEach(intf => {
            if (names.includes(intf.name)) {
                this.simpleCheck(false,
                    `Concept or interface with name '${intf.name}' already exists ${this.location(intf)}.`);
            } else {
                names.push(intf.name);
            }
            // check circularity
            const circularNames: string[] = [];
            interfaceIsCircular = this.checkCircularInheritance(circularNames, intf);
            // remember that we found circularity for one of the interfaces
            if (interfaceIsCircular) {
                foundSomeCircularity = true;
            }
            if (!interfaceIsCircular) {
                // check that all properties have unique names
                // Note: this can be done only after checking for circular inheritance, because we need to look at allPrimProperties.
                this.checkPropertyUniqueNames(intf, false);
            }
        });
        if (!foundSomeCircularity) {
            // check if there are no infinite loops in the model, i.e.
            // A has part b: B and B has part a: A and both are mandatory
            // Note: this can be done only after checking for circular inheritance, because we need to look at allParts.
            this.checkInfiniteLoops(language);
        }
    }

    private checkUnitConceptName(con: PiConcept) {
        const nameProperty = con.allPrimProperties().find(p => p.name === "name");
        this.nestedCheck({
            check: !!nameProperty,
            error: `A modelunit should have a 'name' property ${this.location(con)}.`,
            whenOk: () => {
                this.simpleCheck(nameProperty.primType === "string",
                    `A modelunit should have a 'name' property of type 'string' ${this.location(con)}.`);
            }
        });
    }

    private checkLimitedConceptAgain(piLimitedConcept: PiLimitedConcept) {
        const nameProperty = piLimitedConcept.allPrimProperties().find(p => p.name === "name");
        this.nestedCheck({
            check: !!nameProperty,
            error: `A limited concept ('${piLimitedConcept.name}') can only be used as a reference, therefore it should have a 'name' property ${this.location(piLimitedConcept)}.`,
            whenOk: () => {
                this.simpleCheck(nameProperty.primType === "string",
                    `A limited concept ('${piLimitedConcept.name}') can only be used as a reference, therefore its 'name' property should be of type 'string' ${this.location(piLimitedConcept)}.`);
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
                return false;
            }
        }
    }

    private checkPropertyUniqueNames(con: PiClassifier, strict: boolean) {
        const propnames: string[] = [];
        const propsDone: PiProperty[] = [];
        con.allProperties().forEach(prop => {
            // TODO allProperties() filters out names from implemented interfaces, but there should be a test that
            // this filtering is ok, i.e. the type of both properties should be the same
            if (propnames.includes(prop.name)) {
                if (strict) {
                    const previous = propsDone.find(prevProp => prevProp.name === prop.name);
                    this.simpleCheck(false,
                        `Property with name '${prop.name}' already exists in ${con.name} ${this.location(previous)} and ${this.location(prop)}.`);
                } else {
                    // in non-strict mode properties with the same name are allowed, but only if they have the same type
                    // find the first property with this name
                    const otherProp = propsDone.find(p => p.name === prop.name);
                    this.simpleCheck(PiLangUtil.compareTypes(prop, otherProp),
                        `Property with name '${prop.name}' but different type already exists in ${con.name} ${this.location(prop)} and ${this.location(otherProp)}.`);
                }
            } else {
                propnames.push(prop.name);
                propsDone.push(prop);
            }
        });
    }

    private checkConcept(piConcept: PiConcept): void {
        LOGGER.log("Checking concept '" + piConcept.name + "' of type " + piConcept.constructor.name);
        this.simpleCheck(!!piConcept.name, `Concept should have a name ${this.location(piConcept)}.`);
        this.simpleCheck(!(piReservedWords.includes(piConcept.name.toLowerCase())), `Concept may not have a name that is equal to a reserved word ('${piConcept.name}') ${this.location(piConcept)}.`);
        this.simpleCheck(!(reservedWordsInTypescript.includes(piConcept.name.toLowerCase())),
            `Concept may not have a name that is equal to a reserved word in TypeScript ('${piConcept.name}') ${this.location(piConcept)}.`);

        if ( piConcept.isModel ) {
            this.nestedCheck({
                check: !this.foundModel,
                error: `There may be only one model in the language definition ${this.location(piConcept)}.`,
                whenOk: () => {
                    this.foundModel = true;
                    piConcept.language.modelConcept = piConcept;
                }
            });
        }

        if (!!piConcept.base) {
            this.checkConceptReference(piConcept.base);
            if (!!piConcept.base.referred) { // error message taken care of by checkClassifierReference
                this.nestedCheck({
                    check: piConcept.base.referred instanceof PiConcept,
                    error: `Base '${piConcept.base.name}' must be a concept ` +
                        `${this.location(piConcept.base)}.`,
                    whenOk: () => {
                        if (piConcept instanceof PiLimitedConcept) {
                            this.simpleCheck(piConcept.base.referred instanceof PiLimitedConcept, `Base '${piConcept.base.name}' of limited concept must be a limited concept ` +
                                `${this.location(piConcept.base)}.`
                            );
                        } else {
                            this.simpleCheck(!(piConcept.base.referred instanceof PiLimitedConcept), `Limited concept '${piConcept.base.name}' cannot be base of an unlimited concept ` +
                                `${this.location(piConcept.base)}.`
                            );
                        }
                    }
                });
            }
        }

        const newInterfaces: PiElementReference<PiInterface>[] = [];
        for (const intf of piConcept.interfaces) {
            this.checkConceptReference(intf);
            if (!!intf.referred) { // error message taken care of by checkClassifierReference
                this.simpleCheck(intf.referred instanceof PiInterface, `Concept '${intf.name}' is not an interface ${this.location(intf)}.`);
                // add to the list
                newInterfaces.push(intf);
            }
        }
        piConcept.interfaces = newInterfaces;

        piConcept.primProperties.forEach(prop => this.checkPrimitiveProperty(prop));
        if (!(piConcept instanceof PiLimitedConcept)) {
            piConcept.properties.forEach(part => this.checkConceptProperty(part));
        }

        if (piConcept instanceof PiBinaryExpressionConcept && !(piConcept.isAbstract)) {
            // this.simpleCheck(binExpConcept.getSymbol() !== "undefined", `Concept ${piClass.name} should have a symbol`);
            this.simpleCheck(piConcept.getPriority() !== -1,
                `Binary expression concept ${piConcept.name} should have a priority ${this.location(piConcept)}.`);

            const left = piConcept.allParts().find(part => part.name === "left");
            this.nestedCheck({
                check: !!left,
                error: `Binary expression concept ${piConcept.name} should have a left part ${this.location(piConcept)}.`,
                whenOk: () => {
                    this.simpleCheck(!!left && left.type.referred instanceof PiExpressionConcept,
                        `Concept ${piConcept.name}.left should be an expression concept ${this.location(piConcept)}.`);
                }
            });
            const right = piConcept.allParts().find(part => part.name === "right");
            this.nestedCheck({
                check: !!right,
                error: `Binary expression concept ${piConcept.name} should have a right part ${this.location(piConcept)}.`,
                whenOk: () => {
                    this.simpleCheck(!!right && right.type.referred instanceof PiExpressionConcept,
                        `Concept ${piConcept.name}.right should be an expression concept ${this.location(piConcept)}.`);
                }
            });
        }

        if (piConcept instanceof PiLimitedConcept) {
            this.checkLimitedConcept(piConcept);
        }
    }

    checkLimitedConcept(piLimitedConcept: PiLimitedConcept) {
        LOGGER.log(`Checking limited concept '${piLimitedConcept.name}' ${this.location(piLimitedConcept)}`);
        // the normal checking of concepts is done in this.checkConcept

        // limited concept may be used as reference only, thus it should have a property 'name: string'
        // this property is added in 'createLimitedConcept' in file 'LanguageCreators.ts'

        // checking for properties other than primitive ones
        piLimitedConcept.properties.forEach(prop => {
            this.simpleCheck(false, `Property '${prop.name}' of limited concept should have primitive type ${this.location(prop)}.`);
        });

        // if this concept is abstract there may be no instances
        // if this concept is not abstract there must be instances
        if (piLimitedConcept.isAbstract) {
            this.simpleCheck(piLimitedConcept.instances.length === 0,
                `An abstract limited concept may not have any instances ${this.location(piLimitedConcept)}.`);
        } else {
            this.simpleCheck(piLimitedConcept.instances.length > 0,
                `A non-abstract limited concept must have instances ${this.location(piLimitedConcept)}.`);
        }
    }

    checkInstance(piInstance: PiInstance) {
        this.checkConceptReference(piInstance.concept);
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

    checkInstanceProperty(piPropertyInstance: PiPropertyInstance, enclosingConcept: PiConcept) {
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
                                    if (!myProp.isList) {
                                        this.simpleCheck(this.checkValueToType(piPropertyInstance.value, myProp.primType),
                                            `Type of '${piPropertyInstance.value}' does not equal type of property '${piPropertyInstance.name}' ${this.location(piPropertyInstance)}.`);
                                    } else {
                                        if (!!piPropertyInstance.valueList) {
                                            piPropertyInstance.valueList.forEach(value => {
                                                this.simpleCheck(this.checkValueToType(value, myProp.primType),
                                                    `Type of '${value}' does not equal type of property '${piPropertyInstance.name}' ${this.location(piPropertyInstance)}.`);
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

    checkConceptProperty(piProperty: PiProperty): void {
        LOGGER.log("Checking concept property '" + piProperty.name + "'");
        this.nestedCheck(
            {
                check: !!piProperty.type,
                error: `Element '${piProperty.name}' should have a type ${this.location(piProperty)}.`,
                whenOk: () => {
                    this.checkConceptReference(piProperty.type);
                    const realType = piProperty.type.referred;
                    if (!!realType) { // error message handle by checkConceptReference
                        const owningClassifier = piProperty.owningConcept;
                        this.checkPropertyType(piProperty, realType);

                        const isUnit = (realType instanceof PiConcept) && realType.isUnit;

                        // check use of unit types in non-model concepts: may be references only
                        if (isUnit && piProperty.isPart) {
                            this.simpleCheck(
                                owningClassifier instanceof PiConcept && owningClassifier.isModel,
                                `Modelunit '${realType.name}' may be used as reference only in a non-model concept ${this.location(piProperty.type)}.`);
                        }
                        // check use of non-unit types in model concept
                        if (owningClassifier instanceof PiConcept && owningClassifier.isModel) {
                            this.simpleCheck(
                                isUnit,
                                `Type of property '${piProperty.name}' should be a modelunit ${this.location(piProperty.type)}.`);
                        }
                    }
                }
            });
    }

    private checkPropertyType(piProperty: PiProperty, realType: PiClassifier) {
        if (!!realType) { // error message taken care of by checkClassifierReference
            if (realType instanceof PiLimitedConcept) {
                // this situation is OK, but property with limited concept as type should always be a reference property
                // the property should refer to one of the predefined instances of the limited concept
                piProperty.isPart = false;
            }
            if (!piProperty.isPart) {
                // it is a reference, so check whether the type has a name by which it can be referred
                const nameProperty = realType.allPrimProperties().find(p => p.name === "name");
                this.nestedCheck({
                    check: !!nameProperty,
                    error: `Type '${realType.name}' cannot be used as a reference, because it has no name property ${this.location(piProperty.type)}.`,
                    whenOk: () => {
                        this.simpleCheck(nameProperty.primType === "string",
                            `Type '${realType.name}' cannot be used as a reference, because its name property is not of type 'string' ${this.location(piProperty.type)}.`);
                    }
                });
            }
        }
    }

    checkPrimitiveProperty(element: PiPrimitiveProperty): void {
        LOGGER.log("Checking primitive property '" + element.name + "'");
        this.simpleCheck(!!element.name,
            `Property should have a name ${this.location(element)}.`);
        this.nestedCheck(
            {
                check: !!element.primType,
                error: `Property '${element.name}' should have a type ${this.location(element)}.`,
                whenOk: () => this.checkPrimitiveType(element.primType, element)
            });
    }

    checkConceptReference(reference: PiElementReference<PiClassifier>): void {
        LOGGER.log("Checking classifier reference '" + reference.name + "'");
        this.nestedCheck(
            {
                check: reference.name !== undefined,
                error: `Concept or interface reference should have a name ${this.location(reference)}.`,
                whenOk: () => {

                    this.nestedCheck(
                    {
                        check: (!!reference.referred),
                        error: `Reference to ${reference.name} cannot be resolved ${this.location(reference)}.`
                    });
                }
            });
    }

    checkPrimitiveType(type: string, element: PiPrimitiveProperty) {
        LOGGER.log("Checking primitive type '" + type + "'");
        this.simpleCheck((type === "string" || type === "boolean" || type === "number"),
            `Primitive property '${element.name}' should have a primitive type (string, boolean, or number) ${this.location(element)}.`
        );
    }

    checkInterface(piInterface: PiInterface) {
        this.simpleCheck(!!piInterface.name, `Interface should have a name ${this.location(piInterface)}.`);
        this.simpleCheck(!(piReservedWords.includes(piInterface.name.toLowerCase())), `Interface may not have a name that is equal to a reserved word ('${piInterface.name}') ${this.location(piInterface)}.`);
        this.simpleCheck(!(reservedWordsInTypescript.includes(piInterface.name.toLowerCase())),
            `Interface may not have a name that is equal to a reserved word in TypeScript ('${piInterface.name}') ${this.location(piInterface)}.`);

        for (const intf of piInterface.base) {
            this.checkConceptReference(intf);
            if (!!intf.referred) { // error message taken care of by checkClassifierReference
                this.simpleCheck(intf.referred instanceof PiInterface,
                    `Base concept '${intf.name}' must be an interface concept ` +
                        `${this.location(intf)}`);
            }
        }

        piInterface.primProperties.forEach(prop => this.checkPrimitiveProperty(prop));
        piInterface.properties.forEach(part => this.checkConceptProperty(part));
    }

    /**
     * returns true if the 'value' conforms to 'primType'
     * @param value
     * @param primType
     */
    private checkValueToType(value: PiPrimitiveType, primType: string): boolean {
        if (primType === "number") {
            if (!isNaN(Number(value)) ) {
                return true;
             }
        } else if (primType === "boolean") {
            if ((value === "false" || value === "true")) {
                return true;
            }
        } else if (primType === "string") {
            return true;
        }
        return false;
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
}
