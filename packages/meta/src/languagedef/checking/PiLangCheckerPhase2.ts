import { CheckerPhase, CheckRunner, isNullOrUndefined, LangUtil, Names, ParseLocationUtil } from "../../utils";
import {
    PiClassifier,
    PiConcept,
    PiInstance,
    PiInterface,
    PiLanguage,
    PiLimitedConcept,
    PiPrimitiveProperty,
    PiPrimitiveType,
    PiProperty,
    PiInstanceProperty,
    PiUnitDescription,
    PiElementReference
} from "../metalanguage";
import { CommonChecker } from "./CommonChecker";
import { ClassifierChecker } from "./ClassifierChecker";

export class PiLangCheckerPhase2  extends CheckerPhase<PiLanguage> {
    language: PiLanguage;

    // now everything has been resolved, check that all concepts and interfaces have
    // unique names, that there are no circular inheritance or interface relationships,
    // and that all their properties are consistent with regard to inheritance
    public check(language: PiLanguage, runner: CheckRunner): void {
        this.runner = runner;
        this.language = language;
        const names: string[] = [];
        let foundSomeCircularity: boolean = false;
        const extensions: string[] = [];
        language.units.forEach(unit => {
            CommonChecker.checkUniqueNameOfClassifier(names, unit, true, runner);
            this.checkUniqueFileExtension(extensions, unit);
        });
        const classifierChecker = new ClassifierChecker();
        language.concepts.forEach(con => {
             if (classifierChecker.checkClassifier(names, con, runner)) {
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
            if (classifierChecker.checkClassifier(names, intf, runner)) {
                foundSomeCircularity = true;
            }
        });
        if (!foundSomeCircularity) {
            // check if there are no infinite loops in the model, i.e.
            // A has part b: B and B has part a: A and both are mandatory
            // Note: this can be done only after checking for circular inheritance, because we need to look at allParts.
            language.conceptsAndInterfaces().forEach(classifier => {
                classifierChecker.checkInfiniteLoops(classifier, this.runner);
            });
            // Check wether the classifier needs to be public.
            // Note: this can be done only after checking for circular inheritance, because we need to look at allProperties
            language.conceptsAndInterfaces().forEach(con => {
                // if there is a single property that is public, then the concept is public as well
                if (con.allProperties().some(prop => prop.isPublic)) {
                    con.isPublic = true;
                }
            });
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
                this.runner.simpleCheck(false,
                    `Could not create a file-extension for '${unit.name}', please provide one ${ParseLocationUtil.location(unit)}.`);
            } else {
                extensions.push(unit.fileExtension);
            }
        } else {
            // check uniqueness
            if (extensions.includes(unit.fileExtension)) {
                this.runner.simpleCheck(false,
                    `FileExtension '${unit.fileExtension}' already exists ${ParseLocationUtil.location(unit)}.`);
            } else {
                extensions.push(unit.fileExtension);
            }
        }
    }

