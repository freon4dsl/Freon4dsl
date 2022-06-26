import { PiClassifier, PiLanguage } from "../../../languagedef/metalanguage";
import {
    Names,
    PROJECTITCORE,
    GenerationUtil
} from "../../../utils";
import { PiScopeDef } from "../../metalanguage";


export class ScoperDefTemplate {

    generateEditorDef(language: PiLanguage, scoperDef: PiScopeDef): string {
        // const allLangConcepts: string = Names.allConcepts(language);
        const concreteNamespaces: PiClassifier[] = GenerationUtil.replaceInterfacesWithImplementors(scoperDef.namespaces);
        // const includeRoot: boolean = !concreteNamespaces.includes(language.modelConcept);

        return `import { Language } from "${PROJECTITCORE}";
            /**
             * Adds namespace info to the in-memory representation of the language metamodel.
             */
             export function initializeScoperDef() {
                 ${concreteNamespaces.map( element =>
                    `Language.getInstance().classifier("${Names.classifier(element)}").isNamespace = true;`
                ).join("\n")}
            }`
    }
}
