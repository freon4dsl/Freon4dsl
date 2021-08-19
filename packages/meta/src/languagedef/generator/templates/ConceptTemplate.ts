import { Names } from "../../../utils";
import {
    PiPrimitiveProperty,
    PiBinaryExpressionConcept,
    PiExpressionConcept,
    PiConcept,
    PiLimitedConcept,
    PiProperty,
    PiPropertyInstance
} from "../../metalanguage";
import {
    findMobxImports,
    makeBasicMethods,
    makeBasicProperties,
    makeConstructor,
    makeImportStatements,
    makePartProperty,
    makePrimitiveProperty,
    makeReferenceProperty
} from "./ConceptUtils";

export class ConceptTemplate {

    generateConcept(concept: PiConcept): string {
        if (concept.isModel) {
            return this.generateModel(concept);
        } else if (concept.isUnit) {
            return this.generateUnit(concept);
        } else if (concept instanceof PiLimitedConcept) {
            return this.generateLimited(concept);
        } else if (concept instanceof PiBinaryExpressionConcept) {
            return this.generateBinaryExpression(concept);
        } else {
            return this.generateConceptPrivate(concept);
        }
    }

    private generateConceptPrivate(concept: PiConcept): string {
        const language = concept.language;
        const myName = Names.concept(concept);
        const hasSuper = !!concept.base;
        const hasReferences = concept.implementedReferences().length > 0;
        const extendsClass = hasSuper ? Names.concept(concept.base.referred) : "MobxModelElementImpl";
        const isAbstract = concept.isAbstract;
        const isExpression = (concept instanceof PiBinaryExpressionConcept) || (concept instanceof PiExpressionConcept);
        const abstract = (concept.isAbstract ? "abstract" : "");
        const hasName = concept.implementedPrimProperties().some(p => p.name === "name");
        const implementsPi = (isExpression ? "PiExpression" : (hasName ? "PiNamedElement" : "PiElement"));
        const needsObservable = concept.implementedPrimProperties().length > 0;
        const coreImports = findMobxImports(hasSuper, concept).concat(implementsPi).concat("PiUtils");
        const metaType = Names.metaType(language);
        const modelImports = this.findModelImports(concept, myName, hasReferences);
        const intfaces = Array.from(
            new Set(
                concept.interfaces.map(i => Names.interface(i.referred))
            )
        );

        // Template starts here
        return `
            ${makeImportStatements(hasSuper, needsObservable, coreImports, modelImports)}

            /**
             * Class ${myName} is the implementation of the concept with the same name in the language definition file.
             * It uses mobx decorators to enable parts of the language environment, e.g. the editor, to react 
             * to changes in the state of its properties.
             */            
            @model
            export ${abstract} class ${myName} extends ${extendsClass} implements ${implementsPi}${intfaces.map(imp => `, ${imp}`).join("")}
            {
                ${(!isAbstract) ? `${this.makeStaticCreateMethod(concept, myName)}`
                : ""}
                            
                ${makeBasicProperties(metaType, myName, hasSuper)}
                ${concept.implementedPrimProperties().map(p => makePrimitiveProperty(p)).join("\n")}
                ${concept.implementedParts().map(p => makePartProperty(p)).join("\n")}
                ${concept.implementedReferences().map(p => makeReferenceProperty(p)).join("\n")}     
                              
                ${makeConstructor(hasSuper, concept.implementedProperties())}
                ${makeBasicMethods(hasSuper, metaType,false, false, isExpression, false)}                                   
            }
        `;
    }

