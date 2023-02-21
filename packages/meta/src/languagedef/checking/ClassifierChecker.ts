import { FreClassifier, FreConcept, FreInterface, FreProperty } from "../metalanguage";
import { CheckRunner, LangUtil, ParseLocationUtil } from "../../utils";
import { CommonChecker } from "./CommonChecker";

/**
 * Performs an extended check on a single Classifier:
 * (1) no loops in its inheritance tree
 * (2) all its properties adhere to the inheritance rules
 */
export class ClassifierChecker {
    runner: CheckRunner;

    /**
     * Returns true if there is a circularity found in the inheritance tree of this classifier.
     *
     * @param names: all names of classifier that are encountered so far
     * @param classifier: the classifier to check
     * @param runner
     */
    public checkClassifier(names: string[], classifier: FreClassifier, runner: CheckRunner): boolean {
        this.runner = runner;
        CommonChecker.checkUniqueNameOfClassifier(names, classifier, false, runner);
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

    // check if there are no infinite loops in the model, i.e.
    // A has part b: B and B has part a: A and both are mandatory
    // Note: this can be done only after checking for circular inheritance, because we need to look at allParts.
    public checkInfiniteLoops(classifier: FreClassifier, runner: CheckRunner) {
        classifier.allParts().forEach(aPart => {
            if (!aPart.isPrimitive && !aPart.isOptional && !aPart.isList) {
                const aPartType = aPart.type;
                if (!!aPartType) {
                    aPartType.allParts().forEach(bPart => {
                        if (!bPart.isOptional && !bPart.isList) {
                            const bPartType = bPart.type;
                            runner.simpleCheck(bPartType !== classifier,
                                `Language contains an infinite loop: mandatory part '${aPart.name}' has mandatory property '${bPart.name}' of type ${bPart.typeReference.name} ${ParseLocationUtil.location(aPart)}.`);
                        }
                    });
                }
            }
        });
    }

    private checkPropertyInheritance(classifier: FreClassifier) {
        // Note that in this check method we cannot use the classifier methods 'implementedProperties', 'allProperties', etc.
        // Those methods depend on the fact that everything is correct - which should be checked here.
        // Five aspects to be tested, each numbered.
        const propsToCheck: FreProperty[] = [];
        propsToCheck.push(...classifier.primProperties);
        propsToCheck.push(...classifier.properties);
        const propsDone: FreProperty[] = [];
        propsToCheck.forEach(prop => {
            // 1. all props defined in this classifier against themselves:
            // no prop with same name allowed, not even if they have the same type
            const inSameCls = propsDone.find(prevProp => prevProp.name === prop.name);
            if (!!inSameCls) {
                this.runner.simpleCheck(false,
                    `Property '${prop.name}' already exists in ${classifier.name} ${ParseLocationUtil.location(prop)} and ${ParseLocationUtil.location(inSameCls)}.`);
            }
            propsDone.push(prop);
            // 2. all props defined in this classifier should be different from the props of its super concepts/interfaces
            //      except when their types conform, then props of the sub should be marked 'implementedInBase' - but only if
            //      base is a concept
            if (classifier instanceof FreConcept && !!classifier.base) {
                this.checkPropsOfBase(classifier.base.referred, prop);
            } else if (classifier instanceof FreInterface) {
                classifier.base.forEach(intfRef => {
                    const inSuper = this.searchLocalProps(intfRef.referred, prop);
                    if (!!inSuper) {
                        this.runner.simpleCheck(LangUtil.compareTypes(prop, inSuper),
                            `Property '${prop.name}' with non conforming type already exists in base interface '${intfRef.name}' ${ParseLocationUtil.location(prop)} and ${ParseLocationUtil.location(inSuper)}.`);
                    }
                });
            }
            // 3. all props defined in this concept against props from implemented interfaces: name and type should conform
            if (classifier instanceof FreConcept) {
                classifier.allInterfaces().forEach(intf => {
                    this.checkPropAgainstInterface(intf, prop);
                });
            }
        });
        // 4. all props defined in implemented interfaces, that do not have a counterpart in the concept or its supers,
        //      should not have a name equal to any other, except when their types conform.
        if (classifier instanceof FreConcept) {
            const innerPropsDone: FreProperty[] = [];
            classifier.allInterfaces().forEach(intf => {
                intf.allProperties().forEach(toBeImplemented => {
                    const implementedProp = this.findImplementedProperty(toBeImplemented, classifier, false);
                    if (!implementedProp) { // there is NO counter part in either this concept or its base
                        const inAnotherInterface = innerPropsDone.find(prevProp => prevProp.name === toBeImplemented.name);
                        if (!!inAnotherInterface) { // there is a prop with the same name in another implemented interface
                            // we must check type conformance both ways!
                            // when types conform: add a new prop with the most specific type to classifier
                            let virtualProp: FreProperty = null;
                            if (LangUtil.compareTypes(toBeImplemented, inAnotherInterface)) {
                                virtualProp = CommonChecker.makeCopyOfProp(toBeImplemented, classifier);
                            } else if (LangUtil.compareTypes(inAnotherInterface, toBeImplemented)) {
                                virtualProp = CommonChecker.makeCopyOfProp(inAnotherInterface, classifier);
                            }
                            // if virtualProp exists, the types did conform to eachother
                            this.runner.simpleCheck(!!virtualProp,
                                `Concept '${classifier.name}': property '${toBeImplemented.name}' in '${intf.name}' does not conform to property '${toBeImplemented.name}' in '${inAnotherInterface.owningClassifier.name}' ${ParseLocationUtil.location(classifier)}.`);
                        }
                    }
                    innerPropsDone.push(toBeImplemented);
                });
            });
        }
        // 5. all properties of super concepts, that are not overwritten in this concept, must conform. Idem props of all interfaces.
        if (classifier instanceof FreConcept) {
            const myBase = classifier.base?.referred;
            if (!!myBase) {
                const basePropsToCheck: FreProperty[] = [];
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

    private checkPropsOfBase(myBase: FreConcept, prop: FreProperty) {
        if (!!myBase && !!prop) {
            const inSuper = this.searchLocalProps(myBase, prop);
            if (!!inSuper) {
                this.runner.nestedCheck({
                    check: LangUtil.compareTypes(prop, inSuper),
                    error: `Property '${prop.name}' with non conforming type already exists in base concept '${myBase.name}' ${ParseLocationUtil.location(prop)} and ${ParseLocationUtil.location(inSuper)}.`,
                    whenOk: () => {
                        // set the 'implementedInBase' flag
                        prop.implementedInBase = true;

                    }
                });
            } else if (!!myBase.base) {
                // check base of base
                if (myBase.base.referred instanceof FreConcept) { // if error is made, base could be an interface
                    this.checkPropsOfBase(myBase.base.referred, prop);
                }
            }
        }
    }

    private checkPropAgainstInterface(intf: FreInterface, prop: FreProperty) {
        let inIntf: FreProperty = intf.primProperties.find(prevProp => prevProp.name === prop.name);
        if (!inIntf) {
            inIntf = intf.properties.find(prevProp => prevProp.name === prop.name);
        }
        if (!!inIntf) {
            this.runner.simpleCheck(LangUtil.compareTypes(prop, inIntf),
                `(Inherited) property '${prop.name}' with non conforming type exists in implemented interface '${intf.name}' ${ParseLocationUtil.location(prop)} and ${ParseLocationUtil.location(inIntf)}.`);
        }
    }

    private findImplementedProperty(prop: FreProperty, concept: FreConcept, includeInterfaces: boolean) {
        const propsToCheck: FreProperty[] = [];
        propsToCheck.push(...concept.primProperties);
        propsToCheck.push(...concept.properties);
        if (includeInterfaces && concept.interfaces.length > 0) {
            concept.interfaces.forEach(intf => {
                propsToCheck.push(...intf.referred.allPrimProperties());
                propsToCheck.push(...intf.referred.allProperties());
            });
        }
        let implementedProp = propsToCheck.find(prevProp => prevProp.name === prop.name);
        // if not implemented by the concept itself, try its base - recursive -
        const myBase = concept.base?.referred;
        if (!implementedProp && !!myBase) {
            implementedProp = this.findImplementedProperty(prop, myBase, true);
        }
        return implementedProp;
    }

    private checkCircularInheritance(circularNames: string[], con: FreClassifier): boolean {
        if (circularNames.includes(con.name)) {
            // error, already seen this name
            const text: string = circularNames.map(name => name ).join(", ");
            this.runner.simpleCheck(false,
                `Concept or interface '${con.name}' is part of a forbidden circular inheritance tree (${text}) ${ParseLocationUtil.location(con)}.`);
            return true;
        } else {
            // not (yet) found a circularity, check 'base'
            circularNames.push(con.name);
            if (con instanceof FreConcept) {
                const base = con.base?.referred;
                if (!!base) {
                    return this.checkCircularInheritance(circularNames, base);
                } else {
                    // no problem because there is no 'base'
                    return false;
                }
            } else if (con instanceof FreInterface) {
                let result = false;
                for ( const base of con.base ) {
                    const realBase = base.referred;
                    if (!!realBase) {
                        result = result || this.checkCircularInheritance(circularNames, realBase);
                    }
                }
                return result;
            } else {
                // Does not occur: FreConcept, FreInterface, FreModelUnit, and FreModel are the only subclasses of FreClassifier,
                // and the last two do not have supers.
                console.log("INTERNAL ERROR: UNIT NOT HANDLED");
                return false;
            }
        }
    }

    private searchLocalProps(myBase: FreClassifier, prop: FreProperty) {
        let inSuper: FreProperty = myBase.primProperties.find(prevProp => prevProp.name === prop.name);
        if (!inSuper) {
            inSuper = myBase.properties.find(prevProp => prevProp.name === prop.name);
        }
        return inSuper;
    }
}
