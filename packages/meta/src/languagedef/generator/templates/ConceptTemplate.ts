import { Names } from "../../../utils/Names";
import { PathProvider, PROJECTITCORE } from "../../../utils/PathProvider";
import {
    PiConceptProperty,
    PiPrimitiveProperty,
    PiBinaryExpressionConcept,
    PiExpressionConcept, PiConcept, PiLimitedConcept, PiProperty, PiInstance, PiPropertyInstance
} from "../../metalanguage/PiLanguage";

export class ConceptTemplate {
    constructor() {
    }

    generateConcept(concept: PiConcept, relativePath: string): string {
        const language = concept.language;
        const hasSuper = !!concept.base;
        // if(hasSuper && !(!!concept.base.referred)) console.log("ERROR in " + concept.name);
        const extendsClass = hasSuper ? Names.concept(concept.base.referred) : "MobxModelElementImpl";
        const hasName = concept.implementedPrimProperties().some(p => p.name === "name");
        const isAbstract = concept.isAbstract;
        // const hasSymbol = !!concept.symbol;
        const baseExpressionName = Names.concept(concept.language.findExpressionBase());
        const isBinaryExpression = concept instanceof PiBinaryExpressionConcept;
        const isExpression = (!isBinaryExpression) && concept instanceof PiExpressionConcept;
        const abstract = (concept.isAbstract ? "abstract" : "");
        const implementsPi = (isExpression ? "PiExpression" : (isBinaryExpression ? "PiBinaryExpression" : (hasName ? "PiNamedElement" : "PiElement")));
        const hasInterface = concept.interfaces.length > 0;
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
                    .concat(concept.allParts().map(part => part.type.name))
                    .concat(concept.allReferences().map(part => part.type.name))
                    .filter(name => !(name === concept.name))
                    .concat((concept.base ? Names.concept(concept.base.referred) : null))
                    .filter(r => r !== null)
            )
        );

        const mobxImports: string[] = ["model"];
        if (!hasSuper) {
            mobxImports.push("MobxModelElementImpl");
        }
        if (concept.implementedProperties().some(part => part.isList) ) {
            mobxImports.push("observablelistpart");
        }
        if (concept.implementedProperties().some(part => !part.isList)) {
            mobxImports.push("observablepart");
        }

        // Template starts here
        const result = `
            ${(concept.implementedPrimProperties().length > 0 ) ? `import { observable } from "mobx";` : ""}
            import * as uuid from "uuid";
            import { ${Names.PiElement}, ${Names.PiNamedElement}, ${Names.PiExpression}, ${Names.PiBinaryExpression} } from "${PROJECTITCORE}";
            import { ${mobxImports.join(",")} } from "${PROJECTITCORE}";
            import { ${Names.metaType(language)} } from "./${Names.metaType(language)}";
            import { ${Names.PiElementReference} } from "./${Names.PiElementReference}";
            ${imports.map(imp => `import { ${imp} } from "./${imp}";`).join("")}

            /**
             * Class ${Names.concept(concept)} is the implementation of the concept with the same name in the language definition file.
             * It uses mobx decorators to enable parts of the language environment, e.g. the editor, to react 
             * to changes in the state of its properties.
             */            
            @model
            export ${abstract} class ${Names.concept(concept)} extends ${extendsClass} implements ${implementsPi}${intfaces.map(imp => `, ${imp}`).join("")}
            {
                readonly $typename: ${Names.metaType(language)} = "${concept.name}";    // holds the metatype in the form of a string
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
                
                ${isBinaryExpression && binExpConcept != null ? `
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

                ${(!isAbstract) ? `
                 /**
                 * A convenience method that creates an instance of this class
                 * based on the properties defined in 'data'.
                 * @param data
                 */
                static create(data: Partial<${concept.name}>): ${concept.name} {
                    const result = new ${concept.name}();
                    ${concept.implementedProperties().map(p => this.generatePartialCreate(p)).join("\n")}
                    return result;
                }`
            : ""}
                 
                ${predefInstanceDefinitions}               
            }
            
            ${predefInstanceInitialisations.length>0 ? `
            // Because of mobx we need to generate the initialisations outside of the class,
            // otherwise the state of properties with primitive type will not be kept correctly. 
            ${predefInstanceInitialisations}` : ``}
            `;
        return result;
    }

    private generatePartialCreate(property: PiProperty): string {
        return `if (data.${property.name}) result.${property.name} = data.${property.name};`;
    }

    private generatePrimitiveProperty(property: PiPrimitiveProperty): string {
        const comment = "// implementation of " + property.name;
        const decorator = property.isList ? "@observablelistpart" : "@observable";
        const arrayType = property.isList ? "[]" : "";
        let initializer = "";
        if (property.isList) initializer = "[]";
        if (!property.isList && property.primType === "string") initializer = "\"\"";
        if (!property.isList && property.primType === "number") initializer = "0";
        if (!property.isList && property.primType === "boolean") initializer = "false";
        return `${decorator} ${property.name} : ${property.primType}${arrayType} = ${initializer}; \t${comment}`;
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
        let conceptName = limitedConcept.name;
        return `${limitedConcept.instances.map(predef =>
            `static ${predef.name}: ${conceptName}; // implementation of instance ${predef.name}`).join("\n")}
             static $piANY : ${conceptName}; // default predefined instance`
    }

    private createInstanceInitialisations(limitedConcept: PiLimitedConcept): string {
        let conceptName = limitedConcept.name;
        return `${limitedConcept.instances.map(predef =>
            `${conceptName}.${predef.name} = ${conceptName}.create(${this.createInstanceProperties(predef)})` ).join(";")}`
    }

    private createInstanceProperties(instance: PiInstance) : string {

        return `{${instance.props.map(prop => `${prop.name}: ${this.createInstancePropValue(prop)}`).join(", ")}}`;
    }

    private createInstancePropValue(property: PiPropertyInstance): string {
        let refProperty = property.property?.referred;
        if (!!refProperty && refProperty instanceof PiPrimitiveProperty) { // should always be the case
            if (refProperty.primType === "string") {
                return `"${property.value}"`;
            } else {
                return `${property.value}`;
            }
        }
        return ``;
    }
}