    // assumptions:
    // an expression is not a model
    private generateBinaryExpression(concept: PiBinaryExpressionConcept) {
        const language = concept.language;
        const myName = Names.concept(concept);
        const hasSuper = !!concept.base;
        const hasReferences = concept.implementedReferences().length > 0;
        const extendsClass = hasSuper ? Names.concept(concept.base.referred) : "MobxModelElementImpl";
        const isAbstract = concept.isAbstract;
        const baseExpressionName = Names.concept(concept.language.findExpressionBase());
        const abstract = concept.isAbstract ? "abstract" : "";
        const needsObservable = concept.implementedPrimProperties().length > 0;
        const coreImports = findMobxImports(hasSuper, concept).concat(["PiBinaryExpression", "PiUtils"]);
        const metaType = Names.metaType(language);
        let modelImports = this.findModelImports(concept, myName, hasReferences);
        if (!modelImports.includes(baseExpressionName)) {
            modelImports = modelImports.concat(baseExpressionName);
        }
        const intfaces = Array.from(
            new Set(
                concept.interfaces.map(i => Names.interface(i.referred))
            )
        );

        // Template starts here
        return `
            ${makeImportStatements(hasSuper, needsObservable, coreImports, modelImports)}

            /**
             * Class ${myName} is the implementation of the binary expression concept with the same name in the language definition file.
             * It uses mobx decorators to enable parts of the language environment, e.g. the editor, to react 
             * to changes in the state of its properties.
             */            
            @model
            export ${abstract} class ${myName} extends ${extendsClass} implements PiBinaryExpression${intfaces.map(imp => `, ${imp}`).join("")} {            
                ${(!isAbstract) ? `${this.makeStaticCreateMethod(concept, myName)}`
                : ""}
                            
                ${makeBasicProperties(metaType, myName, hasSuper)}
                ${concept.implementedPrimProperties().map(p => makePrimitiveProperty(p)).join("\n")}
                ${concept.implementedParts().map(p => makePartProperty(p)).join("\n")}
                ${concept.implementedReferences().map(p => makeReferenceProperty(p)).join("\n")}     
                              
                ${makeConstructor(hasSuper, concept.implementedProperties())}
                ${makeBasicMethods(hasSuper, metaType,false, false,true, true)}                    
                
                /**
                 * Returns the priority of this expression instance.
                 * Used to balance the expression tree.
                 */ 
                piPriority(): number {
                    return ${concept.getPriority() ? concept.getPriority() : "-1"};
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
            }
        `;
    }


// the folowing template is based on assumptions about a limited concept.
    // a limited has a name property
    // a limited is not an expression ???
    // a limited does not have any non-prim properties
    // a limited does not have any references
    // the base of a limited is also a limited
    private generateLimited(concept: PiLimitedConcept): string {
        const language = concept.language;
        const myName = Names.concept(concept);
        const hasSuper = !!concept.base;
        const extendsClass = hasSuper ? Names.concept(concept.base.referred) : "MobxModelElementImpl";
        const abstract = (concept.isAbstract ? "abstract" : "");
        const needsObservable = concept.implementedPrimProperties().length > 0;
        const coreImports = findMobxImports(hasSuper, concept).concat(["PiNamedElement", "PiUtils"]);
        const metaType = Names.metaType(language);
        const imports = this.findModelImports(concept, myName, false);
        const intfaces = Array.from(
            new Set(
                concept.interfaces.map(i => Names.interface(i.referred))
            )
        );

        // Template starts here
        return `
            ${makeImportStatements(hasSuper, needsObservable, coreImports, imports)}

            /**
             * Class ${myName} is the implementation of the limited concept with the same name in the language definition file.
             * It uses mobx decorators to enable parts of the language environment, e.g. the editor, to react 
             * to changes in the state of its properties.
             */            
            @model
            export ${abstract} class ${myName} extends ${extendsClass} implements PiNamedElement${intfaces.map(imp => `, ${imp}`).join("")}
            {           
                ${(!concept.isAbstract) ? `${this.makeStaticCreateMethod(concept, myName)}`
                : ""}
             
                ${concept.instances.map(predef =>
                    `static ${predef.name}: ${myName};  // implementation of instance ${predef.name}`).join("\n")}
                     static $piANY : ${myName};         // default predefined instance
                            
                ${makeBasicProperties(metaType, myName, hasSuper)}
                ${concept.implementedPrimProperties().map(p => makePrimitiveProperty(p)).join("\n")}

                ${makeConstructor(hasSuper, concept.implementedProperties())}
                ${makeBasicMethods(hasSuper, metaType,false, false,false, false)}                
            }
                       
            // Because of mobx we need to generate the initialisations outside of the class,
            // otherwise the state of properties with primitive type will not be kept correctly. 
            ${concept.instances.map(predef =>
                `${myName}.${predef.name} = ${myName}.create({
                        ${predef.props.map(prop => `${prop.name}: ${this.createInstancePropValue(prop)}`).join(", ")}
                    });` ). join(" ")}`;
    }

    // the following template is based on assumptions about a 'unit' (i.e. a concept
    // with concept.isUnit === true.
    // a unit has a name property
    // a unit is not an expression
    private generateUnit(concept: PiConcept) {
        const language = concept.language;
        const myName = Names.concept(concept);
        const hasSuper = !!concept.base;
        const hasReferences = concept.implementedReferences().length > 0;
        const extendsClass = hasSuper ? Names.concept(concept.base.referred) : "MobxModelElementImpl";
        const abstract = (concept.isAbstract ? "abstract" : "");
        const needsObservable = concept.implementedPrimProperties().length > 0;
        const coreImports = findMobxImports(hasSuper, concept).concat(["PiNamedElement", "PiUtils"]);
        const metaType = Names.metaType(language);
        const imports = this.findModelImports(concept, myName, hasReferences);
        const intfaces = Array.from(
            new Set(
                concept.interfaces.map(i => Names.interface(i.referred))
            )
        );

        // Template starts here
        return `
            ${makeImportStatements(hasSuper, needsObservable, coreImports, imports)}
            
