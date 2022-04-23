import {
    PiLanguage,
    PiBinaryExpressionConcept,
    PiExpressionConcept,
    PiPrimitiveProperty,
    PiInterface, PiConcept, PiProperty, PiClassifier, PiLimitedConcept,
    PiElementReference, PiMetaEnvironment, PiPrimitiveType, PiModelDescription, PiUnitDescription
} from "../metalanguage";
import { CheckRunner, CheckerPhase, MetaLogger, piReservedWords, reservedWordsInTypescript, ParseLocationUtil } from "../../utils";
import { CommonChecker } from "./CommonChecker";

const LOGGER = new MetaLogger("PiLanguageChecker").mute();

export class PiLangCheckerPhase1 extends CheckerPhase<PiLanguage> {

    public check(language: PiLanguage, runner: CheckRunner): void {
        LOGGER.info("Checking language '" + language.name + "'");
        this.runner = runner;
        this.runner.simpleCheck(!!language.name && !piReservedWords.includes(language.name.toLowerCase()) ,
            `Language should have a name ${ParseLocationUtil.location(language)}.`);

        this.language = language;
        // Note: this should be done first, otherwise the references will not be resolved
        PiMetaEnvironment.metascoper.language = language;

        // now check the whole language
        this.checkModel(language.modelConcept);
        language.units.forEach(unit => this.checkUnit(unit));
        language.concepts.forEach(concept => this.checkConcept(concept));
        language.interfaces.forEach(intf => this.checkInterface(intf));
    }

    private checkModel(myModel: PiModelDescription) {
        this.runner.nestedCheck({
            check: !!myModel,
            error: `There should be a model in your language ${ParseLocationUtil.location(this.language)}.`,
            whenOk: () => {
                myModel.primProperties.forEach(prop => this.checkPrimitiveProperty(prop));
                // check that model has a name property => can be done here, even though allProperties() is used, because models have no base
                CommonChecker.checkOrCreateNameProperty(myModel, this.runner);
                const checkedUnits: PiClassifier[] = [];
                myModel.properties.forEach(prop => {
                    this.checkConceptProperty(prop);
                    // other than 'normal' classifiers, only one property with a certain type is allowed
                    if (checkedUnits.includes(prop.type)) {
                        this.runner.simpleCheck(false,
                            `An entry with this unit type ('${prop.type.name}') already exists ${ParseLocationUtil.location(prop)}.`);
                    } else {
                        checkedUnits.push(prop.type);
                    }
                });
                this.runner.simpleCheck(myModel.parts().length > 0,
                    `The model should have at least one part ${ParseLocationUtil.location(myModel)}.`);
                this.runner.simpleCheck(myModel.references().length == 0,
                    `All properties of a model must be parts, not references ${ParseLocationUtil.location(myModel)}.`);
            }
        });
    }

    private checkUnit(unit: PiUnitDescription) {
        unit.primProperties.forEach(prop => this.checkPrimitiveProperty(prop));
        unit.properties.forEach(part => this.checkConceptProperty(part));
        // check that modelunits have a name property => can be done here, even though allProperties() is used, because units have no base
        CommonChecker.checkOrCreateNameProperty(unit, this.runner);
    }

