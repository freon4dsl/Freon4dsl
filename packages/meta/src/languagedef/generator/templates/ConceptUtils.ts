import { Names, Imports } from "../../../utils/on-lang/index.js"
import { GenerationUtil } from '../../../utils/on-lang/GenerationUtil.js';
import {
    FreMetaClassifier,
    FreMetaConcept,
    FreMetaConceptProperty,
    FreMetaPrimitiveProperty,
    FreMetaProperty,
    FreMetaPrimitiveType,
    FreMetaInterface,
    FreMetaEnumValue
} from "../../metalanguage/index.js"

export class ConceptUtils {
    
    public static makeBasicProperties(metaType: string, conceptName: string, hasSuper: boolean): string {
        return `readonly $typename: ${metaType} = "${conceptName}";    // holds the metatype in the form of a string
                ${!hasSuper ? "$id: string = '';     // a unique identifier" : ""}
                parseLocation: ${Names.FreParseLocation};    // if relevant, the location of this element within the source from which it is parsed`
    }

    public static makePrimitiveProperty(freProp: FreMetaPrimitiveProperty): string {
        const comment = "// implementation of " + freProp.name
        const arrayType = freProp.isList ? "[]" : ""
        return `${freProp.name} : ${GenerationUtil.getBaseTypeAsString(freProp)}${arrayType}; \t${comment}`
    }

    private static initEnumValue(freProp: FreMetaConceptProperty): string {
        if (!!freProp.initial && freProp.initial instanceof FreMetaEnumValue) {
            return `this.${freProp.name} = FreNodeReference.create<${freProp.initial.sourceName}>(${freProp.initial.sourceName}.${freProp.initial.instanceName}, "${freProp.initial.sourceName}");`
        } else {
            return ""
        }
    }

