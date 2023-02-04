import { Names, FREON_CORE, GenerationUtil } from "../../../utils";
import {
    FreClassifier,
    FreConcept,
    FreConceptProperty,
    FrePrimitiveProperty,
    FreProperty,
    FrePrimitiveType,
    FreInterface, FreUnitDescription
} from "../../metalanguage";
import * as console from "console";
import { property } from "lodash";

export class ConceptUtils {

    public static makeImportStatements(needsObservable: boolean, importsFromCore: string[], modelImports: string[]): string {
        return `
            ${needsObservable ? `import { observable } from "mobx";` : ""}            
            import { ${importsFromCore.join(",")} } from "${FREON_CORE}";
            import { ${modelImports.join(", ")} } from "./internal";
            `;
    }

    public static makeBasicProperties(metaType: string, conceptName: string, hasSuper: boolean): string {
        return `readonly $typename: ${metaType} = "${conceptName}";    // holds the metatype in the form of a string
                ${!hasSuper ? "$id: string;     // a unique identifier" : ""}    
                parse_location: ${Names.FreParseLocation};    // if relevant, the location of this element within the source from which it is parsed`;
    }

    public static makePrimitiveProperty(property: FrePrimitiveProperty): string {
        const comment = "// implementation of " + property.name;
        const arrayType = property.isList ? "[]" : "";
        return `${property.name} : ${GenerationUtil.getBaseTypeAsString(property)}${arrayType}; \t${comment}`;
    }