    private checkConcept(piConcept: PiConcept): void {
        LOGGER.log("Checking concept '" + piConcept.name + "' of type " + piConcept.constructor.name);
        this.runner.simpleCheck(!!piConcept.name, `Concept should have a name ${ParseLocationUtil.location(piConcept)}.`);
        this.runner.simpleCheck(!(piReservedWords.includes(piConcept.name.toLowerCase())), `Concept may not have a name that is equal to a reserved word ('${piConcept.name}') ${ParseLocationUtil.location(piConcept)}.`);
        this.runner.simpleCheck(!(reservedWordsInTypescript.includes(piConcept.name.toLowerCase())),
            `Concept may not have a name that is equal to a reserved word in TypeScript ('${piConcept.name}') ${ParseLocationUtil.location(piConcept)}.`);

        if (!!piConcept.base) {
            CommonChecker.checkClassifierReference(piConcept.base, this.runner);
            const myBase = piConcept.base.referred;
            if (!!myBase) { // error message taken care of by checkClassifierReference
                this.runner.nestedCheck({
                    check: myBase instanceof PiConcept,
                    error: `Base '${piConcept.base.name}' must be a concept ` +
                        `${ParseLocationUtil.location(piConcept.base)}.`,
                    whenOk: () => {
                        this.runner.simpleCheck(!(!(piConcept instanceof PiExpressionConcept) && myBase instanceof PiExpressionConcept),
                            `A concept may not have an expression as base ${ParseLocationUtil.location(piConcept.base)}.`);
                        if (piConcept instanceof PiLimitedConcept) {
                            this.runner.simpleWarning(myBase instanceof PiLimitedConcept,
                                `Base '${piConcept.base.name}' of limited concept is not a limited concept. ` +
                                        `Only properties that have primitive type are inherited ${ParseLocationUtil.location(piConcept.base)}.`
                            );
                        } else {
                            this.runner.simpleCheck(!(myBase instanceof PiLimitedConcept),
                                `Limited concept '${piConcept.base.name}' cannot be base of an unlimited concept ${ParseLocationUtil.location(piConcept.base)}.`
                            );
                        }
                    }
                });
            }
        }

        // do the interfaces
        const newInterfaces: PiElementReference<PiInterface>[] = [];
        for (const intf of piConcept.interfaces) {
            CommonChecker.checkClassifierReference(intf, this.runner);
            if (!!intf.referred) { // error message taken care of by checkClassifierReference
                this.runner.nestedCheck({
                    check: intf.referred instanceof PiInterface,
                    error:`Concept '${intf.name}' is not an interface ${ParseLocationUtil.location(intf)}.`,
                    whenOk: () =>{
                        // add to the list
                        newInterfaces.push(intf);
                    }
                });
            }
        }
        piConcept.interfaces = newInterfaces;

        // do the properties
        piConcept.primProperties.forEach(prop => this.checkPrimitiveProperty(prop));
        if (!(piConcept instanceof PiLimitedConcept)) {
            piConcept.properties.forEach(part => this.checkConceptProperty(part));
        }

        if (piConcept instanceof PiBinaryExpressionConcept && !(piConcept.isAbstract)) {
            // this.runner.simpleCheck(binExpConcept.getSymbol() !== "undefined", `Concept ${piClass.name} should have a symbol`);
            this.runner.simpleCheck(piConcept.getPriority() !== -1,
                `Binary expression concept ${piConcept.name} should have a priority ${ParseLocationUtil.location(piConcept)}.`);

            const left = piConcept.allParts().find(part => part.name === "left");
            this.runner.nestedCheck({
                check: !!left,
                error: `Binary expression concept ${piConcept.name} should have a left part ${ParseLocationUtil.location(piConcept)}.`,
                whenOk: () => {
                    this.runner.simpleCheck(!!left && left.type instanceof PiExpressionConcept,
                        `Concept ${piConcept.name}.left should be an expression concept ${ParseLocationUtil.location(piConcept)}.`);
                }
            });
            const right = piConcept.allParts().find(part => part.name === "right");
            this.runner.nestedCheck({
                check: !!right,
                error: `Binary expression concept ${piConcept.name} should have a right part ${ParseLocationUtil.location(piConcept)}.`,
                whenOk: () => {
                    this.runner.simpleCheck(!!right && right.type instanceof PiExpressionConcept,
                        `Concept ${piConcept.name}.right should be an expression concept ${ParseLocationUtil.location(piConcept)}.`);
                }
            });
        }

        if (piConcept instanceof PiLimitedConcept) {
            this.checkLimitedConcept(piConcept);
        }
    }

    checkLimitedConcept(piLimitedConcept: PiLimitedConcept) {
        LOGGER.log(`Checking limited concept '${piLimitedConcept.name}' ${ParseLocationUtil.location(piLimitedConcept)}`);
        // the normal checking of concepts is done in this.checkConcept

        // limited concept may be used as reference only, thus it should have a property 'name: string'
        // this property is added in 'createLimitedConcept' in file 'LanguageCreators.ts'

        // checking for properties other than primitive ones
        piLimitedConcept.properties.forEach(prop => {
            this.runner.simpleCheck(false, `Property '${prop.name}' of limited concept should have primitive type ${ParseLocationUtil.location(prop)}.`);
        });

        // if this concept is abstract there may be no instances
        // if this concept is not abstract there must be instances
        if (piLimitedConcept.isAbstract) {
            this.runner.simpleCheck(piLimitedConcept.instances.length === 0,
                `An abstract limited concept may not have any instances ${ParseLocationUtil.location(piLimitedConcept)}.`);
        } else {
            this.runner.simpleCheck(piLimitedConcept.instances.length > 0,
                `A non-abstract limited concept must have instances ${ParseLocationUtil.location(piLimitedConcept)}.`);
        }
    }

