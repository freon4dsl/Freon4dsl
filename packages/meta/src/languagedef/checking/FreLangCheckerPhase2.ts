import { CheckerPhase, CheckRunner, isNullOrUndefined, ParseLocationUtil } from "../../utils";
import {
    FreConcept,
    FreInstance,
    FreLanguage,
    FreLimitedConcept,
    FrePrimitiveProperty,
    FrePrimitiveType,
    FreProperty,
    FreInstanceProperty,
    FreUnitDescription,
    MetaElementReference
} from "../metalanguage";
import { CommonChecker } from "./CommonChecker";
import { ClassifierChecker } from "./ClassifierChecker";

export class FreLangCheckerPhase2 extends CheckerPhase<FreLanguage> {
    language: FreLanguage;

    // now everything has been resolved, check that all concepts and interfaces have
    // unique names, that there are no circular inheritance or interface relationships,
    // and that all their properties are consistent with regard to inheritance
    public check(language: FreLanguage, runner: CheckRunner): void {
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
                if (con instanceof FreLimitedConcept) {
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

    private checkUniqueFileExtension(extensions: string[], unit: FreUnitDescription) {
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

    private checkLimitedConceptAgain(freLimitedConcept: FreLimitedConcept) {
        let nameProperty: FrePrimitiveProperty = freLimitedConcept.allPrimProperties().find(p => p.name === "name");
        // if 'name' property is not present, create it.
        if ( !nameProperty ) {
            nameProperty = new FrePrimitiveProperty();
            nameProperty.name = "name";
            nameProperty.type = FrePrimitiveType.identifier;
            nameProperty.isPart = true;
            nameProperty.isList = false;
            nameProperty.isOptional = false;
            nameProperty.isPublic = true;
            nameProperty.isStatic = false;
            nameProperty.owningClassifier = freLimitedConcept;
            freLimitedConcept.primProperties.push(nameProperty);
        } else {
            this.runner.simpleCheck(nameProperty.type === FrePrimitiveType.identifier,
                `A limited concept ('${freLimitedConcept.name}') can only be used as a reference, therefore its 'name' property should be of type 'identifier' ${ParseLocationUtil.location(freLimitedConcept)}.`);
        }
        this.runner.simpleCheck(freLimitedConcept.allParts().length === 0,
            `A limited concept may not inherit or implement non-primitive parts ${ParseLocationUtil.location(freLimitedConcept)}.`);
        this.runner.simpleCheck(freLimitedConcept.allReferences().length === 0,
            `A limited concept may not inherit or implement references ${ParseLocationUtil.location(freLimitedConcept)}.`);

        // checking the predefined instances => here, because now we know that the definition of the limited concept is complete
        const names: string[] = [];
        const baseNames: string[] = [];
        if (!!freLimitedConcept.base) { // if there is a base limited concept add all names of instances
            const myBase = freLimitedConcept.base.referred;
            if (myBase instanceof FreLimitedConcept) {
                baseNames.push(...myBase.allInstances().map(inst => inst.name));
            }
        }
        freLimitedConcept.instances.forEach(inst => {
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

    private checkInstance(freInstance: FreInstance) {
        CommonChecker.checkClassifierReference(freInstance.concept, this.runner);
        this.runner.nestedCheck({
            check: freInstance.concept.referred !== null,
            error: `Predefined instance '${freInstance.name}' should belong to a concept ${ParseLocationUtil.location(freInstance)}.`,
            whenOk: () => {
                freInstance.props.forEach(p => {
                    this.checkInstanceProperty(p, freInstance.concept.referred);
                });
            }
        });
    }

    private checkInstanceProperty(freInstanceProperty: FreInstanceProperty, enclosingConcept: FreConcept) {
        const myInstance = freInstanceProperty.owningInstance.referred;
        this.runner.nestedCheck(
            {
                check: !!myInstance,
                error: `Property '${freInstanceProperty.name}' should belong to a predefined instance ${ParseLocationUtil.location(freInstanceProperty)}.`,
                whenOk: () => {
                    // find the property to which this frePropertyInstance refers
                    const myProp = myInstance.concept.referred.allPrimProperties().find(p => p.name === freInstanceProperty.name);
                    this.runner.nestedCheck({
                        check: !!myProp,
                        error: `Property '${freInstanceProperty.name}' does not exist on concept ${enclosingConcept.name} ${ParseLocationUtil.location(freInstanceProperty)}.`,
                        whenOk: () => {
                            this.runner.nestedCheck({
                                check: myProp instanceof FrePrimitiveProperty,
                                error: `Predefined property '${freInstanceProperty.name}' should have a primitive type ${ParseLocationUtil.location(freInstanceProperty)}.`,
                                whenOk: () => {
                                    freInstanceProperty.property = MetaElementReference.create<FreProperty>(myProp, "FreProperty");
                                    let myPropType: FrePrimitiveType = myProp.type as FrePrimitiveType;
                                    if (!myProp.isList) {
                                        this.runner.simpleCheck(CommonChecker.checkValueToType(freInstanceProperty.value, myPropType),
                                            `Type of '${freInstanceProperty.value}' (${typeof freInstanceProperty.value}) does not fit type (${myPropType.name}) of property '${freInstanceProperty.name}' ${ParseLocationUtil.location(freInstanceProperty)}.`);
                                    } else {
                                        if (!!freInstanceProperty.valueList) {
                                            freInstanceProperty.valueList.forEach(value => {
                                                this.runner.simpleCheck(CommonChecker.checkValueToType(value, myPropType),
                                                    `Type of '${value}' (${typeof value}) does not fit type (${myPropType.name}) of property '${freInstanceProperty.name}' ${ParseLocationUtil.location(freInstanceProperty)}.`);
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