    private static initializer(property: FrePrimitiveProperty): string {
        let initializer = "";
        const myType: FreClassifier = property.type;
        if (!property.isList) {
            switch (myType) {
                case FrePrimitiveType.identifier: {
                    initializer = `this.${property.name} = \"${property.initialValue ? property.initialValue : ``}\"`;
                    break;
                }
                case FrePrimitiveType.string: {
                    initializer = `this.${property.name} = \"${property.initialValue ? property.initialValue : ``}\"`;
                    break;
                }
                case FrePrimitiveType.number: {
                    initializer = `this.${property.name} = ${property.initialValue ? property.initialValue : `0`}`;
                    break;
                }
                case FrePrimitiveType.boolean: {
                    initializer = `this.${property.name} = ${property.initialValue ? property.initialValue : `false`}`;
                    break;
                }
            }
        } else {
            if (!!property.initialValueList) {
                if (myType === FrePrimitiveType.string || myType === FrePrimitiveType.identifier) {
                    initializer = `${property.initialValueList.map(elem => `this.${property.name}.push(\"${elem}\")`).join("\n ")}`;
                } else {
                    initializer = `${property.initialValueList.map(elem => `this.${property.name}.push(${elem})`).join("\n ")}`;
                }
            }
        }
        return initializer;
    }

    public static makePartProperty(property: FreConceptProperty): string {
        const comment = "// implementation of part '" + property.name + "'";
        const arrayType = property.isList ? "[]" : "";
        return `${property.name} : ${Names.classifier(property.type)}${arrayType}; ${comment}`;
    }

    public static makeReferenceProperty(property: FreConceptProperty): string {
        const comment = "// implementation of reference '" + property.name + "'";
        const arrayType = property.isList ? "[]" : "";
        return `${property.name} : ${Names.FreNodeReference}<${Names.classifier(property.type)}>${arrayType}; ${comment}`;
    }

    public static makeConvenienceMethods(list: FreConceptProperty[]): string {
        let result: string = '';
        for (const property of list) {
            if (!property.isPart) {
                const propType: string = Names.classifier(property.type);
                if (!property.isList) {
                    result += `
            /**
             * Convenience method for reference '${property.name}'.
             * Instead of returning a '${Names.FreNodeReference}<${propType}>' object,
             * it returns the referred '${propType}' object, if it can be found.
             */
            get ${Names.refName(property)}(): ${propType} {
                if (!!this.${property.name}) {
                    return this.${property.name}.referred;
                }
                return null;
            }`;
                } else {
                    result += `
            /**
             * Convenience method for reference '${property.name}'.
             * Instead of returning a list of '${Names.FreNodeReference}<${propType}>' objects, it 
             * returns a list of referred '${propType}' objects, if the references can be resolved.
             *
             * Note that when some references cannot be resolved, the length of this list is 
             * different to the length of '${property.name}'.
             */
            get ${Names.refName(property)}(): readonly ${propType}[] {
                const result: ${propType}[] = [];
                for (const $part of this.${property.name}) {
                    if (!!$part.referred) {
                        result.push($part.referred);
                    }
                }
                return result;
            }`;
                }
            }
        }
        return result;
    }

    public static makeConstructor(hasSuper: boolean, allProps: FreProperty[]): string {
        // console.log("found overriding props: " + allProps.filter(p => p.isOverriding).map(p => `${p.name} of ${p.owningClassifier.name} [${p.location?.filename}]`).join("\n\t"))
        // console.log("found NON overriding props: " + allProps.filter(p => !p.isOverriding).map(p => `${p.name} of ${p.owningClassifier.name}`).join(", "))
        const allButPrimitiveProps: FreConceptProperty[] = allProps.filter(p => !p.isPrimitive && !p.implementedInBase) as FreConceptProperty[];
        const allPrimitiveProps: FrePrimitiveProperty[] = allProps.filter(p => p.isPrimitive && !p.implementedInBase) as FrePrimitiveProperty[];

        return `constructor(id?: string) {
        ${!hasSuper ? `
                        super();
                        if (!!id) { 
                            this.$id = id;
                        } else {
                            this.$id = ${Names.FreUtils}.ID(); // uuid.v4();
                        }`
            : "super(id);"
        }
        ${allPrimitiveProps.length !== 0 ?
            `// Both 'observableprim' and 'observableprimlist' change the get and set of the attribute 
             // such that the part is observable. In lists no 'null' or 'undefined' values are allowed.
            ${allPrimitiveProps.map(p =>
                (p.isList ?
                    `observableprimlist(this, "${p.name}");
                     ${this.initializer(p)};`
                    : `observableprim(this, "${p.name}");
                       ${this.initializer(p)};`
                )                
            ).join("\n")}
                        `
            : ``
        }
        ${allButPrimitiveProps.length !== 0 ?
            `// Both 'observablepart' and 'observablepartlist' change the get and set of the attribute 
             // such that the parent-part relationship is consistently maintained, 
             // and make sure the part is observable. In lists no 'null' or 'undefined' values are allowed.
                        ${allButPrimitiveProps.map(p =>
                (p.isList ?
                        `observablepartlist(this, "${p.name}");`
                        :
                        `observablepart(this, "${p.name}");`
                )
            ).join("\n")}`
            : ``
        }                    
            }`;
    }

    public static makeBasicMethods(hasSuper: boolean, metaType: string, isModel: boolean, isUnit: boolean, isExpression: boolean, isBinaryExpression): string {
        return `                                
                /**
                 * Returns the metatype of this instance in the form of a string.
                 */               
                freLanguageConcept(): ${metaType} {
                    return this.$typename;
                }

                ${!hasSuper ? `
                /**
                 * Returns the unique identifier of this instance.
                 */                
                 freId(): string {
                    return this.$id;
                }`
            : ""}
                
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
                }`;
    }

    public static makeStaticCreateMethod(concept: FreClassifier, myName: string): string {
        return `/**
                 * A convenience method that creates an instance of this class
                 * based on the properties defined in 'data'.
                 * @param data
                 */
                static create(data: Partial<${myName}>): ${myName} {
                    const result = new ${myName}();
                    ${concept.allProperties().map(property =>
                        `${(property.isList) ?
                            `if (!!data.${property.name}) {
                                            data.${property.name}.forEach(x =>
                                                result.${property.name}.push(x)
                                            );
                                        }`
                            : `if (!!data.${property.name}) { 
                                            result.${property.name} = data.${property.name};
                                        }`
                        }`).join("\n")
                    }
                    if (!!data.parse_location) {
                        result.parse_location = data.parse_location;
                    }
                    return result;
                }`;
    }

    public static makeCopyMethod(concept: FreClassifier, myName: string, isAbstract: boolean): string {
        const comment = `/**
                 * A convenience method that copies this instance into a new object.
                 */`;
        if (isAbstract) {
            return `${comment}
                copy(): ${myName} {
                    console.log("${myName}: copy method should be implemented by concrete subclass"); 
                    return null;  
                }`;
        } else {
            return `/**
                 * A convenience method that copies this instance into a new object.
                 */
                copy(): ${myName} {
                    const result = new ${myName}();
                    ${concept.allProperties().map(property =>
                        `if (!!this.${property.name}) {
                            ${this.makeCopyProperty(property)}
                        }`).join("\n")
                    }
                    return result;  
                }`;
        }
    }

    private static makeCopyProperty(property): string {
        let result: string = "";
        if (property.isList) {
            if (property.isPrimitive) {
                result = `this.${property.name}.forEach(x =>
                        result.${property.name}.push(x)
                    );`;
            } else {
                result = `this.${property.name}.forEach(x =>
                        result.${property.name}.push(x.copy())
                    );`;
            }
        } else {
            if (property.isPrimitive) {
                result = `result.${property.name} = this.${property.name};`;
            } else {
                result = `result.${property.name} = this.${property.name}.copy();`;
            }
        }
        return result;
    }

    public static makeMatchMethod(hasSuper: boolean, concept: FreClassifier, myName: string): string {
        let propsToDo: FreProperty[] = [];
        if (hasSuper && concept instanceof FreConcept) {
            propsToDo = (concept as FreConcept).implementedProperties();
        } else if (hasSuper && concept instanceof FreInterface) {
            propsToDo = (concept as FreInterface).properties;
        } else {
            propsToDo = concept.allProperties();
        }
        return `/**
                 * Matches a partial instance of this class to this object
                 * based on the properties defined in the partial.
                 * @param toBeMatched
                 */
                public match(toBeMatched: Partial<${myName}>): boolean {
                    ${hasSuper ? `let result: boolean = super.match(toBeMatched);` : `let result: boolean = true;`}
                    ${propsToDo.map(property => 
                        `${this.makeMatchEntry(property)}`
                    ).join("\n")}
                    return result;
                }`;
    }

    private static makeMatchEntry(property: FreProperty): string {
        let result: string = '';
        if (property.isPrimitive) {
            if (property.isList) {
                // TODO here we known that matchPrimitiveList needs to be imported => add to imports
                result = `if (result && !!toBeMatched.${property.name}) {
                                result = result && matchPrimitiveList(this.${property.name}, toBeMatched.${property.name});
                          }`
            } else {
                if (property.type === FrePrimitiveType.string || property.type === FrePrimitiveType.identifier) {
                    result = `if (result && toBeMatched.${property.name} !== null && toBeMatched.${property.name} !== undefined && toBeMatched.${property.name}.length > 0) { 
                                result = result && this.${property.name} === toBeMatched.${property.name};
                          }`;
                } else {
                    result = `if (result && toBeMatched.${property.name} !== null && toBeMatched.${property.name} !== undefined) { 
                                result = result && this.${property.name} === toBeMatched.${property.name};
                          }`;
                }
            }
        } else if (property.isList) {
            if (property.isPart) {
                // TODO here we known that matchElementList needs to be imported => add to imports
                result = `if (result && !!toBeMatched.${property.name}) {
                              result = result && matchElementList(this.${property.name}, toBeMatched.${property.name});
                          }`
            } else {
                // TODO here we known that matchReferenceList needs to be imported => add to imports
                // TODO here we known that Names.classifier(property.type) needs to be imported => add to imports
                // result = `if (!!toBeMatched.${property.name}) {
                //               matchReferenceList<${Names.classifier(property.type)}>(this.${property.name}, toBeMatched.${property.name});
                //           }`
                result = `if (result && !!toBeMatched.${property.name}) {
                              result = result && matchReferenceList(this.${property.name}, toBeMatched.${property.name});
                          }`
            }
        } else {
            // same for both parts and references
            result = `if (result && !!toBeMatched.${property.name}) { 
                                result = result && this.${property.name}.match(toBeMatched.${property.name});
                            }`;
        }
        return result;
    }
}