    private static initializer(freProp: FreMetaPrimitiveProperty): string {
        let initializer = ""
        const myType: FreMetaClassifier = freProp.type
        if (!freProp.isList) {
            switch (myType) {
                case FreMetaPrimitiveType.identifier: {
                    initializer = `this.${freProp.name} = \"${freProp.initialValue ? freProp.initialValue : ``}\"`
                    break
                }
                case FreMetaPrimitiveType.string: {
                    initializer = `this.${freProp.name} = \"${freProp.initialValue ? freProp.initialValue : ``}\"`
                    break
                }
                case FreMetaPrimitiveType.number: {
                    initializer = `this.${freProp.name} = ${freProp.initialValue ? freProp.initialValue : `0`}`
                    break
                }
                case FreMetaPrimitiveType.boolean: {
                    initializer = `this.${freProp.name} = ${freProp.initialValue ? freProp.initialValue : `false`}`
                    break
                }
            }
        } else {
            if (!!freProp.initialValueList) {
                if (myType === FreMetaPrimitiveType.string || myType === FreMetaPrimitiveType.identifier) {
                    initializer = `${freProp.initialValueList.map((elem) => `this.${freProp.name}.push(\"${elem}\")`).join("\n ")}`
                } else {
                    initializer = `${freProp.initialValueList.map((elem) => `this.${freProp.name}.push(${elem})`).join("\n ")}`
                }
            }
        }
        return initializer
    }

    public static makePartProperty(freProp: FreMetaConceptProperty): string {
        const comment = "// implementation of part '" + freProp.name + "'"
        const arrayType = freProp.isList ? "[]" : ""
        return `${freProp.name} : ${Names.classifier(freProp.type)}${arrayType}; ${comment}`
    }

    public static makeReferenceProperty(freProp: FreMetaConceptProperty): string {
        const comment = "// implementation of reference '" + freProp.name + "'"
        const arrayType = freProp.isList ? "[]" : ""
        return `${freProp.name} : ${Names.FreNodeReference}<${Names.classifier(freProp.type)}>${arrayType}; ${comment}`
    }

    public static makeConvenienceMethods(list: FreMetaConceptProperty[]): string {
        let result: string = ""
        for (const prop of list) {
            if (!prop.isPart) {
                const propType: string = Names.classifier(prop.type)
                if (!prop.isList) {
                    result += `
            /**
             * Convenience method for reference '${prop.name}'.
             * Instead of returning a '${Names.FreNodeReference}<${propType}>' object,
             * it returns the referred '${propType}' object, if it can be found.
             */
            get ${Names.refName(prop)}(): ${propType} {
                if (!!this.${prop.name}) {
                    return this.${prop.name}.referred;
                }
                return null;
            }`
                } else {
                    result += `
            /**
             * Convenience method for reference '${prop.name}'.
             * Instead of returning a list of '${Names.FreNodeReference}<${propType}>' objects, it
             * returns a list of referred '${propType}' objects, if the references can be resolved.
             *
             * Note that when some references cannot be resolved, the length of this list is
             * different to the length of '${prop.name}'.
             */
            get ${Names.refName(prop)}(): readonly ${propType}[] {
                const result: ${propType}[] = [];
                for (const $part of this.${prop.name}) {
                    if (!!$part.referred) {
                        result.push($part.referred);
                    }
                }
                return result;
            }
            `
                }
            }
        }
        return result
    }

    public static makeConstructor(hasSuper: boolean, allProps: FreMetaProperty[], imports: Imports): string {
        // console.log("found overriding props: " + allProps.filter(p => p.isOverriding)
        // .map(p => `${p.name} of ${p.owningClassifier.name} [${p.location?.filename}]`).join("\n\t"))
        // console.log("found NON overriding props: " + allProps.filter(p => !p.isOverriding).map(p => `${p.name} of ${p.owningClassifier.name}`).join(", "))
        const allButPrimitiveProps: FreMetaConceptProperty[] = allProps.filter((p) => !p.isPrimitive && !p.implementedInBase) as FreMetaConceptProperty[]
        const allPrimitiveProps: FreMetaPrimitiveProperty[] = allProps.filter((p) => p.isPrimitive && !p.implementedInBase) as FreMetaPrimitiveProperty[]

        // here we know that FreUtils needs to be imported => add to imports
        if (!hasSuper) {
            imports.core.add(Names.FreUtils)
        }
        return `constructor(id?: string) {
        ${
            !hasSuper
                ? `
                        super();
                        if (!!id) {
                            this.$id = id;
                        } else {
                            this.$id = ${Names.FreUtils}.ID(); // uuid.v4();
                        }`
                : "super(id);"
        }
        ${
            allPrimitiveProps.length !== 0
                ? `// Both 'observableprim' and 'observableprimlist' change the get and set of the attribute
             // such that the part is observable. In lists no 'null' or 'undefined' values are allowed.
            ${allPrimitiveProps
                    .map((p) =>
                        p.isList
                            ? `observableprimlist(this, "${p.name}");
                     ${this.initializer(p)};`
                            : `observableprim(this, "${p.name}");
                       ${this.initializer(p)};`,
                    )
                    .join("\n")}
                        `
                : ``
        }
        ${
            allButPrimitiveProps.length !== 0
                ? `// Both 'observablepart' and 'observablepartlist' change the get and set of the attribute
             // such that the parent-part relationship is consistently maintained,
             // and make sure the part is observable. In lists no 'null' or 'undefined' values are allowed.
                        ${allButPrimitiveProps
                    .map((p) =>
                        p.isList
                            ? `observablepartlist(this, "${p.name}");`
                            : `observablepart(this, "${p.name}");
                        ${this.initEnumValue(p)}`,
                    )
                    .join("\n")}`
                : ``
        }
                ${
            hasSuper
                ? ""
                : `
                // Make copy method a mobx action
                makeObservable(this, {
                    copy: action
                })`
        }
            }`
    }

    public static makeBasicMethods(
        hasSuper: boolean,
        metaType: string,
        isModel: boolean,
        isUnit: boolean,
        isExpression: boolean,
        isBinaryExpression: boolean,
    ): string {
        return `
                /**
                 * Returns the metatype of this instance in the form of a string.
                 */
                freLanguageConcept(): ${metaType} {
                    return this.$typename;
                }

                ${
            !hasSuper
                ? `
                /**
                 * Returns the unique identifier of this instance.
                 */
                 freId(): string {
                    return this.$id;
                }`
                : ""
        }

                /**
                 * Returns true if this instance is a model concept.
                 */
                freIsModel(): boolean {
                    return ${isModel};
                }

                /**
                 * Returns true if this instance is a model unit.
                 */
                freIsUnit(): boolean {
                    return ${isUnit};
                }

                /**
                 * Returns true if this instance is an expression concept.
                 */
                freIsExpression(): boolean {
                    return ${isExpression};
                }

                /**
                 * Returns true if this instance is a binary expression concept.
                 */
                freIsBinaryExpression(): boolean {
                    return ${isBinaryExpression};
                }`
    }

    public static makeStaticCreateMethod(concept: FreMetaClassifier, myName: string): string {
        const allPartsToInitialize = concept.allSingleNonOptionalPartsInitializers()

        return `/**
                 * A convenience method that creates an instance of this class
                 * based on the properties defined in 'data'.
                 * @param data partial object
                 */
                static create(data: Partial<${myName}>): ${myName} {
                    const result = new ${myName}(data.$id);
                    ${concept
            .allProperties()
            .map(
                (freProp) =>
                    `${
                        freProp.isList
                            ? `if (notNullOrUndefined(data.${freProp.name})) {
                                data.${freProp.name}.forEach(x =>
                                    result.${freProp.name}.push(x)
                                );
                            }`
                            : `if (notNullOrUndefined(data.${freProp.name})) {
                                result.${freProp.name} = data.${freProp.name};
                            ${
                                allPartsToInitialize.find((ip) => ip.part === freProp)
                                    ? `} else {
                                        result.${freProp.name} = ${Names.concept(allPartsToInitialize.find((ip) => ip.part === freProp)?.concept)}.create({})`
                                    : ``
                            }   
                            }`
                    }`,
            )
            .join("\n")}
                    if (!!data.parseLocation) {
                        result.parseLocation = data.parseLocation;
                    }
                    return result;
                }`
    }

    public static makeCopyMethod(concept: FreMetaClassifier, myName: string, isAbstract: boolean): string {
        const comment = `/**
                 * A convenience method that copies this instance into a new object.
                 */`
        if (isAbstract) {
            return `${comment}
                copy(): ${myName} {
                    console.log("${myName}: copy method should be implemented by concrete subclass");
                    return null;
                }`
        } else {
            return `/**
                 * A convenience method that copies this instance into a new object.
                 */
                copy(): ${myName} {
                    const result = new ${myName}();
                    ${concept
                .allProperties()
                .map(
                    (freProperty) =>
                        `if (!!this.${freProperty.name}) {
                            ${this.makeCopyProperty(freProperty)}
                        }`,
                )
                .join("\n")}
                    return result;
                }`
        }
    }

    private static makeCopyProperty(freProperty: FreMetaProperty): string {
        let result: string = ""
        if (freProperty.isList) {
            if (freProperty.isPrimitive) {
                result = `this.${freProperty.name}.forEach(x =>
                        result.${freProperty.name}.push(x)
                    );`
            } else {
                result = `this.${freProperty.name}.forEach(x =>
                        result.${freProperty.name}.push(x.copy())
                    );`
            }
        } else {
            if (freProperty.isPrimitive) {
                result = `result.${freProperty.name} = this.${freProperty.name};`
            } else {
                result = `result.${freProperty.name} = this.${freProperty.name}.copy();`
            }
        }
        return result
    }

    public static makeMatchMethod(hasSuper: boolean, concept: FreMetaClassifier, myName: string, imports: Imports): string {
        let propsToDo: FreMetaProperty[]
        if (hasSuper && concept instanceof FreMetaConcept) {
            propsToDo = (concept as FreMetaConcept).implementedProperties()
        } else if (hasSuper && concept instanceof FreMetaInterface) {
            propsToDo = (concept as FreMetaInterface).properties
        } else {
            propsToDo = concept.allProperties()
        }
        return `/**
                 * Matches a partial instance of this class to this object
                 * based on the properties defined in the partial.
                 * @param toBeMatched
                 */
                public match(toBeMatched: Partial<${myName}>): boolean {
                    ${hasSuper ? `let result: boolean = super.match(toBeMatched);` : `let result: boolean = true;`}
                    ${propsToDo.map((freProp) => `${this.makeMatchEntry(freProp, imports)}`).join("\n")}
                    return result;
                }`
    }

    private static makeMatchEntry(freProperty: FreMetaProperty, imports: Imports): string {
        let result: string = ""
        if (freProperty.isPrimitive) {
            if (freProperty.isList) {
                // here we know that matchPrimitiveList needs to be imported => add to imports
                imports.core.add("matchPrimitiveList")
                result = `if (result && !!toBeMatched.${freProperty.name}) {
                                result = result && matchPrimitiveList(this.${freProperty.name}, toBeMatched.${freProperty.name});
                          }`
            } else {
                if (freProperty.type === FreMetaPrimitiveType.string || freProperty.type === FreMetaPrimitiveType.identifier) {
                    result = `if (result && toBeMatched.${freProperty.name} !== null && toBeMatched.${freProperty.name} !== undefined && toBeMatched.${freProperty.name}.length > 0) {
                                result = result && this.${freProperty.name} === toBeMatched.${freProperty.name};
                          }`
                } else {
                    result = `if (result && toBeMatched.${freProperty.name} !== null && toBeMatched.${freProperty.name} !== undefined) {
                                result = result && this.${freProperty.name} === toBeMatched.${freProperty.name};
                          }`
                }
            }
        } else if (freProperty.isList) {
            if (freProperty.isPart) {
                // here we know that matchElementList needs to be imported => add to imports
                imports.core.add("matchElementList")
                result = `if (result && !!toBeMatched.${freProperty.name}) {
                              result = result && matchElementList(this.${freProperty.name}, toBeMatched.${freProperty.name});
                          }`
            } else {
                // here we know that matchReferenceList needs to be imported => add to imports
                imports.core.add("matchReferenceList")
                result = `if (result && !!toBeMatched.${freProperty.name}) {
                              result = result && matchReferenceList(this.${freProperty.name}, toBeMatched.${freProperty.name});
                          }`
            }
        } else {
            // same for both parts and references
            result = `if (result && !!toBeMatched.${freProperty.name}) {
                                result = result && this.${freProperty.name}.match(toBeMatched.${freProperty.name});
                            }`
        }
        return result
    }
}
