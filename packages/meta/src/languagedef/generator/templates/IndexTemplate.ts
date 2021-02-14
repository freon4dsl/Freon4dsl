import { PiLanguage } from "../../metalanguage";
import { Names, sortClasses } from "../../../utils";

export class IndexTemplate {

    generateIndex(language: PiLanguage): string {

        const tmp: string[] = [];
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
        tmp.push(Names.PiElementReference);

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

    generateInternal(language: PiLanguage): string {
        // The exports need to be sorted such that base concepts are exported before the
        // concepts that are extending them.
        // Function 'sortClasses' provides a sorting mechanism, but its result needs to be reversed.

        const tmp: string[] = [];
        tmp.push(Names.PiElementReference);
        // TODO should be sorting interfaces as well, I think
        language.interfaces.map(c =>
            tmp.push(Names.interface(c))
        );

        sortClasses(language.concepts).reverse().map(c =>
            tmp.push(Names.concept(c))
        );

        tmp.push(Names.allConcepts(language));
        tmp.push(Names.metaType(language));

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

    generateUtilsIndex(language: PiLanguage): string {
        return `export * from "./${Names.workerInterface(language)}";
                export * from "./${Names.walker(language)}";
                export * from "./${Names.defaultWorker(language)}";`;
    }
}