    checkConceptProperty(piProperty: PiProperty): void {
        LOGGER.log("Checking concept property '" + piProperty.name + "'");
        this.checkPropertyName(piProperty);
        this.runner.nestedCheck(
            {
                check: !!piProperty.type,
                error: `Element '${piProperty.name}' should have a type ${ParseLocationUtil.location(piProperty)}.`,
                whenOk: () => {
                    CommonChecker.checkClassifierReference(piProperty.typeReference, this.runner);
                    const realType = piProperty.type;
                    if (!!realType) { // error message handled by checkClassifierReference
                        const owningClassifier = piProperty.owningClassifier;
                        this.checkPropertyType(piProperty, realType);

                        const isUnit = (realType instanceof PiUnitDescription);

                        // check use of unit types in non-model concepts: may be references only
                        if (isUnit && piProperty.isPart) {
                            this.runner.simpleCheck(
                                owningClassifier instanceof PiModelDescription,
                                `Modelunit '${realType.name}' may be used as reference only in a non-model concept ${ParseLocationUtil.location(piProperty.typeReference)}.`);
                        }
                        // check use of non-unit types in model concept
                        if (owningClassifier instanceof PiModelDescription) {
                            this.runner.simpleCheck(
                                isUnit,
                                `Type of property '${piProperty.name}' should be a modelunit ${ParseLocationUtil.location(piProperty.typeReference)}.`);
                        }
                        // TODO review the rules around 'public'
                        // if (piProperty.isPart && piProperty.isPublic) {
                        //     this.runner.nestedCheck({
                        //         check: realType.isPublic,
                        //         error: `Property '${piProperty.name} of type ${realType.name}' is public, the concept ${realType.name} should be public as well ${ParseLocationUtil.location(piProperty)}.`,
                        //         whenOk: () => {
                        //             this.runner.simpleCheck(
                        //                 !!realType.nameProperty() && realType.nameProperty().isPublic,
                        //                 `public Concept '${realType.name}' must have a public property 'name'`
                        //             )
                        //         }
                        //     });
                        // }
                    }
                    // optionality for lists is ignored
                    if (piProperty.isList && piProperty.isOptional) {
                        this.runner.simpleWarning(false,
                            `Property '${piProperty.name}' is a list and therefore always optional, optionality will be ignored ${ParseLocationUtil.location(piProperty)}.`);
                        piProperty.isOptional = false;
                    }
                }
            });
    }

    private checkPropertyType(piProperty: PiProperty, realType: PiClassifier) {
        if (!!realType) { // error message taken care of by checkClassifierReference
            if (realType instanceof PiLimitedConcept) {
                // this situation is OK, but property with limited concept as type should always be a reference property.
                // the property should refer to one of the predefined instances of the limited concept.
                // in phase2 of the checker it is ensured that limited concepts always have a 'name' property of type 'identifier'.
                piProperty.isPart = false;
            } else {
                if (!piProperty.isPart) {
                    // it is a reference, so check whether the type has a name by which it can be referred
                    const nameProperty: PiPrimitiveProperty = realType.nameProperty();
                    this.runner.nestedCheck({
                        check: !!nameProperty,
                        error: `Type '${realType.name}' cannot be used as a reference, because it has no property 'name: identifier' ${ParseLocationUtil.location(piProperty.typeReference)}.`,
                        whenOk: () => {
                            this.runner.simpleCheck(nameProperty.type === PiPrimitiveType.identifier,
                                `Type '${realType.name}' cannot be used as a reference, because its name property is not of type 'identifier' ${ParseLocationUtil.location(piProperty.typeReference)}.`);
                        }
                    });
                }
            }
        }
    }

