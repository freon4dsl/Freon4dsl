import { LANGUAGE_GEN_FOLDER, Names, PROJECTITCORE } from "../../../utils";
import { PiConceptProperty, PiLanguageUnit } from "../../../languagedef/metalanguage/PiLanguage";

export class InitalizationTemplate {
    constructor() {
    }

    generate(language: PiLanguageUnit, relativePath: string): string {
        const firstUnit: PiConceptProperty = language.rootConcept.parts()[0];
        const firstUnitTypeName: string = Names.concept(firstUnit?.type.referred);
        if (firstUnitTypeName.length === 0) {
            //TODO error message
            // "model should have at least one unit type"
        }
        const imports: string[] = language.rootConcept.parts().map(part => `${Names.concept(part.type.referred)}`);

        // the template starts here
        return `
            import { ${Names.PiElement}, PiModel, PiModelInitialization } from "${PROJECTITCORE}";
            import { ${Names.metaType(language)}, ${Names.concept(language.rootConcept)}, ${imports.map(str => `${str}`).join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";

             /**
             * Class ${Names.initialization(language)} provides an entry point for the language engineer to
             * indicate which user model unit should be opened when a new model is requested by the user.
             * Default is to initialize a user model unit by creating an instance of the first unit property
             * in the root concept of the language. 
             * Note that the model itself (i.e. the root concept which holds all model units) must be initialized as well.
             */         
            export class ${Names.initialization(language)} implements PiModelInitialization {
            
                /**
                 * Used to initialize a completely new model. It returns the first model unit in the model.
                 */
                initialize(): ${Names.PiElement} {
                    let model = new ${Names.concept(language.rootConcept)}();
                    // You may replace the default with the initial model unit of your choice   
                    return this.newUnit(model, "${firstUnitTypeName}");
                }

                /** 
                 * Returns an empty model unit within 'model' of type 'unitTypeName'. 
                 * 
                 * @param model
                 * @param unitTypeName
                 */
                newUnit(model: ${Names.concept(language.rootConcept)}, typename: ${Names.metaType(language)}) : ${Names.PiElement}  {
                    switch (typename) {
                        ${language.rootConcept.allParts().map(part => 
                            `case "${Names.concept(part.type.referred)}": {
                                let unit: ${Names.concept(part.type.referred)} = new ${Names.concept(part.type.referred)}();
                                ${part.isList? `model.${part.name}.push(unit as ${Names.concept(part.type.referred)});` : `model.${part.name} = unit as ${Names.concept(part.type.referred)}`}
                                return unit;
                             }`                           
                             ).join("\n")
                        }
                    }
                    return null;
                }
                
                /**
                 * Returns an empty model with name 'modelName'.
                 * 
                 * @param modelName
                 */
                 newModel(modelName: string) : ${Names.concept(language.rootConcept)} {
                    let model = new ${Names.concept(language.rootConcept)}();
                    model.name = modelName;
                    return model;
                }                                   
            }
        `;
    }
}
