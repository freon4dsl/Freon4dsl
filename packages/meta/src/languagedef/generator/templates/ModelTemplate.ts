import { Names, PROJECTITCORE } from "../../../utils";
import { ConceptUtils } from "./ConceptUtils";
import { PiModelDescription } from "../../metalanguage/PiLanguage";

export class ModelTemplate {
    // Note: a model may not have other properties than units
    public generateModel(modelDescription: PiModelDescription): string {
        const language = modelDescription.language;
        const myName = Names.classifier(modelDescription);
        const extendsClass = "MobxModelElementImpl";
        const coreImports = this.findMobxImports(modelDescription).concat(["PiModel", "Language", "PiUtils", "PiParseLocation", "matchElementList"]);
        const modelImports = this.findModelImports(modelDescription, myName);
        const metaType = Names.metaType(language);

        // Template starts here
        return `
            import { ${coreImports.join(",")} } from "${PROJECTITCORE}";
            import { ${Names.modelunit(language)}, ${modelImports.join(", ")} } from "./internal";
            
            /**
             * Class ${myName} is the implementation of the model with the same name in the language definition file.
             * It uses mobx decorators to enable parts of the language environment, e.g. the editor, to react 
             * to changes in the state of its properties.
             */            
            export class ${myName} extends ${extendsClass} implements PiModel {     
            
                ${ConceptUtils.makeStaticCreateMethod(modelDescription, myName)}
                                      
                ${ConceptUtils.makeBasicProperties(metaType, myName, false)}
                ${modelDescription.primProperties.map(p => ConceptUtils.makePrimitiveProperty(p)).join("\n")}
                ${modelDescription.parts().map(p => ConceptUtils.makePartProperty(p)).join("\n")}

                ${ConceptUtils.makeConstructor(false, modelDescription.properties)}            
                ${ConceptUtils.makeBasicMethods(false, metaType,true, false,false, false)}
                ${ConceptUtils.makeCopyMethod(modelDescription, myName, false)}
                ${ConceptUtils.makeMatchMethod(false, modelDescription, myName)}
                
                /**
                 * A convenience method that finds a unit of this model based on its name and 'metatype'.
                 * @param name
                 * @param metatype
                 */
                findUnit(name: string, metatype?: ${metaType} ): ${Names.modelunit(language)} {
                    let result: ${Names.modelunit(language)} = null;
                    ${modelDescription.parts().map(p =>
            `${p.isList ?
                `result = this.${p.name}.find(mod => mod.name === name);`
                :
                `if (this.${p.name}.name === name ) result = this.${p.name}`
            }`
        ).join("\n")}
                    if (!!result && !!metatype) {
                        if (Language.getInstance().metaConformsToType(result, metatype)) {
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
                    if ( oldUnit.piOwnerDescriptor().owner !== this) {
                        return false;
                    }
                    // we must store the interface in the same place as the old unit, which info is held in PiContainer()
                    ${modelDescription.parts().map(part =>
            `if ( oldUnit.piLanguageConcept() === "${Names.classifier(part.type)}" && oldUnit.piOwnerDescriptor().propertyName === "${part.name}" ) {
                                ${part.isList ?
                `const index = this.${part.name}.indexOf(oldUnit as ${Names.classifier(part.type)});
                                this.${part.name}.splice(index, 1, newUnit as ${Names.classifier(part.type)});`
                :
                `this.${part.name} = newUnit as ${Names.classifier(part.type)};`}
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
                            switch (myMetatype) {
                            ${language.modelConcept.allParts().map(part =>
            `case "${Names.classifier(part.type)}": {
                                    ${part.isList ?
                `this.${part.name}.push(newUnit as ${Names.classifier(part.type)});`
                :
                `this.${part.name} = newUnit as ${Names.classifier(part.type)}`
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
            `case "${Names.classifier(part.type)}": {
                                    ${part.isList ?
                `this.${part.name}.splice(this.${part.name}.indexOf(oldUnit as ${Names.classifier(part.type)}), 1);`
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
            `case "${Names.classifier(part.type)}": {
                                const unit: ${Names.classifier(part.type)} = new ${Names.classifier(part.type)}();
                                    ${part.isList ?
                `this.${part.name}.push(unit as ${Names.classifier(part.type)});`
                :
                `this.${part.name} = unit as ${Names.classifier(part.type)}`
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
                `if (!!this.${part.name}) {
                    result.push(this.${part.name});
                 }`
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
                `case "${Names.classifier(part.type)}": {
                                    return this.${part.name};
                                }`
                :
                `case "${Names.classifier(part.type)}": {
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

    private findModelImports(modelDescription: PiModelDescription, myName: string): string[] {
        return Array.from(
            new Set(
                modelDescription.parts().map(part => Names.classifier(part.type))
                    .concat(Names.metaType(modelDescription.language))
                    .filter(name => !(name === myName))
                    .filter(r => (r !== null) && (r.length > 0))
            )
        );
    }

    private findMobxImports(concept: PiModelDescription): string[] {
        const mobxImports: string[] = [];
        mobxImports.push("MobxModelElementImpl");
        if (concept.properties.some(part => part.isList && !part.isPrimitive)) {
            mobxImports.push("observablelistpart");
        }
        if (concept.properties.some(part => !part.isList && !part.isPrimitive)) {
            mobxImports.push("observablepart");
        }
        return mobxImports;
    }
}
