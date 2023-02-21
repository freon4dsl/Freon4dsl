import {
    FreLanguage,
    FreBinaryExpressionConcept,
    FreExpressionConcept,
    FrePrimitiveProperty,
    FreInterface, FreConcept, FreProperty, FreClassifier, FreLimitedConcept,
    MetaElementReference, FreMetaEnvironment, FrePrimitiveType, FreModelDescription, FreUnitDescription
} from "../metalanguage";
import { CheckRunner, CheckerPhase, MetaLogger, freReservedWords, reservedWordsInTypescript, ParseLocationUtil } from "../../utils";
import { CommonChecker } from "./CommonChecker";

const LOGGER = new MetaLogger("FreLanguageChecker").mute();

export class FreLangCheckerPhase1 extends CheckerPhase<FreLanguage> {

    public check(language: FreLanguage, runner: CheckRunner): void {
        LOGGER.info("Checking language '" + language.name + "'");
        this.runner = runner;
        this.runner.simpleCheck(!!language.name && !freReservedWords.includes(language.name.toLowerCase()) ,
            `Language should have a name ${ParseLocationUtil.location(language)}.`);

        this.language = language;
        // Note: this should be done first, otherwise the references will not be resolved
        FreMetaEnvironment.metascoper.language = language;

        // now check the whole language
        this.checkModel(language.modelConcept);
        language.units.forEach(unit => this.checkUnit(unit));
        language.concepts.forEach(concept => this.checkConcept(concept));
        language.interfaces.forEach(intf => this.checkInterface(intf));
    }

    private checkModel(myModel: FreModelDescription) {
        this.runner.nestedCheck({
            check: !!myModel,
            error: `There should be a model in your language ${ParseLocationUtil.location(this.language)}.`,
            whenOk: () => {
                myModel.primProperties.forEach(prop => this.checkPrimitiveProperty(prop));
                // check that model has a name property => can be done here, even though allProperties() is used, because models have no base
                CommonChecker.checkOrCreateNameProperty(myModel, this.runner);
                const checkedUnits: FreClassifier[] = [];
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
                this.runner.simpleCheck(myModel.references().length === 0,
                    `All properties of a model must be parts, not references ${ParseLocationUtil.location(myModel)}.`);
            }
        });
    }

    private checkUnit(unit: FreUnitDescription) {
        unit.primProperties.forEach(prop => this.checkPrimitiveProperty(prop));
        unit.properties.forEach(part => this.checkConceptProperty(part));
        // check that modelunits have a name property => can be done here, even though allProperties() is used, because units have no base
        CommonChecker.checkOrCreateNameProperty(unit, this.runner);
    }

