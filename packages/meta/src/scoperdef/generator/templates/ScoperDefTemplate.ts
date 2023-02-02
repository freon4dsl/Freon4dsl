import { FreClassifier, FreLanguage } from "../../../languagedef/metalanguage";
import {
    Names,
    PROJECTITCORE,
    GenerationUtil, CONFIGURATION_FOLDER
} from "../../../utils";
import { ScopeDef } from "../../metalanguage";


export class ScoperDefTemplate {

    generateScoperDef(language: FreLanguage, scoperDef: ScopeDef, relativePath: string): string {
        // const allLangConcepts: string = Names.allConcepts(language);
        const concreteNamespaces: FreClassifier[] = GenerationUtil.replaceInterfacesWithImplementors(scoperDef.namespaces);
        // const includeRoot: boolean = !concreteNamespaces.includes(language.modelConcept);

        return `import { ${Names.FreLanguage}, ${Names.FreScoperComposite} } from "${PROJECTITCORE}";
            import { freonConfiguration } from "${relativePath}${CONFIGURATION_FOLDER}/${Names.configuration}";
            import { ${Names.scoper(language)} } from "./${Names.scoper(language)}";     

            /**
             * Adds all known scopers to the main scoper.
             * @param rootScoper
             */
            export function initializeScopers(rootScoper: ${Names.FreScoperComposite}) {
                for (const p of freonConfiguration.customScopers) {
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
