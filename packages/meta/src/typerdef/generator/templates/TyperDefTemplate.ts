import { FreLanguage } from "../../../languagedef/metalanguage";
import { CONFIGURATION_FOLDER, Names, FREON_CORE } from "../../../utils";
import { TyperDef } from "../../metalanguage/index";

export class TyperDefTemplate {

    generateTyperDef(language: FreLanguage, typerDef: TyperDef, relativePath: string): string {
        return `import { FreCompositeTyper } from "${FREON_CORE}";

            import { ${Names.typerPart(language)} } from "./${Names.typerPart(language)}";
            import { freonConfiguration } from "${relativePath}${CONFIGURATION_FOLDER}/${Names.configuration}";

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
