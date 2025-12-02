import { FreMetaLanguage } from "../../../languagedef/metalanguage/index.js";
import { FREON_CORE, Names } from '../../../utils/on-lang/index.js';

export class TyperDefTemplate {
    generateTyperDef(language: FreMetaLanguage, customsFolder: string, relativePath: string): string {
        return `import { type ${Names.FreCompositeTyper} } from "${FREON_CORE}";

            import { ${Names.typerPart(language)} } from "./${Names.typerPart(language)}.js";
            import { freonConfiguration } from "${relativePath}/${customsFolder}/${Names.configuration}.js";

            /**
             * Adds all known type-providers the root typer.
             * @param rootTyper
             */
            export function initializeTypers(rootTyper: ${Names.FreCompositeTyper}) {
                for (const p of freonConfiguration.customTypers) {
                    rootTyper.appendTyper(p);
                }
                rootTyper.appendTyper(new ${Names.typerPart(language)}());
            }`;
    }
}
