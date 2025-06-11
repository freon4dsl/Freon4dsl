import { FreMetaClassifier, FreMetaConcept, FreMetaInterface, FreMetaProperty, LangUtil } from "../metalanguage/index.js";
import { CheckRunner, ParseLocationUtil } from "../../utils/basic-dependencies/index.js";
import { CommonChecker } from "./CommonChecker.js";

/**
 * Performs an extended check on a single Classifier:
 * (1) no loops in its inheritance tree
 * (2) all its properties adhere to the inheritance rules
 */
export class ClassifierChecker {
    // The property 'runner' is set by both public methods, therefore we can assume that it is set in all private methods.
    runner: CheckRunner | unknown;

    /**
     * Returns true if there is a circularity found in the inheritance tree of this classifier.
     *
     * @param names: all names of classifier that are encountered so far
     * @param classifier: the classifier to check
     * @param runner
     */
    public checkClassifier(names: string[], classifier: FreMetaClassifier, runner: CheckRunner): boolean {
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
    public checkInfiniteLoops(classifier: FreMetaClassifier, runner: CheckRunner) {
        this.runner = runner;
        classifier.allParts().forEach((aPart) => {
            if (!aPart.isPrimitive && !aPart.isOptional && !aPart.isList) {
                const aPartType = aPart.type;
                if (!!aPartType) {
                    aPartType.allParts().forEach((bPart) => {
                        if (!bPart.isOptional && !bPart.isList) {
                            const bPartType = bPart.type;
                            runner.simpleCheck(
                                bPartType !== classifier,
                                `Language contains an infinite loop: mandatory part '${aPart.name}' has mandatory property '${bPart.name}' of type ${bPart.typeReference.name} ${ParseLocationUtil.location(aPart)}.`,
                            );
                        }
                    });
                }
            }
        });
    }

    private checkPropertyInheritance(classifier: FreMetaClassifier) {
        // Note that in this check method we cannot use the classifier methods 'implementedProperties', 'allProperties', etc.
        // Those methods depend on the fact that everything is correct - which should be checked here.
        // Five aspects to be tested, each numbered.
        const propsToCheck: FreMetaProperty[] = [];
        propsToCheck.push(...classifier.primProperties);
        propsToCheck.push(...classifier.properties);
        const propsDone: FreMetaProperty[] = [];
        propsToCheck.forEach((prop) => {
            // 1. all props defined in this classifier against themselves:
            // no prop with same name allowed, not even if they have the same type
            const inSameCls = propsDone.find((prevProp) => prevProp.name === prop.name);
            if (!!inSameCls) {
                // @ts-ignore Todo find out why this error occurs. Imho, it shouldn't.
                this.runner!.simpleCheck(
                    false,
                    `Property '${prop.name}' already exists in ${classifier.name} ${ParseLocationUtil.location(prop)} and ${ParseLocationUtil.location(inSameCls)}.`,
                );
            }
            propsDone.push(prop);
            // 2. all props defined in this classifier should be different from the props of its super concepts/interfaces
            //      except when their types conform, then props of the sub should be marked 'implementedInBase' - but only if
            //      base is a concept
            if (classifier instanceof FreMetaConcept && !!classifier.base && !!classifier.base.referred) {
                this.checkPropsOfBase(classifier.base.referred, prop);
            } else if (classifier instanceof FreMetaInterface) {
                classifier.base.forEach((intfRef) => {
                    if (!!intfRef.referred) {
                        const inSuper: FreMetaProperty | undefined = this.searchLocalProps(intfRef.referred, prop);
                        if (!!inSuper) {
                            // @ts-ignore Todo find out why this error occurs. Imho, it shouldn't.
                            this.runner!.simpleCheck(
                              LangUtil.compareTypes(prop, inSuper),
                              `Property '${prop.name}' with non conforming type already exists in base interface '${intfRef.name}' ${ParseLocationUtil.location(prop)} and ${ParseLocationUtil.location(inSuper)}.`
                            );
                        }
                    }
                });
            }
            // 3. all props defined in this concept against props from implemented interfaces: name and type should conform
            if (classifier instanceof FreMetaConcept) {
                classifier.allInterfaces().forEach((intf) => {
                    this.checkPropAgainstInterface(intf, prop);
                });
            }
        });
        // 4. all props defined in implemented interfaces, that do not have a counterpart in the concept or its supers,
        //      should not have a name equal to any other, except when their types conform.
        if (classifier instanceof FreMetaConcept) {
            const innerPropsDone: FreMetaProperty[] = [];
            classifier.allInterfaces().forEach((intf) => {
                intf.allProperties().forEach((toBeImplemented) => {
                    const implementedProp = this.findImplementedProperty(toBeImplemented, classifier, false);
                    if (implementedProp === null || implementedProp === undefined) {
                        // there is NO counterpart in either this concept or its base
                        const inAnotherInterface = innerPropsDone.find(
                            (prevProp) => prevProp.name === toBeImplemented.name,
                        );
                        if (!!inAnotherInterface) {
                            // there is a prop with the same name in another implemented interface
                            // we must check type conformance both ways!
                            // when types conform: add a new prop with the most specific type to classifier
                            let virtualProp: FreMetaProperty;
                            if (LangUtil.compareTypes(toBeImplemented, inAnotherInterface)) {
                                virtualProp = CommonChecker.makeCopyOfProp(toBeImplemented, classifier);
                            } else if (LangUtil.compareTypes(inAnotherInterface, toBeImplemented)) {
                                virtualProp = CommonChecker.makeCopyOfProp(inAnotherInterface, classifier);
                            }
                            // if virtualProp exists, the types did conform to each other
                            // @ts-ignore Todo find out why this error occurs. Imho, it shouldn't.
                            this.runner!.simpleCheck(
                                !!virtualProp!,
                                `Concept '${classifier.name}': property '${toBeImplemented.name}' in '${intf.name}' does not conform to property '${toBeImplemented.name}' in '${inAnotherInterface.owningClassifier.name}' ${ParseLocationUtil.location(classifier)}.`,
                            );
                        }
                    }
                    innerPropsDone.push(toBeImplemented);
                });
            });
        }
        // 5. all properties of super concepts, that are not overwritten in this concept, must conform. Idem props of all interfaces.
        if (classifier instanceof FreMetaConcept) {
            const myBase = classifier.base?.referred;
            if (!!myBase) {
                const basePropsToCheck: FreMetaProperty[] = [];
                basePropsToCheck.push(...myBase.primProperties);
                basePropsToCheck.push(...myBase.properties);
                classifier.interfaces.forEach((intf) => {
                    basePropsToCheck.forEach((baseProp) => {
                        const inSuper: FreMetaProperty | undefined = this.searchLocalProps(classifier, baseProp);
                        if (!inSuper) {
                            this.checkPropAgainstInterface(intf.referred, baseProp);
                        }
                    });
                });
            }
        }
    }

    private checkPropsOfBase(myBase: FreMetaConcept, prop: FreMetaProperty) {
        if (!!myBase && !!prop) {
            const inSuper: FreMetaProperty | undefined = this.searchLocalProps(myBase, prop);
            if (!!inSuper) {
                // @ts-ignore Todo find out why this error occurs. Imho, it shouldn't.
                this.runner!.nestedCheck({
                    check: LangUtil.compareTypes(prop, inSuper),
                    error: `Property '${prop.name}' with non conforming type already exists in base concept '${myBase.name}' ${ParseLocationUtil.location(prop)} and ${ParseLocationUtil.location(inSuper)}.`,
                    whenOk: () => {
                        // set the 'implementedInBase' flag
                        prop.implementedInBase = true;
                    },
                });
            } else if (!!myBase.base) {
                // check base of base
                if (myBase.base.referred instanceof FreMetaConcept) {
                    // if error is made, base could be an interface
                    this.checkPropsOfBase(myBase.base.referred, prop);
                }
            }
        }
    }

    private checkPropAgainstInterface(intf: FreMetaInterface, prop: FreMetaProperty) {
        let inIntf: FreMetaProperty | undefined = intf.primProperties.find((prevProp) => prevProp.name === prop.name);
        if (!inIntf) {
            inIntf = intf.properties.find((prevProp) => prevProp.name === prop.name);
        }
        if (!!inIntf) {
            // @ts-ignore Todo find out why this error occurs. Imho, it shouldn't.
            this.runner!.simpleCheck(
                LangUtil.compareTypes(prop, inIntf),
                `(Inherited) property '${prop.name}' with non conforming type exists in implemented interface '${intf.name}' ${ParseLocationUtil.location(prop)} and ${ParseLocationUtil.location(inIntf)}.`,
            );
        }
    }

    private findImplementedProperty(
        prop: FreMetaProperty,
        concept: FreMetaConcept,
        includeInterfaces: boolean,
    ): FreMetaProperty | undefined {
        const propsToCheck: FreMetaProperty[] = [];
        propsToCheck.push(...concept.primProperties);
        propsToCheck.push(...concept.properties);
        if (includeInterfaces && concept.interfaces.length > 0) {
            concept.interfaces.forEach((intf) => {
                if (!!intf.referred) {
                    propsToCheck.push(...intf.referred.allPrimProperties());
                    propsToCheck.push(...intf.referred.allProperties());
                }
            });
        }
        let implementedProp: FreMetaProperty | undefined = propsToCheck.find((prevProp) => prevProp.name === prop.name);
        // if not implemented by the concept itself, try its base - recursive -
        const myBase = concept.base?.referred;
        if (!implementedProp && !!myBase) {
            implementedProp = this.findImplementedProperty(prop, myBase, true);
        }
        return implementedProp;
    }

    private checkCircularInheritance(circularNames: string[], con: FreMetaClassifier): boolean {
        if (circularNames.includes(con.name)) {
            // error, already seen this name
            const text: string = circularNames.map((name) => name).join(", ");
            // @ts-ignore Todo find out why this error occurs. Imho, it shouldn't.
            this.runner!.simpleCheck(
                false,
                `Concept or interface '${con.name}' is part of a forbidden circular inheritance tree (${text}) ${ParseLocationUtil.location(con)}.`,
            );
            return true;
        } else {
            // not (yet) found a circularity, check 'base'
            circularNames.push(con.name);
            if (con instanceof FreMetaConcept) {
                const base = con.base?.referred;
                if (!!base) {
                    const recursiveCircularNames = [...circularNames]
                    return this.checkCircularInheritance(recursiveCircularNames, base);
                } else {
                    // no problem because there is no 'base'
                    return false;
                }
            } else if (con instanceof FreMetaInterface) {
                let result = false;
                for (const base of con.base) {
                    const realBase = base.referred;
                    if (!!realBase) {
                        const recursiveCircularNames = [...circularNames]
                        result = result || this.checkCircularInheritance(recursiveCircularNames, realBase);
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

    private searchLocalProps(myBase: FreMetaClassifier, prop: FreMetaProperty): FreMetaProperty | undefined {
        let inSuper: FreMetaProperty | undefined = myBase.primProperties.find(
            (prevProp) => prevProp.name === prop.name,
        );
        if (!inSuper) {
            inSuper = myBase.properties.find((prevProp) => prevProp.name === prop.name);
        }
        return inSuper;
    }
}
