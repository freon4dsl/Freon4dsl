import { Names, LANGUAGE_GEN_FOLDER, GenerationUtil } from "../../../utils";
import { PiLanguage } from "../../metalanguage";

export class DefaultWorkerTemplate {

    generateDefaultWorker(language: PiLanguage, relativePath: string): string {
        const workerInterfaceName = Names.workerInterface(language);
        const defaultWorkerClassName = Names.defaultWorker(language);
        const commentBefore = `/**
                                * Visits 'modelelement' before visiting its children.
                                * @param modelelement
                                */`;
        const commentAfter = `/**
                               * Visits 'modelelement' after visiting its children.
                               * @param modelelement
                               */`;

        // the template starts here
        return `
        import { ${GenerationUtil.createImports(language)} } from "${relativePath}${LANGUAGE_GEN_FOLDER}"; 
        import { ${workerInterfaceName} } from "./${Names.workerInterface(language)}";     

        /**
         * Class ${defaultWorkerClassName} is part of the implementation of the visitor pattern on models.
         * It implements the interface ${workerInterfaceName} with empty methods, and can thus be used as
         * base to any class that needs to traverse the model tree. 
         * Class ${Names.walker(language)} implements the traversal of the model tree. This class implements 
         * the actual visiting of each node in the tree.
         */
        export class ${defaultWorkerClassName} implements ${workerInterfaceName} {
        
        ${commentBefore}
        public execBefore${Names.classifier(language.modelConcept)}(modelelement: ${Names.classifier(language.modelConcept)}): boolean {
            return false;
        }
            
        ${commentAfter}
        public execAfter${Names.classifier(language.modelConcept)}(modelelement: ${Names.classifier(language.modelConcept)}): boolean {
            return false;
        }

        ${language.units.map(unit =>
            `${commentBefore}
            public execBefore${Names.classifier(unit)}(modelelement: ${Names.classifier(unit)}): boolean {
                return false;
            }
            
            ${commentAfter}
            public execAfter${Names.classifier(unit)}(modelelement: ${Names.classifier(unit)}): boolean {
                return false;
            }`
        ).join("\n\n")}
        
        ${language.concepts.map(concept =>
            `${commentBefore}
            public execBefore${Names.concept(concept)}(modelelement: ${Names.concept(concept)}): boolean {
                return false;
            }
            
            ${commentAfter}
            public execAfter${Names.concept(concept)}(modelelement: ${Names.concept(concept)}): boolean {
                return false;
            }`
        ).join("\n\n")}
        }`;
    }

}
