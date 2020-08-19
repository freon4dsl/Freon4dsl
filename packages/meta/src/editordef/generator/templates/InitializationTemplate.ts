import { LANGUAGE_GEN_FOLDER, Names, PROJECTITCORE } from "../../../utils";
import { PiConceptProperty, PiLanguage } from "../../../languagedef/metalanguage/PiLanguage";

export class InitalizationTemplate {
    constructor() {
    }

    generate(language: PiLanguage, relativePath: string): string {
        const firstUnit: PiConceptProperty = language.modelConcept.parts()[0];
        const firstUnitTypeName: string = Names.classifier(firstUnit?.type.referred);
        if (firstUnitTypeName.length === 0) {
            //TODO error message
            // "model should have at least one unit type"
        }
        const imports: string[] = language.modelConcept.parts().map(part => `${Names.classifier(part.type.referred)}`);

        // the template starts here
        return `
            import { ${Names.PiElement}, PiModel, PiModelInitialization } from "${PROJECTITCORE}";
            import { ${Names.metaType(language)}, ${Names.concept(language.modelConcept)}, ${imports.map(str => `${str}`).join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";

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
                    const model = new ${Names.concept(language.modelConcept)}();
                    // You may replace the default with the initial model unit of your choice   
                    return this.newUnit(model, "${firstUnitTypeName}");
                }

                /** 
                 * Returns an empty model unit within 'model' of type 'unitTypeName'. 
                 * 
                 * @param model
                 * @param unitTypeName
                 */
                newUnit(model: ${Names.concept(language.modelConcept)}, typename: ${Names.metaType(language)}) : ${Names.PiElement}  {
                    switch (typename) {
                        ${language.modelConcept.allParts().map(part => 
                            `case "${Names.classifier(part.type.referred)}": {
                                const unit: ${Names.classifier(part.type.referred)} = new ${Names.classifier(part.type.referred)}();
                                ${part.isList? `model.${part.name}.push(unit as ${Names.classifier(part.type.referred)});` : `model.${part.name} = unit as ${Names.classifier(part.type.referred)}`}
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
                 newModel(modelName: string) : ${Names.concept(language.modelConcept)} {
                    const model = new ${Names.concept(language.modelConcept)}();
                    model.name = modelName;
                    return model;
                }                                   
            }
        `;
    }
}
