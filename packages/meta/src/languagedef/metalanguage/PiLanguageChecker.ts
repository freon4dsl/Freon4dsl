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

// TODO add check: priority only for expression concepts

export class PiLanguageChecker extends Checker<PiLanguageUnit> {
    foundRoot = false;

    public check(language: PiLanguageUnit): void {
        LOGGER.info(this, "Checking language '" + language.name + "'");
        // TODO all keywords that can occur after language should be mentioned
        this.simpleCheck(!!language.name && language.name !== "root" && language.name !== "concept" && language.name !== "interface",
            `Language should have a name [line: ${language.location?.start.line}, column: ${language.location?.start.column}].`);

        this.language = language;
        // Note: this should be done first, otherwise the references will not be resolved
        PiMetaEnvironment.metascoper.language = language;

        // now check the whole language
        // TODO check that all concepts and interfaces have unique names
        language.concepts.forEach(concept => this.checkConcept(concept));
        language.interfaces.forEach(concept => this.checkInterface(concept));

        // create and add expressionPlaceHolder
        // TODO remove the addition of a placeholder as soon as the editor is capable of working with placeholders in general
        let xx = language.findExpressionBase();
        if (!!xx){
            let expressionPlaceHolder = new PiExpressionConcept();
            expressionPlaceHolder.name = "PlaceholderExpression";
            expressionPlaceHolder.base = PiElementReference.create<PiExpressionConcept>(xx, "PiExpressionConcept");
            expressionPlaceHolder.base.owner = expressionPlaceHolder;
            expressionPlaceHolder.language = language;
            expressionPlaceHolder._isPlaceHolder = true;
            language.concepts.push(expressionPlaceHolder);
            language.expressionPlaceHolder = expressionPlaceHolder;
        }

        this.simpleCheck(!!language.concepts.find(c => c.isRoot),
            `There should be a root concept in your language [line: ${language.location?.start.line}, column: ${language.location?.start.column}].`);
        LOGGER.info(this, "Language '" + language.name + "' checked");
    }

    private checkConcept(piClass: PiConcept): void {
        LOGGER.log("Checking concept '" + piClass.name + "'");
        // TODO check that all properties have unique names
        this.simpleCheck(!!piClass.name, `Concept should have a name [line: ${piClass.location?.start.line}, column: ${piClass.location?.start.column}].`);

        if ( piClass.isRoot ) {
            this.nestedCheck({
                check:!this.foundRoot,
                error: `There may be only one root class in the language definition [line: ${piClass.location?.start.line}, column: ${piClass.location?.start.column}].`,
                whenOk: () => {
                    this.foundRoot = true;
                    piClass.language.rootConcept = piClass;
                }
            });
        }

        if (!!piClass.base) {
            this.checkConceptReference(piClass.base);
            if (!!piClass.base.referred) { // error message taken care of by checkConceptReference
                this.simpleCheck(piClass.base.referred instanceof PiConcept, `Base concept '${piClass.base.name}' must be a class concept `+
                        `[line: ${piClass.base.location?.start.line}, column: ${piClass.base.location?.start.column}].`,
              );
            }
        }

        let newInterfaces: PiElementReference<PiInterface>[] = [];
        for (let intf of piClass.interfaces) {
            this.checkConceptReference(intf);
            if (!!intf.referred) { // error message taken care of by checkConceptReference
                this.simpleCheck(intf.referred instanceof PiInterface, `'${intf.name}' is not an interface concept `+
                        `[line: ${intf.location?.start.line}, column: ${intf.location?.start.column}].`,);
                // add to the list
                newInterfaces.push(intf);
            }
        }
        piClass.interfaces = newInterfaces;

        piClass.primProperties.forEach(prop => this.checkPrimitiveProperty(prop));
        piClass.properties.forEach(part => this.checkConceptProperty(part));

        if (piClass instanceof PiBinaryExpressionConcept && !(piClass.isAbstract)) {
            // this.simpleCheck(binExpConcept.getSymbol() !== "undefined", `Concept ${piClass.name} should have a symbol`);
            this.simpleCheck(piClass.getPriority() !== -1,
                `Concept ${piClass.name} should have a priority [line: ${piClass.location?.start.line}, column: ${piClass.location?.start.column}].`);

            const left = piClass.allParts().find(part => part.name === "left");
            this.simpleCheck(!!left,
                `Concept ${piClass.name} should have a left part, because it is a binary expression [line: ${piClass.location?.start.line}, column: ${piClass.location?.start.column}].`);
            this.simpleCheck(!!left && left.type.referred instanceof PiExpressionConcept,
                `Concept ${piClass.name}.left should be an expression [line: ${piClass.location?.start.line}, column: ${piClass.location?.start.column}].`);

            const right = piClass.allParts().find(part => part.name === "right");
            this.simpleCheck(!!right,
                `Concept ${piClass.name} should have a right part, because it is a binary expression [line: ${piClass.location?.start.line}, column: ${piClass.location?.start.column}].`);
            this.simpleCheck(!!right && right.type.referred instanceof PiExpressionConcept,
                `Concept ${piClass.name}.right should be an expression [line: ${piClass.location?.start.line}, column: ${piClass.location?.start.column}].`);
        }

        if (piClass instanceof  PiLimitedConcept) {
            this.checkLimitedConcept(piClass);
        }
    }

