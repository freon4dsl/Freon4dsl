import { Names, PROJECTITCORE, GenerationUtil } from "../../../utils";
import {
    PiClassifier,
    PiConcept,
    PiConceptProperty,
    PiPrimitiveProperty,
    PiProperty,
    PiPrimitiveType,
    PiInterface
} from "../../metalanguage";
import * as console from "console";

export class ConceptUtils {

    public static findMobxImports(hasSuper: boolean, concept: PiConcept): string[] {
        const mobxImports: string[] = [];
        if (!hasSuper) {
            mobxImports.push("MobxModelElementImpl");
        }
        if (concept.implementedProperties().some(part => part.isList && !part.isPrimitive)) {
            mobxImports.push("observablelistpart");
        }
        if (concept.implementedProperties().some(part => !part.isList && !part.isPrimitive)) {
            mobxImports.push("observablepart");
        }
        return mobxImports;
    }

    public static makeImportStatements(needsObservable: boolean, importsFromCore: string[], modelImports: string[]): string {
        // TODO remove or change the import for MatchUtil
        return `
            ${needsObservable ? `import { observable, makeObservable } from "mobx";` : ""}            
            import { ${importsFromCore.join(",")} } from "${PROJECTITCORE}";
            import { ${modelImports.join(", ")} } from "./internal";
            import { MatchUtil } from "../../utils/gen";
            `;
    }

    public static makeBasicProperties(metaType: string, conceptName: string, hasSuper: boolean): string {
        return `readonly $typename: ${metaType} = "${conceptName}";    // holds the metatype in the form of a string
                ${!hasSuper ? "$id: string;     // a unique identifier" : ""}    `;
    }

    public static makePrimitiveProperty(property: PiPrimitiveProperty): string {
        const comment = "// implementation of " + property.name;
        const arrayType = property.isList ? "[]" : "";
        let initializer = "";
        const myType: PiClassifier = property.type;
        if (!property.isList) {
            switch (myType) {
                case PiPrimitiveType.identifier: {
                    initializer = `= \"${property.initialValue ? property.initialValue : ``}\"`;
                    break;
                }
                case PiPrimitiveType.string: {
                    initializer = `= \"${property.initialValue ? property.initialValue : ``}\"`;
                    break;
                }
                case PiPrimitiveType.number: {
                    initializer = `= ${property.initialValue ? property.initialValue : `0`}`;
                    break;
                }
                case PiPrimitiveType.boolean: {
                    initializer = `= ${property.initialValue ? property.initialValue : `false`}`;
                    break;
                }
            }
        } else {
            if (!!property.initialValueList) {
                if (myType === PiPrimitiveType.string || myType === PiPrimitiveType.identifier) {
                    initializer = `= [${property.initialValueList.map(elem => `\"${elem}\"`).join(", ")}]`;
                } else {
                    initializer = `= [${property.initialValueList}]`;
                }
            } else {
                initializer = "= []";
            }
        }
        return `${property.name} : ${GenerationUtil.getBaseTypeAsString(property)}${arrayType} ${initializer}; \t${comment}`;
    }

    public static makePartProperty(property: PiConceptProperty): string {
        const comment = "// implementation of part '" + property.name + "'";
        const arrayType = property.isList ? "[]" : "";
        return `${property.name} : ${Names.classifier(property.type)}${arrayType}; ${comment}`;
    }

    public static makeReferenceProperty(property: PiConceptProperty): string {
        const comment = "// implementation of reference '" + property.name + "'";
        const arrayType = property.isList ? "[]" : "";
        return `${property.name} : PiElementReference<${Names.classifier(property.type)}>${arrayType}; ${comment}`;
    }