    private checkConcept(freConcept: FreConcept): void {
        LOGGER.log("Checking concept '" + freConcept.name + "' of type " + freConcept.constructor.name);
        this.runner.simpleCheck(!!freConcept.name, `Concept should have a name ${ParseLocationUtil.location(freConcept)}.`);
        this.runner.simpleCheck(!(freReservedWords.includes(freConcept.name)), `Concept may not have a name that is equal to a reserved word ('${freConcept.name}') ${ParseLocationUtil.location(freConcept)}.`);
        this.runner.simpleCheck(!(reservedWordsInTypescript.includes(freConcept.name)),
            `Concept may not have a name that is equal to a reserved word in TypeScript ('${freConcept.name}') ${ParseLocationUtil.location(freConcept)}.`);

        if (!!freConcept.base) {
            CommonChecker.checkClassifierReference(freConcept.base, this.runner);
            const myBase = freConcept.base.referred;
            if (!!myBase) { // error message taken care of by checkClassifierReference
                this.runner.nestedCheck({
                    check: myBase instanceof FreConcept,
                    error: `Base '${freConcept.base.name}' must be a concept ` +
                        `${ParseLocationUtil.location(freConcept.base)}.`,
                    whenOk: () => {
                        this.runner.simpleCheck(!(!(freConcept instanceof FreExpressionConcept) && myBase instanceof FreExpressionConcept),
                            `A concept may not have an expression as base ${ParseLocationUtil.location(freConcept.base)}.`);
                        if (freConcept instanceof FreLimitedConcept) {
                            this.runner.simpleWarning(myBase instanceof FreLimitedConcept,
                                `Base '${freConcept.base.name}' of limited concept is not a limited concept. ` +
                                        `Only properties that have primitive type are inherited ${ParseLocationUtil.location(freConcept.base)}.`
                            );
                        } else {
                            this.runner.simpleCheck(!(myBase instanceof FreLimitedConcept),
                                `Limited concept '${freConcept.base.name}' cannot be base of an unlimited concept ${ParseLocationUtil.location(freConcept.base)}.`
                            );
                        }
                    }
                });
            }
        }

        // do the interfaces
        const newInterfaces: MetaElementReference<FreInterface>[] = [];
        for (const intf of freConcept.interfaces) {
            CommonChecker.checkClassifierReference(intf, this.runner);
            if (!!intf.referred) { // error message taken care of by checkClassifierReference
                this.runner.nestedCheck({
                    check: intf.referred instanceof FreInterface,
                    error: `Concept '${intf.name}' is not an interface ${ParseLocationUtil.location(intf)}.`,
                    whenOk: () => {
                        // add to the list
                        newInterfaces.push(intf);
                    }
                });
            }
        }
        freConcept.interfaces = newInterfaces;

        // do the properties
        freConcept.primProperties.forEach(prop => this.checkPrimitiveProperty(prop));
        if (!(freConcept instanceof FreLimitedConcept)) {
            freConcept.properties.forEach(part => this.checkConceptProperty(part));
        }

        if (freConcept instanceof FreBinaryExpressionConcept && !(freConcept.isAbstract)) {
            // this.runner.simpleCheck(binExpConcept.getSymbol() !== "undefined", `Concept ${freConcept.name} should have a symbol`);
            this.runner.simpleCheck(freConcept.getPriority() !== -1,
                `Binary expression concept ${freConcept.name} should have a priority ${ParseLocationUtil.location(freConcept)}.`);

            const left = freConcept.allParts().find(part => part.name === "left");
            this.runner.nestedCheck({
                check: !!left,
                error: `Binary expression concept ${freConcept.name} should have a left part ${ParseLocationUtil.location(freConcept)}.`,
                whenOk: () => {
                    this.runner.simpleCheck(!!left && left.type instanceof FreExpressionConcept,
                        `Concept ${freConcept.name}.left should be an expression concept ${ParseLocationUtil.location(freConcept)}.`);
                }
            });
            const right = freConcept.allParts().find(part => part.name === "right");
            this.runner.nestedCheck({
                check: !!right,
                error: `Binary expression concept ${freConcept.name} should have a right part ${ParseLocationUtil.location(freConcept)}.`,
                whenOk: () => {
                    this.runner.simpleCheck(!!right && right.type instanceof FreExpressionConcept,
                        `Concept ${freConcept.name}.right should be an expression concept ${ParseLocationUtil.location(freConcept)}.`);
                }
            });
        }

        if (freConcept instanceof FreLimitedConcept) {
            this.checkLimitedConcept(freConcept);
        }
    }

    checkLimitedConcept(freLimitedConcept: FreLimitedConcept) {
        LOGGER.log(`Checking limited concept '${freLimitedConcept.name}' ${ParseLocationUtil.location(freLimitedConcept)}`);
        // the normal checking of concepts is done in this.checkConcept

        // limited concept may be used as reference only, thus it should have a property 'name: string'
        // this property is added in 'createLimitedConcept' in file 'LanguageCreators.ts'

        // checking for properties other than primitive ones
        freLimitedConcept.properties.forEach(prop => {
            this.runner.simpleCheck(false, `Property '${prop.name}' of limited concept should have primitive type ${ParseLocationUtil.location(prop)}.`);
        });

        // if this concept is abstract there may be no instances
        // if this concept is not abstract there must be instances
        if (freLimitedConcept.isAbstract) {
            this.runner.simpleCheck(freLimitedConcept.instances.length === 0,
                `An abstract limited concept may not have any instances ${ParseLocationUtil.location(freLimitedConcept)}.`);
        } else {
            this.runner.simpleCheck(freLimitedConcept.instances.length > 0,
                `A non-abstract limited concept must have instances ${ParseLocationUtil.location(freLimitedConcept)}.`);
        }
    }

