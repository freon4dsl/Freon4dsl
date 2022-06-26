import { LANGUAGE_GEN_FOLDER, Names, GenerationUtil } from "../../../utils";
import { PiClassifier, PiLanguage } from "../../../languagedef/metalanguage";
import { PiScopeDef } from "../../metalanguage";

export class ScoperUtilsTemplate {

    generateScoperUtils(language: PiLanguage, scopedef: PiScopeDef, relativePath: string): string {
        const allLangConcepts: string = Names.allConcepts(language);
        const concreteNamespaces: PiClassifier[] = GenerationUtil.replaceInterfacesWithImplementors(scopedef.namespaces);
        const includeRoot: boolean = !concreteNamespaces.includes(language.modelConcept);
        // also process the units that are not explicitly marked as namespace
        language.units.forEach(unit => {
            // TODO check this and change the documentation
            if (!concreteNamespaces.includes(unit)) {
                concreteNamespaces.push(unit);
            }
        });

        // Template starts here
        return `
        import { ${allLangConcepts}, 
                    ${includeRoot ?
                        `${Names.classifier(language.modelConcept)},`
                    : ``} 
                    ${concreteNamespaces.map(ref => `${Names.classifier(ref)}`).join(", ")} 
                } from "${relativePath}${LANGUAGE_GEN_FOLDER }";
              
        /**
         * Returns true if 'modelelement' is marked by 'isnamespace' in the scoper definition.
         * When no namespaces are defined in the scoper definition, this method only returns true if
         * 'modelelement' is the model root.
         * @param modelelement
         */
        export function isNameSpace(modelelement: ${allLangConcepts}): boolean {
            ${includeRoot ? `if (modelelement instanceof ${Names.classifier(language.modelConcept)}) { return true; }` : ``} 
            ${concreteNamespaces.map(ref => `if (modelelement instanceof ${Names.classifier(ref)}) { return true; }`).join("\n")}      
                return false;
        }`;
    }

}
