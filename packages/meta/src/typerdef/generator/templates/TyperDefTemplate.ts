import { PiLanguage } from "../../../languagedef/metalanguage";
import { CONFIGURATION_FOLDER, Names, PROJECTITCORE } from "../../../utils";
import { PiTyperDef } from "../../metalanguage/index";

export class TyperDefTemplate {

    generateTyperDef(language: PiLanguage, typerDef: PiTyperDef, relativePath: string): string {
        return `import { FrCompositeTyper } from "${PROJECTITCORE}";
        
            import { ${Names.typerPart(language)} } from "./${Names.typerPart(language)}";     
            import { projectitConfiguration } from "${relativePath}${CONFIGURATION_FOLDER}/ProjectitConfiguration";
    
            /**
             * Adds all known projection groups to the root projection.
             * @param rootProjection
             */
            export function initializeTypers(rootTyper: FrCompositeTyper) {
                for (const p of projectitConfiguration.customTypersFreon) {
                    rootTyper.appendTyper(p);
                }
                rootTyper.appendTyper(new ${Names.typerPart(language)}());
            }`
    }
}

