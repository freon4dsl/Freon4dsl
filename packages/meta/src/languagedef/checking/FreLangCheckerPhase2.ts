import { CheckerPhase, CheckRunner, isNullOrUndefined, ParseLocationUtil } from "../../utils/index.js";
import {
    FreMetaConcept,
    FreMetaInstance,
    FreMetaLanguage,
    FreMetaLimitedConcept,
    FreMetaPrimitiveProperty,
    FreMetaPrimitiveType,
    FreMetaProperty,
    FreMetaInstanceProperty,
    FreMetaUnitDescription,
    MetaElementReference
} from "../metalanguage/index.js";
import { CommonChecker } from "./CommonChecker.js";
import { ClassifierChecker } from "./ClassifierChecker.js";

export class FreLangCheckerPhase2 extends CheckerPhase<FreMetaLanguage> {
    // @ts-ignore This property is set in the 'check' method, therefore we can assume that it is initialized in the private methods.
    language: FreMetaLanguage;

    // now everything has been resolved, check that all concepts and interfaces have
    // unique names, that there are no circular inheritance or interface relationships,
    // and that all their properties are consistent with regard to inheritance
    public check(language: FreMetaLanguage, runner: CheckRunner): void {
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
                if (con instanceof FreMetaLimitedConcept) {
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

    private checkUniqueFileExtension(extensions: string[], unit: FreMetaUnitDescription) {
        // our parser accepts only variables for fileExtensions, therefore we do not need to check it further here.
        // set the file extension, if not present
        if (isNullOrUndefined(unit.fileExtension) || unit.fileExtension.length === 0) {
            // try to get a unique file extension that is as short as possible starting with a length of 3 chars
            if (unit.name.length < 3) {
                // for small names extend the name with a number
                for (let i = 0; i < 9; i++) {
                    const potential: string = unit.name.toLowerCase() + i;
                    if (!extensions.includes(potential)) {
                        unit.fileExtension = potential;
                        break;
                    }
                }
            } else {
                // for larger names use a substring that makes the extension unqiue
                for (let i = 3; i <= unit.name.length; i++) {
                    const potential: string = unit.name.substring(0, i).toLowerCase();
                    if (!extensions.includes(potential)) {
                        unit.fileExtension = potential;
                        break;
                    }
                }
            }
            if (isNullOrUndefined(unit.fileExtension) || unit.fileExtension.length === 0) { // could not set default
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

    private checkLimitedConceptAgain(freLimitedConcept: FreMetaLimitedConcept) {
        let nameProperty: FreMetaPrimitiveProperty | undefined = freLimitedConcept.allPrimProperties().find(p => p.name === "name");
        // if 'name' property is not present, create it.
        if ( !nameProperty ) {
            nameProperty = new FreMetaPrimitiveProperty();
            nameProperty.name = "name";
            nameProperty.id = "TODO_set-correct-id";
            nameProperty.key = "TODO_set-correct-key";
            nameProperty.type = FreMetaPrimitiveType.identifier;
            nameProperty.isPart = true;
            nameProperty.isList = false;
            nameProperty.isOptional = false;
            nameProperty.isPublic = true;
            nameProperty.isStatic = false;
            nameProperty.owningClassifier = freLimitedConcept;
            freLimitedConcept.primProperties.push(nameProperty);
        } else {
            this.runner.simpleCheck(nameProperty.type === FreMetaPrimitiveType.identifier,
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
            if (myBase instanceof FreMetaLimitedConcept) {
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

    private checkInstance(freInstance: FreMetaInstance) {
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

    private checkInstanceProperty(freInstanceProperty: FreMetaInstanceProperty, enclosingConcept: FreMetaConcept) {
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
                                check: myProp instanceof FreMetaPrimitiveProperty,
                                error: `Predefined property '${freInstanceProperty.name}' should have a primitive type ${ParseLocationUtil.location(freInstanceProperty)}.`,
                                whenOk: () => {
                                    if (!!myProp) {
                                        freInstanceProperty.property = MetaElementReference.create<FreMetaProperty>(myProp, "FreProperty");
                                        const myPropType: FreMetaPrimitiveType = myProp.type as FreMetaPrimitiveType;
                                        if (!myProp.isList) {
                                            this.runner.simpleCheck(CommonChecker.checkValueToType(freInstanceProperty.value, myPropType),
                                                `Type of '${freInstanceProperty.value}' (${CommonChecker.primitiveValueToString(freInstanceProperty.value)}) does not fit type (${myPropType.name}) of property '${freInstanceProperty.name}' ${ParseLocationUtil.location(freInstanceProperty)}.`);
                                        } else {
                                            if (!!freInstanceProperty.valueList) {
                                                freInstanceProperty.valueList.forEach(value => {
                                                    this.runner.simpleCheck(CommonChecker.checkValueToType(value, myPropType),
                                                        `Type of '${CommonChecker.primitiveValueToString(value)}' (${typeof value}) does not fit type (${myPropType.name}) of property '${freInstanceProperty.name}' ${ParseLocationUtil.location(freInstanceProperty)}.`);
                                                });
                                            }
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
