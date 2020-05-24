import {
    Names,
    PathProvider,
    PROJECTITCORE,
    TYPER_GEN_FOLDER,
    SCOPER_GEN_FOLDER,
    VALIDATOR_GEN_FOLDER,
    EDITOR_FOLDER,
    EDITOR_GEN_FOLDER, ENVIRONMENT_GEN_FOLDER, LANGUAGE_GEN_FOLDER, STDLIB_GEN_FOLDER, UNPARSER_GEN_FOLDER
} from "../../../utils/";
import { PiLanguageUnit } from "../../metalanguage/PiLanguage";

export class ConfigurationTemplate {
    constructor() {
    }

    generate(language: PiLanguageUnit, relativePath: string): string {
        const configurationName = Names.configuration(language);
        return `
            import { ${Names.PiProjection}, ${Names.PiActions}, ${Names.PiModelInitialization} } from "${PROJECTITCORE}";
            import { ${Names.customActions(language)}, ${Names.customProjection(language)} } from "${relativePath}${EDITOR_FOLDER}";
            import { ${Names.initialization(language)} } from "${relativePath}${EDITOR_FOLDER}/${Names.initialization(language)}";
            
            /**
             * Class ${configurationName} is TODO add comment
             */
            class ${configurationName} {
                customProjection: ${Names.PiProjection}[] = [new ${Names.customProjection(language)}("manual")];
                customActions: ${Names.PiActions}[] = [new ${Names.customActions(language)}()];
                customInitialization: ${Names.PiModelInitialization} = new ${Names.initialization(language)}();
            }
            
            export const projectitConfiguration = new ${configurationName}();
        `;
    }
}