    private checkLimitedConceptAgain(piLimitedConcept: PiLimitedConcept) {
        let nameProperty: PiPrimitiveProperty = piLimitedConcept.allPrimProperties().find(p => p.name === "name");
        // if 'name' property is not present, create it.
        if ( !nameProperty ) {
            nameProperty = new PiPrimitiveProperty();
            nameProperty.name = "name";
            nameProperty.type = PiPrimitiveType.identifier;
            nameProperty.isPart = true;
            nameProperty.isList = false;
            nameProperty.isOptional = false;
            nameProperty.isPublic = false;
            nameProperty.isStatic = false;
            nameProperty.owningClassifier = piLimitedConcept;
            piLimitedConcept.primProperties.push(nameProperty);
        } else {
            this.runner.simpleCheck(nameProperty.type === PiPrimitiveType.identifier,
                `A limited concept ('${piLimitedConcept.name}') can only be used as a reference, therefore its 'name' property should be of type 'identifier' ${ParseLocationUtil.location(piLimitedConcept)}.`);
        }
        this.runner.simpleCheck(piLimitedConcept.allParts().length === 0,
            `A limited concept may not inherit or implement non-primitive parts ${ParseLocationUtil.location(piLimitedConcept)}.`);
        this.runner.simpleCheck(piLimitedConcept.allReferences().length === 0,
            `A limited concept may not inherit or implement references ${ParseLocationUtil.location(piLimitedConcept)}.`);

        // checking the predefined instances => here, because now we know that the definition of the limited concept is complete
        const names: string[] = [];
        const baseNames: string[] = [];
        if (!!piLimitedConcept.base) { // if there is a base limited concept add all names of instances
            const myBase = piLimitedConcept.base.referred;
            if (myBase instanceof PiLimitedConcept) {
                baseNames.push(...myBase.allInstances().map(inst => inst.name));
            }
        }
        piLimitedConcept.instances.forEach(inst => {
            if (names.includes(inst.name)) {
                this.runner.simpleCheck(false,
                    `Instance with name '${inst.name}' already exists ${ParseLocationUtil.location(inst)}.`);
            } else {
                if (baseNames.includes((inst.name))) {
                    this.runner.simpleCheck(false,
                        `Instance with name '${inst.name}' already exists in the base concept ${ParseLocationUtil.location(inst)}.`);
                } else {
                    names.push(inst.name);
                }
            }
            this.checkInstance(inst);
        });
    }

    private checkInstance(piInstance: PiInstance) {
        CommonChecker.checkClassifierReference(piInstance.concept, this.runner);
        this.runner.nestedCheck({
            check: piInstance.concept.referred !== null,
            error: `Predefined instance '${piInstance.name}' should belong to a concept ${ParseLocationUtil.location(piInstance)}.`,
            whenOk: () => {
                piInstance.props.forEach(p => {
                    this.checkInstanceProperty(p, piInstance.concept.referred);
                });
            }
        });
    }

    private checkInstanceProperty(piPropertyInstance: PiInstanceProperty, enclosingConcept: PiConcept) {
        const myInstance = piPropertyInstance.owningInstance.referred;
        this.runner.nestedCheck(
            {
                check: !!myInstance,
                error: `Property '${piPropertyInstance.name}' should belong to a predefined instance ${ParseLocationUtil.location(piPropertyInstance)}.`,
                whenOk: () => {
                    // find the property to which this piPropertyInstance refers
                    const myProp = myInstance.concept.referred.allPrimProperties().find(p => p.name === piPropertyInstance.name);
                    this.runner.nestedCheck({
                        check: !!myProp,
                        error: `Property '${piPropertyInstance.name}' does not exist on concept ${enclosingConcept.name} ${ParseLocationUtil.location(piPropertyInstance)}.`,
                        whenOk: () => {
                            this.runner.nestedCheck({
                                check: myProp instanceof PiPrimitiveProperty,
                                error: `Predefined property '${piPropertyInstance.name}' should have a primitive type ${ParseLocationUtil.location(piPropertyInstance)}.`,
                                whenOk: () => {
                                    piPropertyInstance.property = PiElementReference.create<PiProperty>(myProp, "PiProperty");
                                    let myPropType: PiPrimitiveType = myProp.type as PiPrimitiveType;
                                    if (!myProp.isList) {
                                        this.runner.simpleCheck(CommonChecker.checkValueToType(piPropertyInstance.value, myPropType),
                                            `Type of '${piPropertyInstance.value}' (${typeof piPropertyInstance.value}) does not fit type (${myPropType.name}) of property '${piPropertyInstance.name}' ${ParseLocationUtil.location(piPropertyInstance)}.`);
                                    } else {
                                        if (!!piPropertyInstance.valueList) {
                                            piPropertyInstance.valueList.forEach(value => {
                                                this.runner.simpleCheck(CommonChecker.checkValueToType(value, myPropType),
                                                    `Type of '${value}' (${typeof value}) does not fit type (${myPropType.name}) of property '${piPropertyInstance.name}' ${ParseLocationUtil.location(piPropertyInstance)}.`);
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
