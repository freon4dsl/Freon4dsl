import { Names } from "../../../utils/on-lang/index.js";

export class ListUtilTemplate {
    generateListUtil(): string {
        const generatedClassName: String = Names.listUtil;

        // Template starts here
        return `/**
         * Class ${generatedClassName} implements two helper methods on lists, each prevents that
         * a list contains an entry more than once (i.e. it is a true Set), or that
         * null values are added to the list.
         */
        export class ${generatedClassName} {
            /**
             * Adds 'addition' to 'list', if 'addition' is not yet present and
             * not equal to null or undefined.
             * @param list
             * @param addition
             */
            static addIfNotPresent<T>(list: T[], addition: T) {
                if (!!addition && !list.includes(addition)) {
                    list.push(addition);
                }
            }

            /**
             * Adds all elements of 'listOfAdditions' to 'list', but only if the element
             * is not yet present and not equal to null or undefined.
             * @param list
             * @param listOfAdditions
             */
            static addAllIfNotPresent<T>(list: T[], listOfAdditions: T[]) {
                for (const xx of listOfAdditions) {
                    ${generatedClassName}.addIfNotPresent<T>(list, xx);
                }
            }
        }`;
    }
}
