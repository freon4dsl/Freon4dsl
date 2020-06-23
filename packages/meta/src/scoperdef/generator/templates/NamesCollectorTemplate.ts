import {
    Names,
    PathProvider,
    PROJECTITCORE,
    LANGUAGE_GEN_FOLDER,
    langExpToTypeScript,
    ENVIRONMENT_GEN_FOLDER,
    hasNameProperty
} from "../../../utils";
import { PiLanguageUnit, PiConcept, PiLangElement, PiProperty, PiPrimitiveProperty } from "../../../languagedef/metalanguage/PiLanguage";

export class NamesCollectorTemplate {
    constructor() {
    }

    generateNamesCollector(language: PiLanguageUnit, relativePath: string): string {
        const workerInterfaceName = Names.workerInterface(language);
        const PiNamedElement = Names.PiNamedElement;
        const namesCollectorClassName : string = Names.namesCollector(language);
        const commentBefore =   `/**
                                 * Collects all parts of 'modelelement' that have a name.
                                 * @param modelelement
                                 */`;
        const commentAfter =    `/**
                                 * Does nothing. Here to comply to the interface
                                 */`;

        // the template starts here
        return `
        import { ${PiNamedElement}, Language } from "${PROJECTITCORE}";   
        import { ${workerInterfaceName} } from "${relativePath}${PathProvider.workerInterface(language)}";
        import { ${Names.metaType(language)}, ${language.concepts.map( concept => `${Names.concept(concept)}` ).join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";           

        /**
         * Class ${namesCollectorClassName} is part of the implementation of the scoper generated from, if present, 
         * the scoper definition, using the visitor pattern. 
         * Class ${Names.walker(language)} implements the traversal of the model tree. This class implements 
         * the collection of named parts of nodes in the tree.
         */
        export class ${namesCollectorClassName} implements ${workerInterfaceName} {
            // 'namesList' holds the named elements found while traversing the model tree
            namesList: ${PiNamedElement}[] = [];
            // 'metatype' may or may not be set; if set any named element is included only if it conforms to this type
            metatype: ${Names.metaType(language)};

        ${language.concepts.map(concept =>
            `${commentBefore}
            public execBefore${concept.name}(modelelement: ${concept.name}) {
                ${concept.allParts().map(part => hasNameProperty(part) ? 
                    (part.isList ? 
                        `for (let z of modelelement.${part.name}) { this.addIfTypeOK(z);  }` 
                        : `this.addIfTypeOK(modelelement.${part.name});`) 
                    : `// ${part.name} has no 'name' property`).join("\n")}
            }
            
            ${commentAfter}
            public execAfter${concept.name}(modelelement: ${concept.name}) {
            }`
        ).join("\n\n")}
      
            /**
             * Checks whether 'namedElement' is an instance of 'metatype', if so 'namedElement' is added to 'result'.
             * 
             * @param namedElement
             * @param result
             * @param metatype
             */
            private addIfTypeOK(namedElement: ${PiNamedElement}) {
                if (!!namedElement) { 
                    if (!!this.metatype) {
                        const concept = namedElement.piLanguageConcept();
                        if (concept === this.metatype || Language.getInstance().subConcepts(this.metatype).includes(concept)) {
                            this.namesList.push(namedElement);
                        }
                    } else {
                        this.namesList.push(namedElement);
                    }
                }
            } 
        }`;
    }
}
