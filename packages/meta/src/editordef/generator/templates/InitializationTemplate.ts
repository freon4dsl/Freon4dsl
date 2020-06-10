import { LANGUAGE_GEN_FOLDER, Names, PROJECTITCORE } from "../../../utils";
import { PiConceptProperty, PiLanguageUnit } from "../../../languagedef/metalanguage/PiLanguage";

export class InitalizationTemplate {
    constructor() {
    }

    generate(language: PiLanguageUnit, relativePath: string): string {
        const firstUnit: PiConceptProperty = language.rootConcept.parts()[0];
        return `
            import { ${Names.PiElement} } from "${PROJECTITCORE}";
            import { ${Names.concept(language.rootConcept)}, ${Names.concept(firstUnit.type.referred)} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";

             /**
             * Class ${Names.initialization(language)} provides an entry point for the language engineer to
             * indicate which user model unit should be opened when a new model is requested by the user.
             * Default is to initialize a user model unit by creating an instance of the first unit property
             * in the root concept of the language. 
             * Note that the model itself (which holds all model units) must be initialized as well.
             */         
            export class ${Names.initialization(language)} {
            
                initialize(): ${Names.PiElement} {
                    // You may replace the default with the initial model unit of your choice     
                    let model = new ${Names.concept(language.rootConcept)}();
                    let unit = new ${Names.concept(firstUnit.type.referred)}();
                    ${firstUnit.isList? `model.${firstUnit.name}.push(unit);` : `model.${firstUnit.name} = unit`}
                    return unit;
                }
            }
        `;
    }
}
