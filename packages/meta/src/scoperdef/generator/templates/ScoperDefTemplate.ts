import { FreMetaClassifier, FreMetaConcept, FreMetaLanguage } from "../../../languagedef/metalanguage/index.js";
import {
    Names,
    FREON_CORE,
    GenerationUtil, CONFIGURATION_FOLDER
} from "../../../utils/index.js";
import { ScopeDef } from "../../metalanguage/index.js";

export class ScoperDefTemplate {

    generateScoperDef(language: FreMetaLanguage, scoperDef: ScopeDef, relativePath: string): string {
        // const allLangConcepts: string = Names.allConcepts(language);
        const concreteNamespaces: FreMetaClassifier[] = GenerationUtil.replaceInterfacesWithImplementors(scoperDef.namespaces);
        // TODO Quick fix, add all subclasses of a namespace concept
        //      Need to also add classes implementing subinterfaces !
        for (const cls of scoperDef.namespaces) {
            const classifier = cls.referred;
            if (classifier instanceof FreMetaConcept) {
                for (const subcls of classifier.allSubConceptsRecursive()) {
                    if (!concreteNamespaces.includes(subcls)) {
                        concreteNamespaces.push(subcls);
                    }

                }
            }
        }
        // const includeRoot: boolean = !concreteNamespaces.includes(language.modelConcept);

        return `import { ${Names.FreLanguage}, ${Names.FreScoperComposite} } from "${FREON_CORE}";
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
            }`;
    }
}
