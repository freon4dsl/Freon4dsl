import {
    Names,
    PROJECTITCORE,
    EDITOR_FOLDER,
    VALIDATOR_GEN_FOLDER, TYPER_FOLDER, VALIDATOR_FOLDER, STDLIB_FOLDER, SCOPER_FOLDER
} from "../../../utils/";
import { PiLanguage } from "../../metalanguage";

export class ConfigurationTemplate {

    generate(language: PiLanguage, relativePath: string): string {
        const configurationName = Names.configuration();
        const workerName = Names.checkerInterface(language);
        return `
            import { ${Names.PiProjection}, ${Names.PiActions}, ${Names.FreonTyperPart}, ${Names.PiStdlib}, ${Names.FrScoperPart} } from "${PROJECTITCORE}";
            import { ${Names.customActions(language)}, ${Names.customProjection(language)} } from "${relativePath}${EDITOR_FOLDER}";
            import { ${Names.customScoper(language)} } from "${relativePath}${SCOPER_FOLDER}";
            import { ${Names.customTyper(language)} } from "${relativePath}${TYPER_FOLDER}";
            import { ${Names.customValidator(language)} } from "${relativePath}${VALIDATOR_FOLDER}";    
            import { ${Names.customStdlib(language)} } from "${relativePath}${STDLIB_FOLDER}";                                  
            import { ${workerName } } from "${relativePath}${VALIDATOR_GEN_FOLDER}";
            
            /**
             * Class ${configurationName} is the place where you can add all your customisations.
             * These will be used through the 'projectitConfiguration' constant by any generated
             * part of your language environment.
             */
            class ${configurationName} {
                // add your custom editor projections here
                customProjection: ${Names.PiProjection}[] = [new ${Names.customProjection(language)}("manual")];
                // add your custom editor actions here
                customActions: ${Names.PiActions}[] = [new ${Names.customActions(language)}()];
                // add your custom validations here
                customValidations: ${workerName}[] = [new ${Names.customValidator(language)}()];
                // add your custom scopers here
                customScopers: ${Names.FrScoperPart}[] = [new ${Names.customScoper(language)}()];
                // add your custom type-providers here
                customTypers: ${Names.FreonTyperPart}[] = [new ${Names.customTyper(language)}()];
                // add your custom typers NEW here
                customTypersFreon: ${Names.FreonTyperPart}[] = [new ${Names.customTyper(language)}()];
                // add extra predefined instances here
                customStdLibs: ${Names.PiStdlib}[] = [new ${Names.customStdlib(language)}()];
            }
            
            export const projectitConfiguration = new ${configurationName}();
        `;
    }
}
