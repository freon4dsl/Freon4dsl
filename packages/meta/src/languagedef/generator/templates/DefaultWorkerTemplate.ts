import { Names, GenerationUtil, Imports } from "../../../utils/index.js"
import { FreMetaLanguage } from "../../metalanguage/index.js";

export class DefaultWorkerTemplate {
    generateDefaultWorker(language: FreMetaLanguage, relativePath: string): string {
        const workerInterfaceName = Names.workerInterface(language);
        const defaultWorkerClassName = Names.defaultWorker(language);
        const commentBefore = `/**
                                * Visits 'node' before visiting its children.
                                * @param node
                                */`;
        const commentAfter = `/**
                               * Visits 'node' after visiting its children.
                               * @param node
                               */`;
        const imports = new Imports(relativePath)
        imports.language = GenerationUtil.allConceptsAndUnits(language)
        
        // the template starts here
        return `
        // TEMPLATE: DefaultWorkerTemplate.generateDefaultWorker(...)
        ${imports.makeImports(language)}
        import { type ${workerInterfaceName} } from "./${Names.workerInterface(language)}.js";

        /**
         * Class ${defaultWorkerClassName} is part of the implementation of the visitor pattern on models.
         * It implements the interface ${workerInterfaceName} with empty methods, and can thus be used as
         * base to any class that needs to traverse the model tree.
         * Class ${Names.walker(language)} implements the traversal of the model tree. This class implements
         * the actual visiting of each node in the tree.
         */
        export class ${defaultWorkerClassName} implements ${workerInterfaceName} {

        ${commentBefore}
        public execBefore${Names.classifier(language.modelConcept)}(node: ${Names.classifier(language.modelConcept)}): boolean {
            return false;
        }

        ${commentAfter}
        public execAfter${Names.classifier(language.modelConcept)}(node: ${Names.classifier(language.modelConcept)}): boolean {
            return false;
        }

        ${language.units
            .map(
                (unit) =>
                    `${commentBefore}
            public execBefore${Names.classifier(unit)}(node: ${Names.classifier(unit)}): boolean {
                return false;
            }

            ${commentAfter}
            public execAfter${Names.classifier(unit)}(node: ${Names.classifier(unit)}): boolean {
                return false;
            }`,
            )
            .join("\n\n")}

        ${language.concepts
            .map(
                (concept) =>
                    `${commentBefore}
            public execBefore${Names.concept(concept)}(node: ${Names.concept(concept)}): boolean {
                return false;
            }

            ${commentAfter}
            public execAfter${Names.concept(concept)}(node: ${Names.concept(concept)}): boolean {
                return false;
            }`,
            )
            .join("\n\n")}
        }`;
    }
}