    checkConceptProperty(freProperty: FreProperty): void {
        LOGGER.log("Checking concept property '" + freProperty.name + "'");
        this.checkPropertyName(freProperty);
        this.runner.nestedCheck(
            {
                check: !!freProperty.type,
                error: `Element '${freProperty.name}' should have a type ${ParseLocationUtil.location(freProperty)}.`,
                whenOk: () => {
                    CommonChecker.checkClassifierReference(freProperty.typeReference, this.runner);
                    const realType = freProperty.type;
                    if (!!realType) { // error message handled by checkClassifierReference
                        const owningClassifier = freProperty.owningClassifier;
                        this.checkPropertyType(freProperty, realType);

                        const isUnit = (realType instanceof FreUnitDescription);

                        // check use of unit types in non-model concepts: may be references only
                        if (isUnit && freProperty.isPart) {
                            this.runner.simpleCheck(
                                owningClassifier instanceof FreModelDescription,
                                `Modelunit '${realType.name}' may be used as reference only in a non-model concept ${ParseLocationUtil.location(freProperty.typeReference)}.`);
                        }
                        // check use of non-unit types in model concept
                        if (owningClassifier instanceof FreModelDescription) {
                            this.runner.simpleCheck(
                                isUnit,
                                `Type of property '${freProperty.name}' should be a modelunit ${ParseLocationUtil.location(freProperty.typeReference)}.`);
                        }
                        // TODO review the rules around 'public'
                        // if (freProperty.isPart && freeProperty.isPublic) {
                        //     this.runner.nestedCheck({
                        //         check: realType.isPublic,
                        // tslint:disable-next-line:max-line-length
                        //         error: `Property '${freProperty.name} of type ${realType.name}' is public, the concept ${realType.name} should be public as well ${ParseLocationUtil.location(freProperty)}.`,
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
                    if (freProperty.isList && freProperty.isOptional) {
                        this.runner.simpleWarning(false,
                            `Property '${freProperty.name}' is a list and therefore always optional, optionality will be ignored ${ParseLocationUtil.location(freProperty)}.`);
                        freProperty.isOptional = false;
                    }
                }
            });
    }

    private checkPropertyType(freProperty: FreProperty, realType: FreClassifier) {
        if (!!realType) { // error message taken care of by checkClassifierReference
            if (realType instanceof FreLimitedConcept) {
                // this situation is OK, but property with limited concept as type should always be a reference property.
                // the property should refer to one of the predefined instances of the limited concept.
                // in phase2 of the checker it is ensured that limited concepts always have a 'name' property of type 'identifier'.
                freProperty.isPart = false;
            } else {
                if (!freProperty.isPart) {
                    // it is a reference, so check whether the type has a name by which it can be referred
                    const nameProperty: FrePrimitiveProperty = realType.nameProperty();
                    this.runner.nestedCheck({
                        check: !!nameProperty,
                        error: `Type '${realType.name}' cannot be used as a reference, because it has no property 'name: identifier' ${ParseLocationUtil.location(freProperty.typeReference)}.`,
                        whenOk: () => {
                            this.runner.simpleCheck(nameProperty.type === FrePrimitiveType.identifier,
                                `Type '${realType.name}' cannot be used as a reference, because its name property is not of type 'identifier' ${ParseLocationUtil.location(freProperty.typeReference)}.`);
                        }
                    });
                }
            }
        }
    }

    checkPrimitiveProperty(element: FrePrimitiveProperty): void {
        LOGGER.log("Checking primitive property '" + element.name + "'");
        this.checkPropertyName(element);
        this.runner.nestedCheck(
            {
                check: !!element.typeReference,
                error: `Property '${element.name}' should have a type ${ParseLocationUtil.location(element)}.`,
                whenOk: () => {
                    const myType = element.type; // there is a type reference, now check whether this reference resolves to a primitive type
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
                            this.runner.simpleCheck(CommonChecker.checkValueToType(element.initialValue, myType as FrePrimitiveType),
                                `Type of '${element.initialValue}' (${typeof element.initialValue}) does not fit type (${element.type.name}) of property '${element.name}' ${ParseLocationUtil.location(element)}.`);
                        }
                    } else {
                        // this.runner.simpleCheck(element.initialValue === null || element.initialValue === undefined,
                        //     `Initial value of property '${element.name}' should be a list value ${ParseLocationUtil.location(element)}.`);
                        if (element.initialValueList.length > 0) { // the property has an initial value, so check it
                            element.initialValueList.forEach(value => {
                                this.runner.simpleCheck(CommonChecker.checkValueToType(value, myType as FrePrimitiveType),
                                    `Type of '${value}' (${typeof element.initialValue}) does not fit type (${element.type.name}[]) of property '${element.name}' ${ParseLocationUtil.location(element)}.`);
                            });
                        }
                    }
                    // end check initial value(s)
                }
            });
    }

    private checkPropertyName(element: FreProperty) {
        this.runner.nestedCheck(
            {
                check: !!element.name,
                error: `Property should have a name ${ParseLocationUtil.location(element)}.`,
                whenOk: () => {
                    this.runner.simpleCheck(!(reservedWordsInTypescript.includes(element.name.toLowerCase())),
                        `Property may not have a name that is equal to a reserved word in TypeScript ('${element.name}') ${ParseLocationUtil.location(element)}.`);
                    // TODO determine whether the following check is important
                    // this.runner.simpleCheck(!(freReservedWords.includes(element.name.toLowerCase())),
                    //     `Property may not have a name that is equal to a reserved word ('${element.name}') ${ParseLocationUtil.location(element)}.`);
                }
            });
    }

    private checkPrimitiveType(type: FreClassifier, element: FrePrimitiveProperty) {
        LOGGER.log("Checking primitive type '" + type.name + "'");
        this.runner.simpleCheck(
            (type === FrePrimitiveType.identifier || type === FrePrimitiveType.string || type === FrePrimitiveType.number || type === FrePrimitiveType.boolean),
            `Primitive property '${element.name}' should have a primitive type (string, identifier, boolean, or number) ${ParseLocationUtil.location(element)}.`
        );
    }

    checkInterface(freInterface: FreInterface) {
        this.runner.simpleCheck(!!freInterface.name, `Interface should have a name ${ParseLocationUtil.location(freInterface)}.`);
        this.runner.simpleCheck(!(freReservedWords.includes(freInterface.name.toLowerCase())), `Interface may not have a name that is equal to a reserved word ('${freInterface.name}') ${ParseLocationUtil.location(freInterface)}.`);
        this.runner.simpleCheck(!(reservedWordsInTypescript.includes(freInterface.name.toLowerCase())),
            // tslint:disable-next-line:max-line-length
            `Interface may not have a name that is equal to a reserved word in TypeScript ('${freInterface.name}') ${ParseLocationUtil.location(freInterface)}.`);

        for (const intf of freInterface.base) {
            CommonChecker.checkClassifierReference(intf, this.runner);
            if (!!intf.referred) { // error message taken care of by checkClassifierReference
                this.runner.simpleCheck(intf.referred instanceof FreInterface,
                    `Base concept '${intf.name}' must be an interface concept ` +
                        `${ParseLocationUtil.location(intf)}`);
            }
        }

        freInterface.primProperties.forEach(prop => this.checkPrimitiveProperty(prop));
        freInterface.properties.forEach(part => this.checkConceptProperty(part));
    }
}