    // TODO change this into a check on LimitedConcept
    checkLimitedConcept(prop: PiLimitedConcept) {
        LOGGER.log(`Checking limited concept '${prop.name}' [line: ${prop.location?.start.line}, column: ${prop.location?.start.column}]`);
        // checking only the predefined instances, all other stuff is done in this.checkConcept
        prop.instances.forEach(inst => this.checkInstance(inst));
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
                        check: myProp instanceof PiPrimitiveProperty,
                        error: `Predefined property '${piPropertyInstance.name}' should have a primitive type `+
                            `[line: ${piPropertyInstance.location?.start.line}, column: ${piPropertyInstance.location?.start.column}].`,
                        whenOk: () => {
                            piPropertyInstance.property = PiElementReference.create<PiProperty>(myProp, "PiProperty");
                        }
                    });
                }
            });
    }

    checkConceptProperty(element: PiProperty): void {
        LOGGER.log("Checking concept property '" + element.name + "'");
        this.nestedCheck(
            {
                check: !!element.type,
                error: `Element '${element.name}' should have a type [line: ${element.location?.start.line}, column: ${element.location?.start.column}].`,
                whenOk: () => {
                    this.checkConceptReference(element.type);
                    // TODO see if we need to add this check??
                    // if (!!element.type.referred) { // error message taken care of by checkConceptReference
                    //     this.nestedCheck({
                    //         check: !(element.type.referred instanceof PiLangEnumeration),
                    //         error:  `Reference property '${element.name}' may not have an enumeration concept as type `+
                    //                 `[line: ${element.location?.start.line}, column: ${element.location?.start.column}].`,
                    //         whenOk: () => {
                    //             element.type = this.morfConceptReferenceIntoSubClass(element.type);
                    //         }
                    //     });
                    // }
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

    /**
     * After this method is called, 'morfConceptReferenceIntoSubClass' should be called to change the reference into the correct subclass
     * of PiLangConceptReference
     */
    checkConceptReference(reference: PiElementReference<PiClassifier>): void {
        LOGGER.log("Checking concept reference '" + reference.name + "'");
        this.nestedCheck(
            {
                check: reference.name !== undefined,
                error: `Concept reference should have a name [line: ${reference.location?.start.line}, column: ${reference.location?.start.column}].`,
                whenOk: () => this.nestedCheck(
                    {
                        check: !!(reference.referred),
                        error: `Reference to ${reference.name} cannot be resolved [line: ${reference.location?.start.line}, column: ${reference.location?.start.column}].`
                    })
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
            if (!!intf.referred) { // error message taken care of by checkConceptReference
                this.simpleCheck(intf.referred instanceof PiInterface,
                    `Base concept '${intf.name}' must be an interface concept `+
                        `[line: ${intf.location?.start.line}, column: ${intf.location?.start.column}].`);
            }
        }

        piInterface.primProperties.forEach(prop => this.checkPrimitiveProperty(prop));
        piInterface.properties.forEach(part => this.checkConceptProperty(part));
    }
}