            /**
             * Class ${myName} is the implementation of the model unit with the same name in the language definition file.
             * It uses mobx decorators to enable parts of the language environment, e.g. the editor, to react 
             * to changes in the state of its properties.
             */            
            @model
            export ${abstract} class ${myName} extends ${extendsClass} implements PiNamedElement${intfaces.map(imp => `, ${imp}`).join("")} {
            
                ${(!concept.isAbstract) ? `${this.makeStaticCreateMethod(concept, myName)}`
                : ""}
                                        
                ${makeBasicProperties(metaType, myName, hasSuper)}
                ${concept.implementedPrimProperties().map(p => makePrimitiveProperty(p)).join("\n")}
                ${concept.implementedParts().map(p => makePartProperty(p)).join("\n")}
                ${concept.implementedReferences().map(p => makeReferenceProperty(p)).join("\n")}     
            
                ${makeConstructor(hasSuper, concept.implementedProperties())}
                ${makeBasicMethods(hasSuper, metaType,false, true,false, false)}                
            }
            `;
    }

    // the folowing template is based on assumptions about a 'model'(i.e. a concept
    // with concept.isModel === true.
    // a model is not abstract
    // a model is not an expression
    // a model is not a modelunit
    // a model may not have a superclass
    // a model may not implement any interfaces
    private generateModel(concept: PiConcept): string {
        const language = concept.language;
        const myName = Names.concept(concept);
        const hasReferences = concept.implementedReferences().length > 0;
        const needsObservable = concept.implementedPrimProperties().length > 0;
        const coreImports = findMobxImports(false, concept).concat(["PiModel", "Language", "PiUtils"]);
        const metaType = Names.metaType(language);
        const imports = this.findModelImports(concept, myName, hasReferences);

        // Template starts here
        return `
            ${makeImportStatements(false, needsObservable, coreImports, imports)}
            import { ${Names.allConcepts(language)}, ${Names.modelunit(language)} } from "./${Names.allConcepts(language)}";
            
            /**
             * Class ${myName} is the implementation of the model with the same name in the language definition file.
             * It uses mobx decorators to enable parts of the language environment, e.g. the editor, to react 
             * to changes in the state of its properties.
             */            
            @model
            export class ${myName} extends MobxModelElementImpl implements PiModel {     
            
                ${this.makeStaticCreateMethod(concept, myName)}
                                      
                ${makeBasicProperties(metaType, myName, false)}
                ${concept.implementedPrimProperties().map(p => makePrimitiveProperty(p)).join("\n")}
                ${concept.implementedParts().map(p => makePartProperty(p)).join("\n")}
                ${concept.implementedReferences().map(p => makeReferenceProperty(p)).join("\n")}     

                ${makeConstructor(false, concept.implementedProperties())}            
                ${makeBasicMethods(false, metaType,true, false,false, false)}
                
