import { Checker } from "../../utils";
import {
    PiLanguageUnit,
    PiBinaryExpressionConcept,
    PiExpressionConcept,
    PiPrimitiveProperty,
    PiInterface, PiConcept, PiProperty, PiClassifier, PiLimitedConcept, PiInstance, PiPropertyInstance
} from "./PiLanguage";
import { PiLogger } from "../../../../core/src/util/PiLogging";
import { PiElementReference } from "./PiElementReference";
import { PiMetaEnvironment } from "./PiMetaEnvironment";

const LOGGER = new PiLogger("PiLanguageChecker").mute();
const reservedWords = ["root", "abstract", "limited", "interface", "binary", "expression", "concept", "base", "reference", "priority", "implements"];

// TODO add check: priority error from parser into checker => only for expression concepts

export class PiLanguageChecker extends Checker<PiLanguageUnit> {
    foundRoot = false;

    public check(language: PiLanguageUnit): void {
        LOGGER.info(this, "Checking language '" + language.name + "'");
        this.simpleCheck(!!language.name && !reservedWords.includes(language.name) ,
            `Language should have a name [line: ${language.location?.start.line}, column: ${language.location?.start.column}].`);

        this.language = language;
        // Note: this should be done first, otherwise the references will not be resolved
        PiMetaEnvironment.metascoper.language = language;

        // now check the whole language
        language.concepts.forEach(concept => this.checkConcept(concept));
        language.interfaces.forEach(concept => this.checkInterface(concept));

        this.simpleCheck(!!language.concepts.find(c => c.isRoot),
            `There should be a root concept in your language [line: ${language.location?.start.line}, column: ${language.location?.start.column}].`);
        LOGGER.info(this, "Language '" + language.name + "' checked");

        // now everything has been resolved, check that all concepts and interfaces have
        // unique names, that there are no circulair inheritance or interface relationships,
        // and that all their properties have unique names
        let names: string[] = [];
        language.concepts.forEach((con, index) => {
            // check unique names
            if (names.includes(con.name)) {
                this.simpleCheck(false,
                    `Concept with name '${con.name}' already exists [line: ${con.location?.start.line}, column: ${con.location?.start.column}].`);
            } else {
                names.push(con.name);
            }
            // check circularity
            let circularNames: string[] = [];
            let foundCircularity = this.checkCircularInheritance(circularNames, con);
            // check that all properties have unique names
            if (!foundCircularity) this.checkPropertyUniqueNames(con);
        });
        language.interfaces.forEach((intf, index) => {
            if (names.includes(intf.name)) {
                this.simpleCheck(false,
                    `Concept or interface with name '${intf.name}' already exists [line: ${intf.location?.start.line}, column: ${intf.location?.start.column}].`);
            } else {
                names.push(intf.name);
            }
            // check circularity
            let circularNames: string[] = [];
            let foundCircularity = this.checkCircularInheritance(circularNames, intf);
            // check that all properties have unique names
            if (!foundCircularity) this.checkPropertyUniqueNames(intf);
        });
    }

    private checkCircularInheritance(circularNames: string[], con: PiClassifier): boolean {
        if (circularNames.includes(con.name)) {
            // error, already seen this name
            let text : string = '';
            text = circularNames.map(name => name ).join(", ");
            this.simpleCheck(false,
                        `Concept or interface '${con.name}' is part of a forbidden circular inheritance tree (${text}) ` +
                        `[line: ${con.location?.start.line}, column: ${con.location?.start.column}].`);
            return true;
        } else {
            // not (yet) found a circularity, check 'base'
            circularNames.push(con.name);
            if (con instanceof PiConcept) {
                let base = con.base?.referred;
                if (!!base) {
                    return this.checkCircularInheritance(circularNames, base);
                } else {
                    // no problem because there is no 'base'
                    return false;
                }
            } else if (con instanceof PiInterface) {
                let result = false;
                for( let base of con.base ) {
                    let realBase = base.referred;
                    if (!!realBase) {
                        result = this.checkCircularInheritance(circularNames, realBase);
                    }
                }
                return result;
            } else {
                // does not occur, PiConcept and PiInterface are the only subclasses of PiClassifier
                return false;
            }
        }
    }

