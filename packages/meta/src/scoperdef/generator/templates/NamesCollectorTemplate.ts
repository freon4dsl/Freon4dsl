import {
    Names,
    PathProvider,
    PROJECTITCORE,
    LANGUAGE_GEN_FOLDER,
    hasNameProperty, createImports
} from "../../../utils";
import { PiLanguage } from "../../../languagedef/metalanguage";

export class NamesCollectorTemplate {

    generateNamesCollector(language: PiLanguage, relativePath: string): string {
        const defaultWorkerName = Names.defaultWorker(language);
        const PiNamedElement = Names.PiNamedElement;
        const namesCollectorClassName: string = Names.namesCollector(language);
        const commentBefore = `/**
                                * Collects all parts of 'modelelement' that have a name.
                                * @param modelelement
                                */`;

        // the template starts here
        return `
        import { ${PiNamedElement}, Language } from "${PROJECTITCORE}";   
        import { ${defaultWorkerName} } from "${relativePath}${PathProvider.defaultWorker(language)}";
        import { ${Names.metaType(language)}, ${createImports(language)} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";           

        /**
         * Class ${namesCollectorClassName} is part of the implementation of the scoper generated from, if present, 
         * the scoper definition, using the visitor pattern. 
         * Class ${Names.walker(language)} implements the traversal of the model tree. This class implements 
         * the collection of named parts of nodes in the tree.
         */
        export class ${namesCollectorClassName} extends ${defaultWorkerName} {
            // 'namesList' holds the named elements found while traversing the model tree
            namesList: ${PiNamedElement}[] = [];
            // 'metatype' may or may not be set; if set any named element is included only if it conforms to this type
            metatype: ${Names.metaType(language)};

        ${commentBefore}
        public execBefore${Names.classifier(language.modelConcept)}(modelelement: ${Names.classifier(language.modelConcept)}): boolean {
            ${language.modelConcept.allParts().map(part => hasNameProperty(part.type) ?
        (part.isList ?
            `for (const z of modelelement.${part.name}) { this.addIfTypeOK(z);  }`
            : `this.addIfTypeOK(modelelement.${part.name});`)
        : `// type of ${part.name} has no 'name' property`).join("\n")}
            return true;
        }

        ${language.units.map(unit =>
            `${commentBefore}
            public execBefore${Names.classifier(unit)}(modelelement: ${Names.classifier(unit)}): boolean {
                ${unit.allParts().map(part => hasNameProperty(part.type) ?
                (part.isList ?
                    `for (const z of modelelement.${part.name}) { this.addIfTypeOK(z);  }`
                    : `this.addIfTypeOK(modelelement.${part.name});`)
                : `// type of ${part.name} has no 'name' property`).join("\n")}
                return true;
            }
            `
        ).join("\n\n")}
       
        ${language.concepts.map(concept =>
            `${commentBefore}
            public execBefore${Names.concept(concept)}(modelelement: ${Names.concept(concept)}): boolean {
                ${concept.allParts().map(part => hasNameProperty(part.type) ?
                    (part.isList ?
                        `for (const z of modelelement.${part.name}) { this.addIfTypeOK(z);  }`
                        : `this.addIfTypeOK(modelelement.${part.name});`)
                    : `// type of ${part.name} has no 'name' property`).join("\n")}
                return true;
            }
            `
        ).join("\n\n")}
      
            /**
             * Checks whether 'namedElement' is an instance of 'this.metatype', if so 'namedElement' is added to 'result'.
             * 
             * @param namedElement
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
