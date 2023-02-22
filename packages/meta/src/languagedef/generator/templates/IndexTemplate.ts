import { FreLanguage } from "../../metalanguage";
import { Names, GenerationUtil } from "../../../utils";

export class IndexTemplate {

    generateIndex(language: FreLanguage): string {

        const tmp: string[] = [];
        tmp.push(Names.classifier(language.modelConcept));
        language.units.map(c =>
            tmp.push(Names.classifier(c))
        );
        language.concepts.map(c =>
            tmp.push(Names.concept(c))
        );
        language.interfaces.map(c =>
            tmp.push(Names.interface(c))
        );
        tmp.push(Names.modelunit(language));
        tmp.push("ModelUnitMetaType");
        tmp.push(Names.allConcepts(language));
        tmp.push(Names.metaType(language));
        tmp.push(Names.initializeLanguage);

        // the template starts here
        return `
        /**
         * This index deploys the pattern from Michael Weststrate
         * (https://medium.com/visual-development/how-to-fix-nasty-circular-dependency-issues-once-and-for-all-in-javascript-typescript-a04c987cf0de)
         * in order to avoid problem with circular imports.
         */

        export {
        ${tmp.map(c =>
            `${c}`
        ).join(",\n")}
        } from "./internal"`;
    }

    generateInternal(language: FreLanguage): string {

        const tmp: string[] = [];
        tmp.push(Names.classifier(language.modelConcept));
        language.units.map(c =>
            tmp.push(Names.classifier(c))
        );
        // The exports need to be sorted such that base concepts/interfaces are exported before the
        // concepts/interfaces that are extending them.
        GenerationUtil.sortClassifiers(language.interfaces).reverse().map(c =>
            tmp.push(Names.classifier(c))
        );
        GenerationUtil.sortConceptsOrRefs(language.concepts).reverse().map(c =>
            tmp.push(Names.concept(c))
        );

        tmp.push(Names.allConcepts(language));
        tmp.push(Names.metaType(language));
        tmp.push(Names.language(language));

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

        ${tmp.map(c =>
            `export * from "./${c}";`
        ).join("\n")}
        `;
    }

    generateUtilsIndex(language: FreLanguage): string {
        return `export * from "./${Names.workerInterface(language)}";
                export * from "./${Names.walker(language)}";
                export * from "./${Names.defaultWorker(language)}";`;

    }
}
