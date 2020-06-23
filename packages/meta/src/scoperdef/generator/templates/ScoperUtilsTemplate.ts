import { LANGUAGE_GEN_FOLDER, Names, replaceInterfacesWithImplementors } from "../../../utils";
import { PiConcept, PiLanguageUnit } from "../../../languagedef/metalanguage";
import { PiScopeDef } from "../../metalanguage";

export class ScoperUtilsTemplate {

    generateScoperUtils(language: PiLanguageUnit, scopedef: PiScopeDef, relativePath: string): string {
        const allLangConcepts : string = Names.allConcepts(language);
        const concreteNamespaces: PiConcept[] = replaceInterfacesWithImplementors(scopedef.namespaces);

        // Template starts here
        return `
        import { ${allLangConcepts}, ${concreteNamespaces.map(ref => `${Names.concept(ref)}`).join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";
              
        /**
         * Returns true if 'modelelement' is marked by 'isnamespace' in the scoper definition.
         * When no namespaces are defined in the scoper definition, this method returns true if
         * 'modelelement' is the model root.
         * @param modelelement
         */
        export function isNameSpace(modelelement: ${allLangConcepts}): boolean {
            ${concreteNamespaces.map(ref => `if (modelelement instanceof ${ref.name}) { return true; }`).join("\n")}      
                return false;
        }`;
    }

}
