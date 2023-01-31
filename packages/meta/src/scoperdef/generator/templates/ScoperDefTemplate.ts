import { PiClassifier, PiLanguage } from "../../../languagedef/metalanguage";
import {
    Names,
    PROJECTITCORE,
    GenerationUtil, CONFIGURATION_FOLDER
} from "../../../utils";
import { PiScopeDef } from "../../metalanguage";


export class ScoperDefTemplate {

    generateScoperDef(language: PiLanguage, scoperDef: PiScopeDef, relativePath: string): string {
        // const allLangConcepts: string = Names.allConcepts(language);
        const concreteNamespaces: PiClassifier[] = GenerationUtil.replaceInterfacesWithImplementors(scoperDef.namespaces);
        // const includeRoot: boolean = !concreteNamespaces.includes(language.modelConcept);

        return `import { ${Names.FreLanguage}, ${Names.FreScoperComposite} } from "${PROJECTITCORE}";
            import { projectitConfiguration } from "${relativePath}${CONFIGURATION_FOLDER}/ProjectitConfiguration";
            import { ${Names.scoper(language)} } from "./${Names.scoper(language)}";     

            /**
             * Adds all known scopers to the main scoper.
             * @param rootScoper
             */
            export function initializeScopers(rootScoper: ${Names.FreScoperComposite}) {
                for (const p of projectitConfiguration.customScopers) {
                    rootScoper.appendScoper(p);
                }
                rootScoper.appendScoper(new ${Names.scoper(language)}());
            }

            /**
             * Adds namespace info to the in-memory representation of the language metamodel.
             */
             export function initializeScoperDef(rootScoper: FreScoperComposite) {
                 ${concreteNamespaces.map( element =>
                    `${Names.FreLanguage}.getInstance().classifier("${Names.classifier(element)}").isNamespace = true;`
                ).join("\n")}
                initializeScopers(rootScoper);
            }`
    }
}