    private checkPropertyUniqueNames(con: PiClassifier) {
        let propnames: string[] = [];
        con.allProperties().forEach(prop => {
            // TODO allProperties() filters out names from implemented interfaces, but there should be a test that
            // this filtering is ok, i.e. the type of both properties should be the same
            if (propnames.includes(prop.name)) {
                this.simpleCheck(false,
                    `Property with name '${prop.name}' already exists in ${con.name} [line: ${prop.location?.start.line}, column: ${prop.location?.start.column}].`);
            } else {
                propnames.push(prop.name);
            }
        });
    }

    private checkConcept(piConcept: PiConcept): void {
        LOGGER.log("Checking concept '" + piConcept.name + "' of type " + piConcept.constructor.name);
        this.simpleCheck(!!piConcept.name, `Concept should have a name [line: ${piConcept.location?.start.line}, column: ${piConcept.location?.start.column}].`);

        if ( piConcept.isRoot ) {
            this.nestedCheck({
                check:!this.foundRoot,
                error: `There may be only one root class in the language definition [line: ${piConcept.location?.start.line}, column: ${piConcept.location?.start.column}].`,
                whenOk: () => {
                    this.foundRoot = true;
                    piConcept.language.rootConcept = piConcept;
                }
            });
        }

        if (!!piConcept.base) {
            this.checkConceptReference(piConcept.base);
            if (!!piConcept.base.referred) { // error message taken care of by checkClassifierReference
                this.nestedCheck({
                    check: piConcept.base.referred instanceof PiConcept,
                    error: `Base '${piConcept.base.name}' must be a concept ` +
                        `[line: ${piConcept.base.location?.start.line}, column: ${piConcept.base.location?.start.column}].`,
                    whenOk: () => {
                        if (piConcept instanceof PiLimitedConcept) {
                            this.simpleCheck(piConcept.base.referred instanceof PiLimitedConcept, `Base '${piConcept.base.name}' of limited concept must be a limited concept ` +
                                `[line: ${piConcept.base.location?.start.line}, column: ${piConcept.base.location?.start.column}].`
                            );
                        } else {
                            this.simpleCheck(!(piConcept.base.referred instanceof PiLimitedConcept), `Limited concept '${piConcept.base.name}' cannot be base of an unlimited concept ` +
                                `[line: ${piConcept.base.location?.start.line}, column: ${piConcept.base.location?.start.column}].`
                            );
                        }
                    }
                });
            }
        }

        let newInterfaces: PiElementReference<PiInterface>[] = [];
        for (let intf of piConcept.interfaces) {
            this.checkConceptReference(intf);
            if (!!intf.referred) { // error message taken care of by checkClassifierReference
                this.simpleCheck(intf.referred instanceof PiInterface, `Concept '${intf.name}' is not an interface `+
                        `[line: ${intf.location?.start.line}, column: ${intf.location?.start.column}].`,);
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
                `Binary expression concept ${piConcept.name} should have a priority [line: ${piConcept.location?.start.line}, column: ${piConcept.location?.start.column}].`);

            const left = piConcept.allParts().find(part => part.name === "left");
            this.nestedCheck({
                check:!!left,
                error: `Binary expression concept ${piConcept.name} should have a left part [line: ${piConcept.location?.start.line}, column: ${piConcept.location?.start.column}].`,
                whenOk: ()=> {
                    this.simpleCheck(!!left && left.type.referred instanceof PiExpressionConcept,
                        `Concept ${piConcept.name}.left should be an expression concept [line: ${piConcept.location?.start.line}, column: ${piConcept.location?.start.column}].`);
                }
            });
            const right = piConcept.allParts().find(part => part.name === "right");
            this.nestedCheck({
                check: !!right,
                error: `Binary expression concept ${piConcept.name} should have a right part [line: ${piConcept.location?.start.line}, column: ${piConcept.location?.start.column}].`,
                whenOk: () => {
                    this.simpleCheck(!!right && right.type.referred instanceof PiExpressionConcept,
                        `Concept ${piConcept.name}.right should be an expression concept [line: ${piConcept.location?.start.line}, column: ${piConcept.location?.start.column}].`);
                }
            });
        }

        if (piConcept instanceof PiLimitedConcept) {
            this.checkLimitedConcept(piConcept);
        }
    }