    public static makeConvenienceMethods(list: PiConceptProperty[]): string {
        let result: string = '';
        for (const property of list) {
            if (!property.isPart) {
                const propType: string = Names.classifier(property.type);
                if (!property.isList) {
                    result += `
            /**
             * Convenience method for reference '${property.name}'.
             * Instead of returning a 'PiElementReference<${propType}>' object,
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
             * Instead of returning a list of 'PiElementReference<${propType}>' objects, it 
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

    public static makeConstructor(hasSuper: boolean, allProps: PiProperty[]): string {
        // console.log("found overriding props: " + allProps.filter(p => p.isOverriding).map(p => `${p.name} of ${p.owningClassifier.name} [${p.location?.filename}]`).join("\n\t"))
        // console.log("found NON overriding props: " + allProps.filter(p => !p.isOverriding).map(p => `${p.name} of ${p.owningClassifier.name}`).join(", "))
        const allButPrimitiveProps: PiConceptProperty[] = allProps.filter(p => !p.isPrimitive && !p.implementedInBase) as PiConceptProperty[];
        const allPrimitiveProps: PiPrimitiveProperty[] = allProps.filter(p => p.isPrimitive && !p.implementedInBase) as PiPrimitiveProperty[];
        return `constructor(id?: string) {
                    ${!hasSuper ? `
                        super();
                        if (!!id) { 
                            this.$id = id;
                        } else {
                            this.$id = PiUtils.ID(); // uuid.v4();
                        }`
            : "super(id);"
        }
                    ${allPrimitiveProps.length !== 0 ?
            `${allPrimitiveProps.map(p =>
                (p.isList ?
                        `makeObservable(this, {"${p.name}": observable})` :
                        `makeObservable(this, {"${Names.primitivePropertyField(p)}": observable})`
                )
            ).join("\n")}
                        `
            : ``
        }
                    ${allButPrimitiveProps.length !== 0 ?
            `// both 'observablepart' and 'observablelistpart' change the get and set of an attribute 
                        // such that the parent-part relationship is consistently maintained, 
                        // and make sure the part is observable
                        ${allButPrimitiveProps.map(p =>
                (p.isList ?
                        `observablelistpart(this, "${p.name}");`
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
                piLanguageConcept(): ${metaType} {
                    return this.$typename;
                }

                ${!hasSuper ? `
                /**
                 * Returns the unique identifier of this instance.
                 */                
                 piId(): string {
                    return this.$id;
                }`
            : ""}
                
                /**
                 * Returns true if this instance is a model concept.
                 */                 
                piIsModel(): boolean {
                    return ${isModel};
                }
                
                /**
                 * Returns true if this instance is a model unit.
                 */                 
                piIsUnit(): boolean {
                    return ${isUnit};
                }
                                
                /**
                 * Returns true if this instance is an expression concept.
                 */                 
                piIsExpression(): boolean {
                    return ${isExpression};
                }

                /**
                 * Returns true if this instance is a binary expression concept.
                 */                 
                piIsBinaryExpression(): boolean {
                    return ${isBinaryExpression};
                }`;
    }

    public static makeStaticCreateMethod(concept: PiClassifier, myName: string): string {
        return `/**
                 * A convenience method that creates an instance of this class
                 * based on the properties defined in 'data'.
                 * @param data
                 */
                static create(data: Partial<${myName}>): ${myName} {
                    const result = new ${myName}();
                    ${concept.allProperties().map(property =>
            `${(property.isList && !(property instanceof PiPrimitiveProperty)) ?
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
                    return result;
                }`;
    }

    public static makeMatchMethod(hasSuper: boolean, concept: PiClassifier, myName: string): string {
        let propsToDo: PiProperty[] = [];
        if (hasSuper && concept instanceof PiConcept) {
            propsToDo = (concept as PiConcept).implementedProperties();
        } else if (hasSuper && concept instanceof PiInterface) {
            propsToDo = (concept as PiInterface).properties;
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

    private static makeMatchEntry(property: PiProperty): string {
        let result: string = '';
        if (property.isPrimitive) {
            if (property.isList) {
                // TODO here we known that matchPrimitiveList needs to be imported => add to imports
                result = `if (result && !!toBeMatched.${property.name}) {
                                result = result && matchPrimitiveList(this.primListIdentifier, toBeMatched.primListIdentifier);
                          }`
            } else {
                if (property.type === PiPrimitiveType.string || property.type === PiPrimitiveType.identifier) {
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
                // TODO here we known that MatchUtil.matchReferenceList needs to be imported => add to imports
                // TODO here we known that Names.classifier(property.type) needs to be imported => add to imports
                // result = `if (!!toBeMatched.${property.name}) {
                //               MatchUtil.matchReferenceList<${Names.classifier(property.type)}>(this.${property.name}, toBeMatched.${property.name});
                //           }`
                result = `if (result && !!toBeMatched.${property.name}) {
                              result = result && MatchUtil.matchReferenceList(this.${property.name}, toBeMatched.${property.name});
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

