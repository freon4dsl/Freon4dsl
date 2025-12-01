import {
    Names,
    VALIDATOR_GEN_FOLDER,
    Imports
} from "../../../utils/on-lang/index.js"
import { FreMetaLanguage } from "../../metalanguage/index.js";

export class ConfigurationTemplate {
    generate(language: FreMetaLanguage, relativePath: string): string {
        const configurationName = Names.configuration;
        const workerName = Names.checkerInterface(language);
        const imports = new Imports(relativePath)
        imports.core = new Set<string>([Names.FreProjection, Names.FreActions, Names.FreTyper, Names.FreStdlib, Names.FreScoperPart])
        return `
            // TEMPLATE: ConfigurationTemplate.generate(...)
            ${imports.makeImports(language)}
            import { ${Names.customActions(language)} } from "./${Names.customActions(language)}.js";
            import { ${Names.customProjection(language)} } from "./${Names.customProjection(language)}.js";
            import { ${Names.customScoper(language)} } from "./${Names.customScoper(language)}.js";
            import { ${Names.customTyper(language)} } from "./${Names.customTyper(language)}.js";
            import { ${Names.customValidator(language)} } from "./${Names.customValidator(language)}.js";
            import { ${Names.customStdlib(language)} } from "./${Names.customStdlib(language)}.js";
            import { type ${workerName} } from "${relativePath}/${VALIDATOR_GEN_FOLDER}/index.js";

            /**
             * Class ${configurationName} is the place where you can add all your customizations.
             * These will be used through the 'freonConfiguration' constant by any generated
             * part of your language environment.
             */
            class ${configurationName} {
                // add your custom editor projections here
                customProjection: ${Names.FreProjection}[] = [new ${Names.customProjection(language)}()];
                // add your custom editor actions here
                customActions: ${Names.FreActions}[] = [new ${Names.customActions(language)}()];
                // add your custom validations here
                customValidations: ${workerName}[] = [new ${Names.customValidator(language)}()];
                // add your custom scopers here
                customScopers: ${Names.FreScoperPart}[] = [new ${Names.customScoper(language)}()];
                // add your custom type-providers here
                customTypers: ${Names.FreTyper}[] = [new ${Names.customTyper(language)}()];
                // add extra predefined instances here
                customStdLibs: ${Names.FreStdlib}[] = [new ${Names.customStdlib(language)}()];
            }

            export const freonConfiguration = new ${configurationName}();
        `;
    }

    generateCustomIndex(language: FreMetaLanguage): string {
        return `
            // TEMPLATE: ConfigurationTemplate.generateCustomIndex(...)
            export * from "./${Names.customActions(language)}.js";
            export * from "./${Names.customProjection(language)}.js";
            export * from "./${Names.customScoper(language)}.js";
            export * from "./${Names.customStdlib(language)}.js";
            export * from "./${Names.customTyper(language)}.js";
            export * from "./${Names.customValidator(language)}.js";
            export * from "./${Names.configuration}.js";
            export * from "./${Names.interpreterClassname(language)}.js";
            export * from "./${Names.interpreterName(language)}.js";
            `
    }
}