    checkLimitedConcept(piLimitedConcept: PiLimitedConcept) {
        LOGGER.log(`Checking limited concept '${piLimitedConcept.name}' [line: ${piLimitedConcept.location?.start.line}, column: ${piLimitedConcept.location?.start.column}]`);
        // the normal checking of concepts is done in this.checkConcept
        // limited concept may be used as reference only, thus it should have a property 'name: string'
        let nameProperty = piLimitedConcept.allPrimProperties().find(p => p.name === "name");
        this.nestedCheck({
            check: !!nameProperty,
            error: `Limited concept '${piLimitedConcept.name}' can only be used as a reference, therefore it must have a 'name' property ` +
                `[line: ${piLimitedConcept.location?.start.line}, column: ${piLimitedConcept.location?.start.column}].`,
            whenOk: () => {
                this.simpleCheck(nameProperty.primType === "string",
                    `Limited concept '${piLimitedConcept.name}' can only be used as a reference, therefore its 'name' property must be of type 'string' ` +
                    `[line: ${piLimitedConcept.location?.start.line}, column: ${piLimitedConcept.location?.start.column}].`);
            }});

        // checking for properties other than primitive ones
        piLimitedConcept.properties.forEach(prop => {
            this.simpleCheck(false, `Property '${prop.name}' of limited concept should have primitive type [line: ${prop.location?.start.line}, column: ${prop.location?.start.column}].`);
        });

        // if this concept is abstract there may be no instances
        // if this concept is not abstract there must be instances
        if (piLimitedConcept.isAbstract) {
            this.simpleCheck(piLimitedConcept.instances.length === 0,
                `An abstract limited concept may not have any instances [line: ${piLimitedConcept.location?.start.line}, column: ${piLimitedConcept.location?.start.column}].`);
        } else {
            this.simpleCheck(piLimitedConcept.instances.length > 0,
                `A non-abstract limited concept must have instances [line: ${piLimitedConcept.location?.start.line}, column: ${piLimitedConcept.location?.start.column}].`);
        }

        // checking the predefined instances
        let names: string[] = [];
        piLimitedConcept.instances.forEach((inst, index) => {
            if (names.includes(inst.name)) {
                this.simpleCheck(false,
                    `Instance with name '${inst.name}' already exists [line: ${inst.location?.start.line}, column: ${inst.location?.start.column}].`);
            } else {
                names.push(inst.name);
            }
            this.checkInstance(inst);
        });
    }

    checkInstance(piInstance: PiInstance) {
        this.checkConceptReference(piInstance.concept);
        this.nestedCheck({
            check: piInstance.concept.referred !== null,
            error: `Predefined instance '${piInstance.name}' should belong to a concept [line: ${piInstance.location?.start.line}, column: ${piInstance.location?.start.column}].`,
            whenOk: () => {
                piInstance.props.forEach(p => this.checkInstanceProperty(p, piInstance.concept.referred));
            }
        });
    }

