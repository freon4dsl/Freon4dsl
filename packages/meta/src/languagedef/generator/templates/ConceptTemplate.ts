import { Names, PROJECTITCORE } from "../../../utils";
import {
    PiConceptProperty,
    PiPrimitiveProperty,
    PiBinaryExpressionConcept,
    PiExpressionConcept,
    PiConcept,
    PiLimitedConcept,
    PiProperty,
    PiInstance,
    PiPropertyInstance
} from "../../metalanguage";

export class ConceptTemplate {

    generateConcept(concept: PiConcept, relativePath: string): string {
        const language = concept.language;
        const hasSuper = !!concept.base;
        const hasReferences = concept.implementedReferences().length > 0;
        const extendsClass = hasSuper ? Names.concept(concept.base.referred) : "MobxModelElementImpl";
        const hasName = concept.implementedPrimProperties().some(p => p.name === "name");
        const isAbstract = concept.isAbstract;
        // const hasSymbol = !!concept.symbol;
        const baseExpressionName = Names.concept(concept.language.findExpressionBase());
        const isBinaryExpression = concept instanceof PiBinaryExpressionConcept;
        const isExpression = (!isBinaryExpression) && concept instanceof PiExpressionConcept;
        const abstract = (concept.isAbstract ? "abstract" : "");
        const implementsPi = (concept.isModel ? "PiModel" : (isExpression ? "PiExpression" : (isBinaryExpression ? "PiBinaryExpression" : (hasName ? "PiNamedElement" : "PiElement"))));
        // const hasInterface = concept.interfaces.length > 0;
        const intfaces = Array.from(
            new Set(
                concept.interfaces.map(i => Names.interface(i.referred))
            )
        );

        const predefInstanceDefinitions = (concept instanceof PiLimitedConcept ? this.createInstanceDefinitions(concept) : ``);
        const predefInstanceInitialisations = (concept instanceof PiLimitedConcept ? this.createInstanceInitialisations(concept) : ``);

        const binExpConcept: PiBinaryExpressionConcept = isBinaryExpression ? concept as PiBinaryExpressionConcept : null;

        const imports = Array.from(
            new Set(
                concept.parts().map(p => Names.classifier(p.type.referred))

                    .concat(concept.references().map(r => Names.classifier(r.type.referred)))
                    .concat(concept.interfaces.map(i => Names.interface(i.referred)))
                    .concat([baseExpressionName])
                    .concat(concept.implementedParts().map(part => Names.classifier(part.type.referred)))
                    .concat(concept.implementedReferences().map(part => Names.classifier(part.type.referred)))
                    .filter(name => !(name === Names.concept(concept)))
                    .concat((concept.base ? Names.concept(concept.base.referred) : null))
                    .filter(r => (r !== null) && (r.length > 0))
            )
        );

        const mobxImports: string[] = ["model"];
        if (!hasSuper) {
            mobxImports.push("MobxModelElementImpl");
        }
        if (concept.implementedProperties().some(part => part.isList && !part.isPrimitive) ) {
            mobxImports.push("observablelistpart");
        }
        if (concept.implementedProperties().some(part => !part.isList && !part.isPrimitive)) {
            mobxImports.push("observablepart");
        }

        // Template starts here
        const result = `
            ${(concept.implementedPrimProperties().length > 0 ) ? `import { observable } from "mobx";` : ""}
            ${!hasSuper ? `import * as uuid from "uuid";` : ``}
            import { ${implementsPi} ${concept.isModel ? `, Language` : ``} } from "${PROJECTITCORE}";
            import { ${mobxImports.join(",")} } from "${PROJECTITCORE}";
            import { ${Names.metaType(language)} } from "./${Names.metaType(language)}";
            ${concept.isModel ? `import { ${Names.allConcepts(language)} } from "./${Names.allConcepts(language)}";` : ``}
            ${hasReferences ? `import { ${Names.PiElementReference} } from "./${Names.PiElementReference}";` : ``}
            ${imports.map(imp => `import { ${imp} } from "./internal";`).join("")}

            /**
             * Class ${Names.concept(concept)} is the implementation of the concept with the same name in the language definition file.
             * It uses mobx decorators to enable parts of the language environment, e.g. the editor, to react 
             * to changes in the state of its properties.
             */            
            @model
            export ${abstract} class ${Names.concept(concept)} extends ${extendsClass} implements ${implementsPi}${intfaces.map(imp => `, ${imp}`).join("")}
            {
            
                ${(!isAbstract) ? `
                 /**
                 * A convenience method that creates an instance of this class
                 * based on the properties defined in 'data'.
                 * @param data
                 */
                static create(data: Partial<${Names.concept(concept)}>): ${Names.concept(concept)} {
                    const result = new ${Names.concept(concept)}();
                    ${concept.allProperties().map(p => this.generatePartialCreate(p)).join("\n")}
                    return result;
                }`
            : ""}
             
                ${predefInstanceDefinitions}
                            
                readonly $typename: ${Names.metaType(language)} = "${Names.concept(concept)}";    // holds the metatype in the form of a string
                ${!hasSuper ? "$id: string;" : ""}                                      // a unique identifier
                ${concept.implementedPrimProperties().map(p => this.generatePrimitiveProperty(p)).join("\n")}
                ${concept.implementedParts().map(p => this.generatePartProperty(p)).join("\n")}
                ${concept.implementedReferences().map(p => this.generateReferenceProperty(p)).join("\n")}     
                              
                constructor(id?: string) {
                    ${!hasSuper ? "super();" : "super(id);"}
                    ${!hasSuper ? `
                        if (!!id) { 
                            this.$id = id;
                        } else {
                            this.$id = uuid.v4();
                        }` : ""
                    }
                    ${concept instanceof PiBinaryExpressionConcept ? `
                    ` : ""
                    }
                }
            
                /**
                 * Returns the metatype of this instance in the form of a string.
                 */               
                piLanguageConcept(): ${Names.metaType(language)} {
                    return this.$typename;
                }

                ${!concept.base ? `
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
                    return ${concept.isModel};
                }
                
