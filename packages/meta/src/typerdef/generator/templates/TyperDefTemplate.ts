import { PiLanguage } from "../../../languagedef/metalanguage";
import { CONFIGURATION_FOLDER, Names, PROJECTITCORE } from "../../../utils";
import { PiTyperDef } from "../../metalanguage/index";

export class TyperDefTemplate {

    generateTyperDef(language: PiLanguage, typerDef: PiTyperDef, relativePath: string): string {
        return `import { FreCompositeTyper } from "${PROJECTITCORE}";
        
            import { ${Names.typerPart(language)} } from "./${Names.typerPart(language)}";     
            import { projectitConfiguration } from "${relativePath}${CONFIGURATION_FOLDER}/ProjectitConfiguration";
    
            /**
             * Adds all known type- providers the root typer.
             * @param rootTyper
             */
            export function initializeTypers(rootTyper: FreCompositeTyper) {
                for (const p of projectitConfiguration.customTypers) {
                    rootTyper.appendTyper(p);
                }
                rootTyper.appendTyper(new ${Names.typerPart(language)}());
            }`
    }
}