    checkInstanceProperty(piPropertyInstance: PiPropertyInstance, enclosingConcept: PiConcept) {
        let myInstance = piPropertyInstance.owningInstance.referred;
        this.nestedCheck(
            {
                check: !!myInstance,
                error: `Property '${piPropertyInstance.name}' should belong to a predefined instance [line: ${piPropertyInstance.location?.start.line}, column: ${piPropertyInstance.location?.start.column}].`,
                whenOk: () => {
                    // find the property to which this piPropertyInstance refers
                    let myProp = myInstance.concept.referred.allPrimProperties().find(p => p.name === piPropertyInstance.name);
                    this.nestedCheck({
                        check: !!myProp,
                        error: `Property '${piPropertyInstance.name}' does not exist on concept ${enclosingConcept.name} `+
                            `[line: ${piPropertyInstance.location?.start.line}, column: ${piPropertyInstance.location?.start.column}].`,
                        whenOk: () => {
                            this.nestedCheck({
                                check: myProp instanceof PiPrimitiveProperty,
                                error: `Predefined property '${piPropertyInstance.name}' should have a primitive type `+
                                    `[line: ${piPropertyInstance.location?.start.line}, column: ${piPropertyInstance.location?.start.column}].`,
                                whenOk: () => {
                                    piPropertyInstance.property = PiElementReference.create<PiProperty>(myProp, "PiProperty");
                                    this.simpleCheck(this.checkValueToType(piPropertyInstance.value, myProp.primType),
                                        `Type of '${piPropertyInstance.value}' does not equal type of property '${piPropertyInstance.name}' `+
                                            `[line: ${piPropertyInstance.location?.start.line}, column: ${piPropertyInstance.location?.start.column}].`);
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
                error: `Element '${piProperty.name}' should have a type [line: ${piProperty.location?.start.line}, column: ${piProperty.location?.start.column}].`,
                whenOk: () => {
                    this.checkConceptReference(piProperty.type);
                    let realType = piProperty.type.referred;
                    if (!!realType) { // error message taken care of by checkClassifierReference
                        if(realType instanceof PiLimitedConcept) {
                            // this situation is OK, but property with limited concept as type should always be a reference property
                            // the property should refer to one of the predefined instances of the limited concept
                            piProperty.isPart = false;
                        }
                        if (!piProperty.isPart) {
                            // it is a reference, so check whether the type has a name by which it can be referred
                            let nameProperty = realType.allPrimProperties().find(p => p.name === "name");
                            this.nestedCheck({
                                    check: !!nameProperty,
                                    error: `Type '${realType.name}' cannot be used as a reference, because it has no name property ` +
                                                `[line: ${piProperty.type.location?.start.line}, column: ${piProperty.type.location?.start.column}].`,
                                    whenOk: () => {
                                        this.simpleCheck(nameProperty.primType === "string",
                                            `Type '${realType.name}' cannot be used as a reference, because its name property is not of type 'string' ` +
                                                `[line: ${piProperty.type.location?.start.line}, column: ${piProperty.type.location?.start.column}].`);
                                    }});
                        }
                    }
                }
            });
    }

    checkPrimitiveProperty(element: PiPrimitiveProperty): void {
        LOGGER.log("Checking primitive property '" + element.name + "'");
        this.simpleCheck(!!element.name,
            `Property should have a name [line: ${element.location?.start.line}, column: ${element.location?.start.column}].`);
        this.nestedCheck(
            {
                check: !!element.primType,
                error: `Property '${element.name}' should have a type [line: ${element.location?.start.line}, column: ${element.location?.start.column}].`,
                whenOk: () => this.checkPrimitiveType(element.primType, element)
            });
    }

    checkConceptReference(reference: PiElementReference<PiClassifier>): void {
        LOGGER.log("Checking classifier reference '" + reference.name + "'");
        this.nestedCheck(
            {
                check: reference.name !== undefined,
                error: `Concept or interface reference should have a name [line: ${reference.location?.start.line}, column: ${reference.location?.start.column}].`,
                whenOk: () => {

                    this.nestedCheck(
                    {
                        check: (!!reference.referred),
                        error: `Reference to ${reference.name} cannot be resolved [line: ${reference.location?.start.line}, column: ${reference.location?.start.column}].`
                    })}
            })
    }

    checkPrimitiveType(type: string, element: PiPrimitiveProperty) {
        LOGGER.log("Checking primitive type '" + type + "'");
        this.simpleCheck((type === "string" || type === "boolean" || type === "number"),
            `Primitive property '${element.name}' should have a primitive type (string, boolean, or number) [line: ${element.location?.start.line}, column: ${element.location?.start.column}].`
        );
    }

    checkInterface(piInterface: PiInterface) {
        this.simpleCheck(!!piInterface.name, `Concept should have a name [line: ${piInterface.location?.start.line}, column: ${piInterface.location?.start.column}].`);
        for (let intf of piInterface.base) {
            this.checkConceptReference(intf);
            if (!!intf.referred) { // error message taken care of by checkClassifierReference
                this.simpleCheck(intf.referred instanceof PiInterface,
                    `Base concept '${intf.name}' must be an interface concept `+
                        `[line: ${intf.location?.start.line}, column: ${intf.location?.start.column}].`);
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
    private checkValueToType(value: string, primType: string): boolean {
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
}