                /**
                 * Returns true if this instance is an expression concept.
                 */                 
                piIsExpression(): boolean {
                    return ${isExpression || isBinaryExpression};
                }

                /**
                 * Returns true if this instance is a binary expression concept.
                 */                 
                piIsBinaryExpression(): boolean {
                    return ${isBinaryExpression};
                }
                
                ${isBinaryExpression && binExpConcept !== null ? `
                /**
                 * Returns the priority of this expression instance.
                 * Used to balance the expression tree.
                 */ 
                piPriority(): number {
                    return ${binExpConcept.getPriority() ? binExpConcept.getPriority() : "-1"};
                }
                
                /**
                 * Returns the left element of this binary expression.
                 */ 
                public piLeft(): ${baseExpressionName} {
                    return this.left;
                }

                /**
                 * Returns the right element of this binary expression.
                 */                 
                public piRight(): ${baseExpressionName} {
                    return this.right;
                }

                /**
                 * Sets the left element of this binary expression.
                 */                 
                public piSetLeft(value: ${baseExpressionName}): void {
                    this.left = value;
                }

                /**
                 * Sets the right element of this binary expression.
                 */                 
                public piSetRight(value: ${baseExpressionName}): void {
                    this.right = value;
                }
                `
            : ""}

                ${(concept.isModel) ? `
                 /**
                 * A convenience method that finds a unit of this model based on its name and 'metatype'.
                 * @param name
                 * @param metatype
                 */
                findUnit(name: string, metatype?: ${Names.metaType(language)} ): ${Names.allConcepts(language)} {
                    let result: ${Names.allConcepts(language)} = null;
                    ${concept.parts().map(p => this.generatefindUnit(p)).join("\n")}
                    if (!!result && !!metatype) {
                        const myMetatype = result.piLanguageConcept();
                        if (myMetatype === metatype || Language.getInstance().subConcepts(metatype).includes(myMetatype)) {
                            return result;
                        }
                    } else {
                        return result;
                    }                    
                    return null;
                }               
                    
                /**
                 * Replaces a model unit by a new one. Used for swapping between complete units and unit public interfaces.
                 * Returns false if the replacement could not be done, e.g. because 'oldUnit' is not a child of this object.
                 * @param oldUnit
                 * @param newUnit
                 */
                replaceUnit(oldUnit: ${Names.allConcepts(language)}, newUnit: ${Names.allConcepts(language)}): boolean {
                    if ( oldUnit.piLanguageConcept() !== newUnit.piLanguageConcept()) {
                        return false;
                    }
                    if ( oldUnit.piContainer().container !== this) {
                        return false;
                    }
                    // we must store the interface in the same place as the old unit, which info is held in PiContainer()
                    // TODO review this approach
                    ${concept.parts().map(part =>
                    `if ( oldUnit.piLanguageConcept() === "${Names.classifier(part.type.referred)}" && oldUnit.piContainer().propertyName === "${part.name}" ) {
                        ${part.isList ?
                        `const index = this.${part.name}.indexOf(oldUnit as ${Names.classifier(part.type.referred)});
                        this.${part.name}.splice(index, 1, newUnit as ${Names.classifier(part.type.referred)});`
                        :
                        `this.${part.name} = newUnit as ${Names.classifier(part.type.referred)};`}
                    } else`
                    ).join(" ")}                    
                    {
                        return false;
                    }
            
                    // TODO maybe this is better?
                    // if (oldUnit.piContainer().propertyIndex > -1) { // it is a list
                    //     this[oldUnit.piContainer().propertyName].splice(oldUnit.piContainer().propertyIndex, 1, newUnit);
                    // } else {
                    //     this[oldUnit.piContainer().propertyName] = newUnit;
                    // }
                    return  true;
                }
                
                    /**
                     * Adds a model unit. Returns false if anything goes wrong.
                     *
                     * @param newUnit
                     */
                    addUnit(newUnit: ${Names.allConcepts(language)}): boolean {
                        const myMetatype = newUnit.piLanguageConcept();
                        // TODO this depends on the fact the only one part of the model concept has the same type, should we allow differently???
                        switch (myMetatype) {
                        ${language.modelConcept.allParts().map(part =>
                            `case "${Names.classifier(part.type.referred)}": {
                                ${part.isList ? `this.${part.name}.push(newUnit as ${Names.classifier(part.type.referred)});` : `this.${part.name} = newUnit as ${Names.classifier(part.type.referred)}`}
                                return true;
                            }`).join("\n")}
                        }
                        return false;                 
                    }`
            : ""}        
            }
            
            ${predefInstanceInitialisations.length > 0 ? `
            // Because of mobx we need to generate the initialisations outside of the class,
            // otherwise the state of properties with primitive type will not be kept correctly. 
            ${predefInstanceInitialisations}` : ``}
            `;
        return result;
    }

    private generatePartialCreate(property: PiProperty): string {
        if (property.isList && !(property instanceof PiPrimitiveProperty)) {
            // TODO remove this hack, when the decorators are improved
            return `if (data.${property.name}) {
                data.${property.name}.forEach(x =>
                    result.${property.name}.push(x)
                );
            }`;
        } else {
            return `if (data.${property.name}) { 
                result.${property.name} = data.${property.name};
            }`;
        }
    }

    private generatePrimitiveProperty(property: PiPrimitiveProperty): string {
        const comment = "// implementation of " + property.name;
        // const decorator = property.isList ? "@observablelistpart" : "@observable";
        const decorator = "@observable";
        const arrayType = property.isList ? "[]" : "";
        let initializer = "";
        if (property.isList) {
            initializer = "";
        } else {
            switch (property.primType) {
                case "string": {
                    initializer = "= \"\"";
                    break;
                }
                case "number": {
                    initializer = "= 0";
                    break;
                }
                case "boolean": {
                    initializer = "= false";
                    break;
                }
            }
        }
        return `${decorator} ${property.name} : ${property.primType}${arrayType} ${initializer}; \t${comment}`;
    }

    private generatePartProperty(property: PiConceptProperty): string {
        const comment = "// implementation of " + property.name;
        const decorator = property.isList ? "@observablelistpart" : "@observablepart";
        const arrayType = property.isList ? "[]" : "";
        const initializer = "";
        return `${decorator} ${property.name} : ${Names.classifier(property.type.referred)}${arrayType} ${initializer}; ${comment}`;
    }

    private generateReferenceProperty(property: PiConceptProperty): string {
        const comment = "// implementation of " + property.name;
        const decorator = property.isList ? "@observablelistpart" : "@observablepart";
        const arrayType = property.isList ? "[]" : "";
        return `${decorator} ${property.name} : PiElementReference<${Names.classifier(property.type.referred)}>${arrayType}; ${comment}`;
    }

    private createInstanceDefinitions(limitedConcept: PiLimitedConcept): string {
        const conceptName = Names.concept(limitedConcept);
        return `${limitedConcept.instances.map(predef =>
            `static ${predef.name}: ${conceptName}; // implementation of instance ${predef.name}`).join("\n")}
             static $piANY : ${conceptName}; // default predefined instance`;
    }

    private createInstanceInitialisations(limitedConcept: PiLimitedConcept): string {
        const conceptName = Names.concept(limitedConcept);
        return `${limitedConcept.instances.map(predef =>
            `${conceptName}.${predef.name} = ${conceptName}.create(${this.createInstanceProperties(predef)});` ). join(" ")}`;
    }

    private createInstanceProperties(instance: PiInstance): string {
        return `{${instance.props.map(prop => `${prop.name}: ${this.createInstancePropValue(prop)}`).join(", ")}}`;
    }

    private createInstancePropValue(property: PiPropertyInstance): string {
        const refProperty: PiProperty = property.property?.referred;
        if (!!refProperty && refProperty instanceof PiPrimitiveProperty) { // should always be the case
            const type: string = refProperty.primType;
            if (refProperty.isList) {
                return `[ ${property.valueList.map(value =>
                    `${type === "string" ? `"${value}"` : `${value}` }`
                ).join(", ")} ]`;
            } else {
                return `${type === "string" ? `"${property.value}"` : `${property.value}` }`;
            }
        }
        return ``;
    }

    private generatefindUnit(p: PiConceptProperty): string {
        // prettier removes inner brackets from "(! (!!result) )"
        // therefore we take another approach here
        return `if (result !== null) {
        ${p.isList ?
        `result = this.${p.name}.find(mod => mod.name === name);`
        :
        `if (this.${p.name}.name === name ) result = this.${p.name}`}
        }`;
    }
}
