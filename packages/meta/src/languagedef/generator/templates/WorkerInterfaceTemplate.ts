import { FreMetaLanguage } from '../../metalanguage/index.js';
import { Names, Imports } from "../../../utils/on-lang/index.js"
import { GenerationUtil } from '../../../utils/on-lang/GenerationUtil.js';

export class WorkerInterfaceTemplate {
    generateWorkerInterface(language: FreMetaLanguage, relativePath: string): string {
        const imports = new Imports(relativePath)
        imports.language = GenerationUtil.allConceptsAndUnits(language)

        // the template starts here
        return `
        // TEMPLATE: WorkerInterfaceTemplate.generateWorkerInterface(...)
        ${imports.makeImports(language)}

        /**
         * Interface ${Names.workerInterface(language)} implements the extended visitor pattern of instances of language ${language.name}.
         * Class ${Names.walker(language)} implements the traversal of the model tree, classes that implement this interface
         * are responsible for the actual work being done on the nodes of the tree.
         * Every node is visited twice, once before the visit of its children, and once after this visit.
         */
        export interface ${Names.workerInterface(language)} {

        execBefore${Names.classifier(language.modelConcept)}(node: ${Names.classifier(language.modelConcept)}): boolean;
        execAfter${Names.classifier(language.modelConcept)}(node: ${Names.classifier(language.modelConcept)}): boolean;

        ${language.units
            .map(
                (unit) =>
                    `execBefore${Names.classifier(unit)}(node: ${Names.classifier(unit)}): boolean;
            execAfter${Names.classifier(unit)}(node: ${Names.classifier(unit)}): boolean ;`,
            )
            .join("\n\n")}

        ${language.concepts
            .map(
                (concept) =>
                    `execBefore${Names.concept(concept)}(node: ${Names.concept(concept)}): boolean;
            execAfter${Names.concept(concept)}(node: ${Names.concept(concept)}): boolean;`,
            )
            .join("\n\n")}
        }`;
    }
}