    checkPrimitiveProperty(element: PiPrimitiveProperty): void {
        LOGGER.log("Checking primitive property '" + element.name + "'");
        this.checkPropertyName(element);
        this.runner.nestedCheck(
            {
                check: !!element.typeReference,
                error: `Property '${element.name}' should have a type ${ParseLocationUtil.location(element)}.`,
                whenOk: () => {
                    let myType = element.type; // there is a type reference, now check whether this reference resolves to a primitive type
                    this.checkPrimitiveType(myType, element);
                    if (element.isOptional) {
                        this.runner.simpleWarning(false,
                            `Property '${element.name}' has primitive type, may therefore not be optional, optionality will be ignored ${ParseLocationUtil.location(element)}.`);
                        element.isOptional = false;
                    }
                    // check initial value(s)
                    if (!element.isList) {
                        this.runner.simpleCheck(element.initialValueList.length <= 1,
                            `Initial value of property '${element.name}' should be a single value ${ParseLocationUtil.location(element)}.`);
                        if (element.initialValue !== null && element.initialValue !== undefined) { // the property has an initial value, so check it
                            this.runner.simpleCheck(CommonChecker.checkValueToType(element.initialValue, myType as PiPrimitiveType),
                                `Type of '${element.initialValue}' (${typeof element.initialValue}) does not fit type (${element.type.name}) of property '${element.name}' ${ParseLocationUtil.location(element)}.`);
                        }
                    } else {
                        // this.runner.simpleCheck(element.initialValue === null || element.initialValue === undefined,
                        //     `Initial value of property '${element.name}' should be a list value ${ParseLocationUtil.location(element)}.`);
                        if (element.initialValueList.length > 0) { // the property has an initial value, so check it
                            element.initialValueList.forEach(value => {
                                this.runner.simpleCheck(CommonChecker.checkValueToType(value, myType as PiPrimitiveType),
                                    `Type of '${value}' (${typeof element.initialValue}) does not fit type (${element.type.name}[]) of property '${element.name}' ${ParseLocationUtil.location(element)}.`);
                            });
                        }
                    }
                    // end check initial value(s)
                }
            });
    }

    private checkPropertyName(element: PiProperty) {
        this.runner.nestedCheck(
            {
                check: !!element.name,
                error: `Property should have a name ${ParseLocationUtil.location(element)}.`,
                whenOk: () => {
                    this.runner.simpleCheck(!(reservedWordsInTypescript.includes(element.name.toLowerCase())),
                        `Property may not have a name that is equal to a reserved word in TypeScript ('${element.name}') ${ParseLocationUtil.location(element)}.`);
                    // TODO determine whether the following check is important
                    // this.runner.simpleCheck(!(piReservedWords.includes(element.name.toLowerCase())),
                    //     `Property may not have a name that is equal to a reserved word ('${element.name}') ${ParseLocationUtil.location(element)}.`);
                }
            });
    }


    private checkPrimitiveType(type: PiClassifier, element: PiPrimitiveProperty) {
        LOGGER.log("Checking primitive type '" + type.name + "'");
        this.runner.simpleCheck((type === PiPrimitiveType.identifier || type === PiPrimitiveType.string || type === PiPrimitiveType.number || type === PiPrimitiveType.boolean),
            `Primitive property '${element.name}' should have a primitive type (string, identifier, boolean, or number) ${ParseLocationUtil.location(element)}.`
        );
    }

    checkInterface(piInterface: PiInterface) {
        this.runner.simpleCheck(!!piInterface.name, `Interface should have a name ${ParseLocationUtil.location(piInterface)}.`);
        this.runner.simpleCheck(!(piReservedWords.includes(piInterface.name.toLowerCase())), `Interface may not have a name that is equal to a reserved word ('${piInterface.name}') ${ParseLocationUtil.location(piInterface)}.`);
        this.runner.simpleCheck(!(reservedWordsInTypescript.includes(piInterface.name.toLowerCase())),
            `Interface may not have a name that is equal to a reserved word in TypeScript ('${piInterface.name}') ${ParseLocationUtil.location(piInterface)}.`);

        for (const intf of piInterface.base) {
            CommonChecker.checkClassifierReference(intf, this.runner);
            if (!!intf.referred) { // error message taken care of by checkClassifierReference
                this.runner.simpleCheck(intf.referred instanceof PiInterface,
                    `Base concept '${intf.name}' must be an interface concept ` +
                        `${ParseLocationUtil.location(intf)}`);
            }
        }

        piInterface.primProperties.forEach(prop => this.checkPrimitiveProperty(prop));
        piInterface.properties.forEach(part => this.checkConceptProperty(part));
    }
}
