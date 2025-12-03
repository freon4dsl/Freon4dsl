import { FreMetaLanguage } from "../../../languagedef/metalanguage/index.js";
import { CONFIGURATION_FOLDER, FREON_CORE, Names } from '../../../utils/on-lang/index.js';


export class TyperDefTemplate {
    generateTyperDef(language: FreMetaLanguage, relativePath: string): string {
        return `import { type FreCompositeTyper } from "${FREON_CORE}";

            import { ${Names.typerPart(language)} } from "./${Names.typerPart(language)}.js";
            import { freonConfiguration } from "${relativePath}${CONFIGURATION_FOLDER}/${Names.configuration}.js";

            /**
             * Adds all known type-providers the root typer.
             * @param rootTyper
             */
            export function initializeTypers(rootTyper: FreCompositeTyper) {
                for (const p of freonConfiguration.customTypers) {
                    rootTyper.appendTyper(p);
                }
                rootTyper.appendTyper(new ${Names.typerPart(language)}());
            }`;
    }
}
