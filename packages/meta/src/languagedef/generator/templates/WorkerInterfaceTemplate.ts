import { FreMetaLanguage } from "../../metalanguage/index.js";
import { Names, LANGUAGE_GEN_FOLDER, GenerationUtil } from "../../../utils/index.js";

export class WorkerInterfaceTemplate {
    generateWorkerInterface(language: FreMetaLanguage, relativePath: string): string {
        // the template starts here
        return `
        import { ${GenerationUtil.createImports(language)} } from "${relativePath}${LANGUAGE_GEN_FOLDER}/index.js";

        /**
         * Interface ${Names.workerInterface(language)} implements the extended visitor pattern of instances of language ${language.name}.
         * Class ${Names.walker(language)} implements the traversal of the model tree, classes that implement this interface
         * are responsible for the actual work being done on the nodes of the tree.
         * Every node is visited twice, once before the visit of its children, and once after this visit.
         */
        export interface ${Names.workerInterface(language)} {

        execBefore${Names.classifier(language.modelConcept)}(modelelement: ${Names.classifier(language.modelConcept)}): boolean;
        execAfter${Names.classifier(language.modelConcept)}(modelelement: ${Names.classifier(language.modelConcept)}): boolean;

        ${language.units
            .map(
                (unit) =>
                    `execBefore${Names.classifier(unit)}(modelelement: ${Names.classifier(unit)}): boolean;
            execAfter${Names.classifier(unit)}(modelelement: ${Names.classifier(unit)}): boolean ;`,
            )
            .join("\n\n")}

        ${language.concepts
            .map(
                (concept) =>
                    `execBefore${Names.concept(concept)}(modelelement: ${Names.concept(concept)}): boolean;
            execAfter${Names.concept(concept)}(modelelement: ${Names.concept(concept)}): boolean;`,
            )
            .join("\n\n")}
        }`;
    }
}
