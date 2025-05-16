import { FreMetaClassifier, FreMetaLanguage } from "../../../languagedef/metalanguage/index.js";
import { Names, CONFIGURATION_FOLDER, LangUtil, Imports } from "../../../utils/index.js"
import { ScopeDef } from "../../metalanguage/index.js";

export class ScoperDefTemplate {
    generateScoperDef(language: FreMetaLanguage, scoperDef: ScopeDef, relativePath: string): string {
        const concreteNamespaces: FreMetaClassifier[] = []
        scoperDef.namespaces.forEach(ns => {
            LangUtil.findAllImplementorsAndSubs(ns).forEach(cls => {
                if (!concreteNamespaces.includes(cls)) {
                    concreteNamespaces.push(cls)
                }
            })
        })
        const imports = new Imports(relativePath)
        imports.core.add(Names.FreLanguage).add(Names.FreScoperComposite)

        return `// TEMPLATE: ScoperDefTemplate.generateScoperDef(...)
            ${imports.makeImports(language)}
            import { freonConfiguration } from "${relativePath}${CONFIGURATION_FOLDER}/${Names.configuration}.js";
            import { ${Names.scoper(language)} } from "./${Names.scoper(language)}.js";

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
                 ${Array.from(concreteNamespaces)
                     .map(
                         (element) =>
                             `${Names.FreLanguage}.getInstance().classifier("${Names.classifier(element)}").isNamespace = true;`,
                     )
                     .join("\n")}
                initializeScopers(rootScoper);
            }`;
    }
}
