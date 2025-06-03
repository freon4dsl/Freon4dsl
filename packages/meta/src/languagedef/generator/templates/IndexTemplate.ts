import { FreMetaLanguage } from "../../metalanguage/index.js";
import { Names, GenerationUtil, Imports } from "../../../utils/index.js"

export class IndexTemplate {
    generateIndex(language: FreMetaLanguage): string {
        const imports = new Imports()
        const modelImports: Set<string> = new Set<string>()
        modelImports.add(Names.classifier(language.modelConcept));
        language.units.forEach((c) => modelImports.add(Names.classifier(c)));
        language.concepts.forEach((c) => modelImports.add(Names.concept(c)));
        language.interfaces.forEach((c) => modelImports.add(Names.interface(c)));
        modelImports.add(Names.initializeLanguage);

        // the template starts here
        return `
        /**
         * This index deploys the pattern from Michael Weststrate
         * (https://medium.com/visual-development/how-to-fix-nasty-circular-dependency-issues-once-and-for-all-in-javascript-typescript-a04c987cf0de)
         * in order to avoid problem with circular imports.
         */
        ${imports.makeExportStatements(modelImports)}
        `
    }

    generateInternal(language: FreMetaLanguage): string {
        const modelImports: Set<string> = new Set<string>()
        modelImports.add(Names.classifier(language.modelConcept));
        language.units.forEach((c) => modelImports.add(Names.classifier(c)));
        // The exports need to be sorted such that base concepts/interfaces are recursive before the
        // concepts/interfaces that are extending them.
        GenerationUtil.sortClassifiers(language.interfaces)
            .reverse()
            .forEach((c) => modelImports.add(Names.classifier(c)));
        GenerationUtil.sortConceptsOrRefs(language.concepts)
            .reverse()
            .forEach((c) => modelImports.add(Names.concept(c)));
        modelImports.add(Names.language(language));

        // the template starts here
        return `
        /**
         * This index deploys the pattern from Michael Weststrate
         * (https://medium.com/visual-development/how-to-fix-nasty-circular-dependency-issues-once-and-for-all-in-javascript-typescript-a04c987cf0de)
         * in order to avoid problem with circular imports.
         *
         * The exports are sorted such that base concepts are exported before the
         * concepts that are extending them.
         */

        ${modelImports.values().toArray().map((c) => `export * from "./${c}.js";`).join("\n")}
        `;
    }

    generateUtilsIndex(language: FreMetaLanguage): string {
        return `export * from "./${Names.workerInterface(language)}.js";
                export * from "./${Names.walker(language)}.js";
                export * from "./${Names.defaultWorker(language)}.js";
                export * from "./${Names.listUtil}.js";`;
    }
}