                /**
                 * A convenience method that finds a unit of this model based on its name and 'metatype'.
                 * @param name
                 * @param metatype
                 */
                findUnit(name: string, metatype?: ${metaType} ): ${Names.modelunit(language)} {
                    let result: ${Names.modelunit(language)} = null;
                    ${concept.parts().map(p => 
                        `${p.isList ?
                            `result = this.${p.name}.find(mod => mod.name === name);`
                        :
                            `if (this.${p.name}.name === name ) result = this.${p.name}`
                        }`
                        ).join("\n")}
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
                replaceUnit(oldUnit: ${Names.modelunit(language)}, newUnit: ${Names.modelunit(language)}): boolean {
                    if ( oldUnit.piLanguageConcept() !== newUnit.piLanguageConcept()) {
                        return false;
                    }
                    if ( oldUnit.piContainer().container !== this) {
                        return false;
                    }
                    // we must store the interface in the same place as the old unit, which info is held in PiContainer()
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
                    return  true;
                }
                
                    /**
                     * Adds a model unit. Returns false if anything goes wrong.
                     *
                     * @param newUnit
                     */
                    addUnit(newUnit: ${Names.modelunit(language)}): boolean {
                        if (!!newUnit) {
                            const myMetatype = newUnit.piLanguageConcept();
                            // TODO this depends on the fact the only one part of the model concept has the same type, should we allow differently???
                            switch (myMetatype) {
                            ${language.modelConcept.allParts().map(part =>
                                `case "${Names.classifier(part.type.referred)}": {
                                    ${part.isList ? 
                                        `this.${part.name}.push(newUnit as ${Names.classifier(part.type.referred)});` 
                                    : 
                                        `this.${part.name} = newUnit as ${Names.classifier(part.type.referred)}`
                                    }
                                    return true;
                                }`).join("\n")}
                            }
                        }
                        return false;                 
                    }
                    
                    /**
                     * Removes a model unit. Returns false if anything goes wrong.
                     *
                     * @param oldUnit
                     */
                    removeUnit(oldUnit: ${Names.modelunit(language)}): boolean {
                        if (!!oldUnit) {
                            const myMetatype = oldUnit.piLanguageConcept();
                            switch (myMetatype) {
                            ${language.modelConcept.allParts().map(part =>
                                `case "${Names.classifier(part.type.referred)}": {
                                    ${part.isList ?
                                        `this.${part.name}.splice(this.${part.name}.indexOf(oldUnit as ${Names.classifier(part.type.referred)}), 1);`
                                    :
                                        `this.${part.name} = null;`
                                    }
                                    return true;
                                }`).join("\n")}
                            }
                        } 
                        return false;
                    }
                    
                /** 
                 * Returns an empty model unit of type 'unitTypeName' within 'model'. 
                 * 
                 * @param model
                 * @param unitTypeName
                 */
                newUnit(typename: ${Names.metaType(language)}) : ${Names.modelunit(language)}  {
                    switch (typename) {
                        ${language.modelConcept.allParts().map(part =>
                            `case "${Names.classifier(part.type.referred)}": {
                                const unit: ${Names.classifier(part.type.referred)} = new ${Names.classifier(part.type.referred)}();
                                    ${part.isList ? 
                                        `this.${part.name}.push(unit as ${Names.classifier(part.type.referred)});` 
                                    : 
                                        `this.${part.name} = unit as ${Names.classifier(part.type.referred)}`
                                    }
                                    return unit;
                                }`
                        ).join("\n")
                        }
                    }
                    return null;
                } 
                                    
                    /**
                     * Returns a list of model units.
                     */
                    getUnits(): ${Names.modelunit(language)}[] {
                        let result : ${Names.modelunit(language)}[] = [];
                        ${language.modelConcept.allParts().map(part =>
                            `${part.isList ?
                                `result = result.concat(this.${part.name});`
                                :
                                `result.push(this.${part.name});`
                            }`).join("\n")}
                        return result;
                    }
                    
                    /**
                     * Returns a list of model units of type 'type'.
                     */
                    getUnitsForType(type: string): ${Names.modelunit(language)}[] {
                        switch (type) {
                        ${language.modelConcept.allParts().map(part =>
                            `${part.isList ?
                                `case "${part.type.referred.name}": {
                                    return this.${part.name};
                                }`
                                : 
                                `case "${part.type.referred.name}": {
                                    let result : ${Names.modelunit(language)}[] = [];
                                    result.push(this.${part.name});
                                    return result;
                                }`
                             }`).join("\n")}
                        }
                        return [];
                    }
                }`;
    }

    private makeStaticCreateMethod(concept: PiConcept, myName: string): string {
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

    private findModelImports(concept: PiConcept, myName: string, hasReferences: boolean): string[] {
        return Array.from(
            new Set(
                concept.interfaces.map(i => Names.interface(i.referred))
                    .concat((concept.base ? Names.concept(concept.base.referred) : null))
                    .concat(concept.implementedParts().map(part => Names.classifier(part.type.referred)))
                    .concat(concept.implementedReferences().map(part => Names.classifier(part.type.referred)))
                    .concat(Names.metaType(concept.language))
                    .concat(hasReferences ? (Names.PiElementReference) : null)
                    .filter(name => !(name === myName))
                    .filter(r => (r !== null) && (r.length > 0))
            )
        );
    }

    // TODO weave the next method into the template for limited concepts
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
}
