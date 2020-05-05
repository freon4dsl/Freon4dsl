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

    generate(language: PiLanguageUnit): string {
        const placeHolderConceptName = Names.concept(language.expressionPlaceHolder);
        return `
            import { PiProjection, PiActions, PiModelInitialization } from "@projectit/core";
            import { ${Names.customActions(language)}, ${Names.customProjection(language)} } from "../editor";
            import { ${Names.initialization(language)} } from "../editor/${Names.initialization(language)}";
            
            class ProjectitConfiguration {
                customProjection: PiProjection[] = [new ${Names.customProjection(language)}("manual")];
                customActions: PiActions[] = [new ${Names.customActions(language)}()];
                customInitialization: PiModelInitialization = new ${Names.initialization(language)}();
            }
            
            export const projectitConfiguration = new ProjectitConfiguration();
        `;
    }
}
